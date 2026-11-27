import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    /**
     * Papel da coluna no cartão que substitui a tabela no telemóvel (GlobalTable):
     *  - "title":   linha principal do cartão (por omissão, a 1.ª coluna de dados)
     *  - "leading": antes do título (ex.: caixa de seleção)
     *  - "badge":   ao lado do título, à direita (ids "estado"/"pago"/"status" já o são)
     *  - "actions": rodapé do cartão (ids "acoes"/"actions" já o são por omissão)
     *  - "full":    valor a toda a largura, sem rótulo
     *  - "hidden":  não aparece no cartão
     */
    mobile?: "title" | "leading" | "badge" | "actions" | "full" | "hidden";
  }
}
