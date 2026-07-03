# KranUA Telegram Bot — деплой и настройка

## 1. Привязать реальный Firebase-проект

Run: `npx firebase-tools projects:list`
Run: `npx firebase-tools use --add` (выбрать/создать проект, обновит `.firebaserc`)

## 2. Задать секреты

Run по одному, вводя значение при запросе:

```bash
npx firebase-tools functions:secrets:set TELEGRAM_BOT_TOKEN
npx firebase-tools functions:secrets:set GEMINI_API_KEY
npx firebase-tools functions:secrets:set LIQPAY_PROVIDER_TOKEN
npx firebase-tools functions:secrets:set ADMIN_CHAT_ID
npx firebase-tools functions:secrets:set WEBHOOK_SECRET_PATH
```

`ADMIN_CHAT_ID` — chat id администратора/диспетчера (узнать через @userinfobot в Telegram).
`WEBHOOK_SECRET_PATH` — произвольная случайная строка (напр. `openssl rand -hex 16`), используется как секретный суффикс URL вебхука.

## 3. Наполнить справочник техники

В Firebase Console → Firestore → создать коллекцию `cranes`, добавить документы вида:

```json
{
  "name": "Автокран 25т",
  "capacityTons": 25,
  "hourlyRate": 1200,
  "minHours": 3,
  "description": "Стріла 21м, підходить для більшості міських об'єктів"
}
```

## 4. Задеплоить

Run: `cd functions && npm run build && npx firebase-tools deploy --only functions`
Expected: команда завершается без ошибок, в выводе — URL функции `telegramWebhook`.

## 5. Подключить вебхук в Telegram

Run (подставить реальные значения):

```bash
curl "https://api.telegram.org/bot<TELEGRAM_BOT_TOKEN>/setWebhook?url=<FUNCTION_URL>/<WEBHOOK_SECRET_PATH>"
```

Expected: JSON-ответ `{"ok":true,"result":true,...}`.

## 6. Локальная проверка через эмулятор (без реального вебхука)

Run: `cd functions && npm run serve`
Затем в другом терминале отправить тестовый update (замените `<FUNCTIONS_EMULATOR_URL>` на адрес из вывода эмулятора, обычно `http://127.0.0.1:5001/<project-id>/us-central1/telegramWebhook`):

```bash
curl -X POST "<FUNCTIONS_EMULATOR_URL>/<WEBHOOK_SECRET_PATH>" \
  -H "Content-Type: application/json" \
  -d '{"update_id": 1, "message": {"message_id": 1, "date": 0, "chat": {"id": 12345, "type": "private"}, "from": {"id": 12345, "is_bot": false, "first_name": "Test"}, "text": "/start"}}'
```

Expected: HTTP 200, в логах эмулятора видно вызов `bot.handleUpdate`.

## 7. Чек-лист ручного сквозного тестирования (реальный тестовый бот BotFather)

- [ ] `/start` — бот отвечает приветствием
- [ ] Консультация: "Який у вас найбільший кран і скільки коштує оренда на 4 години?" — бот отвечает ценой из Firestore, без выдуманных данных
- [ ] Бронирование: "Хочу забронювати кран на завтра о 9:00 на 3 години, адреса вулиця Хрещатик 1" — бот создаёт бронь, админ получает сообщение с кнопками
- [ ] Админ жмёт "✅ Підтвердити" — клиент получает подтверждение
- [ ] Оплата: клиент пишет "оплатити" — приходит счёт LiqPay (тестовый режим), после оплаты — сообщение об успехе клиенту и админу
- [ ] Перенос: "Перенесіть бронь на пʼятницю на 14:00" — новая заявка снова уходит на подтверждение админу
- [ ] Повторная отправка того же Telegram update (ретрай) не создаёт вторую бронь/сообщение
