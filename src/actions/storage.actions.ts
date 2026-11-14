"use server";
import { serverFetch } from "@/lib/api/server";
import { mensagemDeErro } from "@/lib/api/erros";
import type { ActionResult } from "@/types/common.types";

/* Os mesmos tipos que o StorageController aceita como imagem (sem SVG). */
const TIPOS = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const LIMITE_BYTES = 10 * 1024 * 1024;
const PASTAS = new Set(["colecoes", "promocoes", "campanhas"]);

/**
 * Sobe uma imagem para o storage (POST /api/Storage/upload) e devolve o endereço público.
 * O FormData traz "file" e "pasta".
 */
export async function carregarImagem(dados: FormData): Promise<ActionResult<string>> {
  const ficheiro = dados.get("file");
  const pasta = String(dados.get("pasta") ?? "");

  if (!(ficheiro instanceof File) || ficheiro.size === 0) return { success: false, error: "Escolhe uma imagem." };
  if (!TIPOS.has(ficheiro.type)) return { success: false, error: "Só aceitamos imagens JPG, PNG, WEBP ou GIF." };
  if (ficheiro.size > LIMITE_BYTES) return { success: false, error: "A imagem tem mais de 10 MB." };
  if (!PASTAS.has(pasta)) return { success: false, error: "Pasta de destino inválida." };

  try {
    const envio = new FormData();
    envio.append("file", ficheiro, ficheiro.name);
    const res = await serverFetch<{ filePath?: string; FilePath?: string }>("/api/Storage/upload", {
      method: "POST",
      params: { folderPath: pasta },
      formData: envio,
    });
    const url = res.filePath ?? res.FilePath;
    if (!url) return { success: false, error: "O servidor não devolveu o endereço da imagem." };
    return { success: true, data: url };
  } catch (err: unknown) {
    return { success: false, error: mensagemDeErro(err) };
  }
}
