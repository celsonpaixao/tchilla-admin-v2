export const COOKIE_NAME = "tchilla_token";

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 60 * 60 * 24 * 7, // 7 dias
  path: "/",
};

export const API_TIMEOUT = 100_000;

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
