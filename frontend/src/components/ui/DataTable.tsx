import { useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Columns3, Download, Search, SlidersHorizontal } from "lucide-react";
import { cn } from "../../utils/cn";
import { Button, IconButton, SegmentedControl, Tooltip } from "./index";

export type Column<T> = {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "right" | "center";
  sortable?: boolean;
  hideBelow?: "sm" | "md" | "lg";
  tip?: string;
  render: (row: T, i: number) => ReactNode;
  value?: (row: T) => number | string;
};

const DENSITY = ["Dense", "Compact", "Comfortable"] as const;
type Density = (typeof DENSITY)[number];
const PAD: Record<Density, string> = {
  Dense: "py-[5px] px-2.5 text-[11.5px]",
  Compact: "py-[7px] px-3 text-[12px]",
  Comfortable: "py-[11px] px-3.5 text-[12.5px]",
};

export function DataTable<T extends Record<string, unknown>>({
  columns, rows, rowKey, onRowClick, searchable = true, searchKeys = [], pageSize = 0,
  toolbar, defaultSort, dense = "Dense", stickyHeader = true, emptyState, footer,
}: {
  columns: Column<T>[]; rows: T[]; rowKey: (r: T) => string; onRowClick?: (r: T) => void;
  searchable?: boolean; searchKeys?: (keyof T)[]; pageSize?: number; toolbar?: ReactNode;
  defaultSort?: { key: string; dir: "asc" | "desc" }; dense?: Density; stickyHeader?: boolean;
  emptyState?: ReactNode; footer?: ReactNode;
}) {
  const [sort, setSort] = useState(defaultSort ?? null);
  const [q, setQ] = useState("");
  const [density, setDensity] = useState<Density>(dense);
  const [page, setPage] = useState(0);
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [colMenu, setColMenu] = useState(false);

  const visible = columns.filter((c) => !hidden.has(c.key));

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const s = q.toLowerCase();
    return rows.filter((r) =>
      (searchKeys.length ? searchKeys : (Object.keys(r) as (keyof T)[])).some((k) => String(r[k] ?? "").toLowerCase().includes(s)),
    );
  }, [rows, q, searchKeys]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.value) return filtered;
    const arr = [...filtered].sort((a, b) => {
      const av = col.value!(a);
      const bv = col.value!(b);
      if (typeof av === "number" && typeof bv === "number") return sort.dir === "asc" ? av - bv : bv - av;
      return sort.dir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return arr;
  }, [filtered, sort, columns]);

  const paged = pageSize > 0 ? sorted.slice(page * pageSize, (page + 1) * pageSize) : sorted;
  const pages = pageSize > 0 ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;

  const toggleSort = (k: string) =>
    setSort((s) => (s?.key === k ? (s.dir === "desc" ? { key: k, dir: "asc" } : null) : { key: k, dir: "desc" }));

  const exportCsv = () => {
    const head = visible.map((c) => c.header).join(",");
    const body = sorted.map((r) => visible.map((c) => `"${String(c.value ? c.value(r) : "")}"`).join(",")).join("\n");
    const blob = new Blob([head + "\n" + body], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "quantx-export.csv";
    a.click();
  };

  return (
    <div className="min-w-0">
      {(searchable || toolbar) && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-subtle px-2.5 py-2">
          <div className="flex flex-1 items-center gap-2">
            {searchable && (
              <div className="relative flex-1 max-w-[240px]">
                <Search size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-txt-muted" />
                <input
                  value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }}
                  placeholder="Filter rows…" aria-label="Filter table rows"
                  className="h-7 w-full rounded-[5px] border border-line-subtle bg-bg-secondary pl-7 pr-2 text-[11.5px] text-txt-primary placeholder:text-txt-disabled focus:border-line-strong focus:outline-none"
                />
              </div>
            )}
            {toolbar}
          </div>
          <div className="flex items-center gap-1.5">
            <SegmentedControl size="xs" options={DENSITY} value={density} onChange={setDensity} ariaLabel="Row density" />
            <div className="relative">
              <IconButton label="Column visibility" icon={Columns3} size={13} className="h-7 w-7" active={colMenu} onClick={() => setColMenu((v) => !v)} />
              {colMenu && (
                <div className="absolute right-0 top-8 z-40 w-48 rounded-[7px] border border-line glass p-1.5 shadow-[0_24px_50px_-20px_rgba(0,0,0,0.9)] anim-scale-in">
                  {columns.map((c) => (
                    <button key={c.key} onClick={() => setHidden((h) => { const n = new Set(h); n.has(c.key) ? n.delete(c.key) : n.add(c.key); return n; })}
                      className="flex w-full items-center gap-2 rounded-[4px] px-2 py-1 text-left text-[11.5px] text-txt-secondary hover:bg-surface-hover hover:text-txt-primary">
                      <span className={cn("h-2.5 w-2.5 rounded-[2px] border", hidden.has(c.key) ? "border-line" : "border-acc/60 bg-acc/40")} />
                      {c.header}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <IconButton label="Export CSV" icon={Download} size={13} className="h-7 w-7" onClick={exportCsv} />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-full border-collapse">
          <thead className={cn(stickyHeader && "sticky top-0 z-10")}>
            <tr className="bg-bg-secondary/95 backdrop-blur-sm">
              {visible.map((c) => (
                <th key={c.key} scope="col" style={{ width: c.width }}
                  className={cn(
                    "border-b border-line label-xs whitespace-nowrap text-txt-muted select-none",
                    PAD[density], "py-2",
                    c.align === "right" && "text-right", c.align === "center" && "text-center",
                    c.hideBelow === "sm" && "hidden sm:table-cell", c.hideBelow === "md" && "hidden md:table-cell", c.hideBelow === "lg" && "hidden lg:table-cell",
                  )}>
                  {c.sortable ? (
                    <button onClick={() => toggleSort(c.key)}
                      className={cn("inline-flex items-center gap-1 transition-colors hover:text-txt-secondary", c.align === "right" && "flex-row-reverse")}>
                      {c.tip ? <Tooltip content={c.tip}><span className="border-b border-dotted border-line-strong">{c.header}</span></Tooltip> : c.header}
                      {sort?.key === c.key ? (sort.dir === "desc" ? <ArrowDown size={9} /> : <ArrowUp size={9} />) : <SlidersHorizontal size={8} className="opacity-25" />}
                    </button>
                  ) : c.tip ? (
                    <Tooltip content={c.tip}><span className="border-b border-dotted border-line-strong">{c.header}</span></Tooltip>
                  ) : c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((r, i) => (
              <tr key={rowKey(r)} tabIndex={onRowClick ? 0 : -1}
                onClick={() => onRowClick?.(r)}
                onKeyDown={(e) => { if (onRowClick && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onRowClick(r); } }}
                className={cn(
                  "border-b border-line-subtle/70 transition-colors duration-100",
                  onRowClick && "cursor-pointer",
                  "hover:bg-surface-hover/60 focus:bg-surface-hover focus:outline-none",
                )}>
                {visible.map((c) => (
                  <td key={c.key}
                    className={cn(
                      PAD[density], "whitespace-nowrap text-txt-secondary",
                      c.align === "right" && "text-right", c.align === "center" && "text-center",
                      c.hideBelow === "sm" && "hidden sm:table-cell", c.hideBelow === "md" && "hidden md:table-cell", c.hideBelow === "lg" && "hidden lg:table-cell",
                    )}>
                    {c.render(r, i)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {paged.length === 0 && (emptyState ?? <div className="px-4 py-10 text-center text-[12px] text-txt-muted">No rows match the current filter.</div>)}
      </div>

      {(pageSize > 0 || footer) && (
        <div className="flex items-center justify-between gap-3 border-t border-line-subtle px-3 py-2">
          <div className="text-[10.5px] text-txt-muted tnum">
            {footer ?? `${sorted.length} rows · showing ${paged.length}`}
          </div>
          {pageSize > 0 && pages > 1 && (
            <div className="flex items-center gap-1">
              <Button size="xs" variant="ghost" disabled={page === 0} onClick={() => setPage((p) => p - 1)} icon={ChevronLeft}>Prev</Button>
              <span className="mono px-1.5 text-[10.5px] text-txt-secondary">{page + 1} / {pages}</span>
              <Button size="xs" variant="ghost" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)}>
                Next <ChevronRight size={11} />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
