// src/Components/HRPages/Hrwidgets.jsx
// Small reusable pieces shared by Performance.jsx and EmployeeReports.jsx.
import { card } from "../Shared/ui.jsx"; // your shared UI file (exports card, PageHeader, ...)

const TONES = {
  up: "text-emerald-600",
  down: "text-red-500",
  muted: "text-neutral-400",
};

/** KPI card: title (right) + optional icon (left), big value, note. */
export function KpiCard({
  title,
  value,
  unit,
  note,
  tone = "muted",
  icon: Icon,
}) {
  return (
    <div className={`${card} p-4 transition-shadow hover:shadow-sm`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10.5px] text-neutral-500">{title}</span>
        {Icon && (
          <span className="grid h-6 w-6 place-items-center rounded-md bg-neutral-100 text-neutral-600">
            <Icon size={13} />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5 text-[26px] font-semibold leading-none text-ink">
        <span dir="ltr">{value}</span>
        {unit && <span className="text-[26px]">{unit}</span>}
      </div>
      <div className={`mt-2 text-[10px] ${TONES[tone]}`}>{note}</div>
    </div>
  );
}

/** Card heading: title + subtitle on the right, optional action on the left. */
export function CardHead({ title, sub, action, className = "" }) {
  return (
    <div className={`flex items-start justify-between gap-3 ${className}`}>
      <div>
        <h3 className="text-[12.5px] font-semibold text-ink">{title}</h3>
        {sub && <p className="mt-0.5 text-[10px] text-neutral-500">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/** Slim progress bar; fills from the right in RTL. */
export function Progress({ value, max = 100, className = "" }) {
  return (
    <div
      className={`h-[5px] w-full overflow-hidden rounded-full bg-neutral-200 ${className}`}
    >
      <div
        className="h-full rounded-full bg-ink transition-[width] duration-500 ease-out"
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  );
}

/** Label above a progress bar with the percent on the opposite side. */
export function MetricBar({ label, value }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[10px] text-ink">
        <span>{label}</span>
        <span dir="ltr" className="text-neutral-500">
          {value}%
        </span>
      </div>
      <Progress value={value} />
    </div>
  );
}

export const linkBtn =
  "text-[10px] font-semibold text-neutral-500 transition-colors hover:text-ink";
