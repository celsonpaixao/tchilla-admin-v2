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
        <td key={i} className="px-4 py-3">
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
          className="flex items-center gap-2.5 px-3 py-2.5"
          style={{ borderBottom: "1px solid var(--border)" }}
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
                height: 36,
                background: "var(--gray-50)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r-md)",
                fontSize: 13,
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
                  className="px-4 py-12 text-center text-sm"
                  style={{ color: "var(--text-3)" }}
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
                      className="px-4 py-3 text-sm"
                      style={{ color: "var(--text)" }}
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
          className="flex items-center gap-3 px-3.5 py-2.5"
          style={{
            borderTop: "1px solid var(--border)",
            background: "var(--surface-2)",
            fontSize: 12.5,
            color: "var(--text-3)",
          }}
        >
          <p>
            {pageIndex * ps + 1}–{Math.min((pageIndex + 1) * ps, totalRows)} de {totalRows}
          </p>
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer disabled:opacity-40"
              style={{ color: "var(--text-2)" }}
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, table.getPageCount()) }).map((_, i) => {
              const page = i;
              return (
                <button
                  key={page}
                  onClick={() => table.setPageIndex(page)}
                  className={cn(
                    "w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  )}
                  style={
                    pageIndex === page
                      ? { background: "var(--blue)", color: "var(--navy)", fontWeight: 700 }
                      : { color: "var(--text-2)" }
                  }
                >
                  {page + 1}
                </button>
              );
            })}
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer disabled:opacity-40"
              style={{ color: "var(--text-2)" }}
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
