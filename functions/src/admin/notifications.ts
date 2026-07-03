import { Telegraf, Markup } from "telegraf";
import { config } from "../config";
import { Booking, Crane } from "../types";
import { updateBookingStatusIfCurrent } from "../booking/bookingRepository";

function formatBookingText(booking: Booking, crane: Crane): string {
  return [
    `Нова бронь #${booking.id}`,
    `Кран: ${crane.name}`,
    `Період: ${booking.startAt.toLocaleString("uk-UA")} — ${booking.endAt.toLocaleString("uk-UA")}`,
    `Адреса: ${booking.address}`,
    `Ціна: ${booking.price} грн`,
    `Клієнт (chat id): ${booking.clientChatId}`,
  ].join("\n");
}

export async function notifyAdminNewBooking(bot: Telegraf, booking: Booking, crane: Crane): Promise<void> {
  await bot.telegram.sendMessage(
    config.adminChatId,
    formatBookingText(booking, crane),
    Markup.inlineKeyboard([
      Markup.button.callback("✅ Підтвердити", `confirm:${booking.id}`),
      Markup.button.callback("❌ Відхилити", `decline:${booking.id}`),
    ])
  );
}

export function registerAdminActions(bot: Telegraf): void {
  bot.action(/^confirm:(.+)$/, async (ctx) => {
    const bookingId = ctx.match[1];
    const result = await updateBookingStatusIfCurrent(bookingId, ["pending_confirmation"], "confirmed");
    if (!result.ok) {
      await ctx.answerCbQuery("Бронь вже оброблена.");
      return;
    }
    await ctx.answerCbQuery("Підтверджено");
    await ctx.editMessageText(`${(ctx.callbackQuery as { message?: { text?: string } }).message?.text ?? ""}\n\nСтатус: підтверджено ✅`);
    await bot.telegram.sendMessage(
      result.booking.clientChatId,
      "Вашу бронь підтверджено! Напишіть \"оплатити\" в чаті, щоб перейти до оплати."
    );
  });

  bot.action(/^decline:(.+)$/, async (ctx) => {
    const bookingId = ctx.match[1];
    const result = await updateBookingStatusIfCurrent(bookingId, ["pending_confirmation"], "declined");
    if (!result.ok) {
      await ctx.answerCbQuery("Бронь вже оброблена.");
      return;
    }
    await ctx.answerCbQuery("Відхилено");
    await ctx.editMessageText(`${(ctx.callbackQuery as { message?: { text?: string } }).message?.text ?? ""}\n\nСтатус: відхилено ❌`);
    await bot.telegram.sendMessage(
      result.booking.clientChatId,
      "На жаль, обраний час недоступний. Оберіть, будь ласка, інший."
    );
  });
}
