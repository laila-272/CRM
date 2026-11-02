import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ChevronLeft,
  Circle,
  CheckCircle2,
  TrendingUp,
  Users,
  Handshake,
  Percent,
  X,
} from "lucide-react";
import { card, Select, egp } from "../Shared/ui.jsx"; // same shared path as AccountingUI.jsx — adjust if different
import {
  ACCENT,
  short,
  Sparkline,
  LineChart,
  Donut,
  PairedBars,
} from "./Dashboardcharts.jsx";

const MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];
const ACTUAL = [
  2.9, 3.4, 3.1, 3.8, 3.6, 4.1, 3.9, 4.4, 4.2, 4.86, 4.5, 4.9,
].map((v) => v * 1e6);
const TARGET = [3.2, 3.3, 3.5, 3.6, 3.8, 3.9, 4.1, 4.2, 4.4, 4.5, 4.7, 4.9].map(
  (v) => v * 1e6,
);
const EXPENSES = [
  2.1, 2.3, 2.2, 2.6, 2.4, 2.7, 2.5, 2.9, 2.8, 3.1, 2.9, 3.2,
].map((v) => v * 1e6);

const PERIODS = {
  month: {
    label: "هذا الشهر",
    kpi: [
      { v: 4860000, money: 1, d: 10.1, s: [3, 4, 3.5, 5, 4.6, 6, 5.5, 7] },
      { v: 1248, d: 18.3, s: [5, 6, 6, 7, 8, 8, 9, 10] },
      { v: 86, d: 50.3, s: [2, 3, 5, 4, 7, 8, 9, 11] },
      { v: "18.6%", d: 18.3, s: [9, 8, 10, 9, 11, 10, 12, 12] },
    ],
    collect: [152000, 118000, 188000],
    sales: [3, 4, 3.6, 5, 4.7, 6.1, 6.8],
  },
  quarter: {
    label: "هذا الربع",
    kpi: [
      { v: 13900000, money: 1, d: 6.4, s: [4, 5, 5, 6, 6, 7, 8, 8] },
      { v: 1432, d: 9.2, s: [5, 5, 6, 6, 7, 8, 8, 9] },
      { v: 241, d: 21.7, s: [3, 4, 4, 6, 7, 8, 9, 10] },
      { v: "17.9%", d: -2.1, s: [10, 9, 9, 10, 9, 8, 9, 9] },
    ],
    collect: [310000, 264000, 420000],
    sales: [4, 4.4, 5, 5.2, 5.9, 6.5, 7],
  },
  year: {
    label: "هذه السنة",
    kpi: [
      { v: 52400000, money: 1, d: 14.8, s: [2, 3, 4, 5, 6, 7, 8, 10] },
      { v: 1960, d: 24.1, s: [2, 3, 4, 6, 7, 8, 9, 11] },
      { v: 812, d: 31.2, s: [1, 3, 4, 5, 7, 9, 10, 12] },
      { v: "19.4%", d: 3.3, s: [8, 9, 9, 10, 10, 11, 12, 12] },
    ],
    collect: [610000, 540000, 760000],
    sales: [3, 3.8, 4.6, 5.1, 6, 6.9, 8],
  },
};
const KPI_META = [
  [TrendingUp, "إجمالي الإيرادات"],
  [Users, "العملاء النشطون"],
  [Handshake, "الصفقات المفتوحة"],
  [Percent, "معدل التحويل"],
];
const SOURCES = [
  { label: "إحالات", value: 42, color: "#171717" },
  { label: "إعلانات", value: 28, color: ACCENT },
  { label: "الموقع الإلكتروني", value: 18, color: "#BFC3C8" },
  { label: "معارض", value: 12, color: "#8B9097" },
];
const DUES = [
  ["إيجار المكتب", "الأربعاء 4 نوفمبر", 120000],
  ["رواتب أكتوبر", "الخميس 5 نوفمبر", 480000],
  ["فاتورة مورد المخزون", "الأحد 8 نوفمبر", 85000],
  ["ضريبة القيمة المضافة", "الثلاثاء 10 نوفمبر", 120800],
];
const ALERTS0 = [
  ["3 دفعات متأخرة", "راجع التحصيل", "/accounting/invoices"],
  ["عقد يوشك على الانتهاء", "تجديد قبل 10 نوفمبر", "/contracts"],
  ["مخزون منخفض", "4 منتجات تحت الحد", "/stock-alerts"],
];
const ACTIVITY = [
  ["تم إغلاق صفقة شركة آفاق للتقنية", "منذ 20 دقيقة"],
  ["فاتورة جديدة INV-0032", "منذ ساعة"],
  ["اجتماع مع مجموعة النخبة", "منذ 3 ساعات"],
  ["عميل جديد: مؤسسة المدار", "أمس"],
];
const TASKS0 = [
  "متابعة عرض سعر شركة سمار",
  "مراجعة عقد مؤسسة المدار",
  "مكالمة تعريفية مع عميل جديد",
  "إرسال تقرير المبيعات",
];
const LATEST = {
  exp: [
    ["مورد المخزون الأول", 85000],
    ["شركة الإعلانات الرقمية", 32000],
  ],
  rev: [
    ["مؤسسة المدار", 260000],
    ["شركة آفاق للتقنية", 180000],
  ],
};

