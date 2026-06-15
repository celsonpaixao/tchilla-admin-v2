export interface SubCategoryData {
  id: number;
  nome: string;
  descricao: string;
  tipo: number; // 1=Serviço, 2=Espaço
  foto: string;
  categoriaId: number;
}

export interface CategoryData {
  id: number;
  nome: string;
  descricao: string;
  foto: string;
  subcategorias?: SubCategoryData[];
}

export interface CreateCategoryRequest {
  Nome: string;
  Descricao: string;
  Foto: File;
}

export interface UpdateCategoryRequest {
  id: number;
  Nome: string;
  Descricao: string;
}

export interface CreateSubCategoryRequest {
  Nome: string;
  Descricao: string;
  Tipo: number;
  CategoriaId: number;
  Foto?: File;
}
