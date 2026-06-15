import type { Timestamp } from "firebase/firestore";

/** Sub-object `data` inside each Firestore `notificacoes` document */
export interface NotificationPayload {
  reservaId?: string;
  tipo?: string;
  tipoEvento?: string;
  dataInicio?: string;
  valorTotal?: string;
  novoStatus?: string;
  clienteId?: string;
  clienteName?: string;
  route?: string;
}

/** Matches the actual Firestore document structure written by Firebase Functions */
export interface FirebaseNotification {
  id: string;
  userId: number;
  titulo: string;
  mensagem: string;
  tipo: string;
  lida: boolean;
  criadoEm: Timestamp;
  deletadoEm: Timestamp | null;
  imagem: string | null;
  data: NotificationPayload;
}
