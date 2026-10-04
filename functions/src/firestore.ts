import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore as getAdminFirestore, Firestore } from "firebase-admin/firestore";

let firestoreInstance: Firestore | null = null;

export function getFirestore(): Firestore {
  if (!firestoreInstance) {
    if (getApps().length === 0) {
      initializeApp();
    }
    // The project's database was created with the ID "default", not the implicit "(default)".
    firestoreInstance = getAdminFirestore("default");
  }
  return firestoreInstance;
}
