export enum UserType {
  AGENCIA = "Agencia",
  PRESTADOR = "Prestador",
  SUPERVISOR = "Supervisor",
  VISITANTE = "Visitante",
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
  role: "supervisor" | "Parceiro";
}

export interface UsuarioInterface {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  foto: string | null;
  tipo: UserType | string;
  dataCriacao: string;
  dataAtualizacao?: string;
  dataRemocao: string | null;
  verificado: boolean;
}
