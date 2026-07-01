# Telegram-бот KranUA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Реализовать Telegram-бота KranUA (консультация, бронирование, перенос, оплата аренды крана) как Firebase Cloud Function внутри репозитория `kranua-app`, по спеке `docs/superpowers/specs/2026-07-01-telegram-bot-design.md`.

**Architecture:** Один HTTPS Cloud Function (2nd gen, `telegramWebhook`) на Telegraf.js принимает вебхуки Telegram, читает/пишет Firestore (клиенты, техника, брони, история диалога, дедуп апдейтов), делегирует диалог Gemini 2.5 с function calling, а Gemini через набор инструментов вызывает бизнес-логику (проверка доступности, создание/перенос/отмена брони, отправка счёта LiqPay через Telegram Payments).

**Tech Stack:** Firebase Functions v2 (Node.js 22), TypeScript, Telegraf.js, firebase-admin (Firestore), @google/genai (Gemini 2.5), vitest.

## Global Constraints

- Бот — часть репозитория/Firebase-проекта `kranua-app`, папка `functions/`, не связан с Next.js кодом сайта в рантайме.
- Секреты (`TELEGRAM_BOT_TOKEN`, `GEMINI_API_KEY`, `LIQPAY_PROVIDER_TOKEN`, `ADMIN_CHAT_ID`, `WEBHOOK_SECRET_PATH`) — только через Firebase Secret Manager, никогда в коде/логах.
- Оплата — только Telegram Payments с провайдером LiqPay (провайдер-токен уже есть у пользователя).
- Язык бота — украинский и русский (автоопределение по языку сообщения клиента), без прочих языков.
- Без отдельной веб-панели администратора — управление бронями только через Telegram-уведомления и Firebase Console.
- Без автоматического возврата/доплаты при переносе оплаченной брони — сумма сообщается словами, доплату оформляет администратор вручную.
- Единственный провайдер оплаты — LiqPay; расширение на другие провайдеры вне рамок.
- Автоматические тесты (vitest) — только для чистых функций (пересечение интервалов, расчёт цены, валидация дат); остальное проверяется вручную через Firebase Emulator и реальный тестовый бот.

---

### Task 1: Bootstrap Firebase Functions project

**Files:**
- Create: `firebase.json`
- Create: `.firebaserc`
- Create: `functions/package.json`
- Create: `functions/tsconfig.json`
- Create: `functions/vitest.config.ts`
- Create: `functions/.gitignore`
- Create: `functions/src/index.ts`

**Interfaces:**
- Consumes: ничего (первая задача)
- Produces: скомпилированный стаб `telegramWebhook` (Cloud Function 2nd gen), рабочий `npm run build` / `npm test` в `functions/`

- [ ] **Step 1: Создать `firebase.json`**

```json
{
  "functions": [
    {
      "source": "functions",
      "codebase": "default",
      "runtime": "nodejs22"
    }
  ]
}
```

- [ ] **Step 2: Создать `.firebaserc` (плейсхолдер project id — заменить на реальный на шаге деплоя в Task 17)**

```json
{
  "projects": {
    "default": "kranua-app"
  }
}
```

- [ ] **Step 3: Создать `functions/package.json`**

```json
{
  "name": "kranua-bot-functions",
  "version": "1.0.0",
  "private": true,
  "engines": { "node": "22" },
  "main": "lib/index.js",
  "scripts": {
    "build": "tsc",
    "test": "vitest run",
    "serve": "npm run build && firebase emulators:start --only functions,firestore"
  },
  "dependencies": {
    "@google/genai": "^1.0.0",
    "firebase-admin": "^13.0.0",
    "firebase-functions": "^6.0.0",
    "telegraf": "^4.16.3"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 4: Создать `functions/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "lib": ["ES2022"],
    "outDir": "lib",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "test", "lib"]
}
```

- [ ] **Step 5: Создать `functions/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
  },
});
```

- [ ] **Step 6: Создать `functions/.gitignore`**

```
node_modules/
lib/
*.log
```

- [ ] **Step 7: Создать стаб `functions/src/index.ts`** (полная реализация — в Task 16)

```ts
import { onRequest } from "firebase-functions/v2/https";

