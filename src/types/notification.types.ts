import type { Timestamp } from "firebase/firestore";

export interface FirebaseNotificationData {
  reservaId: string;
  imagem: string;
  lida: boolean;
  mensagem: string;
  tipo: string;
  titulo: string;
  userId: number;
}

export interface FirebaseNotification {
  id: string;
  criadoEm: Timestamp;
  data: FirebaseNotificationData;
}
