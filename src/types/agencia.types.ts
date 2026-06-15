export interface AgenciaEndereco {
  nome: string;
  complemento: string;
  bairro: string;
  numero: string;
  rua: string;
  cidade: string;
  pais: string;
  provincia: string;
  cep: string;
  latitude: number;
  longitude: number;
}

export interface AgenciaUsuario {
  id: number;
  nome: string;
  email: string;
  foto?: string;
  telefone: string;
  dataCriacao: string;
  tipo: string;
  verificado: boolean;
}

export interface AgenciaData {
  id: number;
  nif: string | null;
  descricao: string | null;
  nomeComercial: string | null;
  tipo: string;
  aprovado: boolean;
  usuario: AgenciaUsuario;
  endereco?: AgenciaEndereco | null;
}

export interface AgenciaCreateRequest {
  nif: string;
  descricao: string;
  usuarioDto: {
    nome: string;
    email: string;
    telefone: string;
    senha: string;
  };
  enderecoDto: AgenciaEndereco & { provinciaId?: number };
}
