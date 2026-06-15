export interface SupervisorResponse {
  id: number;
  username: string;
  telefone: string;
  admin: boolean;
}

export interface CreateSupervisorRequest {
  username: string;
  telefone: string;
  senha: string;
}
