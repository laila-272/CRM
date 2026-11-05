import { useEffect } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";

export function Crumbs({ items }) {
  return (
    <nav
      aria-label="مسار التنقل"
      className="flex items-center gap-1.5 text-[10.5px] text-neutral-500"
    >
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span>›</span>}
          {it.to ? (
            <Link to={it.to} className="hover:text-ink">
              {it.label}
            </Link>
          ) : (
            <span className="font-semibold text-[#FF7E52]">{it.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

export function Switch({ on, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${on ? "bg-[#FF7E52]" : "bg-neutral-300"}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${on ? "right-[18px]" : "right-0.5"}`}
      />
    </button>
  );
}

export function ModalShell({ icon: Icon, title, subtitle, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/40 p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-[460px] rounded-2xl bg-white p-5 sm:p-6"
      >
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FF7E52]/10 text-[#FF7E52]">
            <Icon size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[15px] font-bold text-ink">{title}</h2>
            <p className="mt-0.5 text-[10.5px] text-neutral-500">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="text-neutral-500 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export const inputCls =
  "w-full h-10 rounded-lg border bg-white pr-9 pl-3 text-[12px] text-ink outline-none transition-colors placeholder:text-neutral-400";

export function Field({ label, error, children, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-[11px] font-semibold text-ink">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
    </div>
  );
}