export const telegramWebhook = onRequest((req, res) => {
  res.status(200).send("ok");
});
```

- [ ] **Step 8: Установить зависимости и проверить сборку**

Run: `cd functions && npm install && npm run build`
Expected: команда завершается без ошибок, появляется `functions/lib/index.js`

- [ ] **Step 9: Commit**

```bash
git add firebase.json .firebaserc functions/package.json functions/package-lock.json functions/tsconfig.json functions/vitest.config.ts functions/.gitignore functions/src/index.ts
git commit -m "chore: bootstrap Firebase Functions project for Telegram bot"
```

---

### Task 2: Общие TypeScript-типы

**Files:**
- Create: `functions/src/types.ts`

**Interfaces:**
- Consumes: ничего
- Produces: `BookingStatus`, `Crane`, `Booking`, `Client`, `ConversationMessage`, `ConversationState` — используются во всех последующих задачах

- [ ] **Step 1: Создать `functions/src/types.ts`**

```ts
export type BookingStatus =
  | "pending_confirmation"
  | "confirmed"
  | "declined"
  | "paid"
  | "completed"
  | "cancelled";

export interface Crane {
  id: string;
  name: string;
  capacityTons: number;
  hourlyRate: number;
  minHours: number;
  description: string;
}

export interface Booking {
  id: string;
  clientChatId: string;
  craneId: string;
  startAt: Date;
  endAt: Date;
  address: string;
  comment?: string;
  status: BookingStatus;
  price: number;
  paymentStatus: "unpaid" | "paid";
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  chatId: string;
  name?: string;
  phone?: string;
  language: "uk" | "ru";
  createdAt: Date;
}

export interface ConversationMessage {
  role: "user" | "model";
  text: string;
  at: Date;
}

export interface ConversationState {
  chatId: string;
  history: ConversationMessage[];
  paused?: boolean;
}
```

- [ ] **Step 2: Проверить сборку**

Run: `cd functions && npm run build`
Expected: без ошибок компиляции

- [ ] **Step 3: Commit**

```bash
git add functions/src/types.ts
git commit -m "feat: add shared TypeScript types for bot domain model"
```

---

### Task 3: Firestore-клиент

**Files:**
- Create: `functions/src/firestore.ts`

**Interfaces:**
- Consumes: ничего
- Produces: `getFirestore(): Firestore` — единая точка получения инициализированного Firestore-клиента, используется во всех репозиториях

- [ ] **Step 1: Создать `functions/src/firestore.ts`**

```ts
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore as getAdminFirestore, Firestore } from "firebase-admin/firestore";

let firestoreInstance: Firestore | null = null;

export function getFirestore(): Firestore {
  if (!firestoreInstance) {
    if (getApps().length === 0) {
      initializeApp();
    }
    firestoreInstance = getAdminFirestore();
  }
  return firestoreInstance;
}
```

- [ ] **Step 2: Проверить сборку**

Run: `cd functions && npm run build`
Expected: без ошибок компиляции

- [ ] **Step 3: Commit**

```bash
git add functions/src/firestore.ts
git commit -m "feat: add Firestore client accessor"
```

---

### Task 4: Проверка пересечения интервалов брони (чистая функция)

**Files:**
- Create: `functions/src/booking/availability.ts`
- Test: `functions/test/availability.test.ts`

**Interfaces:**
- Consumes: ничего
- Produces: `hasOverlap(candidate: {startAt: Date; endAt: Date}, existing: {startAt: Date; endAt: Date}[]): boolean` — используется в Task 13 (`ai/tools.ts`)

- [ ] **Step 1: Написать падающий тест `functions/test/availability.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { hasOverlap } from "../src/booking/availability";

