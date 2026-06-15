// Resposta padrão da API .NET
export interface ApiResponse<T = unknown> {
  isSuccess: boolean;
  message: string;
  errorMessage: string;
  data: T;
}

// Resultado tipado de Server Actions
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: number };

// Tipos de erro da API
export enum ApiErrorType {
  NETWORK = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT_ERROR",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  VALIDATION = "VALIDATION_ERROR",
  SERVER = "SERVER_ERROR",
  UNKNOWN = "UNKNOWN_ERROR",
}

export class ApiException extends Error {
  status: number;
  type: ApiErrorType;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    status: number,
    type?: ApiErrorType,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "ApiException";
    this.status = status;
    this.type = type ?? statusToErrorType(status);
    this.details = details;
  }
}

function statusToErrorType(status: number): ApiErrorType {
  const map: Record<number, ApiErrorType> = {
    400: ApiErrorType.VALIDATION,
    401: ApiErrorType.UNAUTHORIZED,
    403: ApiErrorType.FORBIDDEN,
    404: ApiErrorType.NOT_FOUND,
    408: ApiErrorType.TIMEOUT,
    500: ApiErrorType.SERVER,
    502: ApiErrorType.SERVER,
    503: ApiErrorType.SERVER,
  };
  return map[status] ?? ApiErrorType.UNKNOWN;
}

export const ERROR_MESSAGES: Record<ApiErrorType, string> = {
  [ApiErrorType.NETWORK]: "Falha na conexão. Verifique sua internet.",
  [ApiErrorType.TIMEOUT]: "A requisição demorou muito para responder.",
  [ApiErrorType.UNAUTHORIZED]: "Sessão expirada. Faça login novamente.",
  [ApiErrorType.FORBIDDEN]: "Você não tem permissão para acessar este recurso.",
  [ApiErrorType.NOT_FOUND]: "O recurso solicitado não foi encontrado.",
  [ApiErrorType.VALIDATION]: "Os dados enviados contêm erros.",
  [ApiErrorType.SERVER]: "Erro no servidor. Tente novamente mais tarde.",
  [ApiErrorType.UNKNOWN]: "Ocorreu um erro inesperado.",
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type SortDirection = "asc" | "desc";
