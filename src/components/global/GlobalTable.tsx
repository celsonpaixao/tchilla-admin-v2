"use client";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type Cell,
  type Column,
  type Table,
} from "@tanstack/react-table";
import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAGINATION_SIZE } from "@/constants/app.constants";

export interface ServerPagination {
  /** Página atual, começa em 1. */
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface GlobalTableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  searchPlaceholder?: string;
  pageSize?: number;
  isLoading?: boolean;
  emptyMessage?: React.ReactNode;
  /** Conteúdo extra na barra da tabela (filtros). */
  toolbar?: React.ReactNode;
  /**
   * Paginação feita no servidor: `data` é só a página atual. A pesquisa local é
   * escondida (a pesquisa deve ir no `toolbar`, também no servidor).
   */
  serverPagination?: ServerPagination;
}

function paginasVisiveis(atual: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const paginas: (number | "…")[] = [1];
  const inicio = Math.max(2, atual - 1);
  const fim = Math.min(total - 1, atual + 1);
  if (inicio > 2) paginas.push("…");
  for (let p = inicio; p <= fim; p++) paginas.push(p);
  if (fim < total - 1) paginas.push("…");
  paginas.push(total);
  return paginas;
}

function SkeletonRow({ columns }: { columns: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} style={{ height: "var(--row-h)", padding: "0 var(--pad-x)" }}>
          <div className="skeleton h-4 w-3/4" />
        </td>
      ))}
    </tr>
  );
}

/* ── Telemóvel: cada linha vira um cartão ──────────────────── */

type PapelMobile = "title" | "leading" | "badge" | "actions" | "full" | "hidden" | "campo";

/** Estados (badges) vão para a linha do título: o cartão fica mais curto e o estado sempre visível. */
const COLUNAS_BADGE = ["estado", "pago", "status"];

function papelDaColuna<T>(col: Column<T, unknown>): PapelMobile {
  const m = col.columnDef.meta?.mobile;
  if (m) return m;
  if (col.id === "acoes" || col.id === "actions") return "actions";
  if (col.id === "escolher") return "leading";
  if (COLUNAS_BADGE.includes(col.id)) return "badge";
  return "campo";
}

function semRotulo<T>(col: Column<T, unknown>): boolean {
  const h = col.columnDef.header;
  return h == null || (typeof h === "string" && !h.trim());
}

