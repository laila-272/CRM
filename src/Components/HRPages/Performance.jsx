// src/Components/HRPages/Performance.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Download,
  Star,
  Target,
  CheckCircle2,
  Smile,
  Clock,
  BookOpen,
} from "lucide-react";
import { Modal, Field, inputCls } from "../AccountingPages/Accountingui.jsx";
import {
  PageHeader,
  btnDark,
  btnLight,
  card,
  th,
  td,
  downloadCsv,
} from "../Shared/ui.jsx"; // same shared path as the other modules
import { Avatar } from "../HRPages/Hrshared.jsx";
import {
  KpiCard,
  CardHead,
  Progress,
  MetricBar,
  linkBtn,
} from "./Hrwidgets.jsx";

const STATUS = {
  excellent: {
    label: "ممتاز",
    cls: "bg-emerald-600 text-white border-emerald-600",
  },
  track: {
    label: "على المسار",
    cls: "bg-neutral-100 text-neutral-600 border-line",
  },
  support: {
    label: "يحتاج دعم",
    cls: "bg-neutral-100 text-neutral-600 border-line",
  },
};

const TEAM = [
  {
    name: "أحمد علي",
    role: "مدير مبيعات",
    goals: 96,
    rating: 4.8,
    status: "excellent",
  },
  {
    name: "سارة الحلوي",
    role: "مسؤولة حسابات",
    goals: 88,
    rating: 4.5,
    status: "track",
  },
  {
    name: "فهد المحمداني",
    role: "أخصائي مبيعات",
    goals: 81,
    rating: 4.2,
    status: "track",
  },
  {
    name: "ريم السالم",
    role: "محاسبة",
    goals: 74,
    rating: 3.9,
    status: "support",
  },
  {
    name: "عمر الغماري",
    role: "مسؤول مبيعات",
    goals: 69,
    rating: 3.7,
    status: "support",
  },
  {
    name: "منى فتحي",
    role: "مشرفة خدمة عملاء",
    goals: 92,
    rating: 4.6,
    status: "excellent",
  },
  {
    name: "طارق نصر",
    role: "أخصائي تسويق",
    goals: 85,
    rating: 4.3,
    status: "track",
  },
  {
    name: "دينا شاكر",
    role: "مسؤولة توظيف",
    goals: 66,
    rating: 3.6,
    status: "support",
  },
];

const GOALS = [
  ["تحسينات الإيرادات الشهرية", 88],
  ["اكتساب عملاء جدد", 72],
  ["رضا العملاء", 94],
  ["الاحتفاظ بالعملاء", 78],
  ["إنجاز المهام في وقتها", 86],
];

const SKILLS = [
  ["مهارات التفاوض", 64],
  ["تحليل البيانات", 58],
  ["خدمة العملاء", 47],
  ["إدارة الوقت", 41],
  ["القيادة وإدارة الفرق", 35],
];

const DEPTS = [
  "المبيعات",
  "خدمة العملاء",
  "المالية",
  "التسويق",
  "الموارد البشرية",
];

