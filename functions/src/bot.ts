import { Telegraf } from "telegraf";
import { config } from "./config";
import { getConversation, appendMessages } from "./conversation/conversationStore";
import { runAgentTurn } from "./ai/gemini";
import { registerAdminActions } from "./admin/notifications";
import { registerPaymentHandlers } from "./payment/liqpayInvoice";
import { getFirestore } from "./firestore";

async function getCraneCatalogText(): Promise<string> {
  const snap = await getFirestore().collection("cranes").get();
  return snap.docs
    .map((d) => {
      const c = d.data() as { name: string; capacityTons: number; hourlyRate: number; minHours: number; description?: string };
      return `- ${c.name} (id: ${d.id}): вантажопідйомність ${c.capacityTons}т, ${c.hourlyRate} грн/год, мін. ${c.minHours} год. ${c.description ?? ""}`;
    })
    .join("\n");
}

export function createBot(): Telegraf {
  const bot = new Telegraf(config.telegramBotToken);

  bot.start(async (ctx) => {
    await ctx.reply(
      "Вітаю! Я бот KranUA. Розкажіть, яка техніка вам потрібна і на коли — підберу варіант, забронюю і допоможу з оплатою."
    );
  });

  bot.on("text", async (ctx) => {
    const chatId = String(ctx.chat.id);
    const conversation = await getConversation(chatId);
    if (conversation.paused) {
      return;
    }

    const catalogText = await getCraneCatalogText();
    const reply = await runAgentTurn({
      catalogText,
      history: conversation.history,
      userMessage: ctx.message.text,
      ctx: { chatId, bot },
    });

    await appendMessages(chatId, [
      { role: "user", text: ctx.message.text, at: new Date() },
      { role: "model", text: reply, at: new Date() },
    ]);

    await ctx.reply(reply);
  });

  registerAdminActions(bot);
  registerPaymentHandlers(bot);

  bot.catch((err, ctx) => {
    console.error(`Telegraf handler error for chat ${ctx.chat?.id ?? "unknown"}:`, err);
  });

  return bot;
}
