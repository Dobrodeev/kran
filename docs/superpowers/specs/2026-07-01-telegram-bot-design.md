# Telegram-бот KranUA — дизайн

Дата: 2026-07-01
Статус: утверждено, готово к планированию реализации

## Контекст и цель

Компания KranUA (аренда кранов/эвакуаторов, Киев) хочет Telegram-бота для:
- консультаций клиентов (цены, виды техники, условия),
- бронирования аренды крана,
- переноса существующей брони,
- оплаты аренды прямо в Telegram.

Бот является частью существующего репозитория/Firebase-проекта `kranua-app` (Next.js сайт), но не связан с ним в рантайме — отдельная папка `functions/` с собственным `package.json`, использующая тот же Firebase-проект (общий Firestore, общий billing).

## Архитектура

```
Telegram ──(webhook)──> Cloud Function `telegramWebhook` (Telegraf.js, Node.js)
                              │
                              ├─> Firestore (клиенты, техника, брони, история диалога, дедуп апдейтов)
                              ├─> Gemini 2.5 API (function calling)
                              └─> Telegram Bot API (сообщения, invoice, уведомления админу)
```

- Один HTTPS-эндпоинт Cloud Function (2nd gen), подключённый через `setWebhook` с секретным путём/токеном для защиты от посторонних запросов.
- Cloud Functions не хранят состояние между вызовами — весь стейт диалога и брони лежит в Firestore.
- Секреты (Telegram Bot Token, Gemini API key, LiqPay provider token, ADMIN_CHAT_ID) — через Firebase Secret Manager (`firebase functions:secrets:set`), никогда в коде или логах.
- Библиотека бота: **Telegraf.js** — меньше ручного кода для роутинга апдейтов, клавиатур, callback-кнопок и сцен, чем чистый `fetch` к Bot API.

## Модель данных (Firestore)

**`clients/{chatId}`**
- `name`, `phone`, `language` (`uk`/`ru`), `createdAt`

**`cranes/{craneId}`** — справочник техники, редактируется вручную через Firebase Console
- `name` (напр. "Автокран 25т"), `capacityTons`, `hourlyRate`, `minHours`, `description`

**`bookings/{bookingId}`**
- `clientChatId`, `craneId`, `startAt`, `endAt`, `address`, `comment`
- `status`: `pending_confirmation` → `confirmed` / `declined` → `paid` → `completed` / `cancelled`
- `price`, `paymentStatus` (`unpaid`/`paid`), `createdAt`, `updatedAt`

**`conversations/{chatId}`**
- `history`: последние N сообщений (роль + текст) — контекст для Gemini
- `pendingAction`: черновик действия, если Gemini начал многошаговый сценарий (например бот спросил адрес и ждёт ответа)

**`processedUpdates/{update_id}`** — для идемпотентности обработки повторных вебхуков от Telegram

Проверка пересечений при бронировании: запрос `bookings` по `craneId` со статусом `confirmed`/`paid`, где `startAt < newEnd AND endAt > newStart`.

## AI-агент (Gemini 2.5, function calling)

На каждое сообщение клиента бот подтягивает:
- краткую историю диалога (`conversations/{chatId}.history`),
- актуальный каталог техники и цен (`cranes`),

и передаёт всё это в Gemini как system prompt + история + новое сообщение. Gemini сам решает, когда вызвать инструмент, основываясь на ходе разговора.

**Инструменты (tools):**
- `check_availability(craneId, startAt, endAt)` — проверка пересечений по Firestore
- `create_booking(craneId, startAt, endAt, address, comment)` — создаёт запись со статусом `pending_confirmation`, уведомляет админа
- `reschedule_booking(bookingId, newStartAt, newEndAt)` — аналогично, снова уходит на подтверждение админу
- `cancel_booking(bookingId)`
- `request_payment(bookingId)` — только для брони в статусе `confirmed`; отправляет Telegram-invoice (LiqPay)
- `escalate_to_human()` — пересылает диалог админу и приостанавливает обработку AI для этого чата

Так как Cloud Function не хранит состояние между вызовами, любое незавершённое действие живёт только в `conversations/{chatId}.history` — Gemini восстанавливает контекст из истории при каждом новом сообщении.

## Флоу подтверждения и оплаты (LiqPay через Telegram Payments)

1. Клиент через диалог доходит до `create_booking` / `reschedule_booking` → запись в Firestore со статусом `pending_confirmation`.
2. Бот отправляет админу (`ADMIN_CHAT_ID` из секретов) сообщение с деталями брони и инлайн-кнопками **✅ Подтвердить** / **❌ Отклонить**.
3. Админ жмёт кнопку → `callback_query` хендлер обновляет `status` в Firestore (через транзакцию с проверкой текущего статуса) и уведомляет клиента.
4. Если отклонено — клиенту уходит вежливое сообщение, Gemini может предложить другое время через повторный `check_availability`.
5. Для `confirmed` брони бот шлёт Telegram `sendInvoice` с `provider_token` LiqPay на сумму `price`.
6. `pre_checkout_query` → проверка, что бронь всё ещё `confirmed` и не оплачена → `answerPreCheckoutQuery(true)`, иначе `answerPreCheckoutQuery(false, "Бронь недоступна")`.
7. `successful_payment` → `status = paid`, `paymentStatus = paid`, уведомление админу и клиенту.

Перенос оплаченной брони проходит тот же цикл подтверждения; доплата/возврат разницы при переносе — сообщается клиенту словами, ручная корректировка платежа админом (авто-возврат вне рамок MVP).

## Обработка ошибок и edge-cases

- **Дубли апдейтов Telegram** — идемпотентность по `update_id` через `processedUpdates/{update_id}`.
- **Ошибка Gemini API** (таймаут/лимит) — клиенту заранее заготовленное сообщение с предложением написать `/human`, ошибка логируется (`logger.error`), диалог не ломается.
- **Некорректные аргументы функции от Gemini** (кран не найден, даты в прошлом, `endAt <= startAt`) — валидация внутри tool-функции, ошибка возвращается в Gemini как текст, чтобы модель переспросила клиента.
- **Двойная/устаревшая оплата** — проверка статуса брони в `pre_checkout_query`.
- **Гонка на подтверждении** (двойное нажатие кнопки, отменённая клиентом бронь) — Firestore-транзакция с проверкой текущего статуса перед записью.
- **Секреты** — только через Firebase Secret Manager.

## Тестирование

- Юнит-тесты (vitest) для чистых функций: пересечение интервалов брони, расчёт цены, парсинг дат из текста.
- Ручное тестирование через тестового Telegram-бота (BotFather test token) перед деплоем в прод: полный сценарий консультация → бронь → подтверждение админом → оплата → перенос.
- `firebase emulators` (Firestore + Functions) для локальной проверки без реальных вебхуков (тестовые update JSON через curl/Postman).

## Вне рамок MVP (сознательно исключено)

- Отдельная веб-панель администратора (управление только через Telegram-уведомления и Firebase Console).
- Автоматический возврат/доплата при переносе оплаченной брони.
- Мультиязычность за пределами uk/ru.
- Множественные провайдеры оплаты (только LiqPay через Telegram Payments).
