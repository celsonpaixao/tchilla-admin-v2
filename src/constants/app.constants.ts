export const COOKIE_NAME = "tchilla_token";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  // "lax", não "strict": abrir a PWA pelo ícone do ecrã principal ou por uma notificação conta
  // como navegação vinda de fora, e com "strict" o cookie não ia nesse 1.º pedido → login de novo.
  // "lax" continua a bloqueá-lo em POSTs de outros sites (CSRF).
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 7, // 7 dias
  path: "/",
};

export const API_TIMEOUT = 100_000;

/** Service worker único da app (PWA + push do Firebase) — ver public/sw.js. */
export const SERVICE_WORKER_URL = "/sw.js";

/** Registo de tokens de push — mesmo padrão do app-user e do app do parceiro. */
export const FCM = {
  COLLECTION: "fcm_tokens",
  APP: "admin",
  PLATAFORMA: "web",
  ROLE_PADRAO: "Supervisor",
  /** Chave do localStorage com o id estável deste browser. */
  DEVICE_ID_KEY: "tchilla_admin_device_id",
} as const;

export const RESERVA_STATUS = {
  CONFIRMADO: 1,
  CANCELADO: 2,
  CONCLUIDO: 3,
} as const;

export const PAGINATION_SIZE = 10;

export const MONTHS_PT = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export const SOUNDS = {
  BOOT_DOWN: "/sounds/boot_down.mp3",
  ERROR: "/sounds/error.mp3",
  INFO: "/sounds/info.mp3",
  MESSAGE: "/sounds/message.mp3",
  NOTIFICATION: "/sounds/notification.mp3",
  POPUP: "/sounds/popup.mp3",
  REMINDER: "/sounds/reminder.mp3",
  SUCCESS: "/sounds/success.mp3",
  WARNING: "/sounds/warning.mp3",
} as const;