describe("hasOverlap", () => {
  it("returns false when no existing bookings", () => {
    const candidate = { startAt: new Date("2026-07-03T09:00:00Z"), endAt: new Date("2026-07-03T12:00:00Z") };
    expect(hasOverlap(candidate, [])).toBe(false);
  });

  it("returns true when candidate overlaps an existing booking", () => {
    const candidate = { startAt: new Date("2026-07-03T09:00:00Z"), endAt: new Date("2026-07-03T12:00:00Z") };
    const existing = [{ startAt: new Date("2026-07-03T11:00:00Z"), endAt: new Date("2026-07-03T14:00:00Z") }];
    expect(hasOverlap(candidate, existing)).toBe(true);
  });

  it("returns false when candidate is fully before an existing booking", () => {
    const candidate = { startAt: new Date("2026-07-03T09:00:00Z"), endAt: new Date("2026-07-03T10:00:00Z") };
    const existing = [{ startAt: new Date("2026-07-03T10:00:00Z"), endAt: new Date("2026-07-03T12:00:00Z") }];
    expect(hasOverlap(candidate, existing)).toBe(false);
  });

  it("returns false when candidate is fully after an existing booking", () => {
    const candidate = { startAt: new Date("2026-07-03T12:00:00Z"), endAt: new Date("2026-07-03T14:00:00Z") };
    const existing = [{ startAt: new Date("2026-07-03T09:00:00Z"), endAt: new Date("2026-07-03T12:00:00Z") }];
    expect(hasOverlap(candidate, existing)).toBe(false);
  });
});
```

- [ ] **Step 2: Запустить тест и убедиться, что он падает**

Run: `cd functions && npx vitest run test/availability.test.ts`
Expected: FAIL — `Cannot find module '../src/booking/availability'`

- [ ] **Step 3: Реализовать `functions/src/booking/availability.ts`**

```ts
export interface BookingInterval {
  startAt: Date;
  endAt: Date;
}

export function hasOverlap(candidate: BookingInterval, existing: BookingInterval[]): boolean {
  return existing.some((b) => candidate.startAt < b.endAt && candidate.endAt > b.startAt);
}
```

- [ ] **Step 4: Запустить тест и убедиться, что он проходит**

Run: `cd functions && npx vitest run test/availability.test.ts`
Expected: PASS (4 теста)

- [ ] **Step 5: Commit**

```bash
git add functions/src/booking/availability.ts functions/test/availability.test.ts
git commit -m "feat: add booking interval overlap check"
```

---

### Task 5: Расчёт цены брони (чистая функция)

**Files:**
- Create: `functions/src/booking/pricing.ts`
- Test: `functions/test/pricing.test.ts`

**Interfaces:**
- Consumes: ничего
- Produces: `computePrice(hourlyRate: number, minHours: number, startAt: Date, endAt: Date): number` — используется в Task 13 (`ai/tools.ts`)

- [ ] **Step 1: Написать падающий тест `functions/test/pricing.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { computePrice } from "../src/booking/pricing";

describe("computePrice", () => {
  it("charges exactly for full hours", () => {
    const price = computePrice(1000, 2, new Date("2026-07-03T09:00:00Z"), new Date("2026-07-03T12:00:00Z"));
    expect(price).toBe(3000);
  });

  it("rounds up partial hours", () => {
    const price = computePrice(1000, 2, new Date("2026-07-03T09:00:00Z"), new Date("2026-07-03T10:30:00Z"));
    expect(price).toBe(2000);
  });

  it("applies the minimum hours floor", () => {
    const price = computePrice(1000, 3, new Date("2026-07-03T09:00:00Z"), new Date("2026-07-03T10:00:00Z"));
    expect(price).toBe(3000);
  });
});
```

- [ ] **Step 2: Запустить тест и убедиться, что он падает**

Run: `cd functions && npx vitest run test/pricing.test.ts`
Expected: FAIL — `Cannot find module '../src/booking/pricing'`

- [ ] **Step 3: Реализовать `functions/src/booking/pricing.ts`**

```ts
export function computePrice(hourlyRate: number, minHours: number, startAt: Date, endAt: Date): number {
  const rawHours = (endAt.getTime() - startAt.getTime()) / 3_600_000;
  const billableHours = Math.max(minHours, Math.ceil(rawHours));
  return billableHours * hourlyRate;
}
```

- [ ] **Step 4: Запустить тест и убедиться, что он проходит**

Run: `cd functions && npx vitest run test/pricing.test.ts`
Expected: PASS (3 теста)

- [ ] **Step 5: Commit**

```bash
git add functions/src/booking/pricing.ts functions/test/pricing.test.ts
git commit -m "feat: add booking price calculation"
```

---

### Task 6: Валидация дат брони (чистая функция)

**Files:**
- Create: `functions/src/booking/dateValidation.ts`
- Test: `functions/test/dateValidation.test.ts`

**Interfaces:**
- Consumes: ничего
- Produces: `parseIsoDateTime(value: string): Date | null`, `isValidBookingRange(startAt: Date, endAt: Date, now: Date): { valid: boolean; reason?: string }` — используются в Task 13 (`ai/tools.ts`)

- [ ] **Step 1: Написать падающий тест `functions/test/dateValidation.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { parseIsoDateTime, isValidBookingRange } from "../src/booking/dateValidation";

