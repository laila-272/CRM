// src/Components/HRPages/EmployeeReports.jsx
import { useMemo, useState } from "react";
import { Download, Search, X } from "lucide-react";
import {
  PageHeader,
  Chip,
  PagerBar,
  btnDark,
  card,
  th,
  td,
  downloadCsv,
} from "../Shared/ui.jsx"; // same shared path as the other modules
import { KpiCard, CardHead } from "./Hrwidgets.jsx";

const PERIODS = {
  month: {
    label: "هذا الشهر",
    total: 48,
    totalNote: "+3 هذا الشهر",
    att: "94%",
    attNote: "أعلى من الشهر الماضي (93%)",
    turn: "4.2%",
    turnNote: "آخر 12 شهراً",
    perf: "4.3",
  },
  quarter: {
    label: "الربع الحالي",
    total: 48,
    totalNote: "+5 هذا الربع",
    att: "93%",
    attNote: "أعلى من الربع الماضي (92%)",
    turn: "4.0%",
    turnNote: "آخر 12 شهراً",
    perf: "4.3",
  },
  year: {
    label: "هذه السنة",
    total: 48,
    totalNote: "+11 هذه السنة",
    att: "93%",
    attNote: "أعلى من السنة الماضية (91%)",
    turn: "6.8%",
    turnNote: "منذ بداية السنة",
    perf: "4.2",
  },
  custom: {
    label: "فترة مخصصة",
    total: 48,
    totalNote: "ضمن الفترة المحددة",
    att: "93%",
    attNote: "متوسط الفترة المحددة",
    turn: "4.5%",
    turnNote: "ضمن الفترة المحددة",
    perf: "4.3",
  },
};

const DEPT_DIST = [
  ["المبيعات", 12],
  ["خدمة العملاء", 10],
  ["التقنية", 10],
  ["التسويق", 8],
  ["المالية", 5],
  ["الموارد البشرية", 3],
];

const ATTENDANCE = [
  ["مايو", 92],
  ["يونيو", 93],
  ["يوليو", 91],
  ["أغسطس", 95],
  ["سبتمبر", 91],
  ["أكتوبر", 94],
];

const REPORTS = [
  [
    "تقرير الحضور والانصراف الشهري",
    "ملخص ساعات العمل والتأخير والغياب",
    "الحضور",
    "2026-10-21",
    "PDF",
  ],
  [
    "تقرير الرواتب والاستقطاعات",
    "إجمالي الرواتب والبدلات والخصومات",
    "الرواتب",
    "2026-10-20",
    "Excel",
  ],
  [
    "تقرير الدوران الوظيفي",
    "معدلات القبول والاستقالات وإنهاء الخدمة",
    "التوظيف",
    "2026-10-18",
    "PDF",
  ],
  [
    "تقرير تقييم الأداء المهني",
    "نتائج التقييم لكل قسم وموظف",
    "الأداء",
    "2026-10-15",
    "PDF",
  ],
  [
    "تقرير الإجازات والأرصدة",
    "الإجازات المستخدمة والأرصدة الفعلية",
    "الإجازات",
    "2026-10-12",
    "Excel",
  ],
  [
    "تقرير المستندات المنتهية",
    "مستندات الموظفين المنتهية أو القريبة من الانتهاء",
    "المستندات",
    "2026-10-10",
    "PDF",
  ],
  [
    "تقرير العمل الإضافي",
    "ساعات العمل الإضافي وتكلفتها لكل قسم",
    "الحضور",
    "2026-10-08",
    "Excel",
  ],
  [
    "تقرير التدريب والتطوير",
    "الدورات المكتملة وساعات التدريب للفريق",
    "الأداء",
    "2026-10-06",
    "PDF",
  ],
  [
    "تقرير الموظفين الجدد",
    "المعينون حديثاً وحالة التهيئة الوظيفية",
    "التوظيف",
    "2026-10-04",
    "PDF",
  ],
  [
    "تقرير التأمينات والضرائب",
    "الاشتراكات والضرائب المستقطعة شهرياً",
    "الرواتب",
    "2026-10-02",
    "Excel",
  ],
  [
    "تقرير التأخير والغياب",
    "الموظفون الأكثر تأخيراً وغياباً",
    "الحضور",
    "2026-09-30",
    "PDF",
  ],
  [
    "تقرير رضا الموظفين",
    "نتائج استبيان رضا الموظفين الربع سنوي",
    "الأداء",
    "2026-09-27",
    "PDF",
  ],
  [
    "تقرير الإجازات المرضية",
    "إجازات مرضية مسجلة وتقارير طبية",
    "الإجازات",
    "2026-09-22",
    "Excel",
  ],
  [
    "تقرير عقود الموظفين",
    "العقود السارية والمنتهية والقريبة من التجديد",
    "المستندات",
    "2026-09-18",
    "PDF",
  ],
].map(([name, desc, cat, date, fmt], id) => ({
  id,
  name,
  desc,
  cat,
  date,
  fmt,
}));

