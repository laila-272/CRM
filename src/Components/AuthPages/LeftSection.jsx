
import { CalendarDays, Clock3, Rocket, Shield, Zap, Lock } from "lucide-react";

import DashboardPreview from "./DashboardPerview.jsx";

const FEATURE_ICONS = [Lock, Zap, Clock3];
const STAT_ICONS = [Shield, Rocket, CalendarDays];

const iconTile =
  "flex h-[22px] w-[22px] sm:h-[24px] sm:w-[24px] shrink-0 items-center justify-center rounded-[6px] bg-gradient-to-br from-[#f58d27] to-[#cf5a12] shadow-[0_2px_8px_rgba(234,106,26,.3)]";

export default function LeftSection({
  t,
  variant,
  compact = false,
}) {
  const dir = t.dir || "ltr";

  return (
    <div
      dir={dir}
      className="mx-auto w-full min-w-0 max-w-[420px]"
    >
      <h1 className="text-[clamp(22px,2.2vw,30px)] font-extrabold leading-[1.1] tracking-[-0.02em] text-white">
        {t.headline1}
        <br />
        <span className="text-[#e4631a]">{t.headline2}</span>
      </h1>

      <p className="mt-2 max-w-[300px] text-[11.5px] sm:text-[12px] leading-relaxed text-[#b9aea6]">
        {t.description}
      </p>

      {!compact && (
        <>
          <ul className="mt-3 space-y-1.5">
            {t.features.map((text, i) => {
              const Icon = FEATURE_ICONS[i] || Lock;

              return (
                <li
                  key={`${i}-${text}`}
                  className="flex items-center gap-2.5 rounded-[8px] border border-white/[0.04] bg-gradient-to-r from-white/[0.045] to-white/[0.01] px-2.5 py-3.5"
            >
                  <span className={iconTile}>
                    <Icon
                      size={i === 2 ? 13 : 12}
                      strokeWidth={2.4}
                      className={i === 2 ? "text-[#d9620f]" : "text-white"}
                      fill={i === 2 ? "white" : "currentColor"}
                    />
                  </span>

                  <span className="min-w-0 text-[11px] font-medium leading-relaxed text-white">
                    {text}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-3 grid grid-cols-3 rounded-t-[10px] border border-white/[0.06] border-b-0 bg-gradient-to-b from-white/[0.035] to-white/[0.01] py-2">
            {t.stats.map(([num, label], i) => {
              const Icon = STAT_ICONS[i] || Shield;

              return (
                <div
                  key={`${i}-${label}`}
                  className={`flex min-w-0 flex-col items-center px-1 text-center ${
                    i > 0 ? "border-s border-white/[0.06]" : ""
                  }`}
                >
                  <Icon
                    size={13}
                    strokeWidth={2.2}
                    className="text-[#e07a26]"
                    fill="currentColor"
                    fillOpacity=".85"
                  />

                  <span className="mt-1 text-[clamp(13px,1.2vw,16px)] font-extrabold leading-tight text-white">
                    {num}
                  </span>

                  <span className="mt-0.5 text-[9px] sm:text-[10px] leading-tight text-[#8c7f76]">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-0 w-full min-w-0 ps-4 sm:ps-6">
            <DashboardPreview variant={variant} />
          </div>
        </>
      )}
    </div>
  );
}
