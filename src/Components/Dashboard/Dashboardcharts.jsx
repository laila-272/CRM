// Lightweight SVG charts (no chart dependency). All geometry is in a fixed viewBox and scales with width.
import { useState } from "react";

export const ACCENT = "#FF7E52";
export const short = (n) =>
  n >= 1e6
    ? `${(n / 1e6).toFixed(2)}M`
    : n >= 1e3
      ? `${Math.round(n / 1e3)}K`
      : String(n);

export function Sparkline({ data, color = ACCENT, w = 120, h = 36 }) {
  const max = Math.max(...data),
    min = Math.min(...data);
  const pts = data.map(
    (v, i) =>
      `${(i / (data.length - 1)) * w},${h - 3 - ((v - min) / (max - min || 1)) * (h - 6)}`,
  );
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-9 w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** series: [{name,color,dash?,area?,data}] — hover shows a tooltip with every series' value at that x. */
export function LineChart({
  labels,
  series,
  height = 200,
  format = (v) => v,
  grid = 4,
}) {
  const W = 600,
    H = height,
    P = { l: 8, r: 8, t: 10, b: 22 };
  const [hi, setHi] = useState(null);
  const max = Math.max(...series.flatMap((s) => s.data)) * 1.1;
  const x = (i) => P.l + (i * (W - P.l - P.r)) / (labels.length - 1);
  const y = (v) => P.t + (1 - v / max) * (H - P.t - P.b);
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.round(
      (((e.clientX - r.left) / r.width) * W - P.l) /
        ((W - P.l - P.r) / (labels.length - 1)),
    );
    setHi(Math.max(0, Math.min(labels.length - 1, i)));
  };
  return (
    <div className="relative" dir="ltr">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
        onMouseMove={move}
        onMouseLeave={() => setHi(null)}
      >
        {Array.from({ length: grid + 1 }, (_, g) => {
          const gy = P.t + (g * (H - P.t - P.b)) / grid;
          return (
            <line
              key={g}
              x1={P.l}
              x2={W - P.r}
              y1={gy}
              y2={gy}
              stroke="#EEF0F2"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
        {series.map((s) => {
          const d = s.data
            .map((v, i) => `${i ? "L" : "M"}${x(i)},${y(v)}`)
            .join(" ");
          return (
            <g key={s.name}>
              {s.area && (
                <path
                  d={`${d} L${x(labels.length - 1)},${H - P.b} L${x(0)},${H - P.b} Z`}
                  fill={s.color}
                  opacity="0.14"
                />
              )}
              <path
                d={d}
                fill="none"
                stroke={s.color}
                strokeWidth="1.6"
                strokeDasharray={s.dash}
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
              />
            </g>
          );
        })}
        {hi !== null && (
          <line
            x1={x(hi)}
            x2={x(hi)}
            y1={P.t}
            y2={H - P.b}
            stroke="#D4D7DB"
            strokeDasharray="3 3"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
      {hi !== null &&
        series.map((s) => (
          <span
            key={s.name}
            className="pointer-events-none absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white"
            style={{
              left: `${(x(hi) / W) * 100}%`,
              top: (y(s.data[hi]) / H) * height,
              borderColor: s.color,
            }}
          />
        ))}
      <div className="mt-1 flex justify-between px-1 text-[9px] text-neutral-400">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
      {hi !== null && (
        <div
          dir="rtl"
          className="pointer-events-none absolute top-1 z-10 min-w-[110px] -translate-x-1/2 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[10px] shadow-md"
          style={{ left: `${Math.min(88, Math.max(12, (x(hi) / W) * 100))}%` }}
        >
          <div className="mb-1 font-semibold text-ink">{labels[hi]}</div>
          {series.map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-between gap-3 text-neutral-500"
            >
              <span className="flex items-center gap-1">
                <i
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: s.color }}
                />
                {s.name}
              </span>
              <b dir="ltr" className="text-ink">
                {format(s.data[hi])}
              </b>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function Donut({ parts, size = 112 }) {
  const r = 40,
    c = 2 * Math.PI * r,
    total = parts.reduce((s, p) => s + p.value, 0);
  let off = 0;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label="توزيع مصادر العملاء"
    >
      <g transform="rotate(-90 50 50)">
        {parts.map((p) => {
          const len = (p.value / total) * c;
          const el = (
            <circle
              key={p.label}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={p.color}
              strokeWidth="13"
              strokeDasharray={`${Math.max(len - 1.5, 0)} ${c}`}
              strokeDashoffset={-off}
            >
              <title>{`${p.label}: ${Math.round((p.value / total) * 100)}%`}</title>
            </circle>
          );
          off += len;
          return el;
        })}
      </g>
    </svg>
  );
}

export function PairedBars({
  labels,
  a,
  b,
  nameA,
  nameB,
  format = (v) => v,
  height = 150,
}) {
  const max = Math.max(...a, ...b);
  return (
    <div dir="ltr">
      <div
        className="flex items-end gap-2 border-b border-line px-1"
        style={{ height }}
      >
        {labels.map((l, i) => (
          <div
            key={l}
            className="flex h-full flex-1 items-end justify-center gap-[3px]"
          >
            <div
              className="w-full max-w-[9px] rounded-t-sm bg-ink"
              style={{ height: `${(a[i] / max) * 100}%` }}
              title={`${l} · ${nameA}: ${format(a[i])}`}
            />
            <div
              className="w-full max-w-[9px] rounded-t-sm bg-neutral-300"
              style={{ height: `${(b[i] / max) * 100}%` }}
              title={`${l} · ${nameB}: ${format(b[i])}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex gap-2 px-1">
        {labels.map((l) => (
          <span
            key={l}
            className="flex-1 text-center text-[9px] text-neutral-400"
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
