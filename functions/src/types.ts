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
