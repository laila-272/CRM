import { useEffect, useState } from "react";
import {
  X,
  Plus,
  Trash2,
  SlidersHorizontal,
  ChevronDown,
  CalendarDays,
} from "lucide-react";
import { SearchBox, Chip, card, th, td } from "../Shared/ui.jsx";
import { STATUS_TONE, TONES, fmtDate } from "../../data/salesData.js";

export const inputCls =
  "h-11 w-full rounded-xl border border-line bg-white px-3.5 text-[12px] text-ink outline-none focus:border-neutral-400 placeholder:text-neutral-400";
export const pBtn =
  "inline-flex h-9 items-center justify-center rounded-full bg-ink px-5 text-[12px] font-semibold text-white";
export const sBtn =
  "inline-flex h-9 items-center justify-center rounded-full border border-line bg-white px-5 text-[12px] font-semibold text-ink";
const pill =
  "inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-white px-4 text-[11px] font-semibold text-ink";

export function Badge({ k, children }) {
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold ${TONES[STATUS_TONE[k] || "gray"]}`}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  required,
  error,
  hint,
  children,
  className = "",
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[12px] font-medium text-ink">
        {label} {required && <span className="text-[#FF5A36]">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-[10px] text-neutral-400">{hint}</p>
      )}
      {error && <p className="mt-1.5 text-[10.5px] text-red-600">{error}</p>}
    </div>
  );
}

export function SelectField({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} cursor-pointer appearance-none pl-9`}
      >
        {children}
      </select>
      <ChevronDown
        size={14}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
      />
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
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-ink" : "bg-neutral-300"
      }`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
          checked ? "right-1" : "right-6"
        }`}
      />
    </button>
  );
}
export function DateField({ value, onChange }) {
  return (
    <div className="relative">
      <div
        className={`${inputCls} flex items-center ${value ? "" : "text-neutral-400"}`}
      >
        {value ? fmtDate(value) : "اختر التاريخ"}
      </div>
      <CalendarDays
        size={14}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
      />
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={(e) => {
          try {
            e.currentTarget.showPicker?.();
          } catch {
            /* ignore */
          }
        }}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        aria-label="التاريخ"
      />
    </div>
  );
}

export function UnitInput({ value, onChange, unit, commas }) {
  const v = Number(value) || 0;
  const text = commas ? v.toLocaleString("en-US") : String(v);
  return (
    <div
      className={`${inputCls} flex items-center gap-1 focus-within:border-neutral-400`}
    >
      <input
        inputMode="numeric"
        value={text}
        onFocus={(e) => e.target.select()}
        style={{ width: `${text.length + 1}ch` }}
        onChange={(e) =>
          onChange(Number(e.target.value.replace(/\D/g, "")) || 0)
        }
        className="bg-transparent text-right outline-none"
      />
      <span>{unit}</span>
    </div>
  );
}

export function NumCell({ value, onChange, commas, className = "" }) {
  const v = Number(value) || 0;
  return (
    <input
      inputMode="numeric"
      value={commas ? v.toLocaleString("en-US") : String(v)}
      onFocus={(e) => e.target.select()}
      onChange={(e) => onChange(Number(e.target.value.replace(/\D/g, "")) || 0)}
      className={`w-full bg-transparent text-[12px] outline-none ${className}`}
    />
  );
}

