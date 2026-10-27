import {
  Calculator,
  Download,
  Percent,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import {
  LEAD_SOURCES,
  MONTHLY,
  OPEN_PIPELINE,
  TEAM,
} from "../../data/Reports.js";
import {
  PageHeader,
  StatCard,
  card,
  downloadCsv,
  egp,
  td,
  th,
} from "../Shared/ui.jsx";

// Charts are plain SVG/CSS so no chart dependency is required. Swap for recharts later if you install it.

function LineChart({ data }) {
  const W = 320,
    H = 130,
    P = 22;
  const max = Math.max(...data.map((d) => d.sales));
  const min = Math.min(...data.map((d) => d.sales)) * 0.8;
  const pts = data.map((d, i) => [
    P + (i * (W - P * 2)) / (data.length - 1),
    H - P - ((d.sales - min) / (max - min)) * (H - P * 2),
  ]);
  return (
    <svg
      viewBox={`0 0 ${W} ${H + 14}`}
      className="w-full"
      role="img"
      aria-label="اتجاه المبيعات الشهرية"
    >
      {[0, 1, 2].map((i) => (
        <line
          key={i}
          x1={P}
          x2={W - P}
          y1={P + (i * (H - P * 2)) / 2}
          y2={P + (i * (H - P * 2)) / 2}
          stroke="#eee"
        />
      ))}
      <polyline
        fill="none"
        stroke="#111"
        strokeWidth="2"
        points={pts.map((p) => p.join(",")).join(" ")}
      />
      {pts.map(([x, y], i) => (
        <g key={data[i].m}>
          <circle
            cx={x}
            cy={y}
            r="3"
            fill="#fff"
            stroke="#f97316"
            strokeWidth="2"
          />
          <text x={x} y={H + 8} textAnchor="middle" fontSize="8" fill="#737373">
            {data[i].m}
          </text>
          <text x={x} y={y - 7} textAnchor="middle" fontSize="7.5" fill="#111">
            {(data[i].sales / 1e6).toFixed(1)}M
          </text>
        </g>
      ))}
    </svg>
  );
}

function Donut({ data }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  const R = 40,
    C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="flex items-center gap-4">
      <svg
        viewBox="0 0 100 100"
        className="w-[130px] shrink-0 -rotate-90"
        role="img"
        aria-label="توزيع العملاء حسب المصدر"
      >
        {data.map((d) => {
          const len = (d.value / total) * C;
          const el = (
            <circle
              key={d.name}
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke={d.color}
              strokeWidth="14"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-acc}
            />
          );
          acc += len;
          return el;
        })}
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          transform="rotate(90 50 50)"
          fontSize="16"
          fontWeight="700"
          fill="#111"
        >
          {total}
        </text>
      </svg>
      <ul className="space-y-2 text-[10.5px]">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2">
            <i
              className="w-2.5 h-2.5 rounded-sm border border-line"
              style={{ background: d.color }}
            />
            <span className="text-neutral-600">{d.name}</span>
            <b className="text-ink" dir="ltr">
              {d.value}
            </b>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Bars({ data }) {
  const max = Math.max(...data.map((d) => d.deals));
  return (
    <div className="flex items-end justify-around gap-2 h-[150px]" dir="ltr">
      {data.map((d, i) => {
        const last = i === data.length - 1;
        return (
          <div
            key={d.m}
            className="flex flex-col items-center justify-end h-full flex-1 max-w-[48px]"
          >
            <div
              className={`text-[10px] mb-1 ${last ? "font-bold text-ink" : "text-neutral-500"}`}
            >
              {d.deals}
            </div>
            <div
              className={`w-full rounded-t-sm ${last ? "bg-ink" : "bg-neutral-300"}`}
              style={{ height: `${(d.deals / max) * 100}px` }}
            />
            <div className="mt-1.5 text-[9.5px] text-neutral-500">{d.m}</div>
          </div>
        );
      })}
    </div>
  );
}

function HBars({ data }) {
  const max = Math.max(...data.map((d) => d.value));
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.stage}>
          <div className="flex items-center justify-between text-[10.5px] mb-1">
            <span className="font-semibold text-ink">{d.stage}</span>
            <span className="text-neutral-500" dir="ltr">
              {egp(d.value)}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-orange-500"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

const Panel = ({ title, hint, children, className = "" }) => (
  <section className={`${card} p-4 ${className}`}>
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-[13px] font-extrabold text-ink">{title}</h2>
      {hint && <span className="text-[10px] text-neutral-400">{hint}</span>}
    </div>
    {children}
  </section>
);

export default function Reports() {
  // Everything below is derived from the data module so the numbers always agree.
  const totalSales = MONTHLY.reduce((a, m) => a + m.sales, 0);
  const totalDeals = MONTHLY.reduce((a, m) => a + m.deals, 0);
  const totalLeads = TEAM.reduce((a, t) => a + t.leads, 0);
  const conversion = (totalDeals / totalLeads) * 100;
  const openValue = OPEN_PIPELINE.reduce((a, s) => a + s.value, 0);

  const exportCsv = () =>
    downloadCsv(
      "sales-team-report.csv",
      [
        "الموظف",
        "الصفقات المغلقة",
        "قيمة المبيعات",
        "معدل التحويل",
        "متوسط الصفقة",
      ],
      TEAM.map((t) => [
        t.name,
        t.deals,
        t.sales,
        `${((t.deals / t.leads) * 100).toFixed(1)}%`,
        Math.round(t.sales / t.deals),
      ]),
    );

  return (
    <div dir="rtl" className=" max-w-full">
      <PageHeader
        title="التقارير"
        subtitle="ملخص الأداء وأحدث التقارير الجاهزة لفريق المبيعات"
      >
        <button className="btn !rounded-full" onClick={exportCsv}>
          <Download size={12} /> تصدير البيانات
        </button>
        <button
          className="btn !bg-black text-white !rounded-full h-9"
          onClick={() => document.getElementById("broker-name")?.focus()}
        >
          + تقرير جديد
        </button>
      </PageHeader>

      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={TrendingUp}
          tag="6 أشهر"
          value={egp(totalSales)}
          label="إجمالي المبيعات"
        />
        <StatCard
          icon={UsersRound}
          value={totalDeals}
          label=" العملاء المحتملون الجدد"
        />
        <StatCard
          icon={Percent}
          value={`${conversion.toFixed(1)}%`}
          label="معدل التحويل"
        />
        <StatCard
          icon={Calculator}
          value={egp(openValue)}
          label="قيمة الصفقات المفتوحة"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="اتجاه المبيعات" hint="مليون جنيه">
          <LineChart data={MONTHLY} />
        </Panel>
        <Panel title="توزيع العملاء المحتملين حسب المصدر" hint="هذا الشهر">
          <Donut data={LEAD_SOURCES} />
        </Panel>
        <Panel title="الصفقات المغلقة شهريًا">
          <Bars data={MONTHLY} />
        </Panel>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
        <Panel title="قيمة الصفقات المفتوحة حسب المرحلة">
          <HBars data={OPEN_PIPELINE} />
        </Panel>

        <section className={`${card} p-4 min-w-0`}>
          <h2 className="text-[13px] font-extrabold text-ink mb-3">
            أداء فريق المبيعات
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead className="bg-neutral-50/70">
                <tr>
                  {[
                    "الموظف",
                    "الصفقات المغلقة",
                    "قيمة المبيعات",
                    "معدل التحويل",
                    "متوسط الصفقة",
                  ].map((h) => (
                    <th key={h} className={th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TEAM.map((t) => (
                  <tr key={t.name} className="border-t border-line">
                    <td className={`${td} font-bold`}>{t.name}</td>
                    <td className={td}>{t.deals}</td>
                    <td className={td} dir="ltr" style={{ textAlign: "right" }}>
                      {egp(t.sales)}
                    </td>
                    <td className={td}>
                      {((t.deals / t.leads) * 100).toFixed(1)}%
                    </td>
                    <td className={td} dir="ltr" style={{ textAlign: "right" }}>
                      {egp(Math.round(t.sales / t.deals))}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-line bg-neutral-50/70 font-bold">
                  <td className={td}>الإجمالي</td>
                  <td className={td}>
                    {TEAM.reduce((a, t) => a + t.deals, 0)}
                  </td>
                  <td className={td} dir="ltr" style={{ textAlign: "right" }}>
                    {egp(TEAM.reduce((a, t) => a + t.sales, 0))}
                  </td>
                  <td className={td}>{conversion.toFixed(1)}%</td>
                  <td className={td} dir="ltr" style={{ textAlign: "right" }}>
                    {egp(Math.round(totalSales / totalDeals))}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
