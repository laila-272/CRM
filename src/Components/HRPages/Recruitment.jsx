// src/Components/HRPages/Recruitment.jsx
import { useEffect, useMemo, useState } from "react";
import { Plus, MoreHorizontal, X, Search, Star } from "lucide-react";
import { Modal, Field, inputCls } from "../AccountingPages/Accountingui.jsx";
// ↓ the shared file that exports PageHeader, StatCard, Chip, PagerBar, card, btnDark, btnLight, th, td, downloadCsv
//   (adjust the file name/path to wherever it lives in your project)
import {
  PageHeader,
  StatCard,
  Chip,
  PagerBar,
  downloadCsv,
  card,
  btnDark,
  btnLight,
  th,
  td,
} from "../Shared/ui.jsx"; // same shared path as the other modules
import { Briefcase, FileText, CalendarCheck, UserCheck } from "lucide-react";
import { Avatar } from "./Hrshared.jsx"; // the file that exports Avatar / dmy (your last snippet)

/* ───────────── data ───────────── */
const JOB_STATUS = {
  open: { label: "مفتوحة", cls: "bg-emerald-50 text-emerald-600" },
  urgent: { label: "عاجلة", cls: "bg-red-50 text-red-500" },
  review: { label: "قيد المراجعة", cls: "bg-amber-50 text-amber-600" },
  closed: { label: "مقفلة", cls: "bg-neutral-100 text-neutral-500" },
  draft: { label: "مسودة", cls: "bg-neutral-100 text-neutral-500" },
};
const STAGES = {
  new: { label: "جديد", cls: "bg-amber-50 text-amber-600" },
  interview: { label: "مقابلة", cls: "bg-sky-50 text-sky-600" },
  offer: { label: "عرض وظيفي", cls: "bg-emerald-50 text-emerald-600" },
  hired: { label: "تم التعيين", cls: "bg-emerald-50 text-emerald-600" },
  rejected: { label: "مرفوض", cls: "bg-red-50 text-red-500" },
  pending: { label: "مقابلة", cls: "bg-sky-50 text-sky-600" },
};
const SEED_JOBS = [
  {
    id: 1,
    title: "مدير مبيعات إقليمي",
    meta: "دوام كامل · القاهرة",
    dept: "المبيعات",
    applicants: 24,
    openings: 1,
    date: "2026-10-12",
    status: "open",
  },
  {
    id: 2,
    title: "أخصائي خدمة عملاء",
    meta: "دوام كامل · الإسكندرية",
    dept: "خدمة العملاء",
    applicants: 38,
    openings: 2,
    date: "2026-10-08",
    status: "urgent",
  },
  {
    id: 3,
    title: "محاسب أول",
    meta: "دوام كامل · القاهرة",
    dept: "المالية",
    applicants: 17,
    openings: 1,
    date: "2026-10-03",
    status: "open",
  },
  {
    id: 4,
    title: "مصمم تسويق رقمي",
    meta: "عن بُعد",
    dept: "التسويق",
    applicants: 29,
    openings: 1,
    date: "2026-09-28",
    status: "review",
  },
  {
    id: 5,
    title: "أخصائي موارد بشرية",
    meta: "دوام كامل · القاهرة",
    dept: "الموارد البشرية",
    applicants: 12,
    openings: 1,
    date: "2026-09-15",
    status: "closed",
  },
  {
    id: 6,
    title: "مندوب مبيعات ميداني",
    meta: "دوام كامل · الجيزة",
    dept: "المبيعات",
    applicants: 6,
    openings: 3,
    date: "2026-10-20",
    status: "draft",
  },
];
const SEED_APPS = [
  {
    id: 1,
    name: "ياسمين عادل",
    email: "yasmin.adel@mail.com",
    job: "مدير مبيعات إقليمي",
    stage: "new",
    rating: 4.5,
    date: "2026-10-12",
  },
  {
    id: 2,
    name: "عمر حسام",
    email: "omar.hosam@mail.com",
    job: "أخصائي خدمة عملاء",
    stage: "interview",
    rating: 4.0,
    date: "2026-10-10",
  },
  {
    id: 3,
    name: "ليلى مؤاد",
    email: "laila.m@mail.com",
    job: "محاسب أول",
    stage: "pending",
    rating: 4.8,
    date: "2026-10-09",
  },
  {
    id: 4,
    name: "كريم سعيد",
    email: "karim.s@mail.com",
    job: "مصمم تسويق رقمي",
    stage: "offer",
    rating: 4.6,
    date: "2026-10-07",
  },
  {
    id: 5,
    name: "منى طارق",
    email: "mona.t@mail.com",
    job: "أخصائي موارد بشرية",
    stage: "rejected",
    rating: 3.2,
    date: "2026-10-05",
  },
];
const SEED_CANDIDATES = [
  ["ياسمين عادل", "yasmin.adel@mail.com", "new", 4.5],
  ["عمر حسام", "omar.hosam@mail.com", "new", 4.0],
  ["هبة الله سعيد", "heba.s@mail.com", "interview", 4.7],
  ["كريم سعيد", "karim.s@mail.com", "offer", 4.8],
  ["ليل فؤاد", "lail.f@mail.com", "new", 4.6],
  ["حسن مراد", "hassan.m@mail.com", "interview", 4.2],
  ["مي طارق", "mai.t@mail.com", "rejected", 3.2],
  ["آدم يوسف", "adam.y@mail.com", "new", 4.1],
  ["رنا خالد", "rana.k@mail.com", "interview", 4.4],
  ["طارق نبيل", "tarek.n@mail.com", "rejected", 3.4],
].map(([name, email, stage, rating], i) => ({
  id: i + 1,
  name,
  email,
  stage,
  rating,
}));

