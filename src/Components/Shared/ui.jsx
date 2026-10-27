import React from "react";
import { Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
export const egp = (n, digits = 0) =>
  `${Number(n).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })} EGP`;

export const card = "bg-white border border-line rounded-xl";

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-[26px] font-semibold text-ink leading-tight">
          {" "}
          {title}
        </h1>
        <p className="mt-1 text-[11px] text-neutral-500">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

export const btnDark =
  "inline-flex items-center gap-1.5 h-8 rounded-[4px] bg-ink text-white px-3.5 text-[11.5px] font-semibold";
export const btnLight =
  "inline-flex items-center gap-1.5 h-8 rounded-full border border-line bg-white px-3.5 text-[11.5px] font-semibold text-ink";

export function SearchBox({ value, onChange, placeholder, className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <Search
        size={13}
        className="absolute top-1/2 -translate-y-1/2 right-3 text-neutral-400"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 rounded-lg border border-line bg-white pr-8 pl-3 text-[13px] outline-none focus:border-neutral-400"
      />
    </div>
  );
}

export function Select({ value, onChange, children, className = "" }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-9 w-full appearance-none rounded-lg border border-line bg-white pr-7 pl-3 text-[11px] font-semibold outline-none cursor-pointer ${className}`}
      >
        {children}
      </select>

      <ChevronDown
        size={13}
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500"
      />
    </div>
  );
}

export function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`h-7 rounded-full px-3 text-[10.5px] font-semibold border transition-colors ${
        active
          ? "bg-ink text-white border-ink"
          : "bg-[#F1F2F4] text-neutral-500 border-line hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function StatCard({ icon: Icon, tag, value, label }) {
  return (
    <div className={`${card} p-4`}>
      <div className="flex items-center justify-between">
        <Icon size={26} strokeWidth={1.25} className="text-neutral-500" />
        {tag && (
          <span className="text-[10px] bg-neutral-100 text-neutral-500 rounded-full px-2 py-0.5">
            {tag}
          </span>
        )}
      </div>
      <div
        className="mt-3 text-[26px] leading-none font-semibold text-ink"
        dir="ltr"
        style={{ textAlign: "right" }}
      >
        {value}
      </div>
      <div className="mt-1.5 text-[10.5px] text-neutral-500">{label}</div>
    </div>
  );
}


export function PagerBar({ page, pages, onPage, info }) {
  const pageNumbers = [
    ...new Set(
      [1, page - 1, page, page + 1, pages].filter((p) => p >= 1 && p <= pages),
    ),
  ].sort((a, b) => a - b);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-white px-4 py-3 text-[11px] text-neutral-500">
      <span>{info}</span>

      <div className="flex items-center gap-1.5" dir="ltr">
        {/* Previous */}
        <button
          disabled={page === 1}
          onClick={() => onPage(Math.max(page - 1, 1))}
          aria-label="Previous page"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-neutral-500 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={15} />
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((p, i) => (
          <React.Fragment key={p}>
            {i > 0 && p - pageNumbers[i - 1] > 1 && (
              <span className="px-0.5 text-neutral-400">...</span>
            )}

            <button
              onClick={() => onPage(p)}
              aria-current={page === p ? "page" : undefined}
              className={`flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-[11px] font-semibold transition ${
                page === p
                  ? "bg-ink text-white shadow-sm"
                  : "bg-white text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              {p}
            </button>
          </React.Fragment>
        ))}

        {/* Next */}
        <button
          disabled={page === pages}
          onClick={() => onPage(Math.min(page + 1, pages))}
          aria-label="Next page"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-neutral-500 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

export function downloadCsv(filename, head, rows) {
  const csv =
    "\ufeff" +
    [head, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" }),
  );
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

export const th =
  "px-3 py-3.5 text-[12px] font-semibold text-neutral-400 text-right whitespace-nowrap ";
export const td = "px-3 py-3 text-[11px] text-ink whitespace-nowrap";
