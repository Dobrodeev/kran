function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  get telegramBotToken(): string {
    return requireEnv("TELEGRAM_BOT_TOKEN");
  },
  get geminiApiKey(): string {
    return requireEnv("GEMINI_API_KEY");
  },
  get liqpayProviderToken(): string {
    return requireEnv("LIQPAY_PROVIDER_TOKEN");
  },
  get adminChatId(): string {
    return requireEnv("ADMIN_CHAT_ID");
  },
  get webhookSecretPath(): string {
    return requireEnv("WEBHOOK_SECRET_PATH");
  },
};
