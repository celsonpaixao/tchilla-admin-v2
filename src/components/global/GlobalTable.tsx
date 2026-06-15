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
} from "@tanstack/react-table";
import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { PAGINATION_SIZE } from "@/constants/app.constants";

interface GlobalTableProps<T> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  searchPlaceholder?: string;
  pageSize?: number;
  isLoading?: boolean;
  emptyMessage?: string;
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

export function GlobalTable<T>({
  data,
  columns,
  searchPlaceholder = "Buscar…",
  pageSize = PAGINATION_SIZE,
  isLoading,
  emptyMessage = "Nenhum resultado encontrado.",
}: GlobalTableProps<T>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize } },
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
            display: "flex", alignItems: "center",
            gap: "var(--gap)", padding: "8px var(--pad-x)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="relative flex-1 max-w-xs">
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
        </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
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
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center"
                  style={{ padding: "48px var(--pad-x)", fontSize: "var(--font-sm)", color: "var(--text-3)" }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
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

      {/* tbl-foot — conforme DS */}
      {totalRows > ps && (
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
              className="flex items-center justify-center rounded-lg transition-colors cursor-pointer disabled:opacity-40"
              style={{ width: "var(--control-h-sm)", height: "var(--control-h-sm)", color: "var(--text-2)" }}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, table.getPageCount()) }).map((_, i) => {
              const page = i;
              return (
                <button
                  key={page}
                  onClick={() => table.setPageIndex(page)}
                  className={cn("flex items-center justify-center rounded-lg font-medium transition-colors cursor-pointer")}
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