describe("parseIsoDateTime", () => {
  it("parses a valid ISO string", () => {
    expect(parseIsoDateTime("2026-07-03T09:00:00Z")).toEqual(new Date("2026-07-03T09:00:00Z"));
  });

  it("returns null for invalid input", () => {
    expect(parseIsoDateTime("not-a-date")).toBeNull();
  });
});

describe("isValidBookingRange", () => {
  const now = new Date("2026-07-01T00:00:00Z");

  it("rejects a start time in the past", () => {
    const result = isValidBookingRange(new Date("2026-06-30T00:00:00Z"), new Date("2026-07-02T00:00:00Z"), now);
    expect(result).toEqual({ valid: false, reason: "start_in_past" });
  });

  it("rejects an end time before the start time", () => {
    const result = isValidBookingRange(new Date("2026-07-03T12:00:00Z"), new Date("2026-07-03T09:00:00Z"), now);
    expect(result).toEqual({ valid: false, reason: "end_before_start" });
  });

  it("accepts a valid range", () => {
    const result = isValidBookingRange(new Date("2026-07-03T09:00:00Z"), new Date("2026-07-03T12:00:00Z"), now);
    expect(result).toEqual({ valid: true });
  });
});
```

- [ ] **Step 2: Запустить тест и убедиться, что он падает**

Run: `cd functions && npx vitest run test/dateValidation.test.ts`
Expected: FAIL — `Cannot find module '../src/booking/dateValidation'`

- [ ] **Step 3: Реализовать `functions/src/booking/dateValidation.ts`**

```ts
export function parseIsoDateTime(value: string): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isValidBookingRange(
  startAt: Date,
  endAt: Date,
  now: Date
): { valid: boolean; reason?: string } {
  if (startAt <= now) {
    return { valid: false, reason: "start_in_past" };
  }
  if (endAt <= startAt) {
    return { valid: false, reason: "end_before_start" };
  }
  return { valid: true };
}
```

- [ ] **Step 4: Запустить тест и убедиться, что он проходит**

Run: `cd functions && npx vitest run test/dateValidation.test.ts`
Expected: PASS (5 тестов)

- [ ] **Step 5: Commit**

```bash
git add functions/src/booking/dateValidation.ts functions/test/dateValidation.test.ts
git commit -m "feat: add booking date parsing and range validation"
```

---

### Task 7: Доступ к секретам/конфигурации

**Files:**
- Create: `functions/src/config.ts`

**Interfaces:**
- Consumes: ничего
- Produces: `config.telegramBotToken`, `config.geminiApiKey`, `config.liqpayProviderToken`, `config.adminChatId`, `config.webhookSecretPath` — используются во всех задачах, работающих с Telegram/Gemini/LiqPay

- [ ] **Step 1: Создать `functions/src/config.ts`**

```ts
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
```

- [ ] **Step 2: Проверить сборку**

Run: `cd functions && npm run build`
Expected: без ошибок компиляции

- [ ] **Step 3: Commit**

```bash
git add functions/src/config.ts
git commit -m "feat: add secrets/config accessor"
```

---

### Task 8: Репозиторий броней и техники (Firestore)

**Files:**
- Create: `functions/src/booking/bookingRepository.ts`

**Interfaces:**
- Consumes: `getFirestore()` (Task 3), `Booking`, `BookingStatus`, `Crane` (Task 2)
- Produces: `getCrane(craneId): Promise<Crane | null>`, `listActiveBookingsForCrane(craneId): Promise<Booking[]>`, `createBooking(data): Promise<Booking>`, `getBooking(bookingId): Promise<Booking | null>`, `updateBookingStatusIfCurrent(bookingId, expectedCurrentStatus: BookingStatus[], nextStatus: BookingStatus, extra?: Partial<Booking>): Promise<{ ok: true; booking: Booking } | { ok: false; reason: string }>` — используются в Task 11, 12, 13

- [ ] **Step 1: Создать `functions/src/booking/bookingRepository.ts`**

```ts
import { getFirestore } from "../firestore";
import { Booking, BookingStatus, Crane } from "../types";

