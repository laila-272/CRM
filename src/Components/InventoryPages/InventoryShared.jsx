import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function useInventoryState(key) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(items));
  }, [key, items]);
  return [items, setItems];
}

export function Modal({
  title,
  onClose,
  children,
  onSubmit,
  submitLabel = "حفظ البيانات",
}) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        dir="rtl"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-base font-bold text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-neutral-100"
            aria-label="إغلاق"
          >
            <X size={17} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 p-5">
          {children}
          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <button
              type="button"
              onClick={onClose}
              className="h-9 rounded-lg border border-line px-4 text-xs font-semibold text-neutral-600"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="h-9 rounded-lg bg-ink px-5 text-xs font-semibold text-white"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-neutral-600">{label}</span>
      {children}
    </label>
  );
}

export const fieldClass =
  "h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink outline-none focus:border-neutral-400";
export const statusClass = (status) => {
  if (["متوفر", "تم الاستلام", "إضافة مخزون", "مرتجع"].includes(status))
    return "bg-emerald-50 text-emerald-700";
  if (["منخفض", "قيد الانتظار", "جزئي", "تسوية"].includes(status))
    return "bg-orange-50 text-orange-700";
  if (["نفد المخزون", "ملغي", "صرف / بيع"].includes(status))
    return "bg-rose-50 text-rose-600";
  return "bg-neutral-100 text-neutral-600";
};
export function Status({ children }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusClass(children)}`}
    >
      {children}
    </span>
  );
}
export function EmptyRow({
  colSpan,
  children = "لا توجد بيانات مطابقة لعملية البحث",
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-4 py-10 text-center text-xs text-neutral-400"
      >
        {children}
      </td>
    </tr>
  );
}
export function TableShell({ title, subtitle, children, footer }) {
  return (
    <section className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex items-center justify-between border-b border-line px-4 py-4">
        <div>
          <h2 className="text-sm font-bold text-ink">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-[10px] text-neutral-400">{subtitle}</p>
          )}
        </div>
        <span className="text-[10px] text-neutral-400">عرض الكل</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-right">
          <tbody>{children}</tbody>
        </table>
      </div>
      {footer}
    </section>
  );
}
