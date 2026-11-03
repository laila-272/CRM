import { card } from "../Shared/ui.jsx"; // same shared path as the other modules

const subTone = {
  gray: "text-neutral-500",
  green: "text-green-600",
  red: "text-red-600",
  orange: "text-orange-500",
};
export const Stat = ({ title, value, sub, tone = "gray" }) => (
  <div className={`${card} p-4`}>
    <div className="text-[11px] text-neutral-500">{title}</div>
    <div
      dir="ltr"
      className="mt-3 text-right text-[28px] font-semibold leading-none text-ink"
    >
      {value}
    </div>
    <div className={`mt-3 text-[10px] ${subTone[tone]}`}>{sub}</div>
  </div>
);
export const SectionTitle = ({ title, sub }) => (
  <div className="pt-2">
    <h2 className="text-[16px] font-semibold text-ink">{title}</h2>
    {sub && <p className="mt-0.5 text-[10.5px] text-neutral-500">{sub}</p>}
  </div>
);
export const Empty = ({ children }) => (
  <div className="py-8 text-center text-[11px] text-neutral-400">
    {children}
  </div>
);