export async function getCrane(craneId: string): Promise<Crane | null> {
  const snap = await getFirestore().collection("cranes").doc(craneId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as Omit<Crane, "id">) };
}

export async function listActiveBookingsForCrane(craneId: string): Promise<Booking[]> {
  const snap = await getFirestore()
    .collection("bookings")
    .where("craneId", "==", craneId)
    .where("status", "in", ["confirmed", "paid"])
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Booking, "id">) }));
}

export async function createBooking(
  data: Omit<Booking, "id" | "status" | "paymentStatus" | "createdAt" | "updatedAt">
): Promise<Booking> {
  const now = new Date();
  const status: BookingStatus = "pending_confirmation";
  const ref = await getFirestore()
    .collection("bookings")
    .add({ ...data, status, paymentStatus: "unpaid", createdAt: now, updatedAt: now });
  return { id: ref.id, ...data, status, paymentStatus: "unpaid", createdAt: now, updatedAt: now };
}

export async function getBooking(bookingId: string): Promise<Booking | null> {
  const snap = await getFirestore().collection("bookings").doc(bookingId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as Omit<Booking, "id">) };
}

export async function updateBookingStatusIfCurrent(
  bookingId: string,
  expectedCurrentStatus: BookingStatus[],
  nextStatus: BookingStatus,
  extra: Partial<Booking> = {}
): Promise<{ ok: true; booking: Booking } | { ok: false; reason: string }> {
  const ref = getFirestore().collection("bookings").doc(bookingId);
  return getFirestore().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) {
      return { ok: false, reason: "not_found" };
    }
    const current = snap.data() as Omit<Booking, "id">;
    if (!expectedCurrentStatus.includes(current.status)) {
      return { ok: false, reason: `unexpected_status:${current.status}` };
    }
    const updatedAt = new Date();
    tx.update(ref, { ...extra, status: nextStatus, updatedAt });
    return { ok: true, booking: { id: bookingId, ...current, ...extra, status: nextStatus, updatedAt } };
  });
}
```

- [ ] **Step 2: Проверить сборку**

Run: `cd functions && npm run build`
Expected: без ошибок компиляции

- [ ] **Step 3: Commit**

```bash
git add functions/src/booking/bookingRepository.ts
git commit -m "feat: add Firestore booking and crane repository"
```

---

### Task 9: Хранилище истории диалога

**Files:**
- Create: `functions/src/conversation/conversationStore.ts`

**Interfaces:**
- Consumes: `getFirestore()` (Task 3), `ConversationMessage`, `ConversationState` (Task 2)
- Produces: `getConversation(chatId): Promise<ConversationState>`, `appendMessages(chatId, messages: ConversationMessage[]): Promise<void>`, `setPaused(chatId, paused: boolean): Promise<void>` — используются в Task 13, 15

- [ ] **Step 1: Создать `functions/src/conversation/conversationStore.ts`**

```ts
import { getFirestore } from "../firestore";
import { ConversationMessage, ConversationState } from "../types";

const MAX_HISTORY_MESSAGES = 20;

export async function getConversation(chatId: string): Promise<ConversationState> {
  const snap = await getFirestore().collection("conversations").doc(chatId).get();
  if (!snap.exists) {
    return { chatId, history: [] };
  }
  const data = snap.data() as { history?: ConversationMessage[]; paused?: boolean };
  return { chatId, history: data.history ?? [], paused: data.paused };
}

export async function appendMessages(chatId: string, messages: ConversationMessage[]): Promise<void> {
  const state = await getConversation(chatId);
  const history = [...state.history, ...messages].slice(-MAX_HISTORY_MESSAGES);
  await getFirestore()
    .collection("conversations")
    .doc(chatId)
    .set({ history, paused: state.paused ?? false }, { merge: true });
}

