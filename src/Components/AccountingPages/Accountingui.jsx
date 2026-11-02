// Shared accounting building blocks. Re-exports the app's existing shared UI.
// If your shared components live elsewhere, change ONLY the path below.
import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  PageHeader,
  SearchBox,
  Select,
  Chip,
  StatCard,
  PagerBar,
  downloadCsv,
  egp,
  card,
  btnDark,
  btnLight,
  th,
  td,
} from "../Shared/ui.jsx";

export {
  PageHeader,
  SearchBox,
  Select,
  Chip,
  StatCard,
  PagerBar,
  downloadCsv,
  egp,
  card,
  btnDark,
  btnLight,
  th,
  td,
};

/* ---------- formatting ---------- */
export const num = (n) => Number(n).toLocaleString("en-US");
export const sar = (n) => `${num(n)} ر.س`;
const AR_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];
export const fmtDate = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${AR_MONTHS[m - 1]} ${y}`;
};
export const MONTH_OPTIONS = [
  ["all", "كل الفترات"],
  ["2026-10", "أكتوبر 2026"],
  ["2026-09", "سبتمبر 2026"],
];
export const inMonth = (iso, m) => m === "all" || (iso || "").startsWith(m);
export const today = () => new Date().toISOString().slice(0, 10);
export const nextId = (prefix, ids, pad = 4) => {
  const max = ids.reduce(
    (a, id) =>
      Math.max(
        a,
        parseInt(String(id).replace(/\D+/g, "").slice(-pad), 10) || 0,
      ),
    0,
  );
  return `${prefix}${String(max + 1).padStart(pad, "0")}`;
};

/* ---------- small atoms ---------- */
const tones = {
  green: "bg-green-50 text-green-700",
  red: "bg-red-50 text-red-600",
  orange: "bg-orange-50 text-orange-600",
  gray: "bg-neutral-100 text-neutral-600",
  dark: "bg-ink text-white",
};
export function Badge({ tone = "gray", children }) {
  return (
    <span
      className={`inline-flex h-5 items-center rounded-full px-2 text-[10px] font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
export const subTones = {
  green: "text-green-600",
  red: "text-red-600",
  orange: "text-orange-500",
  gray: "text-neutral-500",
};

export function KpiCard({
  icon: Icon,
  tag,
  value,
  label,
  sub,
  subTone = "gray",
  titled,
}) {
  return (
    <div className={`${card} p-4`}>
      {titled ? (
        <div className="flex items-center justify-between text-[11px] text-ink">
          <span>{label}</span>
          {Icon && (
            <span className="grid h-6 w-6 place-items-center rounded-full border border-line">
              <Icon size={12} className="text-neutral-500" />
            </span>
          )}
        </div>
      ) : (
        <div className="flex justify-end">
          <span className="inline-flex h-6 items-center gap-1 rounded-full bg-neutral-100 px-2 text-[10px] text-neutral-500">
            {Icon && <Icon size={11} />}
            {tag}
          </span>
        </div>
      )}
      <div
        dir="ltr"
        className="mt-3 text-right text-[22px] font-semibold leading-none text-ink"
      >
        {value}
      </div>
      {!titled && (
        <div className="mt-2 text-[10.5px] text-neutral-500">{label}</div>
      )}
      {sub && (
        <div className={`mt-2 text-[10px] ${subTones[subTone]}`}>{sub}</div>
      )}
    </div>
  );
}

export function SectionHead({ title, sub, children }) {
  return (
    <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
      <div>
        <div className="text-[13px] font-semibold text-ink">{title}</div>
        {sub && (
          <div className="mt-0.5 text-[10.5px] text-neutral-500">{sub}</div>
        )}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-ink" : "bg-neutral-200"}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? "right-[18px]" : "right-0.5"}`}
      />
    </button>
  );
}

