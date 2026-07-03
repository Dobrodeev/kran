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