export function PillGroup({ options, active, onPick }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([k, label]) => (
        <button
          key={k}
          type="button"
          onClick={() => onPick(k)}
          className={`h-8 rounded-full border px-4 text-[11.5px] font-semibold transition-colors ${active(k) ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:bg-neutral-50"}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function SummaryBox({ rows, total }) {
  return (
    <div className="space-y-2.5 rounded-xl bg-[#F6F6F7] px-4 py-3.5">
      {rows.map(([k, v]) => (
        <div
          key={k}
          className="flex items-center justify-between text-[11.5px] text-neutral-500"
        >
          <span>{k}</span>
          <span className="text-ink">{v}</span>
        </div>
      ))}
      <div className="flex items-center justify-between border-t border-line pt-3">
        <span className="text-[13px] font-semibold text-ink">{total[0]}</span>
        <span className="text-[15px] font-semibold text-ink">{total[1]}</span>
      </div>
    </div>
  );
}

export function Modal({ title, onClose, children, footer }) {
  useEffect(() => {
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[94vh] w-full max-w-[640px] flex-col rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between px-6 pb-2 pt-5">
          <h2 className="text-[22px] font-medium text-ink">{title}</h2>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink hover:bg-neutral-50"
          >
            <X size={14} />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-3">
          {children}
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-start gap-2 border-t border-line px-6 py-4">
          {footer}
        </div>
      </div>
    </div>
  );
}

export function PillSelect({ value, onChange, children }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 cursor-pointer appearance-none rounded-full border border-line bg-white pl-8 pr-4 text-[11px] font-semibold text-ink outline-none"
      >
        {children}
      </select>
      <ChevronDown
        size={13}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
      />
    </div>
  );
}

export function Toolbar({
  q,
  onQ,
  placeholder,
  owner,
  onOwner,
  owners,
  onExport,
  onAdv,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchBox
        className="min-w-[220px] flex-1"
        value={q}
        onChange={onQ}
        placeholder={placeholder}
      />
      <button className={pill} onClick={onAdv}>
        <SlidersHorizontal size={13} /> فلترة متقدمة
      </button>
      <PillSelect value={owner} onChange={onOwner}>
        <option value="all">كل المالكين</option>
        {owners.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </PillSelect>
      <PillSelect value="" onChange={(v) => v === "csv" && onExport()}>
        <option value="">تصدير</option>
        <option value="csv">CSV</option>
      </PillSelect>
    </div>
  );
}

export function AdvancedPanel({ children }) {
  return (
    <div className={`${card} flex flex-wrap items-end gap-3 p-3`}>
      {children}
    </div>
  );
}
export function MiniField({ label, children }) {
  return (
    <div className="w-40">
      <div className="mb-1 text-[10.5px] text-neutral-500">{label}</div>
      {children}
    </div>
  );
}

export function Chips({ items, value, onChange, counts }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map(([k, label]) => (
        <Chip key={k} active={value === k} onClick={() => onChange(k)}>
          {label} {counts[k]}
        </Chip>
      ))}
    </div>
  );
}

export function CustCell({ name, company }) {
  return (
    <div>
      <div className="text-[12px] font-semibold">{name}</div>
      <div className="text-[10px] text-neutral-400">{company}</div>
    </div>
  );
}

export function SalesTable({ cols, rows, onRow, children }) {
  return (
    <div className={`${card} overflow-hidden shadow-sm`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead>
            <tr className="bg-[#F3F4F6]">
              {cols.map((c) => (
                <th key={c.h} className={th}>
                  {c.h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                onClick={() => onRow(r)}
                className="cursor-pointer border-t border-line/60 even:bg-neutral-50/70 hover:bg-neutral-100/60"
              >
                {cols.map((c) => (
                  <td key={c.h} className={`${td} py-3.5`}>
                    {c.cell(r)}
                  </td>
                ))}
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td
                  colSpan={cols.length}
                  className="py-12 text-center text-[12px] text-neutral-400"
                >
                  لا توجد نتائج مطابقة. جرّب تغيير البحث أو الفلاتر.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {children}
    </div>
  );
}

export function usePaged(list, size = 6) {
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(list.length / size));
  const cur = Math.min(page, pages);
  const start = (cur - 1) * size;
  return {
    page: cur,
    pages,
    setPage,
    slice: list.slice(start, start + size),
    info: list.length
      ? `عرض ${start + 1}–${Math.min(start + size, list.length)} من ${list.length}`
      : "لا توجد نتائج",
  };
}

export function useToast() {
  const [m, setM] = useState("");
  const show = (msg) => {
    setM(msg);
    setTimeout(() => setM(""), 2600);
  };
  const node = m ? (
    <div
      dir="rtl"
      className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-[12px] text-white shadow-lg"
    >
      {m}
    </div>
  ) : null;
  return [node, show];
}

export function CustomerPicker({ list, initialText, onPick, error }) {
  const [q, setQ] = useState(initialText || "");
  const [open, setOpen] = useState(false);
  const shown = list.filter((c) => `${c.name} ${c.company}`.includes(q.trim()));
  return (
    <Field
      label="العميل"
      required
      error={error}
      hint="عند اختيار العميل تُملأ بياناته وشروط الدفع الخاصة به تلقائياً."
    >
      <div className="relative">
        <input
          className={`${inputCls} pl-9`}
          value={q}
          placeholder="ابحث عن عميل بالاسم أو الشركة"
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            onPick(null);
          }}
        />
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        {open && (
          <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-line bg-white shadow-lg">
            {shown.map((c) => (
              <li key={c.name}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setQ(`${c.name} — ${c.company}`);
                    onPick(c);
                    setOpen(false);
                  }}
                  className="block w-full px-3.5 py-2 text-right text-[12px] hover:bg-neutral-50"
                >
                  {c.name}{" "}
                  <span className="text-neutral-400">— {c.company}</span>
                </button>
              </li>
            ))}
            {!shown.length && (
              <li className="px-3.5 py-2 text-[11px] text-neutral-400">
                لا يوجد عميل مطابق
              </li>
            )}
          </ul>
        )}
      </div>
    </Field>
  );
}
export { Plus, Trash2 };