function Panel({ title, sub, action, children, className = "" }) {
  return (
    <section className={`${card} ${className}`}>
      <div className="flex items-start justify-between gap-2 px-4 pt-3.5">
        <div>
          <h2 className="text-[13px] font-semibold text-ink">{title}</h2>
          {sub && <p className="mt-0.5 text-[10px] text-neutral-500">{sub}</p>}
        </div>
        {action}
      </div>
      <div className="px-4 pb-4 pt-3">{children}</div>
    </section>
  );
}
const Pill = ({ children }) => (
  <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[9.5px] text-neutral-500">
    {children}
  </span>
);

export default function Dashboard() {
  const [period, setPeriod] = useState("month");
  const [alerts, setAlerts] = useState(ALERTS0);
  const [done, setDone] = useState([]);
  const [scope, setScope] = useState("all");
  const P = PERIODS[period];
  const collectTotal = P.collect.reduce((s, v) => s + v, 0);
  const maxC = Math.max(...P.collect);

  return (
    <div dir="rtl" className="space-y-4">
      {/* Welcome */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10.5px] text-neutral-500">
            الاثنين، 2 نوفمبر 2026
          </p>
          <h1 className="mt-1 text-[26px] font-semibold leading-tight text-ink">
            صباح الخير، أستاذ محمد
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex gap-1 rounded-full border border-line bg-white p-0.5"
            role="tablist"
          >
            {Object.entries(PERIODS).map(([k, p]) => (
              <button
                key={k}
                role="tab"
                aria-selected={period === k}
                onClick={() => setPeriod(k)}
                className={`h-7 rounded-full px-3 text-[10.5px] font-semibold transition-colors ${period === k ? "bg-ink text-white" : "text-neutral-500 hover:text-ink"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="w-[120px]">
            <Select value={scope} onChange={setScope}>
              <option value="all">كل الفرق</option>
              <option value="sales">فريق المبيعات</option>
              <option value="ops">فريق العمليات</option>
            </Select>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {P.kpi.map((k, i) => {
          const [Icon, label] = KPI_META[i];
          return (
            <div key={label} className={`${card} p-4`}>
              <div className="flex items-center justify-between text-[11px] text-neutral-600">
                <span>{label}</span>
                <Icon size={14} className="text-neutral-400" />
              </div>
              <div
                dir="ltr"
                className="mt-2 text-right text-[24px] font-semibold leading-none text-ink"
              >
                {k.money
                  ? `${short(k.v)} EGP`
                  : typeof k.v === "number"
                    ? k.v.toLocaleString("en-US")
                    : k.v}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span
                  dir="ltr"
                  className={`text-[10px] font-semibold ${k.d >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {k.d >= 0 ? "+" : "−"}
                  {Math.abs(k.d)}%
                </span>
                <div className="w-[96px]">
                  <Sparkline data={k.s} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue vs target + alerts/activity */}
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_270px]">
        <Panel
          title="الإيرادات مقابل الهدف"
          sub="الإيراد الفعلي مقارنة بالهدف الشهري"
          action={
            <span className="flex items-center gap-3 text-[10px] text-neutral-500">
              <span className="flex items-center gap-1">
                <i className="h-0.5 w-3" style={{ background: ACCENT }} />
                الفعلي
              </span>
              <span className="flex items-center gap-1">
                <i className="h-0.5 w-3 border-t border-dashed border-neutral-500" />
                الهدف
              </span>
            </span>
          }
        >
          <LineChart
            labels={MONTHS.map((m) => m.slice(0, 3))}
            height={210}
            format={egp}
            series={[
              { name: "الفعلي", color: ACCENT, data: ACTUAL, area: true },
              { name: "الهدف", color: "#8B9097", dash: "4 4", data: TARGET },
            ]}
          />
          <div className="mt-3 flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-[10.5px] text-neutral-600">
            <span>
              الإيراد الحالي {egp(ACTUAL[9])} من هدف {egp(TARGET[9])}
            </span>
            <span className="font-semibold" style={{ color: ACCENT }}>
              {Math.round((ACTUAL[9] / TARGET[9]) * 100)}%
            </span>
          </div>
        </Panel>

        <div className="space-y-3">
          <Panel
            title="تنبيهات حرجة"
            action={
              <Pill>
                {alerts.length}/{ALERTS0.length}
              </Pill>
            }
          >
            <ul className="space-y-2.5">
              {alerts.map(([t, s, to]) => (
                <li key={t} className="flex items-center gap-2 text-[11px]">
                  <AlertTriangle
                    size={13}
                    style={{ color: ACCENT }}
                    className="shrink-0"
                  />
                  <Link to={to} className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-ink">{t}</div>
                    <div className="text-[10px] text-neutral-500">{s}</div>
                  </Link>
                  <button
                    aria-label="إخفاء التنبيه"
                    onClick={() => setAlerts(alerts.filter((a) => a[0] !== t))}
                    className="text-neutral-400 hover:text-ink"
                  >
                    <X size={12} />
                  </button>
                </li>
              ))}
              {alerts.length === 0 && (
                <li className="py-3 text-center text-[10.5px] text-neutral-400">
                  لا توجد تنبيهات
                </li>
              )}
            </ul>
          </Panel>
          <Panel title="آخر الأنشطة">
            <ul className="space-y-3 border-r border-line pr-3">
              {ACTIVITY.map(([t, w]) => (
                <li key={t} className="relative text-[10.5px]">
                  <i className="absolute -right-[17px] top-1 h-1.5 w-1.5 rounded-full bg-ink" />
                  <div className="text-ink">{t}</div>
                  <div className="text-[9.5px] text-neutral-400">{w}</div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      {/* Tasks / sources / sales trend */}
      <div className="grid gap-3 lg:grid-cols-3">
        <Panel
          title="اتجاه المبيعات"
          sub={`نمو ${P.kpi[0].d}% عن الفترة السابقة`}
        >
          <LineChart
            labels={["1", "2", "3", "4", "5", "6", "7"]}
            height={120}
            grid={3}
            format={(v) => `${v.toFixed(1)}M`}
            series={[
              { name: "المبيعات", color: ACCENT, area: true, data: P.sales },
            ]}
          />
        </Panel>
        <Panel title="مصادر العملاء" sub="توزيع العملاء الجدد">
          <div className="flex items-center gap-4">
            <Donut parts={SOURCES} />
            <ul className="flex-1 space-y-2 text-[10.5px]">
              {SOURCES.map((s) => (
                <li key={s.label} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-neutral-600">
                    <i
                      className="h-2 w-2 rounded-sm"
                      style={{ background: s.color }}
                    />
                    {s.label}
                  </span>
                  <b dir="ltr">{s.value}%</b>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
        <Panel
          title="مهام اليوم"
          action={
            <Pill>
              {done.length}/{TASKS0.length}
            </Pill>
          }
        >
          <ul className="space-y-2.5">
            {TASKS0.map((t) => {
              const on = done.includes(t);
              return (
                <li key={t}>
                  <button
                    onClick={() =>
                      setDone(on ? done.filter((x) => x !== t) : [...done, t])
                    }
                    className="flex w-full items-center gap-2 text-right text-[11px]"
                  >
                    {on ? (
                      <CheckCircle2 size={14} className="shrink-0 text-ink" />
                    ) : (
                      <Circle size={14} className="shrink-0 text-neutral-300" />
                    )}
                    <span
                      className={
                        on ? "text-neutral-400 line-through" : "text-ink"
                      }
                    >
                      {t}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      {/* Weekly commitments */}
      <h2 className="pt-2 text-[16px] font-semibold text-ink">
        التزامات الأسبوع
      </h2>
      <div className="grid gap-3 lg:grid-cols-2">
        <Panel
          title="الالتزامات القادمة"
          sub="مدفوعات مستحقة خلال 7 أيام"
          action={
            <Link
              to="/accounting/expenses"
              className="flex items-center text-[10px] text-neutral-500 hover:text-ink"
            >
              عرض الكل <ChevronLeft size={11} />
            </Link>
          }
        >
          <ul className="divide-y divide-line">
            {DUES.map(([t, d, a]) => (
              <li
                key={t}
                className="flex items-center justify-between py-2.5 text-[11px]"
              >
                <div>
                  <div className="font-semibold text-ink">{t}</div>
                  <div className="text-[10px] text-neutral-500">{d}</div>
                </div>
                <span dir="ltr" className="font-semibold">
                  {egp(a)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel
          title="التحصيلات المستحقة"
          sub="إجمالي المبالغ المنتظر تحصيلها"
          action={
            <Link
              to="/accounting/invoices"
              className="flex items-center text-[10px] text-neutral-500 hover:text-ink"
            >
              عرض الكل <ChevronLeft size={11} />
            </Link>
          }
        >
          <div
            dir="ltr"
            className="text-right text-[24px] font-semibold leading-none text-ink"
          >
            {egp(collectTotal)}
          </div>
          <div className="mt-4 space-y-3">
            {["حتى 30 يوماً", "من 31 إلى 60 يوماً", "من 61 يوماً فأكثر"].map(
              (l, i) => (
                <div key={l}>
                  <div className="mb-1 flex justify-between text-[10.5px]">
                    <span className="text-neutral-600">{l}</span>
                    <span dir="ltr" className="font-semibold">
                      {egp(P.collect[i])}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-neutral-100">
                    <div
                      className={`h-1.5 rounded-full ${i === 0 ? "bg-ink" : "bg-neutral-400"}`}
                      style={{ width: `${(P.collect[i] / maxC) * 100}%` }}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </Panel>
      </div>

      {/* Financial overview */}
      <Panel
        title="النظرة المالية"
        sub="الإيرادات والمصروفات خلال الـ 12 شهراً الماضية"
        action={
          <span className="flex items-center gap-3 text-[10px] text-neutral-500">
            <span className="flex items-center gap-1">
              <i className="h-2 w-2 rounded-full bg-ink" />
              الإيرادات
            </span>
            <span className="flex items-center gap-1">
              <i className="h-2 w-2 rounded-full bg-neutral-300" />
              المصروفات
            </span>
          </span>
        }
      >
        <PairedBars
          labels={MONTHS.map((m) => m.slice(0, 3))}
          a={ACTUAL}
          b={EXPENSES}
          nameA="الإيرادات"
          nameB="المصروفات"
          format={egp}
          height={170}
        />
        <div className="mt-4 grid gap-4 border-t border-line pt-3 sm:grid-cols-2">
          {[
            ["أحدث الإيرادات", LATEST.rev, "text-green-700"],
            ["أحدث المصروفات", LATEST.exp, "text-ink"],
          ].map(([t, rows, c]) => (
            <div key={t}>
              <div className="mb-1.5 text-[11px] font-semibold text-ink">
                {t}
              </div>
              {rows.map(([n, a]) => (
                <div
                  key={n}
                  className="flex justify-between py-1.5 text-[10.5px]"
                >
                  <span className="text-neutral-600">{n}</span>
                  <span dir="ltr" className={`font-semibold ${c}`}>
                    {egp(a)}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