const dmy = (iso) => iso.split("-").reverse().join("/");
const PAGE_SIZE = 6;
const ease = "ease-[cubic-bezier(0.32,0.72,0,1)]";

function Badge({ cls, children }) {
  return (
    <span
      className={`inline-flex h-5 items-center rounded-full px-2.5 text-[10px] font-semibold transition-colors ${cls}`}
    >
      {children}
    </span>
  );
}

/* ───────────── applicants drawer ───────────── */
function ApplicantsDrawer({ open, job, onClose }) {
  const [list, setList] = useState(SEED_CANDIDATES);
  const [q, setQ] = useState("");
  const [f, setF] = useState("all");

  // lock background scroll + Esc to close
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const counts = useMemo(() => {
    const c = { all: list.length };
    list.forEach((x) => (c[x.stage] = (c[x.stage] || 0) + 1));
    return c;
  }, [list]);

  const rows = list.filter(
    (x) =>
      (f === "all" || x.stage === f) &&
      (x.name + x.email).toLowerCase().includes(q.trim().toLowerCase()),
  );

  const scheduleAll = () =>
    setList((l) =>
      l.map((x) => (x.stage === "new" ? { ...x, stage: "interview" } : x)),
    );
  const exportList = () =>
    downloadCsv(
      "applicants.csv",
      ["الاسم", "البريد", "المرحلة", "التقييم"],
      rows.map((x) => [x.name, x.email, STAGES[x.stage].label, x.rating]),
    );
  const reject = (id) =>
    setList((l) =>
      l.map((x) => (x.id === id ? { ...x, stage: "rejected" } : x)),
    );

  const FILTERS = [
    ["all", "الكل"],
    ["new", "جديد"],
    ["interview", "مقابلة"],
    ["offer", "عرض"],
    ["rejected", "مرفوض"],
  ];

  return (
    <>
      {/* overlay */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity duration-300 ${ease} ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      {/* drawer (slides from the left) */}
      <aside
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-50 flex w-[400px] max-w-full flex-col bg-white shadow-2xl transition-transform duration-300 ${ease} ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="shrink-0 border-b border-line px-5 pb-4 pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-ink">
                المتقدمون للوظيفة
              </h2>
              <p className="mt-1 truncate text-[10.5px] text-neutral-500">
                {job ? `${job.title} · ${job.dept} · ${job.meta}` : ""}
              </p>
              {job && (
                <div className="mt-2 flex items-center gap-1.5">
                  <Badge cls={JOB_STATUS[job.status].cls}>
                    {JOB_STATUS[job.status].label}
                  </Badge>
                  <Badge cls="bg-neutral-100 text-neutral-600">
                    {job.applicants} متقدم
                  </Badge>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="إغلاق"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-ink"
            >
              <X size={13} />
            </button>
          </div>
        </div>

        <div className="shrink-0 space-y-3 px-5 py-3">
          <div className="relative">
            <Search
              size={12}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن مرشح بالاسم أو البريد..."
              className="h-8 w-full rounded-lg border border-line bg-[#F7F7F8] pl-3 pr-8 text-[11px] outline-none transition-colors focus:border-neutral-400"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map(([k, l]) => (
              <Chip key={k} active={f === k} onClick={() => setF(k)}>
                {l} {counts[k] ?? 0}
              </Chip>
            ))}
          </div>
        </div>

        {/* independently scrolling list */}
        <ul className="min-h-0 flex-1 overflow-y-auto px-5">
          {rows.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-2.5 border-b border-line py-3 last:border-0"
            >
              <Avatar name={c.name} size={26} />
              <div className="min-w-0 flex-1 leading-tight">
                <div className="truncate text-[11.5px] font-semibold text-ink">
                  {c.name}
                </div>
                <div
                  dir="ltr"
                  className="truncate text-right text-[9.5px] text-neutral-400"
                >
                  {c.email}
                </div>
              </div>
              <span
                className="flex items-center gap-0.5 text-[10px] text-neutral-500"
                dir="ltr"
              >
                <Star size={9} className="fill-amber-400 text-amber-400" />
                {c.rating.toFixed(1)}
              </span>
              <Badge cls={STAGES[c.stage].cls}>{STAGES[c.stage].label}</Badge>
              <button
                onClick={() => reject(c.id)}
                title="رفض"
                aria-label="خيارات"
                className="grid h-6 w-6 place-items-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-ink"
              >
                <MoreHorizontal size={14} />
              </button>
            </li>
          ))}
          {!rows.length && (
            <li className="py-10 text-center text-[11px] text-neutral-400">
              لا توجد نتائج مطابقة
            </li>
          )}
        </ul>

        {/* fixed footer actions */}
        <div className="flex shrink-0 items-center gap-2 border-t border-line px-5 py-3">
          <button
            onClick={scheduleAll}
            className={`${btnDark} transition-opacity hover:opacity-90`}
          >
            جدولة مقابلات
          </button>
          <button
            onClick={exportList}
            className={`${btnLight} transition-colors hover:bg-neutral-50`}
          >
            تصدير القائمة
          </button>
        </div>
      </aside>
    </>
  );
}