/* ---------- row action menu (fixed-positioned so tables don't clip it) ---------- */
export function RowMenu({ items }) {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);
  useEffect(() => {
    if (!pos) return;
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setPos(null);
    };
    const off = () => setPos(null);
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", off, true);
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", off, true);
    };
  }, [pos]);
  return (
    <div ref={ref} className="inline-block">
      <button
        type="button"
        aria-label="إجراءات"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setPos(pos ? null : { top: r.bottom + 4, left: r.left });
        }}
        className="grid h-6 w-6 place-items-center rounded text-neutral-500 hover:bg-neutral-100"
      >
        <MoreHorizontal size={15} />
      </button>
      {pos && (
        <div
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-50 min-w-[140px] rounded-lg border border-line bg-white py-1 text-[11px] shadow-md"
        >
          {items.map((it) => (
            <button
              key={it.label}
              type="button"
              onClick={() => {
                setPos(null);
                it.onClick();
              }}
              className={`block w-full px-3 py-1.5 text-right hover:bg-neutral-50 ${it.danger ? "text-red-600" : "text-ink"}`}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- table + pagination ---------- */
export function DataTable({
  columns,
  rows,
  rowKey,
  onRowClick,
  selectedKey,
  minWidth = 720,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ minWidth }}>
        <thead>
          <tr className="border-y border-line bg-[#F7F7F8]">
            {columns.map((c) => (
              <th key={c.key} className={`${th} ${c.className || ""}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const k = rowKey(r);
            return (
              <tr
                key={k}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                className={`border-b border-line last:border-0 ${onRowClick ? "cursor-pointer hover:bg-neutral-50" : ""} ${selectedKey === k ? "bg-neutral-50" : ""}`}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={`${td} h-[52px] ${c.className || ""}`}
                  >
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="py-10 text-center text-[11px] text-neutral-400"
              >
                لا توجد نتائج مطابقة
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function usePaged(rows, size) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const p = Math.min(page, pages);
  const slice = rows.slice((p - 1) * size, p * size);
  const info = rows.length
    ? `عرض ${(p - 1) * size + 1}–${Math.min(p * size, rows.length)} من ${rows.length}`
    : "لا توجد نتائج";
  return { page: p, setPage, pages, slice, info };
}

export function Pager({ pg }) {
  return pg.pages > 1 ? (
    <PagerBar
      page={pg.page}
      pages={pg.pages}
      onPage={pg.setPage}
      info={pg.info}
    />
  ) : null;
}

/* ---------- feedback + forms ---------- */
export function useToast() {
  const [msg, setMsg] = useState("");
  const t = useRef();
  const show = (m) => {
    setMsg(m);
    clearTimeout(t.current);
    t.current = setTimeout(() => setMsg(""), 2400);
  };
  useEffect(() => () => clearTimeout(t.current), []);
  const node = msg ? (
    <div
      role="status"
      className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-[11.5px] text-white shadow-lg"
    >
      {msg}
    </div>
  ) : null;
  return [node, show];
}

export const inputCls =
  "h-9 w-full rounded-lg border border-line bg-white px-3 text-[12px] outline-none focus:border-neutral-400";
export function Field({ label, children, full }) {
  return (
    <label className={`block ${full ? "col-span-2" : ""}`}>
      <span className="mb-1 block text-[10.5px] text-neutral-500">{label}</span>
      {children}
    </label>
  );
}
export function Modal({
  title,
  onClose,
  onSubmit,
  submitLabel = "حفظ",
  children,
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        dir="rtl"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-xl bg-white p-5 shadow-xl"
      >
        <h3 className="mb-4 text-[15px] font-semibold text-ink">{title}</h3>
        <div className="grid grid-cols-2 gap-3">{children}</div>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={btnLight}>
            إلغاء
          </button>
          <button type="submit" className={btnDark}>
            {submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
export const Ltr = ({ children }) => (
  <span dir="ltr" className="inline-block">
    {children}
  </span>
);
