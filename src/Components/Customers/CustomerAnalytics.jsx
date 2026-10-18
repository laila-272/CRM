import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { SOURCES } from "../../data/customers.js";

const trend = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
].map((m, i) => ({ m, v: [12, 18, 15, 26, 22, 34, 40][i] }));
const COLORS = ["#ea580c", "#111111", "#a3a3a3", "#fdba74", "#525252"];

export default function CustomerAnalytics({ customers }) {
  const bySource = SOURCES.map((s) => ({
    name: s,
    value: customers.filter((c) => c.source === s).length,
  })).filter((d) => d.value);
  const hot = customers.filter((c) => c.score >= 70).length;
  const mid = customers.filter((c) => c.score >= 40 && c.score < 70).length;
  const low = customers.length - hot - mid;
  const total = customers.length || 1;
  const rows = [
    { label: "فرصة قوية (+70)", n: hot, color: "bg-orange-500" },
    { label: "فرصة متوسطة (40–69)", n: mid, color: "bg-neutral-800" },
    { label: "فرصة ضعيفة (أقل من 40)", n: low, color: "bg-neutral-300" },
  ];

  return (
    <section>
      <h2 className="text-sm font-bold mb-0.5">تحليل جودة العملاء</h2>
      <p className="text-[11px] text-neutral-500 mb-3">
        اعرف من الذي يستحق المتابعة أولًا
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* اتجاه العملاء */}
        <div className="card p-3 sm:p-4 lg:col-span-4 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[12px] font-bold ">توزيع الجودة</h3>
            <span className="text-[11px] text-neutral-500">{total} عميل</span>
          </div>

          <div className="flex h-3 rounded-full overflow-hidden bg-neutral-100 mb-4">
            {rows.map((r) => (
              <div
                key={r.label}
                className={r.color}
                style={{
                  width: `${total ? (r.n / total) * 100 : 0}%`,
                }}
              />
            ))}
          </div>

          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.label} className="flex items-center gap-2 text-[11px]">
                <span className="flex-1 min-w-0 text-neutral-700">
                  {r.label}
                </span>

                <b className="shrink-0 font-semibold">{r.n} عميل</b>

                <i className={`w-2.5 h-2.5 rounded-sm shrink-0 ${r.color}`} />
              </li>
            ))}
          </ul>
        </div>

        {/* مصادر العملاء */}
        <div className="card p-3 sm:p-4 lg:col-span-3 min-w-0">
          <h3 className="text-[12px] font-bold mb-1">مصادر العملاء</h3>
          <p className="text-[9px] text-neutral-400 mb-2">
            توزيع العملاء المحتملين
          </p>

          <div className="flex items-center justify-center gap-2">
            <ul className="text-[9px] space-y-2 flex-1 min-w-0">
              {bySource.map((d, i) => (
                <li key={d.name} className="flex items-center gap-1.5 min-w-0">
                  <i
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: COLORS[i % COLORS.length],
                    }}
                  />
                  <span className="text-neutral-500 truncate">{d.name}</span>
                  <b className="font-medium text-neutral-600 shrink-0">
                    {d.value}
                  </b>
                </li>
              ))}
            </ul>

            <div className="relative h-[130px] w-[130px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bySource}
                    dataKey="value"
                    innerRadius={42}
                    outerRadius={59}
                    paddingAngle={2}
                    stroke="none"
                  >
                    {bySource.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      fontSize: 10,
                      borderRadius: 8,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 grid place-items-center pointer-events-none text-center">
                <div>
                  <div className="text-[13px] font-bold">
                    {customers.length}
                  </div>
                  <div className="text-[8px] text-neutral-400">عميل</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* توزيع الجودة */}
        <div className="card p-3 sm:p-4 lg:col-span-5 min-w-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-[12px] font-bold">اتجاه العملاء</h3>
              <p className="text-[9px] text-neutral-400 mt-1">آخر 8 أشهر</p>
            </div>
            <span className="text-[9px] text-neutral-400">شهري</span>
          </div>

          <div dir="ltr" className="h-[130px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trend}
                margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="#e5e7eb"
                  vertical={false}
                  strokeDasharray="0"
                />
                <XAxis
                  dataKey="m"
                  tick={{ fontSize: 8, fill: "#a3a3a3" }}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                />
                <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
                <Tooltip
                  contentStyle={{
                    fontSize: 10,
                    borderRadius: 8,
                    border: "1px solid #eee",
                  }}
                />
                <Line
                  type="linear"
                  dataKey="v"
                  name="عملاء"
                  stroke="#ff5733"
                  strokeWidth={1.8}
                  dot={{ r: 1.5, fill: "#ff5733", strokeWidth: 0 }}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
