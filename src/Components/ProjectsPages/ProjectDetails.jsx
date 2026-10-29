import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Check, Pencil, Plus } from "lucide-react";
import {
  PageHeader,
  Chip,
  card,
  btnDark,
  btnLight,
  th,
  td,
} from "../Shared/ui.jsx";
import { MetricCard, PrevNextPager, Badge } from "../Shared/ProjectUI.jsx";
import ProjectModal from "../Shared/ProjectModal.jsx";
import ProjectTaskModal from "../Shared/ProjectTaskModal.jsx";
import { Toast, useToast } from "../CRMPages/TaskModal.jsx";
import { fmtDate } from "../../data/Tasks.js";
import {
  useProjects,
  projectStatusOf,
  progressOf,
  taskOverdue,
  loadProjectSettings,
  money,
  PRIORITY_CLS,
  TASK_STATUSES,
} from "../../data/projects.js";

const PAGE_SIZE = 6;
const TASK_STATUS_CLS = {
  جديدة: "bg-neutral-100 text-neutral-600",
  "قيد التنفيذ": "bg-blue-50 text-blue-600",
  مراجعة: "bg-orange-50 text-orange-600",
  مكتملة: "bg-green-50 text-green-600",
};

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects, tasks, saveProject, saveTask, removeTask, removeProject } =
    useProjects();
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // { kind: "project" | "task", task?, defaults? }
  const [toast, notify] = useToast();

  const p = projects.find((x) => x.id === id);
  const mine = useMemo(
    () =>
      tasks
        .filter((t) => t.projectId === id)
        .sort((a, b) => a.due.localeCompare(b.due)),
    [tasks, id],
  );

  if (!p) {
    return (
      <div dir="rtl" className="p-10 text-center">
        <p className="text-[13px] font-bold text-ink">
          لم يتم العثور على المشروع
        </p>
        <p className="mt-1 text-[11px] text-neutral-500">
          قد يكون محذوفًا أو أن الرابط غير صحيح.
        </p>
        <Link to="/projects" className={`${btnDark} mt-4`}>
          العودة إلى المشاريع
        </Link>
      </div>
    );
  }

  const st = projectStatusOf(p);
  const progress = progressOf(p, tasks);
  const done = mine.filter((t) => t.status === "مكتملة").length;
  const list =
    status === "all" ? mine : mine.filter((t) => t.status === status);
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const rows = list.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const from = list.length ? (cur - 1) * PAGE_SIZE + 1 : 0;

  const paid = p.payments
    .filter((x) => x.paid)
    .reduce((s, x) => s + (p.value * x.percent) / 100, 0);
  const team = [...new Set([p.owner, ...mine.map((t) => t.owner)])].map(
    (name) => ({
      name,
      open: mine.filter((t) => t.owner === name && t.status !== "مكتملة")
        .length,
    }),
  );

  const setStage = (i) => {
    if (i === p.stageIndex) return;
    saveProject({ ...p, stageIndex: i });
    notify(`المرحلة الحالية: ${p.stages[i]}`);
  };
  const complete = () => {
    const open = mine.filter((t) => t.status !== "مكتملة").length;
    if (loadProjectSettings().blockCloseWithOpenTasks && open)
      return notify(`لا يمكن إتمام المشروع وبه ${open} مهام مفتوحة`);
    saveProject({ ...p, status: "مكتمل", stageIndex: p.stages.length - 1 });
    notify("تم إتمام المشروع");
  };
  const reopen = () => {
    saveProject({ ...p, status: "جاري" });
    notify("تمت إعادة فتح المشروع");
  };
  const togglePayment = (i) => {
    saveProject({
      ...p,
      payments: p.payments.map((x, j) =>
        j === i ? { ...x, paid: !x.paid } : x,
      ),
    });
    notify("تم تحديث حالة الدفعة");
  };
  const delProject = (x) => {
    if (window.confirm(`حذف المشروع «${x.name}» وكل مهامه؟`)) {
      removeProject(x.id);
      navigate("/projects");
    }
  };
  const delTask = (t) => {
    if (window.confirm(`حذف المهمة «${t.title}»؟`)) {
      removeTask(t.id);
      setModal(null);
      notify("تم حذف المهمة");
    }
  };

  return (
    <div dir="rtl" className="max-w-full">
      <Link
        to="/projects"
        className="text-[10.5px] text-neutral-500 hover:text-ink"
      >
        → المشاريع
      </Link>
      <div className="mt-1">
        <PageHeader
          title={p.name}
          subtitle={`${p.code} · ${p.client} · المسؤول ${p.owner}`}
        >
          {p.status === "مكتمل" ? (
            <button onClick={reopen} className={`${btnLight} !rounded-md`}>
              إعادة فتح
            </button>
          ) : (
            <button onClick={complete} className={`${btnLight} !rounded-md`}>
              <Check size={12} /> إتمام المشروع
            </button>
          )}
          <button
            onClick={() => setModal({ kind: "project" })}
            className={`${btnLight} !rounded-md`}
          >
            <Pencil size={12} /> تعديل
          </button>
          <button
            onClick={() =>
              setModal({ kind: "task", defaults: { projectId: p.id } })
            }
            className={btnDark}
          >
            <Plus size={13} /> مهمة جديدة
          </button>
        </PageHeader>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="نسبة الإنجاز"
          value={`${progress}%`}
          badge={st}
          tone={st === "متأخر" ? "red" : st === "مكتمل" ? "green" : "gray"}
        />
        <MetricCard
          label="قيمة المشروع"
          value={money(p.value)}
          badge={`المحصّل ${money(paid)}`}
          tone="green"
        />
        <MetricCard
          label="المهام المكتملة"
          value={`${done} / ${mine.length}`}
          badge={`${mine.length - done} متبقية`}
        />
        <MetricCard
          label="موعد التسليم"
          value={fmtDate(p.due).replace(/ \d{4}$/, "")}
          badge={st === "متأخر" ? "تجاوز الموعد" : p.due.slice(0, 4)}
          tone={st === "متأخر" ? "red" : "gray"}
        />
      </div>

      {/* stages */}
      <section className={`${card} mt-4 p-4`}>
        <h2 className="text-[15px] font-semibold text-ink">مراحل المشروع</h2>
        <p className="mb-4 mt-0.5 text-[10.5px] text-neutral-500">
          {p.description}
        </p>
        <ol
          className="grid overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(${p.stages.length}, minmax(0, 1fr))`,
          }}
        >
          {p.stages.map((name, i) => {
            const state =
              p.status === "مكتمل" || i < p.stageIndex
                ? "done"
                : i === p.stageIndex
                  ? "current"
                  : "todo";
            return (
              <li key={name} className="relative text-center">
                {i > 0 && (
                  <span
                    className={`absolute right-1/2 top-3 h-px w-full ${state === "todo" ? "bg-neutral-200" : "bg-ink"}`}
                    aria-hidden
                  />
                )}
                <button
                  onClick={() => setStage(i)}
                  aria-label={`المرحلة ${name}`}
                  aria-current={state === "current" ? "step" : undefined}
                  className={`relative z-10 mx-auto grid h-6 w-6 place-items-center rounded-full border-2 ${state === "done" ? "border-ink bg-ink text-white" : state === "current" ? "border-ink bg-white" : "border-neutral-300 bg-white"}`}
                >
                  {state === "done" ? (
                    <Check size={12} />
                  ) : state === "current" ? (
                    <span className="h-2 w-2 rounded-full bg-ink" />
                  ) : null}
                </button>
                <div
                  className={`mt-2 text-[11px] ${state === "todo" ? "text-neutral-400" : "font-bold text-ink"}`}
                >
                  {name}
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_270px]">
        {/* tasks */}
        <section className={`${card} min-w-0 overflow-hidden`}>
          <div className="flex flex-wrap items-center justify-between gap-2 p-4">
            <h2 className="text-[15px] font-semibold text-ink">مهام المشروع</h2>
            <div className="flex flex-wrap gap-1.5">
              <Chip
                active={status === "all"}
                onClick={() => {
                  setStatus("all");
                  setPage(1);
                }}
              >
                الكل ({mine.length})
              </Chip>
              {TASK_STATUSES.map((s) => (
                <Chip
                  key={s}
                  active={status === s}
                  onClick={() => {
                    setStatus(s);
                    setPage(1);
                  }}
                >
                  {s}
                </Chip>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="border-y border-line bg-neutral-50/70">
                <tr>
                  {[
                    "المهمة",
                    "المرحلة",
                    "المسؤول",
                    "الأولوية",
                    "الحالة",
                    "التسليم",
                  ].map((h) => (
                    <th key={h} className={th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setModal({ kind: "task", task: t })}
                    className="cursor-pointer border-b border-line last:border-0 hover:bg-neutral-50/60"
                  >
                    <td className={`${td} text-[12px] font-bold`}>{t.title}</td>
                    <td className={td}>{t.stage}</td>
                    <td className={td}>{t.owner}</td>
                    <td className={td}>
                      <Badge cls={PRIORITY_CLS[t.priority]}>{t.priority}</Badge>
                    </td>
                    <td className={td}>
                      <Badge
                        cls={
                          taskOverdue(t)
                            ? "bg-red-50 text-red-500"
                            : TASK_STATUS_CLS[t.status]
                        }
                      >
                        {taskOverdue(t) ? "متأخرة" : t.status}
                      </Badge>
                    </td>
                    <td className={`${td} text-neutral-500`}>
                      {fmtDate(t.due)}
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-[11px] text-neutral-400"
                    >
                      لا توجد مهام
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
            info={`عرض ${from}–${from ? from + rows.length - 1 : 0} من ${list.length} مهمة`}
          />
        </section>

        {/* side cards */}
        <aside className="space-y-4">
          <section className={`${card} p-4`}>
            <h2 className="mb-2 text-[14px] font-extrabold text-ink">العميل</h2>
            <div className="text-[12px] font-bold text-ink">{p.client}</div>
            <dl className="mt-2 space-y-1.5 text-[10.5px]">
              <div className="flex justify-between">
                <dt className="text-neutral-500">المسؤول</dt>
                <dd className="font-semibold">{p.owner}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">البدء</dt>
                <dd className="font-semibold">{fmtDate(p.start)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">الأولوية</dt>
                <dd>
                  <Badge cls={PRIORITY_CLS[p.priority]}>{p.priority}</Badge>
                </dd>
              </div>
            </dl>
          </section>

          <section className={`${card} p-4`}>
            <h2 className="mb-2 text-[14px] font-extrabold text-ink">
              الدفعات
            </h2>
            <ul className="space-y-2.5">
              {p.payments.map((x, i) => (
                <li
                  key={x.label}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[10.5px] font-semibold text-ink">
                      {x.label}
                    </div>
                    <div
                      className="text-[10px] text-neutral-500"
                      dir="ltr"
                      style={{ textAlign: "right" }}
                    >
                      {money((p.value * x.percent) / 100)}
                    </div>
                  </div>
                  <button
                    onClick={() => togglePayment(i)}
                    aria-pressed={x.paid}
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-[9.5px] font-semibold ${x.paid ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}
                  >
                    {x.paid ? "مدفوعة" : "مستحقة"}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className={`${card} p-4`}>
            <h2 className="mb-2 text-[14px] font-extrabold text-ink">
              فريق المشروع
            </h2>
            <ul className="space-y-2.5">
              {team.map((m) => (
                <li key={m.name} className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-neutral-100 text-[10.5px] font-bold text-ink">
                    {m.name[0]}
                  </span>
                  <div className="flex-1 leading-tight">
                    <div className="text-[11px] font-bold text-ink">
                      {m.name}
                    </div>
                    <div className="text-[9.5px] text-neutral-400">
                      {m.open} مهام مفتوحة
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      {modal?.kind === "project" && (
        <ProjectModal
          project={p}
          projects={projects}
          onSave={(x) => {
            saveProject(x);
            setModal(null);
            notify("تم حفظ المشروع");
          }}
          onDelete={delProject}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === "task" && (
        <ProjectTaskModal
          task={modal.task}
          defaults={modal.defaults}
          projects={projects}
          onSave={(t) => {
            const isNew = !tasks.some((x) => x.id === t.id);
            saveTask(t);
            setModal(null);
            notify(isNew ? "تمت إضافة المهمة" : "تم حفظ المهمة");
          }}
          onDelete={delTask}
          onClose={() => setModal(null)}
        />
      )}
      <Toast message={toast} />
    </div>
  );
}
