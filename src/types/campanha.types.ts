import type { Timestamp } from "firebase/firestore";
import type { AudienceType } from "@/types/settings.types";
import type { PromoCatalogItem } from "@/actions/campanha.actions";
import type { CupomData } from "@/types/cupom.types";

export interface CampanhaRascunhoInput {
  audienceType: AudienceType;
  selectedId: number | null;
  selectedName: string | null;
  titulo: string;
  mensagem: string;
  tipo: string;
  imagem: string | null;
  data: Record<string, string> | null;
  promoSelection: PromoCatalogItem | null;
  cupomSelection: CupomData | null;
}

export interface CampanhaRascunho extends CampanhaRascunhoInput {
  id: string;
  usageCount: number;
  criadoEm: Timestamp | null;
  atualizadoEm: Timestamp | null;
}
