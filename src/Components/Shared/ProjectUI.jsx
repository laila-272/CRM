import { card } from "./ui.jsx";

// Small pieces shared by the Projects / ProjectDetails / Execution pages only.

export function MetricCard({ label, value, badge, tone = "gray" }) {
  const tones = {
    gray: "bg-neutral-100 text-neutral-500",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-500",
  };
  return (
    <div className={`${card} p-4`}>
      <div className="text-[11px] text-neutral-500">{label}</div>
      <div className="mt-2 text-[28px] font-semibold leading-none text-ink">
        {value}
      </div>
      {badge && (
        <span
          className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-[10px] ${tones[tone]}`}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

export function ProgressBar({ value, late }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 rounded-full bg-neutral-100">
        <div
          className={`h-full rounded-full ${late ? "bg-red-500" : "bg-ink"}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[10.5px] text-neutral-500" dir="ltr">
        {value}%
      </span>
    </div>
  );
}

export function PrevNextPager({ page, pages, onPage, info }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
      <span className="text-[11px] text-neutral-500">{info}</span>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPage(Math.max(page - 1, 1))}
          disabled={page === 1}
          className="h-9 rounded-lg border border-line bg-white px-4 text-[11.5px] font-semibold text-ink hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          السابق
        </button>
        <button
          onClick={() => onPage(Math.min(page + 1, pages))}
          disabled={page === pages}
          className="h-9 rounded-lg bg-ink px-4 text-[11.5px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          التالي
        </button>
      </div>
    </div>
  );
}

export const Badge = ({ cls, children }) => (
  <span
    className={`rounded-full px-2 py-0.5 text-[9.5px] font-semibold ${cls}`}
  >
    {children}
  </span>
);

export const fieldCls = (err) =>
  `w-full h-9 rounded-lg border bg-white px-3 text-[12px] outline-none focus:border-neutral-500 placeholder:text-neutral-400 ${err ? "border-red-400" : "border-line"}`;

export function Field({ label, required, error, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[11px] font-bold text-ink">
        {label} {required && <b className="text-red-500">*</b>}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-[10px] text-red-500">{error}</span>
      )}
    </label>
  );
}
