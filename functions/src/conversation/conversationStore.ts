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
