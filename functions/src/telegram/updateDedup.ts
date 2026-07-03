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
