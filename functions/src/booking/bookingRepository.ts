import { getFirestore } from "../firestore";
import { Timestamp } from "firebase-admin/firestore";
import { Booking, BookingStatus, Crane } from "../types";

/**
 * Firestore returns date-like fields as `Timestamp` instances (not native `Date`),
 * for any document read back from the database. Freshly constructed in-memory
 * objects (e.g. right after `createBooking`) use real `Date` objects, so this
 * helper is defensive: it converts `Timestamp` -> `Date` and passes real `Date`
 * values through unchanged.
 */
function toDate(value: unknown): Date {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  return value as Date;
}

/** Normalizes all Booking date-like fields read from a Firestore document. */
function normalizeBookingDates(data: Omit<Booking, "id">): Omit<Booking, "id"> {
  return {
    ...data,
    startAt: toDate(data.startAt),
    endAt: toDate(data.endAt),
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

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
  return snap.docs.map((d) => ({ id: d.id, ...normalizeBookingDates(d.data() as Omit<Booking, "id">) }));
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
  return { id: snap.id, ...normalizeBookingDates(snap.data() as Omit<Booking, "id">) };
}

/**
 * Returns the most recently created booking for a given client chat, or null if
 * the client has never booked. Used so Gemini can resolve "my booking" /
 * "оплатити" in a new conversation turn without needing the client to restate
 * the opaque Firestore booking id.
 */
export async function getLatestBookingForChat(clientChatId: string): Promise<Booking | null> {
  const snap = await getFirestore()
    .collection("bookings")
    .where("clientChatId", "==", clientChatId)
    .orderBy("createdAt", "desc")
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...normalizeBookingDates(doc.data() as Omit<Booking, "id">) };
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
    const current = normalizeBookingDates(snap.data() as Omit<Booking, "id">);
    if (!expectedCurrentStatus.includes(current.status)) {
      return { ok: false, reason: `unexpected_status:${current.status}` };
    }
    const updatedAt = new Date();
    tx.update(ref, { ...extra, status: nextStatus, updatedAt });
    return { ok: true, booking: { id: bookingId, ...current, ...extra, status: nextStatus, updatedAt } };
  });
}
