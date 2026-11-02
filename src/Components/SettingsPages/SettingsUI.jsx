import React from "react";
import { Search, ChevronDown } from "lucide-react";

export const panel = "rounded-xl border border-line bg-white";
export const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-xs font-semibold text-white hover:opacity-90 transition";
export const lightBtn =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 py-2.5 text-xs font-semibold text-ink hover:bg-neutral-50 transition";
export const field =
  "h-9 w-full rounded-lg border border-line bg-white px-3 text-xs text-ink outline-none focus:border-neutral-400";
export const label = "mb-1.5 block text-[11px] font-semibold text-neutral-600";

export function SettingsHeader({ title, subtitle, children }) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold leading-tight text-ink md:text-2xl">
          {title}
        </h1>
        <p className="mt-1 text-[11px] text-neutral-500">{subtitle}</p>
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      )}
    </div>
  );
}

export function Field({
  title,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
}) {
  return (
    <label className="block min-w-0">
      <span className={label}>{title}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={field}
      />
      {hint && (
        <span className="mt-1 block text-[10px] text-neutral-400">{hint}</span>
      )}
    </label>
  );
}

export function SelectField({ title, value, onChange, options }) {
  return (
    <label className="block min-w-0">
      <span className={label}>{title}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${field} appearance-none pl-8`}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
        />
      </span>
    </label>
  );
}

export function Toggle({ checked, onChange, title, description }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <div className="text-xs font-semibold text-ink">{title}</div>
        {description && (
          <div className="mt-0.5 text-[10px] text-neutral-500">
            {description}
          </div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition ${checked ? "bg-ink" : "bg-neutral-300"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${checked ? "right-0.5" : "right-[18px]"}`}
        />
      </button>
    </div>
  );
}

export function SearchField({ value, onChange, placeholder = "بحث..." }) {
  return (
    <div className="relative w-full sm:w-56">
      <Search
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
      />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${field} pr-9`}
      />
    </div>
  );
}

export function SectionTitle({ title, description, action }) {
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div>
        <h2 className="text-sm font-bold text-ink">{title}</h2>
        {description && (
          <p className="mt-0.5 text-[10px] text-neutral-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
