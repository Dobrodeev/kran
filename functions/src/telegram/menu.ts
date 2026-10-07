import { Telegraf } from "telegraf";
import { config } from "../config";
import { getFirestore } from "../firestore";
import { getCrane, getLatestBookingForChat } from "../booking/bookingRepository";
import { BookingStatus } from "../types";

// TODO: замінити на реальні контакти компанії.
const CONTACTS_TEXT = [
  "📞 Контакти KranUA",
  "",
  "Телефон: +380 44 000 00 00 (Viber, Telegram)",
  "Email: info@example.com",
  "Сайт: https://kran.kiev.ua",
  "Адреса: м. Київ, вул. Прикладна, 1",
  "Працюємо: Пн–Сб, 8:00–20:00, Нд — за домовленістю",
].join("\n");

const MENU_COMMANDS = [
  { command: "catalog", description: "🏗 Каталог техніки" },
  { command: "book", description: "📅 Забронювати" },
  { command: "mybooking", description: "📋 Моє бронювання" },
  { command: "consult", description: "💬 Консультація з менеджером" },
  { command: "contacts", description: "📞 Контакти" },
];

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending_confirmation: "очікує підтвердження",
  confirmed: "підтверджено, очікує оплати",
  declined: "відхилено",
  paid: "оплачено",
  completed: "виконано",
  cancelled: "скасовано",
};

function formatDateTime(date: Date): string {
  return date.toLocaleString("uk-UA", { timeZone: "Europe/Kyiv", dateStyle: "short", timeStyle: "short" });
}

/**
 * Registers the menu command handlers. Must be called before the generic
 * `bot.on("text")` handler, otherwise commands would be routed to the AI agent.
 */
export function registerMenuCommands(bot: Telegraf): void {
  // Publishes the "Menu" button list once per cold start; failures are non-fatal.
  // The private-chat scope is set explicitly because it takes precedence over the
  // default scope, so a stale list there (e.g. from BotFather) would hide ours.
  for (const scope of [{ type: "default" }, { type: "all_private_chats" }] as const) {
    bot.telegram
      .setMyCommands(MENU_COMMANDS, { scope })
      .catch((err) => console.error(`Failed to set bot commands (${scope.type}):`, err));
  }

  bot.command("catalog", async (ctx) => {
    const snap = await getFirestore().collection("cranes").get();
    if (snap.empty) {
      await ctx.reply("Каталог наразі порожній. Зверніться, будь ласка, до менеджера: /consult");
      return;
    }
    const lines = snap.docs.map((d) => {
      const c = d.data() as { name: string; capacityTons: number; hourlyRate: number; minHours: number };
      return `• ${c.name} — ${c.capacityTons} т, ${c.hourlyRate} грн/год (мін. ${c.minHours} год)`;
    });
    await ctx.reply(`🏗 Наша техніка:\n\n${lines.join("\n")}\n\nЩоб забронювати — /book`);
  });

  bot.command("book", async (ctx) => {
    await ctx.reply(
      "📅 Напишіть, будь ласка, одним повідомленням:\n" +
        "• яка техніка потрібна (або яка вага вантажу);\n" +
        "• дата і час початку та завершення робіт;\n" +
        "• адреса об'єкта.\n\n" +
        "Я перевірю доступність і розрахую вартість."
    );
  });

  bot.command("mybooking", async (ctx) => {
    const booking = await getLatestBookingForChat(String(ctx.chat.id));
    if (!booking) {
      await ctx.reply("У вас поки немає бронювань. Створити — /book");
      return;
    }
    const crane = await getCrane(booking.craneId);
    await ctx.reply(
      [
        "📋 Ваше бронювання",
        "",
        `Техніка: ${crane?.name ?? booking.craneId}`,
        `Початок: ${formatDateTime(booking.startAt)}`,
        `Завершення: ${formatDateTime(booking.endAt)}`,
        `Адреса: ${booking.address}`,
        `Вартість: ${booking.price} грн`,
        `Статус: ${STATUS_LABELS[booking.status] ?? booking.status}`,
      ].join("\n")
    );
  });

  bot.command("consult", async (ctx) => {
    const from = ctx.from;
    const name = [from.first_name, from.last_name].filter(Boolean).join(" ");
    const username = from.username ? ` (@${from.username})` : "";
    await ctx.telegram.sendMessage(
      config.adminChatId,
      `💬 Запит на консультацію від ${name}${username}, chat id: ${ctx.chat.id}`
    );
    await ctx.reply("Дякуємо! Менеджер зв'яжеться з вами найближчим часом. Можете також описати питання тут.");
  });

  bot.command("contacts", async (ctx) => {
    await ctx.reply(CONTACTS_TEXT);
  });
}
