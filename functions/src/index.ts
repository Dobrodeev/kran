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

    // The update is already marked processed by isDuplicateUpdate above, so a
    // thrown error here would previously propagate, cause Cloud Functions to
    // return a 5xx, and any Telegram retry of the SAME update would then be
    // swallowed as a "duplicate" -- silently losing the message forever.
    // Catch here so a transient failure is at least logged (visible in Cloud
    // Functions logs) instead of vanishing with zero trace. We still return
    // 200 to Telegram: since the update is already marked processed, a 5xx
    // would only trigger retries that get dropped as duplicates anyway, so
    // there is no benefit to returning an error status here.
    try {
      await bot.handleUpdate(req.body);
    } catch (error) {
      console.error(`telegramWebhook: failed to handle update ${updateId}:`, error);
    }
    res.status(200).send("ok");
  }
);