/* ───────────── page ───────────── */
export default function Recruitment() {
  const [jobs, setJobs] = useState(SEED_JOBS);
  const [apps, setApps] = useState(SEED_APPS);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [jp, setJp] = useState(1);
  const [ap, setAp] = useState(1);
  const [drawerJob, setDrawerJob] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    title: "",
    dept: "المبيعات",
    openings: 1,
  });

  const openDrawer = (job) => {
    setDrawerJob(job);
    setDrawerOpen(true);
  };
  const closeDrawer = () => setDrawerOpen(false); // job kept so content stays during the close animation

  const FILTERS = [
    ["all", "الكل"],
    ["open", "مفتوحة"],
    ["urgent", "عاجلة"],
    ["review", "قيد المراجعة"],
    ["closed", "مقفلة"],
  ];

  const filtered = jobs.filter(
    (j) =>
      (filter === "all" || j.status === filter) &&
      (j.title + j.dept).includes(q.trim()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(jp, pages);
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const aPages = Math.max(1, Math.ceil(apps.length / 5));
  const aPage = Math.min(ap, aPages);
  const aShown = apps.slice((aPage - 1) * 5, aPage * 5);

  const setStage = (id, stage) =>
    setApps((l) => l.map((a) => (a.id === id ? { ...a, stage } : a)));

  const addJob = () => {
    if (!form.title.trim()) return;
    setJobs([
      {
        id: Date.now(),
        title: form.title.trim(),
        meta: "دوام كامل · القاهرة",
        dept: form.dept,
        applicants: 0,
        openings: Number(form.openings) || 1,
        date: new Date().toISOString().slice(0, 10),
        status: "open",
      },
      ...jobs,
    ]);
    setForm({ title: "", dept: "المبيعات", openings: 1 });
    setAdding(false);
  };

  const openCount = jobs.filter(
    (j) => j.status === "open" || j.status === "urgent",
  ).length;

  return (
    <div className="space-y-5" dir="rtl">
      <PageHeader
        title="التوظيف"
        subtitle="إدارة الوظائف الشاغرة وطلبات التوظيف والمرشحين والمقابلات"
      >
        <button
          onClick={() => setAdding(true)}
          className={`${btnDark} transition-opacity hover:opacity-90`}
        >
          <Plus size={12} /> وظيفة جديدة
        </button>
      </PageHeader>

      {/* filters + search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map(([k, l]) => (
            <Chip
              key={k}
              active={filter === k}
              onClick={() => {
                setFilter(k);
                setJp(1);
              }}
            >
              {l}
            </Chip>
          ))}
        </div>
        <div className="relative w-full sm:w-[230px]">
          <Search
            size={12}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setJp(1);
            }}
            placeholder="ابحث عن وظيفة أو مرشح..."
            className="h-8 w-full rounded-full border border-line bg-white pl-3 pr-8 text-[11px] outline-none transition-colors focus:border-neutral-400"
          />
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Briefcase}
          value={openCount}
          label="3 عاجلة"
          tag="وظائف مفتوحة"
        />
        <StatCard
          icon={FileText}
          value="126"
          label="+14 هذا الأسبوع"
          tag="طلبات التوظيف"
        />
        <StatCard
          icon={CalendarCheck}
          value="14"
          label="5 مقابلات اليوم"
          tag="مقابلات هذا الأسبوع"
        />
        <StatCard
          icon={UserCheck}
          value="6"
          label="هذا الشهر"
          tag="تم التعيين"
        />
      </div>

      {/* vacancies */}
      <section>
        <h2 className="text-[14px] font-semibold text-ink">الوظائف الشاغرة</h2>
        <p className="mb-2.5 mt-0.5 text-[10.5px] text-neutral-500">
          الوظائف المنشورة وعدد المتقدمين لكل وظيفة
        </p>
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line">
                  <th className={th}>الوظيفة</th>
                  <th className={th}>القسم</th>
                  <th className={th}>المتقدمين</th>
                  <th className={th}>الشواغر</th>
                  <th className={th}>تاريخ النشر</th>
                  <th className={th}>الحالة</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody>
                {shown.map((j) => (
                  <tr
                    key={j.id}
                    onClick={() => openDrawer(j)}
                    className="cursor-pointer border-b border-line transition-colors last:border-0 hover:bg-neutral-50"
                  >
                    <td className={td}>
                      <div className="font-semibold">{j.title}</div>
                      <div className="mt-0.5 text-[9.5px] text-neutral-400">
                        {j.meta}
                      </div>
                    </td>
                    <td className={td}>{j.dept}</td>
                    <td className={td}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDrawer(j);
                        }}
                        className="underline-offset-2 transition-colors hover:text-neutral-500 hover:underline"
                      >
                        {j.applicants} متقدم
                      </button>
                    </td>
                    <td className={td}>{j.openings}</td>
                    <td className={td}>{dmy(j.date)}</td>
                    <td className={td}>
                      <Badge cls={JOB_STATUS[j.status].cls}>
                        {JOB_STATUS[j.status].label}
                      </Badge>
                    </td>
                    <td className={td}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openDrawer(j);
                        }}
                        aria-label="عرض المتقدمين"
                        className="grid h-6 w-6 place-items-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-ink"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!shown.length && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-[11px] text-neutral-400"
                    >
                      لا توجد وظائف
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <PagerBar
            page={page}
            pages={pages}
            onPage={setJp}
            info={`عرض ${filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0}–${Math.min(page * PAGE_SIZE, filtered.length)} من ${filtered.length} وظائف`}
          />
        </div>
      </section>

      {/* latest applications */}
      <section>
        <h2 className="text-[14px] font-semibold text-ink">
          أحدث طلبات التوظيف
        </h2>
        <p className="mb-2.5 mt-0.5 text-[10.5px] text-neutral-500">
          آخر المتقدمين لكل المرشحين للوظائف المفتوحة
        </p>
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line">
                  <th className={th}>المرشح</th>
                  <th className={th}>الوظيفة المتقدم لها</th>
                  <th className={th}>المرحلة</th>
                  <th className={th}>التقييم</th>
                  <th className={th}>تاريخ التقديم</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody>
                {aShown.map((a) => (
                  <tr key={a.id} className="border-b border-line last:border-0">
                    <td className={td}>
                      <div className="flex items-center gap-2">
                        <Avatar name={a.name} size={26} />
                        <div className="leading-tight">
                          <div className="font-semibold">{a.name}</div>
                          <div
                            dir="ltr"
                            className="text-right text-[9.5px] text-neutral-400"
                          >
                            {a.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={td}>{a.job}</td>
                    <td className={td}>
                      <Badge cls={STAGES[a.stage].cls}>
                        {STAGES[a.stage].label}
                      </Badge>
                    </td>
                    <td className={td}>{a.rating.toFixed(1)} من 5</td>
                    <td className={td}>{dmy(a.date)}</td>
                    <td className={td}>
                      <div className="flex items-center gap-1.5">
                        {a.stage !== "rejected" && (
                          <>
                            <button
                              onClick={() => setStage(a.id, "interview")}
                              className="h-6 rounded-full bg-ink px-3 text-[10px] font-semibold text-white transition-opacity hover:opacity-90"
                            >
                              جدولة مقابلة
                            </button>
                            <button
                              onClick={() => setStage(a.id, "rejected")}
                              className="h-6 rounded-full border border-line bg-white px-3 text-[10px] font-semibold text-ink transition-colors hover:bg-neutral-100"
                            >
                              رفض
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PagerBar
            page={aPage}
            pages={aPages}
            onPage={setAp}
            info={`عرض ${(aPage - 1) * 5 + 1}–${Math.min(aPage * 5, apps.length)} من 126 طلب`}
          />
        </div>
      </section>

      <ApplicantsDrawer
        open={drawerOpen}
        job={drawerJob}
        onClose={closeDrawer}
      />

      {adding && (
        <Modal
          title="وظيفة جديدة"
          onClose={() => setAdding(false)}
          onSubmit={addJob}
          submitLabel="نشر الوظيفة"
        >
          <Field label="المسمى الوظيفي" full>
            <input
              className={inputCls}
              value={form.title}
              autoFocus
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
          <Field label="القسم">
            <select
              className={inputCls}
              value={form.dept}
              onChange={(e) => setForm({ ...form, dept: e.target.value })}
            >
              {[
                "المبيعات",
                "خدمة العملاء",
                "المالية",
                "التسويق",
                "الموارد البشرية",
              ].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="عدد الشواغر">
            <input
              type="number"
              min="1"
              className={inputCls}
              value={form.openings}
              onChange={(e) => setForm({ ...form, openings: e.target.value })}
            />
          </Field>
        </Modal>
      )}
    </div>
  );
}
