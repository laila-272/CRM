import React, { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
// >>> Adjust this ONE path to where your shared helpers file lives <<<
import { card } from "../Shared/ui.jsx";
export {
  PageHeader,
  SearchBox,
  Select,
  Chip,
  PagerBar,
  card,
  btnDark,
  btnLight,
  egp,
  downloadCsv,
  th,
  td,
} from "../Shared/ui.jsx";

const TONES = {
  neutral: "bg-[#F1F2F4] text-ink border-line",
  ok: "bg-[#F1F2F4] text-ink border-line",
  low: "bg-[#FFF4E5] text-[#B45309] border-[#FCD9A8]",
  out: "bg-[#FDECEC] text-[#DC2626] border-[#F8C9C9]",
  green: "bg-[#E8F7EE] text-[#15803D] border-[#BFE8CF]",
};
export function StatusBadge({ tone = "neutral", children }) {
  return (
    <span
      className={`inline-flex h-5 items-center rounded-full border px-2.5 text-[10px] font-semibold ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

const NOTE = {
  green: "text-[#15803D]",
  orange: "text-[#EA580C]",
  red: "text-[#DC2626]",
  grey: "text-neutral-500",
};
export function InvStat({
  icon: Icon,
  tag,
  value,
  note,
  tone = "grey",
  valueClass = "",
}) {
  return (
    <div className={`${card} p-4`}>
      <div className="flex items-center justify-between">
        <Icon size={22} strokeWidth={1.25} className="text-neutral-500" />
        {tag && (
          <span className="text-[10px] bg-neutral-100 text-neutral-500 rounded-full px-2 py-0.5">
            {tag}
          </span>
        )}
      </div>
      <div
        className={`mt-3 text-[24px] leading-none font-semibold text-ink ${valueClass}`}
      >
        {value}
      </div>
      <div className={`mt-1.5 text-[10px] ${NOTE[tone]}`}>{note}</div>
    </div>
  );
}

export function TableCard({ title, subtitle, info, footer, children }) {
  return (
    <div className={`${card} overflow-hidden`}>
      <div className="flex items-start justify-between gap-3 px-4 pt-4 pb-3">
        <div>
          <h2 className="text-[14px] font-semibold text-ink">{title}</h2>
          {subtitle && (
            <p className="mt-0.5 text-[10.5px] text-neutral-500">{subtitle}</p>
          )}
        </div>
        {info && <span className="text-[10.5px] text-neutral-500">{info}</span>}
      </div>
      <div className="overflow-x-auto">{children}</div>
      {footer}
    </div>
  );
}

export function ProductCell({ name, sku, icon: Icon }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-line bg-[#F7F7F8] text-neutral-500">
        {Icon && <Icon size={13} />}
      </span>
      <div className="leading-tight">
        <div className="text-[11px] font-semibold text-ink">{name}</div>
        {sku && (
          <div
            className="text-[9.5px] text-neutral-400"
            dir="ltr"
            style={{ textAlign: "right" }}
          >
            {sku}
          </div>
        )}
      </div>
    </div>
  );
}

export function EmptyRow({ cols, text = "لا توجد نتائج مطابقة" }) {
  return (
    <tr>
      <td
        colSpan={cols}
        className="py-10 text-center text-[11px] text-neutral-400"
      >
        {text}
      </td>
    </tr>
  );
}

export function Modal({ open, onClose, title, children, width = "max-w-md" }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        dir="rtl"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${width} max-h-[92vh] overflow-y-auto rounded-xl bg-white p-5 shadow-xl`}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
          <button
            onClick={onClose}
            aria-label="إغلاق"
            className="text-neutral-400 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "تأكيد الحذف",
  message,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm">
      <p className="text-[12px] text-neutral-600">{message}</p>
      <div className="mt-5 flex gap-2">
        <button
          onClick={onConfirm}
          className="h-9 flex-1 rounded-lg bg-[#DC2626] text-[12px] font-semibold text-white"
        >
          حذف
        </button>
        <button
          onClick={onClose}
          className="h-9 flex-1 rounded-lg border border-line text-[12px] font-semibold text-ink"
        >
          إلغاء
        </button>
      </div>
    </Modal>
  );
}

export function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10.5px] font-semibold text-neutral-500">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-[10px] text-[#DC2626]">{error}</span>
      )}
    </label>
  );
}
export const input =
  "h-9 w-full rounded-lg border border-line bg-white px-3 text-[12px] text-ink outline-none focus:border-neutral-400";

export function useToast() {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 2600);
    return () => clearTimeout(t);
  }, [msg]);
  const show = useCallback((m) => setMsg(m), []);
  const node = msg ? (
    <div className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-[11.5px] font-semibold text-white shadow-lg">
      {msg}
    </div>
  ) : null;
  return [node, show];
}
