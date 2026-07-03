import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { createBot } from "./bot";
import { isDuplicateUpdate } from "./telegram/updateDedup";
import { config } from "./config";

const telegramBotToken = defineSecret("TELEGRAM_BOT_TOKEN");
const geminiApiKey = defineSecret("GEMINI_API_KEY");
const liqpayProviderToken = defineSecret("LIQPAY_PROVIDER_TOKEN");
const adminChatId = defineSecret("ADMIN_CHAT_ID");
const webhookSecretPath = defineSecret("WEBHOOK_SECRET_PATH");

let bot: ReturnType<typeof createBot> | undefined;

export const telegramWebhook = onRequest(
  { secrets: [telegramBotToken, geminiApiKey, liqpayProviderToken, adminChatId, webhookSecretPath] },
  async (req, res) => {
    if (req.path.replace(/^\//, "") !== config.webhookSecretPath) {
      res.status(404).send("not found");
      return;
    }

    const updateId = req.body?.update_id;
    if (typeof updateId !== "number") {
      res.status(400).send("bad request");
      return;
    }
    if (await isDuplicateUpdate(updateId)) {
      res.status(200).send("duplicate");
      return;
    }

    if (!bot) {
      bot = createBot();
    }

    await bot.handleUpdate(req.body);
    res.status(200).send("ok");
  }
);
