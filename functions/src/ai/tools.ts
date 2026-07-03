import { Type, FunctionDeclaration } from "@google/genai";
import { Telegraf } from "telegraf";
import {
  getCrane,
  listActiveBookingsForCrane,
  createBooking,
  getBooking,
  updateBookingStatusIfCurrent,
} from "../booking/bookingRepository";
import { hasOverlap } from "../booking/availability";
import { computePrice } from "../booking/pricing";
import { parseIsoDateTime, isValidBookingRange } from "../booking/dateValidation";
import { setPaused } from "../conversation/conversationStore";
import { notifyAdminNewBooking } from "../admin/notifications";
import { sendBookingInvoice } from "../payment/liqpayInvoice";
import { config } from "../config";
import { Crane, Booking } from "../types";

export interface ToolContext {
  chatId: string;
  bot: Telegraf;
}

export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: "check_availability",
    description: "Перевірити, чи вільний кран на вказаний період часу.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        craneId: { type: Type.STRING, description: "ID крана з довідника cranes" },
        startAt: { type: Type.STRING, description: "Початок, ISO 8601" },
        endAt: { type: Type.STRING, description: "Кінець, ISO 8601" },
      },
      required: ["craneId", "startAt", "endAt"],
    },
  },
  {
    name: "create_booking",
    description: "Створити бронювання крана (очікує підтвердження диспетчера).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        craneId: { type: Type.STRING },
        startAt: { type: Type.STRING, description: "ISO 8601" },
        endAt: { type: Type.STRING, description: "ISO 8601" },
        address: { type: Type.STRING },
        comment: { type: Type.STRING },
      },
      required: ["craneId", "startAt", "endAt", "address"],
    },
  },
  {
    name: "reschedule_booking",
    description: "Перенести існуюче бронювання на новий час (знову очікує підтвердження диспетчера).",
    parameters: {
      type: Type.OBJECT,
      properties: {
        bookingId: { type: Type.STRING },
        newStartAt: { type: Type.STRING, description: "ISO 8601" },
        newEndAt: { type: Type.STRING, description: "ISO 8601" },
      },
      required: ["bookingId", "newStartAt", "newEndAt"],
    },
  },
  {
    name: "cancel_booking",
    description: "Скасувати бронювання.",
    parameters: {
      type: Type.OBJECT,
      properties: { bookingId: { type: Type.STRING } },
      required: ["bookingId"],
    },
  },
  {
    name: "request_payment",
    description: "Надіслати клієнту рахунок на оплату підтвердженого бронювання.",
    parameters: {
      type: Type.OBJECT,
      properties: { bookingId: { type: Type.STRING } },
      required: ["bookingId"],
    },
  },
  {
    name: "escalate_to_human",
    description: "Передати розмову живому диспетчеру, коли AI не може допомогти.",
    parameters: {
      type: Type.OBJECT,
      properties: { reason: { type: Type.STRING } },
      required: ["reason"],
    },
  },
];

interface ResolvedBookingWindow {
  crane: Crane;
  startAt: Date;
  endAt: Date;
  existing: Booking[];
}

async function validateAndResolveBookingWindow(
  craneId: string,
  startAtRaw: string,
  endAtRaw: string,
  excludeBookingId?: string
): Promise<{ ok: true; window: ResolvedBookingWindow } | { ok: false; error: string }> {
  const startAt = parseIsoDateTime(startAtRaw);
  const endAt = parseIsoDateTime(endAtRaw);
  if (!startAt || !endAt) return { ok: false, error: "invalid_date_format" };

  const rangeCheck = isValidBookingRange(startAt, endAt, new Date());
  if (!rangeCheck.valid) return { ok: false, error: rangeCheck.reason ?? "invalid_range" };

  const crane = await getCrane(craneId);
  if (!crane) return { ok: false, error: "crane_not_found" };

  const existing = (await listActiveBookingsForCrane(craneId)).filter((b) => b.id !== excludeBookingId);
  return { ok: true, window: { crane, startAt, endAt, existing } };
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<Record<string, unknown>> {
  switch (name) {
    case "check_availability": {
      const resolved = await validateAndResolveBookingWindow(String(args.craneId), String(args.startAt), String(args.endAt));
      if (!resolved.ok) return { error: resolved.error };
      const { crane, startAt, endAt, existing } = resolved.window;
      const available = !hasOverlap({ startAt, endAt }, existing);
      return { available, price: computePrice(crane.hourlyRate, crane.minHours, startAt, endAt) };
    }
    case "create_booking": {
      const craneId = String(args.craneId);
      const resolved = await validateAndResolveBookingWindow(craneId, String(args.startAt), String(args.endAt));
      if (!resolved.ok) return { error: resolved.error };
      const { crane, startAt, endAt, existing } = resolved.window;
      if (hasOverlap({ startAt, endAt }, existing)) return { error: "not_available" };
      const price = computePrice(crane.hourlyRate, crane.minHours, startAt, endAt);
      const booking = await createBooking({
        clientChatId: ctx.chatId,
        craneId,
        startAt,
        endAt,
        address: String(args.address),
        comment: args.comment ? String(args.comment) : undefined,
        price,
      });
      await notifyAdminNewBooking(ctx.bot, booking, crane);
      return { bookingId: booking.id, price, status: booking.status };
    }
    case "reschedule_booking": {
      const bookingId = String(args.bookingId);
      const booking = await getBooking(bookingId);
      if (!booking) return { error: "booking_not_found" };
      const resolved = await validateAndResolveBookingWindow(
        booking.craneId,
        String(args.newStartAt),
        String(args.newEndAt),
        bookingId
      );
      if (!resolved.ok) return { error: resolved.error };
      const { crane, startAt: newStartAt, endAt: newEndAt, existing } = resolved.window;
      if (hasOverlap({ startAt: newStartAt, endAt: newEndAt }, existing)) return { error: "not_available" };
      const price = computePrice(crane.hourlyRate, crane.minHours, newStartAt, newEndAt);
      const result = await updateBookingStatusIfCurrent(
        bookingId,
        ["pending_confirmation", "confirmed", "paid"],
        "pending_confirmation",
        { startAt: newStartAt, endAt: newEndAt, price, paymentStatus: "unpaid" }
      );
      if (!result.ok) return { error: result.reason };
      await notifyAdminNewBooking(ctx.bot, result.booking, crane);
      return { bookingId, price, status: result.booking.status };
    }
    case "cancel_booking": {
      const bookingId = String(args.bookingId);
      const result = await updateBookingStatusIfCurrent(bookingId, ["pending_confirmation", "confirmed"], "cancelled");
      if (!result.ok) return { error: result.reason };
      return { bookingId, status: "cancelled" };
    }
    case "request_payment": {
      const bookingId = String(args.bookingId);
      await sendBookingInvoice(ctx.bot, ctx.chatId, bookingId);
      return { sent: true };
    }
    case "escalate_to_human": {
      await setPaused(ctx.chatId, true);
      await ctx.bot.telegram.sendMessage(
        config.adminChatId,
        `Клієнт ${ctx.chatId} потребує уваги диспетчера: ${String(args.reason)}`
      );
      return { escalated: true };
    }
    default:
      return { error: `unknown_tool:${name}` };
  }
}
