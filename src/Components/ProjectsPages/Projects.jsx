import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Plus, ArrowLeft } from "lucide-react";
import {
  PageHeader,
  SearchBox,
  Select,
  Chip,
  card,
  btnDark,
  btnLight,
  downloadCsv,
  th,
  td,
} from "../Shared/ui.jsx";
import {
  MetricCard,
  ProgressBar,
  PrevNextPager,
  Badge,
} from "../Shared/ProjectUI.jsx";
import ProjectModal from "../Shared/ProjectModal.jsx";
import { Toast, useToast } from "../CRMPages/TaskModal.jsx";
import { fmtDate, todayIso } from "../../data/Tasks.js";
import {
  useProjects,
  projectStatusOf,
  progressOf,
  PSTATUS_CLS,
  OWNERS,
  PRIORITIES,
} from "../../data/projects.js";

const PAGE_SIZE = 7;
const STATUS_CHIPS = ["جاري", "متأخر", "مكتمل", "متوقف"];

export default function Projects() {
  const { projects, tasks, saveProject } = useProjects();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [owner, setOwner] = useState("all");
  const [priority, setPriority] = useState("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [toast, notify] = useToast();

  const withInfo = useMemo(
    () =>
      projects.map((p) => ({
        ...p,
        st: projectStatusOf(p),
        progress: progressOf(p, tasks),
      })),
    [projects, tasks],
  );

  const base = useMemo(() => {
    const s = q.trim().toLowerCase();
    return withInfo.filter(
      (p) =>
        (owner === "all" || p.owner === owner) &&
        (priority === "all" || p.priority === priority) &&
        (!s ||
          [p.name, p.client, p.code].some((v) => v.toLowerCase().includes(s))),
    );
  }, [withInfo, q, owner, priority]);
  const list = status === "all" ? base : base.filter((p) => p.st === status);

  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const rows = list.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const from = list.length ? (cur - 1) * PAGE_SIZE + 1 : 0;

  const count = (st) => withInfo.filter((p) => p.st === st).length;
  const monthPrefix = todayIso().slice(0, 7);
  const newThisMonth = withInfo.filter((p) =>
    p.start.startsWith(monthPrefix),
  ).length;
  const reset = (fn) => (v) => {
    fn(v);
    setPage(1);
  };

  const onSave = (p) => {
    saveProject(p);
    setModal(false);
    setPage(1);
    setStatus("all");
    notify("تمت إضافة المشروع");
  };

  return (
    <div dir="rtl" className="max-w-full">
      <PageHeader
        title="المشاريع"
        subtitle="تابع مشاريع العملاء ومراحل التنفيذ ونسب الإنجاز في مكان واحد."
      >
        <button onClick={() => setModal(true)} className={btnDark}>
          <Plus size={13} /> مشروع جديد
        </button>
        <button
          onClick={() =>
            downloadCsv(
              "projects.csv",
              [
                "الكود",
                "المشروع",
                "العميل",
                "المسؤول",
                "الحالة",
                "الإنجاز %",
                "التسليم",
                "القيمة",
              ],
              list.map((p) => [
                p.code,
                p.name,
                p.client,
                p.owner,
                p.st,
                p.progress,
                p.due,
                p.value,
              ]),
            )
          }
          className={`${btnLight} !rounded-md`}
        >
          <Download size={12} /> تصدير
        </button>
      </PageHeader>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="إجمالي المشاريع"
          value={withInfo.length}
          badge={
            newThisMonth ? `+${newThisMonth} هذا الشهر` : "لا جديد هذا الشهر"
          }
          tone={newThisMonth ? "green" : "gray"}
        />
        <MetricCard
          label="جاري التنفيذ"
          value={count("جاري")}
          badge={`${withInfo.length ? Math.round((count("جاري") / withInfo.length) * 100) : 0}% من الإجمالي`}
        />
        <MetricCard
          label="متأخرة"
          value={count("متأخر")}
          badge={count("متأخر") ? "تحتاج تدخل" : "لا يوجد تأخير"}
          tone={count("متأخر") ? "red" : "gray"}
        />
        <MetricCard
          label="مكتملة"
          value={count("مكتمل")}
          badge={`${withInfo.length ? Math.round((count("مكتمل") / withInfo.length) * 100) : 0}% من الإجمالي`}
          tone="green"
        />
      </div>

      <section className={`${card} mt-4 overflow-hidden`}>
        <div className="flex flex-wrap items-center justify-between gap-2 p-4">
          <h2 className="text-[17px] font-semibold text-ink">قائمة المشاريع</h2>
          <div className="flex flex-wrap gap-1.5">
            <Chip
              active={status === "all"}
              onClick={() => reset(setStatus)("all")}
            >
              الكل ({base.length})
            </Chip>
            {STATUS_CHIPS.map((s) => (
              <Chip
                key={s}
                active={status === s}
                onClick={() => reset(setStatus)(s)}
              >
                {s}
              </Chip>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
          <SearchBox
            value={q}
            onChange={reset(setQ)}
            placeholder="ابحث باسم المشروع أو العميل أو الكود"
            className="min-w-[220px] flex-1"
          />
          <div className="w-[140px]">
            <Select value={owner} onChange={reset(setOwner)}>
              <option value="all">كل المسؤولين</option>
              {OWNERS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Select>
          </div>
          <div className="w-[130px]">
            <Select value={priority} onChange={reset(setPriority)}>
              <option value="all">كل الأولويات</option>
              {PRIORITIES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead className="border-y border-line bg-neutral-50/70">
              <tr>
                {[
                  "المشروع",
                  "العميل",
                  "المسؤول",
                  "الحالة",
                  "نسبة الإنجاز",
                  "التسليم",
                ].map((h) => (
                  <th key={h} className={th}>
                    {h}
                  </th>
                ))}
                <th className={th} aria-label="إجراء" />
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-line last:border-0 hover:bg-neutral-50/60"
                >
                  <td className={`${td} !py-3.5`}>
                    <Link
                      to={`/projects/${p.id}`}
                      className="block leading-tight"
                    >
                      <div className="text-[12px] font-bold hover:underline">
                        {p.name}
                      </div>
                      <div
                        dir="ltr"
                        className="mt-0.5 text-right text-[10px] text-neutral-400"
                      >
                        {p.code}
                      </div>
                    </Link>
                  </td>
                  <td className={td}>{p.client}</td>
                  <td className={td}>{p.owner}</td>
                  <td className={td}>
                    <Badge cls={PSTATUS_CLS[p.st]}>{p.st}</Badge>
                  </td>
                  <td className={td}>
                    <ProgressBar value={p.progress} late={p.st === "متأخر"} />
                  </td>
                  <td className={`${td} text-neutral-500`}>{fmtDate(p.due)}</td>
                  <td className={td}>
                    <Link
                      to={`/projects/${p.id}`}
                      className="inline-flex items-center gap-1 text-[10.5px] text-neutral-500 hover:text-ink"
                    >
                      عرض التفاصيل <ArrowLeft size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-[11px] text-neutral-400"
                  >
                    لا توجد مشاريع مطابقة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PrevNextPager
          page={cur}
          pages={pages}
          onPage={setPage}
          info={`عرض ${from}–${from ? from + rows.length - 1 : 0} من ${list.length} مشروعًا`}
        />
      </section>

      {modal && (
        <ProjectModal
          projects={projects}
          onSave={onSave}
          onClose={() => setModal(false)}
        />
      )}
      <Toast message={toast} />
    </div>
  );
}