export async function setPaused(chatId: string, paused: boolean): Promise<void> {
  await getFirestore().collection("conversations").doc(chatId).set({ paused }, { merge: true });
}
```

- [ ] **Step 2: Проверить сборку**

Run: `cd functions && npm run build`
Expected: без ошибок компиляции

- [ ] **Step 3: Commit**

```bash
git add functions/src/conversation/conversationStore.ts
git commit -m "feat: add conversation history store"
```

---

### Task 10: Идемпотентность вебхуков Telegram

**Files:**
- Create: `functions/src/telegram/updateDedup.ts`

**Interfaces:**
- Consumes: `getFirestore()` (Task 3)
- Produces: `isDuplicateUpdate(updateId: number): Promise<boolean>` — используется в Task 16

- [ ] **Step 1: Создать `functions/src/telegram/updateDedup.ts`**

```ts
import { getFirestore } from "../firestore";

export async function isDuplicateUpdate(updateId: number): Promise<boolean> {
  const ref = getFirestore().collection("processedUpdates").doc(String(updateId));
  return getFirestore().runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists) {
      return true;
    }
    tx.set(ref, { processedAt: new Date() });
    return false;
  });
}
```

- [ ] **Step 2: Проверить сборку**

Run: `cd functions && npm run build`
Expected: без ошибок компиляции

- [ ] **Step 3: Commit**

```bash
git add functions/src/telegram/updateDedup.ts
git commit -m "feat: add Telegram webhook update deduplication"
```

---

### Task 11: Уведомления администратору и подтверждение/отклонение брони

**Files:**
- Create: `functions/src/admin/notifications.ts`

**Interfaces:**
- Consumes: `config` (Task 7), `Booking`, `Crane` (Task 2), `updateBookingStatusIfCurrent` (Task 8)
- Produces: `notifyAdminNewBooking(bot: Telegraf, booking: Booking, crane: Crane): Promise<void>`, `registerAdminActions(bot: Telegraf): void` — используются в Task 13, 15

- [ ] **Step 1: Создать `functions/src/admin/notifications.ts`**

```ts
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
```

- [ ] **Step 2: Проверить сборку**

Run: `cd functions && npm run build`
Expected: без ошибок компиляции

- [ ] **Step 3: Commit**

```bash
git add functions/src/admin/notifications.ts
git commit -m "feat: add admin booking notifications and confirm/decline actions"
```

---

### Task 12: Оплата через LiqPay (Telegram Payments)

**Files:**
- Create: `functions/src/payment/liqpayInvoice.ts`

**Interfaces:**
- Consumes: `config` (Task 7), `getBooking`, `updateBookingStatusIfCurrent` (Task 8)
- Produces: `sendBookingInvoice(bot: Telegraf, chatId: string, bookingId: string): Promise<void>`, `registerPaymentHandlers(bot: Telegraf): void` — используются в Task 13, 15

- [ ] **Step 1: Создать `functions/src/payment/liqpayInvoice.ts`**

```ts
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
```

- [ ] **Step 2: Проверить сборку**

Run: `cd functions && npm run build`
Expected: без ошибок компиляции

- [ ] **Step 3: Commit**

```bash
git add functions/src/payment/liqpayInvoice.ts
git commit -m "feat: add LiqPay invoice sending and payment callbacks"
```

---

### Task 13: Инструменты (tools) для Gemini function calling

**Files:**
- Create: `functions/src/ai/tools.ts`

**Interfaces:**
- Consumes: `hasOverlap` (Task 4), `computePrice` (Task 5), `parseIsoDateTime`/`isValidBookingRange` (Task 6), `config` (Task 7), `getCrane`/`listActiveBookingsForCrane`/`createBooking`/`getBooking`/`updateBookingStatusIfCurrent` (Task 8), `setPaused` (Task 9), `notifyAdminNewBooking` (Task 11), `sendBookingInvoice` (Task 12)
- Produces: `ToolContext { chatId: string; bot: Telegraf }`, `toolDeclarations: FunctionDeclaration[]`, `executeTool(name: string, args: Record<string, unknown>, ctx: ToolContext): Promise<Record<string, unknown>>` — используются в Task 14

- [ ] **Step 1: Создать `functions/src/ai/tools.ts`**

```ts
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

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<Record<string, unknown>> {
  switch (name) {
    case "check_availability": {
      const craneId = String(args.craneId);
      const startAt = parseIsoDateTime(String(args.startAt));
      const endAt = parseIsoDateTime(String(args.endAt));
      if (!startAt || !endAt) return { error: "invalid_date_format" };
      const rangeCheck = isValidBookingRange(startAt, endAt, new Date());
      if (!rangeCheck.valid) return { error: rangeCheck.reason };
      const crane = await getCrane(craneId);
      if (!crane) return { error: "crane_not_found" };
      const existing = await listActiveBookingsForCrane(craneId);
      const available = !hasOverlap({ startAt, endAt }, existing);
      return { available, price: computePrice(crane.hourlyRate, crane.minHours, startAt, endAt) };
    }
    case "create_booking": {
      const craneId = String(args.craneId);
      const startAt = parseIsoDateTime(String(args.startAt));
      const endAt = parseIsoDateTime(String(args.endAt));
      if (!startAt || !endAt) return { error: "invalid_date_format" };
      const rangeCheck = isValidBookingRange(startAt, endAt, new Date());
      if (!rangeCheck.valid) return { error: rangeCheck.reason };
      const crane = await getCrane(craneId);
      if (!crane) return { error: "crane_not_found" };
      const existing = await listActiveBookingsForCrane(craneId);
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
      const newStartAt = parseIsoDateTime(String(args.newStartAt));
      const newEndAt = parseIsoDateTime(String(args.newEndAt));
      if (!newStartAt || !newEndAt) return { error: "invalid_date_format" };
      const rangeCheck = isValidBookingRange(newStartAt, newEndAt, new Date());
      if (!rangeCheck.valid) return { error: rangeCheck.reason };
      const booking = await getBooking(bookingId);
      if (!booking) return { error: "booking_not_found" };
      const crane = await getCrane(booking.craneId);
      if (!crane) return { error: "crane_not_found" };
      const existing = (await listActiveBookingsForCrane(booking.craneId)).filter((b) => b.id !== bookingId);
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
```

- [ ] **Step 2: Проверить сборку**

Run: `cd functions && npm run build`
Expected: без ошибок компиляции

- [ ] **Step 3: Commit**

```bash
git add functions/src/ai/tools.ts
git commit -m "feat: add Gemini function-calling tool declarations and dispatcher"
```

---

### Task 14: Клиент Gemini 2.5 и цикл function calling

**Files:**
- Create: `functions/src/ai/gemini.ts`

**Interfaces:**
- Consumes: `config.geminiApiKey` (Task 7), `toolDeclarations`/`executeTool`/`ToolContext` (Task 13), `ConversationMessage` (Task 2)
- Produces: `runAgentTurn(params: { catalogText: string; history: ConversationMessage[]; userMessage: string; ctx: ToolContext }): Promise<string>` — используется в Task 15

**Важно:** `@google/genai` — относительно новый SDK, точные имена полей (`chats.create`, `sendMessage`, `response.functionCalls`, `response.text`) могли измениться после cutoff знаний модели. Перед переходом к Task 15 обязательно сверить со Step 2 этой задачи.

- [ ] **Step 1: Создать `functions/src/ai/gemini.ts`**

```ts
import { GoogleGenAI } from "@google/genai";
import { config } from "../config";
import { toolDeclarations, executeTool, ToolContext } from "./tools";
import { ConversationMessage } from "../types";

const MODEL_NAME = "gemini-2.5-flash";
const MAX_TOOL_ITERATIONS = 5;

function buildSystemInstruction(catalogText: string): string {
  return [
    "Ти — консультант компанії KranUA (оренда автокранів у Києві).",
    "Спілкуйся тією мовою, якою пише клієнт (українська або російська).",
    "Допомагай з консультацією, бронюванням, перенесенням і оплатою оренди.",
    "Використовуй надані інструменти для перевірки доступності, створення/перенесення/скасування броні та оплати.",
    "Ніколи не вигадуй ціни чи техніку — використовуй лише дані з переліку нижче.",
    `Поточний час: ${new Date().toISOString()}.`,
    "Перелік техніки та цін:",
    catalogText,
  ].join("\n");
}

export async function runAgentTurn(params: {
  catalogText: string;
  history: ConversationMessage[];
  userMessage: string;
  ctx: ToolContext;
}): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

  const chat = ai.chats.create({
    model: MODEL_NAME,
    config: {
      systemInstruction: buildSystemInstruction(params.catalogText),
      tools: [{ functionDeclarations: toolDeclarations }],
    },
    history: params.history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
  });

  let response = await chat.sendMessage({ message: params.userMessage });
  let iterations = 0;

  while (response.functionCalls && response.functionCalls.length > 0 && iterations < MAX_TOOL_ITERATIONS) {
    const call = response.functionCalls[0];
    const result = await executeTool(call.name ?? "", (call.args ?? {}) as Record<string, unknown>, params.ctx);
    response = await chat.sendMessage({
      message: [{ functionResponse: { name: call.name ?? "", response: result } }],
    });
    iterations += 1;
  }

  return response.text ?? "Вибачте, не вдалося сформувати відповідь. Напишіть /human, щоб покликати диспетчера.";
}
```

- [ ] **Step 2: Сверить API `@google/genai` с установленным пакетом**

Run: `cd functions && npm ls @google/genai && cat node_modules/@google/genai/package.json | grep '"version"'`
Затем открыть `functions/node_modules/@google/genai/dist/*.d.ts` (или README пакета) и подтвердить, что `ai.chats.create(...)`, `chat.sendMessage({ message })`, `response.functionCalls`, `response.text` существуют с такими именами. Если сигнатуры отличаются — поправить `gemini.ts` под фактический API пакета прямо сейчас, до перехода к Task 15.
Expected: `npm ls` показывает установленную версию `@google/genai`; типы подтверждают (или требуют правки) сигнатуры выше.

- [ ] **Step 3: Проверить сборку**

Run: `cd functions && npm run build`
Expected: без ошибок компиляции

- [ ] **Step 4: Commit**

```bash
git add functions/src/ai/gemini.ts
git commit -m "feat: add Gemini 2.5 function-calling agent loop"
```

---

### Task 15: Telegraf-бот (диалог, /start, обработчики)

**Files:**
- Create: `functions/src/bot.ts`

**Interfaces:**
- Consumes: `config.telegramBotToken` (Task 7), `getConversation`/`appendMessages` (Task 9), `runAgentTurn` (Task 14), `registerAdminActions` (Task 11), `registerPaymentHandlers` (Task 12), `getFirestore` (Task 3)
- Produces: `createBot(): Telegraf` — используется в Task 16

- [ ] **Step 1: Создать `functions/src/bot.ts`**

```ts
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

  return bot;
}
```

- [ ] **Step 2: Проверить сборку**

Run: `cd functions && npm run build`
Expected: без ошибок компиляции

- [ ] **Step 3: Commit**

```bash
git add functions/src/bot.ts
git commit -m "feat: wire Telegraf bot with AI agent, admin and payment handlers"
```

---

### Task 16: Cloud Function entry point (вебхук)

**Files:**
- Modify: `functions/src/index.ts` (заменить стаб из Task 1)

**Interfaces:**
- Consumes: `createBot` (Task 15), `isDuplicateUpdate` (Task 10), `config.webhookSecretPath` (Task 7)
- Produces: экспортируемая Cloud Function `telegramWebhook` — конечная точка деплоя (Task 17)

- [ ] **Step 1: Заменить содержимое `functions/src/index.ts`**

```ts
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
```

- [ ] **Step 2: Проверить сборку**

Run: `cd functions && npm run build`
Expected: без ошибок компиляции

- [ ] **Step 3: Commit**

```bash
git add functions/src/index.ts
git commit -m "feat: implement telegramWebhook Cloud Function entry point"
```

---

### Task 17: Деплой, секреты, ручное сквозное тестирование

**Files:**
- Create: `functions/README.md`

**Interfaces:**
- Consumes: всё вышеперечисленное
- Produces: развёрнутый и настроенный бот, готовый к использованию

- [ ] **Step 1: Создать `functions/README.md` с инструкциями по настройке**

```markdown
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
```

- [ ] **Step 2: Пройти чек-лист вручную**

Выполнить все пункты Step 1.6 (эмулятор) и Step 1.7 (реальный тестовый бот) лично, отметив каждый пункт чек-листа.
Expected: все пункты чек-листа проходят успешно.

- [ ] **Step 3: Commit**

```bash
git add functions/README.md
git commit -m "docs: add deployment and manual testing guide for Telegram bot"
```

---

## Порядок выполнения

Задачи строго последовательны (1 → 17): каждая опирается на модули, созданные в предыдущих. TDD-задачи — 4, 5, 6 (чистые функции с автотестами); остальные проверяются компиляцией (`npm run build`) и, в финале, ручным сквозным тестированием (Task 17).