const PAGE_SIZE = 6;
const dmy = (iso) => iso.split("-").reverse().join("/");

export default function EmployeeReports() {
  const [period, setPeriod] = useState("month");
  const [range, setRange] = useState({ from: "", to: "" });
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [active, setActive] = useState(ATTENDANCE.length - 1);
  const [preview, setPreview] = useState(null);

  const p = PERIODS[period];

  const list = useMemo(() => {
    const s = q.trim();
    return REPORTS.filter((r) => !s || (r.name + r.desc + r.cat).includes(s));
  }, [q]);
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const shown = list.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

  const maxDept = Math.max(...DEPT_DIST.map(([, n]) => n));

  const exportReport = () =>
    downloadCsv(
      "employee-report.csv",
      ["المؤشر", "القيمة"],
      [
        ["الفترة", p.label],
        ["إجمالي الموظفين", p.total],
        ["معدل الحضور", p.att],
        ["معدل الدوران الوظيفي", p.turn],
        ["متوسط تقييم الأداء", `${p.perf} من 5`],
        ...DEPT_DIST.map(([d, n]) => [`قسم ${d}`, n]),
      ],
    );
  const download = (r) =>
    downloadCsv(
      `${r.name}.csv`,
      ["التقرير", "الفئة", "آخر تحديث", "الصيغة"],
      [[r.name, r.cat, dmy(r.date), r.fmt]],
    );

  return (
    <div className="space-y-5" dir="rtl">
      <PageHeader
        title="تقارير الموظفين"
        subtitle="تقارير تحليلية عن الحضور والأداء والرواتب والدوران الوظيفي"
      >
        <button
          onClick={exportReport}
          className={`${btnDark} transition-opacity hover:opacity-90`}
        >
          <Download size={12} /> تصدير التقرير
        </button>
      </PageHeader>

      {/* period tabs + search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {Object.entries(PERIODS).map(([k, v]) => (
            <Chip key={k} active={period === k} onClick={() => setPeriod(k)}>
              {v.label}
            </Chip>
          ))}
          {period === "custom" && (
            <div className="flex items-center gap-1.5 text-[10.5px] text-neutral-500">
              <input
                type="date"
                value={range.from}
                max={range.to || undefined}
                onChange={(e) => setRange({ ...range, from: e.target.value })}
                className="h-7 rounded-full border border-line bg-white px-2.5 outline-none focus:border-neutral-400"
              />
              <span>إلى</span>
              <input
                type="date"
                value={range.to}
                min={range.from || undefined}
                onChange={(e) => setRange({ ...range, to: e.target.value })}
                className="h-7 rounded-full border border-line bg-white px-2.5 outline-none focus:border-neutral-400"
              />
            </div>
          )}
        </div>
        <div className="relative w-full sm:w-[250px]">
          <Search
            size={12}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="ابحث عن تقرير..."
            className="h-8 w-full rounded-full border border-line bg-white pl-8 pr-8 text-[11px] outline-none transition-colors focus:border-neutral-400"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              aria-label="مسح"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-ink"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          title="إجمالي الموظفين"
          value={p.total}
          tone="up"
          note={p.totalNote}
        />
        <KpiCard title="معدل الحضور" value={p.att} tone="up" note={p.attNote} />
        <KpiCard
          title="معدل الدوران الوظيفي"
          value={p.turn}
          note={p.turnNote}
        />
        <KpiCard
          title="متوسط تقييم الأداء"
          value={p.perf}
          unit="من 5"
          note="الربع الحالي"
        />
      </div>

      {/* charts */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className={`${card} p-5`}>
          <CardHead
            title="توزيع الموظفين حسب القسم"
            sub="عدد الموظفين في كل قسم · الإجمالي 48"
          />
          <div className="mt-6 space-y-3.5">
            {DEPT_DIST.map(([d, n]) => (
              <div
                key={d}
                className="flex items-center gap-3 text-[10px] text-ink"
              >
                <span className="w-[72px] shrink-0">{d}</span>
                <div className="h-[5px] flex-1 overflow-hidden rounded-full bg-neutral-200">
                  <div
                    className="h-full rounded-full bg-ink transition-[width] duration-500 ease-out"
                    style={{ width: `${(n / maxDept) * 100}%` }}
                  />
                </div>
                <span dir="ltr" className="w-5 shrink-0 text-neutral-500">
                  {n}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={`${card} p-5`}>
          <CardHead
            title="معدل الحضور آخر 6 أشهر"
            sub="نسبة الحضور الشهرية لجميع الأقسام"
          />
          <div className="mt-5 flex h-[190px] items-end justify-between gap-4 px-2">
            {ATTENDANCE.map(([m, v], i) => (
              <button
                key={m}
                onClick={() => setActive(i)}
                className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5 outline-none"
                aria-label={`${m} ${v}%`}
              >
                <span dir="ltr" className="text-[8.5px] text-neutral-500">
                  {v}%
                </span>
                <div
                  className={`w-full max-w-[22px] rounded-[3px] transition-all duration-300 ease-out ${
                    active === i
                      ? "bg-ink"
                      : "bg-[#D9DCE1] group-hover:bg-neutral-400"
                  }`}
                  style={{ height: `${((v - 70) / 30) * 135}px` }}
                />
                <span className="text-[9px] text-neutral-500">{m}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* reports table */}
      <section>
        <h2 className="text-[14px] font-semibold text-ink">التقارير الجاهزة</h2>
        <p className="mb-2.5 mt-0.5 text-[10.5px] text-neutral-500">
          تقارير الموظفين المتاحة للمعاينة والتنزيل
        </p>
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line bg-neutral-50/60">
                  <th className={th}>التقرير</th>
                  <th className={th}>الفئة</th>
                  <th className={th}>آخر تحديث</th>
                  <th className={th}>الصيغة</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-line transition-colors last:border-0 hover:bg-neutral-50"
                  >
                    <td className={`${td} w-full`}>
                      <div className="font-semibold">{r.name}</div>
                      <div className="mt-0.5 text-[9.5px] text-neutral-400">
                        {r.desc}
                      </div>
                    </td>
                    <td className={td}>{r.cat}</td>
                    <td className={td}>{dmy(r.date)}</td>
                    <td className={td}>{r.fmt}</td>
                    <td className={td}>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => download(r)}
                          className="h-6 rounded-full bg-ink px-3 text-[10px] font-semibold text-white transition-opacity hover:opacity-90"
                        >
                          تنزيل
                        </button>
                        <button
                          onClick={() => setPreview(r)}
                          className="h-6 rounded-full border border-line bg-white px-3 text-[10px] font-semibold text-ink transition-colors hover:bg-neutral-100"
                        >
                          معاينة
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!shown.length && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-[11px] text-neutral-400"
                    >
                      لا توجد تقارير مطابقة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <PagerBar
            page={cur}
            pages={pages}
            onPage={setPage}
            info={`عرض ${list.length ? (cur - 1) * PAGE_SIZE + 1 : 0}–${Math.min(cur * PAGE_SIZE, list.length)} من ${list.length} تقرير`}
          />
        </div>
      </section>

      {/* preview dialog */}
      {preview && (
        <div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setPreview(null)}
          />
          <div className="relative w-full max-w-[420px] rounded-xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-[14px] font-semibold text-ink">
                  {preview.name}
                </h3>
                <p className="mt-1 text-[10.5px] text-neutral-500">
                  {preview.desc}
                </p>
              </div>
              <button
                onClick={() => setPreview(null)}
                aria-label="إغلاق"
                className="grid h-7 w-7 place-items-center rounded-full border border-line text-neutral-500 hover:bg-neutral-100"
              >
                <X size={13} />
              </button>
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-3 rounded-lg bg-neutral-50 p-3 text-[11px]">
              <div>
                <dt className="text-neutral-400">الفئة</dt>
                <dd className="mt-0.5 font-semibold text-ink">{preview.cat}</dd>
              </div>
              <div>
                <dt className="text-neutral-400">آخر تحديث</dt>
                <dd className="mt-0.5 font-semibold text-ink">
                  {dmy(preview.date)}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-400">الصيغة</dt>
                <dd className="mt-0.5 font-semibold text-ink">{preview.fmt}</dd>
              </div>
            </dl>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  download(preview);
                  setPreview(null);
                }}
                className={`${btnDark}`}
              >
                تنزيل التقرير
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