function CartoesMobile<T>({ table, isLoading, linhasSkeleton }: { table: Table<T>; isLoading?: boolean; linhasSkeleton: number }) {
  const headerDe = new Map(table.getFlatHeaders().map((h) => [h.column.id, h]));
  const render = (c: Cell<T, unknown>) => flexRender(c.column.columnDef.cell, c.getContext());

  if (isLoading) {
    return (
      <ul>
        {Array.from({ length: linhasSkeleton }).map((_, i) => (
          <li key={i} style={{ padding: "14px var(--pad-x)", borderTop: i ? "1px solid var(--border)" : undefined }}>
            <div className="skeleton h-4 w-2/3 mb-3" />
            <div className="skeleton h-3 w-full mb-2" />
            <div className="skeleton h-3 w-4/5" />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul>
      {table.getRowModel().rows.map((row, i) => {
        const cells = row.getVisibleCells().filter((c) => papelDaColuna(c.column) !== "hidden");
        const papel = (c: Cell<T, unknown>) => papelDaColuna(c.column);
        const titulo = cells.find((c) => papel(c) === "title") ?? cells.find((c) => papel(c) === "campo");
        const leading = cells.filter((c) => papel(c) === "leading");
        const badges = cells.filter((c) => papel(c) === "badge");
        const acoes = cells.filter((c) => papel(c) === "actions");
        const campos = cells.filter((c) => c !== titulo && (papel(c) === "campo" || papel(c) === "full"));

        return (
          <li key={row.id} style={{ padding: "14px var(--pad-x)", borderTop: i ? "1px solid var(--border)" : undefined }}>
            <div className="flex items-start gap-3">
              {leading.map((c) => (
                <div key={c.id} className="flex-shrink-0 pt-0.5">{render(c)}</div>
              ))}
              {titulo && (
                <div className="min-w-0 flex-1 font-semibold break-words" style={{ color: "var(--heading)", fontSize: 14 }}>
                  {render(titulo)}
                </div>
              )}
              {badges.length > 0 && (
                <div className="flex flex-wrap items-center justify-end gap-1.5 flex-shrink-0 max-w-[60%]">
                  {badges.map((c) => <div key={c.id}>{render(c)}</div>)}
                </div>
              )}
            </div>

            {campos.length > 0 && (
              <dl className="mt-2.5 space-y-2" style={{ fontSize: "var(--font-sm)", color: "var(--text)" }}>
                {campos.map((c) => {
                  const h = headerDe.get(c.column.id);
                  if (papel(c) === "full" || !h || semRotulo(c.column)) {
                    return <dd key={c.id} className="min-w-0 break-words">{render(c)}</dd>;
                  }
                  return (
                    <div key={c.id} className="flex items-start justify-between gap-4">
                      <dt className="tbl-card-label flex-shrink-0 pt-px">
                        {flexRender(c.column.columnDef.header, h.getContext())}
                      </dt>
                      <dd className="min-w-0 text-right break-words">{render(c)}</dd>
                    </div>
                  );
                })}
              </dl>
            )}

            {acoes.length > 0 && (
              <div className="tbl-card-acoes mt-3 flex flex-wrap items-center justify-end gap-2">
                {acoes.map((c) => <div key={c.id}>{render(c)}</div>)}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function GlobalTable<T>({
  data,
  columns,
  searchPlaceholder = "Buscar…",
  pageSize = PAGINATION_SIZE,
  isLoading,
  emptyMessage = "Nenhum resultado encontrado.",
  toolbar,
  serverPagination,
}: GlobalTableProps<T>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const server = serverPagination;

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: server ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: !!server,
    pageCount: server?.totalPages,
    initialState: { pagination: { pageSize: server?.pageSize ?? pageSize } },
  });

  const { pageIndex, pageSize: ps } = table.getState().pagination;
  const totalRows = table.getFilteredRowModel().rows.length;

  return (
    <div>
      {/* Wrapper do DS: border + radius + shadow no container inteiro */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)", background: "var(--surface)" }}
      >
        {/* tbl-toolbar — busca integrada ao container */}
        <div
          style={{
            display: "flex", alignItems: "center", flexWrap: "wrap",
            gap: "var(--gap)", padding: "8px var(--pad-x)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          {!server && (
          <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-3)" }}
            />
            <input
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-3 outline-none transition-colors"
              style={{
                height: "var(--control-h-sm)",
                background: "var(--gray-50)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r-md)",
                fontSize: "var(--font-sm)",
                color: "var(--text)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--blue)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>
          )}
          {toolbar}
        </div>

      {/* Telemóvel: cartões */}
      <div className="md:hidden">
        <CartoesMobile table={table} isLoading={isLoading} linhasSkeleton={4} />
      </div>

      {/* Tablet/desktop: tabela */}
      {/* relative: elementos absolutos (ex.: sr-only) ficam presos ao scroll e não alargam a página */}
      <div className="hidden md:block overflow-x-auto relative">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="tbl-th text-left whitespace-nowrap"
                    onClick={header.column.getToggleSortingHandler()}
                    style={{ cursor: header.column.getCanSort() ? "pointer" : "default" }}
                  >
                    <div className="flex items-center gap-1.5">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span style={{ color: "var(--gray-400)" }}>
                          {header.column.getIsSorted() === "asc" ? (
                            <ChevronUp size={12} />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ChevronDown size={12} />
                          ) : (
                            <ChevronsUpDown size={12} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} columns={columns.length} />
              ))
            ) : table.getRowModel().rows.length === 0 ? null : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="group transition-colors"
                  style={{ borderTop: "1px solid var(--border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--gray-25)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{
                        height: "var(--row-h)",
                        padding: "0 var(--pad-x)",
                        fontSize: "var(--font-sm)",
                        color: "var(--text)",
                        verticalAlign: "middle",
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Vazio fora da área com scroll horizontal — em ecrãs estreitos fica sempre visível */}
      {!isLoading && table.getRowModel().rows.length === 0 && (
        <div
          className="text-center"
          style={{
            padding: "40px var(--pad-x)",
            borderTop: "1px solid var(--border)",
            fontSize: "var(--font-sm)",
            color: "var(--text-3)",
          }}
        >
          {emptyMessage}
        </div>
      )}

      {/* tbl-foot — paginação no servidor */}
      {server && server.totalPages > 1 && (
        <div
          style={{
            display: "flex", alignItems: "center", gap: "var(--gap)",
            padding: "7px var(--pad-x)",
            borderTop: "1px solid var(--border)",
            background: "var(--surface-2)",
            fontSize: "var(--font-sm)",
            color: "var(--text-3)",
          }}
        >
          <p style={{ fontVariantNumeric: "tabular-nums" }}>
            {(server.page - 1) * server.pageSize + 1}–{Math.min(server.page * server.pageSize, server.totalItems)} de {server.totalItems}
          </p>
          <nav aria-label="Paginação" style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: "auto" }}>
            <button
              onClick={() => server.onPageChange(server.page - 1)}
              disabled={server.page <= 1 || isLoading}
              aria-label="Página anterior"
              className="flex items-center justify-center rounded-lg transition-colors cursor-pointer disabled:opacity-40"
              style={{ width: "var(--control-h-sm)", height: "var(--control-h-sm)", color: "var(--text-2)" }}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="sm:hidden px-2" style={{ fontVariantNumeric: "tabular-nums", color: "var(--text-2)" }}>
              {server.page} / {server.totalPages}
            </span>
            {paginasVisiveis(server.page, server.totalPages).map((p, i) =>
              p === "…" ? (
                <span key={`gap-${i}`} className="hidden sm:inline-block" style={{ width: "var(--control-h-sm)", textAlign: "center" }}>…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => server.onPageChange(p)}
                  disabled={isLoading}
                  aria-current={p === server.page ? "page" : undefined}
                  className="hidden sm:flex items-center justify-center rounded-lg font-medium transition-colors cursor-pointer"
                  style={{
                    width: "var(--control-h-sm)", height: "var(--control-h-sm)",
                    fontSize: "var(--font-sm)",
                    ...(p === server.page
                      ? { background: "var(--blue)", color: "var(--navy)", fontWeight: 700 }
                      : { color: "var(--text-2)" }),
                  }}
                >
                  {p}
                </button>
              ),
            )}
            <button
              onClick={() => server.onPageChange(server.page + 1)}
              disabled={server.page >= server.totalPages || isLoading}
              aria-label="Página seguinte"
              className="flex items-center justify-center rounded-lg transition-colors cursor-pointer disabled:opacity-40"
              style={{ width: "var(--control-h-sm)", height: "var(--control-h-sm)", color: "var(--text-2)" }}
            >
              <ChevronRight size={16} />
            </button>
          </nav>
        </div>
      )}

      {/* tbl-foot — conforme DS */}
      {!server && totalRows > ps && (
        <div
          style={{
            display: "flex", alignItems: "center", gap: "var(--gap)",
            padding: "7px var(--pad-x)",
            borderTop: "1px solid var(--border)",
            background: "var(--surface-2)",
            fontSize: "var(--font-sm)",
            color: "var(--text-3)",
          }}
        >
          <p>
            {pageIndex * ps + 1}–{Math.min((pageIndex + 1) * ps, totalRows)} de {totalRows}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 2, marginLeft: "auto" }}>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Página anterior"
              className="flex items-center justify-center rounded-lg transition-colors cursor-pointer disabled:opacity-40"
              style={{ width: "var(--control-h-sm)", height: "var(--control-h-sm)", color: "var(--text-2)" }}
            >
              <ChevronLeft size={16} />
            </button>
            <span className="sm:hidden px-2" style={{ fontVariantNumeric: "tabular-nums", color: "var(--text-2)" }}>
              {pageIndex + 1} / {table.getPageCount()}
            </span>
            {Array.from({ length: Math.min(5, table.getPageCount()) }).map((_, i) => {
              const page = i;
              return (
                <button
                  key={page}
                  onClick={() => table.setPageIndex(page)}
                  className={cn("hidden sm:flex items-center justify-center rounded-lg font-medium transition-colors cursor-pointer")}
                  style={{
                    width: "var(--control-h-sm)", height: "var(--control-h-sm)",
                    fontSize: "var(--font-sm)",
                    ...(pageIndex === page
                      ? { background: "var(--blue)", color: "var(--navy)", fontWeight: 700 }
                      : { color: "var(--text-2)" }),
                  }}
                >
                  {page + 1}
                </button>
              );
            })}
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Página seguinte"
              className="flex items-center justify-center rounded-lg transition-colors cursor-pointer disabled:opacity-40"
              style={{ width: "var(--control-h-sm)", height: "var(--control-h-sm)", color: "var(--text-2)" }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
      </div> {/* fim wrapper container DS */}
    </div>
  );
}
