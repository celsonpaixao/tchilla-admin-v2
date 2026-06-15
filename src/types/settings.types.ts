export interface SettingsAppEnum {
  name: string;
  values: string[];
}

export interface CampanhaRequest {
  userId: number;
  titulo: string;
  mensagem: string;
  tipo: "Geral";
}

export interface EnderecoResponse {
  id: number;
  nome: string;
  complemento: string;
  bairro: string;
  numero: string;
  cep: string;
  rua: string;
  cidade: string;
  pais: string;
  provincia: string;
  latitude: number;
  longitude: number;
}

export interface Provincia {
  id: number;
  nome: string;
}

export interface PrestadorData {
  id: number;
  nif: string;
  descricao: string;
  tipo: string;
  aprovado: boolean;
  usuario: {
    id: number;
    nome: string;
    telefone: string;
    email: string;
    foto?: string;
    dataCriacao: string;
  };
  enderecoDto: {
    numero: string;
    rua: string;
    cidade: string;
    provinciaId: number;
    cep: string;
    latitude: number;
    longitude: number;
    principal: boolean;
  };
}
