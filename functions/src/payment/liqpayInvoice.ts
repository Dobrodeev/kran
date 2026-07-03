import { Telegraf } from "telegraf";
import { config } from "../config";
import { getBooking, updateBookingStatusIfCurrent } from "../booking/bookingRepository";

export async function sendBookingInvoice(bot: Telegraf, chatId: string, bookingId: string): Promise<void> {
  const booking = await getBooking(bookingId);
  if (!booking || booking.status !== "confirmed") {
    await bot.telegram.sendMessage(chatId, "Цю бронь наразі не можна оплатити.");
    return;
  }

  await bot.telegram.sendInvoice(chatId, {
    title: `Оренда крана — бронь #${booking.id}`,
    description: `Оплата оренди на ${booking.startAt.toLocaleString("uk-UA")}`,
    payload: booking.id,
    provider_token: config.liqpayProviderToken,
    currency: "UAH",
    prices: [{ label: "Оренда крана", amount: Math.round(booking.price * 100) }],
  });
}

export function registerPaymentHandlers(bot: Telegraf): void {
  bot.on("pre_checkout_query", async (ctx) => {
    const bookingId = ctx.preCheckoutQuery.invoice_payload;
    const booking = await getBooking(bookingId);
    if (!booking || booking.status !== "confirmed" || booking.paymentStatus === "paid") {
      await ctx.answerPreCheckoutQuery(false, "Бронь недоступна для оплати.");
      return;
    }
    await ctx.answerPreCheckoutQuery(true);
  });

  bot.on("successful_payment", async (ctx) => {
    const message = ctx.message;
    if (!message || !("successful_payment" in message)) {
      return;
    }
    const bookingId = message.successful_payment.invoice_payload;
    const result = await updateBookingStatusIfCurrent(bookingId, ["confirmed"], "paid", { paymentStatus: "paid" });
    if (result.ok) {
      await ctx.reply("Оплату отримано, дякуємо! До зустрічі.");
      await bot.telegram.sendMessage(config.adminChatId, `Бронь #${bookingId} оплачена клієнтом.`);
    }
  });
}
