import type { FieldValue, Timestamp } from "firebase/firestore";

/**
 * Documento da coleção `fcm_tokens`, partilhada com o app-user, o app do parceiro,
 * o back-end e as Cloud Functions. As functions enviam pushes para os documentos com
 * `userId == destinatário` e `isActive == true`, filtrando por `role` (ver
 * tchilla-firebase-functions/functions/src/utils/tokens.js).
 */
export interface FcmTokenDoc {
  userId: number;
  token: string;
  /** Estável por browser; um documento por (userId, deviceId, app). */
  deviceId: string;
  deviceType: "web";
  deviceName: string;
  deviceInfo: FcmDeviceInfo;
  appVersion: string;
  /** Origem do token. Nunca "web-admin": as functions tratam esse valor como parceiro. */
  plataforma: "web";
  /** Que app registou o token, para separar admin, cliente e parceiro no mesmo userId. */
  app: "admin";
  /** Papel do dono ("Supervisor"…), para não receber pushes de cliente/parceiro com o mesmo id. */
  role: string;
  nome?: string;
  isActive: boolean;
  invalidReason?: string | null;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

export interface FcmDeviceInfo {
  deviceName: string;
  osVersion: string;
  browser: string;
  language: string;
  userAgent: string;
  /** Aberto como app instalada (PWA). */
  standalone: boolean;
  mobile: boolean;
}