export default function Performance() {
  const [showAll, setShowAll] = useState(false);
  const [hours, setHours] = useState(312);
  const [plans, setPlans] = useState(24);
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ title: "", dept: DEPTS[0], hours: 8 });
  const [err, setErr] = useState("");

  const rows = showAll ? TEAM : TEAM.slice(0, 5);

  const exportReport = () =>
    downloadCsv(
      "performance.csv",
      ["الموظف", "المسمى", "تحقيق الأهداف %", "التقييم", "الحالة"],
      TEAM.map((e) => [
        e.name,
        e.role,
        e.goals,
        e.rating,
        STATUS[e.status].label,
      ]),
    );

  const addPlan = () => {
    if (!f.title.trim()) return setErr("أدخل اسم خطة التطوير");
    setPlans((p) => p + 1);
    setHours((h) => h + (Number(f.hours) || 0));
    setF({ title: "", dept: DEPTS[0], hours: 8 });
    setErr("");
    setAdding(false);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader
        title="الأداء والتطوير"
        subtitle="تابع أداء فريقك وخطط تطويره وحقق أهداف العمل"
      >
        <button
          onClick={exportReport}
          className={`${btnLight} transition-colors hover:bg-neutral-50`}
        >
          <Download size={12} /> تصدير التقرير
        </button>
        <button
          onClick={() => setAdding(true)}
          className={`${btnDark} transition-opacity hover:opacity-90`}
        >
          <Plus size={12} /> خطط تطوير جديدة
        </button>
      </PageHeader>

      {/* ───────── Performance ───────── */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">الأداء</h2>
            <p className="mt-0.5 text-[10.5px] text-neutral-500">
              نظرة عامة على أداء الفريق خلال الربع الحالي
            </p>
          </div>
          <Link to="/employee-reports" className={linkBtn}>
            عرض تقارير الأداء
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            icon={Star}
            title="متوسط تقييم الأداء"
            value="4.3"
            unit="/ 5"
            tone="up"
            note="+0.2 عن الربع الماضي"
          />
          <KpiCard
            icon={Target}
            title="تحقيق الأهداف"
            value="82%"
            tone="up"
            note="+5% عن الربع الماضي"
          />
          <KpiCard
            icon={CheckCircle2}
            title="معدل إنجاز المهام"
            value="91%"
            tone="up"
            note="+3% عن الشهر الماضي"
          />
          <KpiCard
            icon={Smile}
            title="رضا العملاء"
            value="4.6"
            unit="/ 5"
            tone="down"
            note="-0.1 عن الشهر الماضي"
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.9fr_1fr]">
          {/* team table */}
          <div className={`${card} overflow-hidden`}>
            <div className="p-4 pb-2">
              <CardHead
                title="أداء الفريق"
                sub="تقدم كل موظف في تحقيق أهدافه وتقييمه الحالي"
                action={
                  <button
                    onClick={() => setShowAll((s) => !s)}
                    className={linkBtn}
                  >
                    {showAll ? "عرض أقل" : "عرض الكل"}
                  </button>
                }
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-y border-line bg-neutral-50/60">
                    <th className={th}>الموظف</th>
                    <th className={th}>تحقيق الأهداف</th>
                    <th className={th}>التقييم</th>
                    <th className={th}>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((e) => (
                    <tr
                      key={e.name}
                      className="border-b border-line transition-colors last:border-0 hover:bg-neutral-50"
                    >
                      <td className={td}>
                        <div className="flex items-center gap-2">
                          <Avatar name={e.name} size={24} />
                          <div className="leading-tight">
                            <div className="font-semibold">{e.name}</div>
                            <div className="text-[9.5px] text-neutral-400">
                              {e.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={td}>
                        <div className="flex w-[150px] items-center gap-2">
                          <span
                            dir="ltr"
                            className="w-8 text-[10px] text-neutral-500"
                          >
                            {e.goals}%
                          </span>
                          <Progress value={e.goals} />
                        </div>
                      </td>
                      <td className={td}>
                        <span className="flex items-center gap-1" dir="ltr">
                          <Star
                            size={10}
                            className="fill-amber-400 text-amber-400"
                          />
                          {e.rating.toFixed(1)}
                        </span>
                      </td>
                      <td className={td}>
                        <span
                          className={`inline-flex h-5 items-center rounded-full border px-2.5 text-[9.5px] font-semibold ${STATUS[e.status].cls}`}
                        >
                          {STATUS[e.status].label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* quarter goals */}
          <div className={`${card} p-4`}>
            <CardHead
              title="أهداف الربع"
              sub="نسبة تحقيق الأهداف الرئيسية"
              action={
                <Link to="/employee-reports" className={linkBtn}>
                  عرض الكل
                </Link>
              }
            />
            <div className="mt-5 space-y-4">
              {GOALS.map(([l, v]) => (
                <MetricBar key={l} label={l} value={v} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Development ───────── */}
      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">التطوير</h2>
            <p className="mt-0.5 text-[10.5px] text-neutral-500">
              خطط التطوير والدورات التدريبية للفريق
            </p>
          </div>
          <button onClick={() => setAdding(true)} className={linkBtn}>
            عرض كل الخطط
          </button>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className={`${card} p-4`}>
            <CardHead
              title="المهارات الأكثر احتياجاً"
              sub="نسبة الموظفين المحتاجين للتطوير حسب المهارة"
              action={<span className={linkBtn}>عرض الكل</span>}
            />
            <div className="mt-5 space-y-4">
              {SKILLS.map(([l, v]) => (
                <MetricBar key={l} label={l} value={v} />
              ))}
            </div>
          </div>

          <div className="grid content-start gap-3">
            <KpiCard
              icon={Clock}
              title="ساعات التدريب المكتملة"
              value={hours}
              unit="ساعة"
              tone="up"
              note="+18% عن الشهر الماضي"
            />
            <KpiCard
              icon={BookOpen}
              title="خطط التطوير النشطة"
              value={plans}
              tone="up"
              note="+4 هذا الشهر"
            />
          </div>
        </div>
      </section>

      {adding && (
        <Modal
          title="خطة تطوير جديدة"
          onClose={() => {
            setAdding(false);
            setErr("");
          }}
          onSubmit={addPlan}
          submitLabel="إضافة الخطة"
        >
          <Field label="اسم الخطة" full>
            <input
              className={inputCls}
              value={f.title}
              autoFocus
              onChange={(e) => setF({ ...f, title: e.target.value })}
            />
          </Field>
          <Field label="القسم">
            <select
              className={inputCls}
              value={f.dept}
              onChange={(e) => setF({ ...f, dept: e.target.value })}
            >
              {DEPTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="ساعات التدريب">
            <input
              type="number"
              min="0"
              className={inputCls}
              value={f.hours}
              onChange={(e) => setF({ ...f, hours: e.target.value })}
            />
          </Field>
          {err && (
            <p role="alert" className="col-span-2 text-[11px] text-red-600">
              {err}
            </p>
          )}
        </Modal>
      )}
    </div>
  );
}
