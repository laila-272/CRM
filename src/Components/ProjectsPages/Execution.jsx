import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Columns3, Download, List, Plus } from "lucide-react";
import {
  PageHeader,
  SearchBox,
  Select,
  card,
  btnDark,
  btnLight,
  downloadCsv,
  th,
  td,
} from "../Shared/ui.jsx";
import { MetricCard, PrevNextPager, Badge } from "../Shared/ProjectUI.jsx";
import ProjectTaskModal from "../Shared/ProjectTaskModal.jsx";
import { Toast, useToast } from "../CRMPages/TaskModal.jsx";
import { addDays, fmtDate, todayIso } from "../../data/Tasks.js";
import {
  useProjects,
  taskOverdue,
  daysBetween,
  PRIORITY_CLS,
  PRIORITIES,
  TASK_STATUSES,
  TASK_TYPES,
  OWNERS,
} from "../../data/projects.js";

const PAGE_SIZE = 8;
const VISIBLE_CARDS = 3; // columns with more cards than this become scrollable
const WINDOW_DAYS = 28;
const COL_TITLE = {
  جديدة: "text-ink",
  "قيد التنفيذ": "text-blue-600",
  مراجعة: "text-orange-600",
  مكتملة: "text-green-600",
};
const STATUS_CLS = {
  جديدة: "bg-neutral-100 text-neutral-600",
  "قيد التنفيذ": "bg-blue-50 text-blue-600",
  مراجعة: "bg-orange-50 text-orange-600",
  مكتملة: "bg-green-50 text-green-600",
};

function TaskCard({ t, projectName, onOpen, onComplete, onMove }) {
  const late = taskOverdue(t);
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)}
      className="cursor-grab rounded-xl border border-line bg-white p-3 shadow-sm active:cursor-grabbing"
    >
      <div className="flex items-center justify-between">
        <Badge cls={PRIORITY_CLS[t.priority]}>{t.priority}</Badge>
        <span className="text-[9.5px] text-neutral-400">{t.type}</span>
      </div>
      <button
        onClick={() => onOpen(t)}
        className={`mt-2 block text-right text-[12px] font-bold text-ink hover:underline ${t.status === "مكتملة" ? "line-through opacity-60" : ""}`}
      >
        {t.title}
      </button>
      <Link
        to={`/projects/${t.projectId}`}
        className="mt-1 block truncate text-[10px] text-neutral-500 hover:text-ink"
      >
        {projectName}
      </Link>
      <div className="mt-2 flex items-center justify-between text-[10px]">
        <span className="text-neutral-500">{t.owner}</span>
        <span className={late ? "font-bold text-red-500" : "text-neutral-500"}>
          {late ? "متأخرة · " : ""}
          {fmtDate(t.due).replace(/ \d{4}$/, "")}
        </span>
      </div>
      <div className="mt-2.5 flex items-center justify-between">
        <button
          onClick={() => onComplete(t)}
          className={`h-6 rounded-full border px-3 text-[10px] font-semibold ${t.status === "مكتملة" ? "border-green-200 text-green-600" : "border-line text-ink hover:bg-neutral-50"}`}
        >
          {t.status === "مكتملة" ? "إعادة فتح" : "إكمال"}
        </button>
        <select
          value={t.status}
          onChange={(e) => onMove(t, e.target.value)}
          aria-label="نقل المهمة"
          className="h-6 cursor-pointer rounded-md border border-line bg-white px-1.5 text-[10px] outline-none"
        >
          {TASK_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function Timeline({ tasks, projectName }) {
  const today = todayIso();
  const start = addDays(today, -7);
  const pct = (iso) =>
    Math.min(100, Math.max(0, (daysBetween(start, iso) / WINDOW_DAYS) * 100));
  const weeks = [0, 7, 14, 21].map((d) => addDays(start, d));
  const rows = tasks
    .filter((t) => t.due >= start && t.start <= addDays(start, WINDOW_DAYS))
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, 8);

  return (
    <section className={`${card} mt-4 p-4`}>
      <h2 className="text-[15px] font-semibold text-ink">الجدول الزمني</h2>
      <p className="mb-3 mt-0.5 text-[10.5px] text-neutral-500">
        المهام خلال الأسابيع الأربعة القادمة (الخط البرتقالي = اليوم)
      </p>
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="grid grid-cols-[170px_1fr] border-b border-line pb-2 text-[10px] text-neutral-400">
            <span>المهمة</span>
            <div className="grid grid-cols-4">
              {weeks.map((w) => (
                <span key={w}>{fmtDate(w).replace(/ \d{4}$/, "")}</span>
              ))}
            </div>
          </div>
          {rows.map((t) => {
            const left = pct(t.start);
            const width = Math.max(pct(t.due) - left, 2);
            const late = taskOverdue(t);
            return (
              <div
                key={t.id}
                className="grid grid-cols-[170px_1fr] items-center border-b border-line py-2.5 last:border-0"
              >
                <div className="min-w-0 pl-3 leading-tight">
                  <div className="truncate text-[11px] font-bold text-ink">
                    {t.title}
                  </div>
                  <div className="truncate text-[9.5px] text-neutral-400">
                    {projectName(t.projectId)}
                  </div>
                </div>
                <div className="relative h-3">
                  <div
                    className="absolute inset-y-0 w-px bg-orange-400"
                    style={{ right: `${pct(today)}%` }}
                    aria-hidden
                  />
                  <div
                    title={`${fmtDate(t.start)} – ${fmtDate(t.due)}`}
                    className={`absolute top-0.5 h-2 rounded-full ${t.status === "مكتملة" ? "bg-neutral-300" : late ? "bg-red-500" : "bg-ink"}`}
                    style={{ right: `${left}%`, width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
          {!rows.length && (
            <p className="py-6 text-center text-[11px] text-neutral-400">
              لا توجد مهام في هذه الفترة.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Execution() {
  const { projects, tasks, saveTask, removeTask } = useProjects();
  const [view, setView] = useState("board"); // board | list
  const [q, setQ] = useState("");
  const [projectId, setProjectId] = useState("all");
  const [owner, setOwner] = useState("all");
  const [priority, setPriority] = useState("all");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [toast, notify] = useToast();

  const projectName = (id) => projects.find((p) => p.id === id)?.name || "—";

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return tasks
      .filter(
        (t) =>
          (projectId === "all" || t.projectId === projectId) &&
          (owner === "all" || t.owner === owner) &&
          (priority === "all" || t.priority === priority) &&
          (type === "all" || t.type === type) &&
          (!s ||
            [
              t.title,
              t.owner,
              projects.find((p) => p.id === t.projectId)?.name || "",
            ].some((v) => v.toLowerCase().includes(s))),
      )
      .sort((a, b) => a.due.localeCompare(b.due));
  }, [tasks, projects, q, projectId, owner, priority, type]);

  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const rows = list.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const from = list.length ? (cur - 1) * PAGE_SIZE + 1 : 0;

  const inProgress = list.filter((t) => t.status === "قيد التنفيذ").length;
  const overdue = list.filter(taskOverdue).length;
  const completed = list.filter((t) => t.status === "مكتملة").length;
  const reset = (fn) => (v) => {
    fn(v);
    setPage(1);
  };

  const complete = (t) => {
    saveTask({
      ...t,
      status: t.status === "مكتملة" ? "قيد التنفيذ" : "مكتملة",
    });
    notify(t.status === "مكتملة" ? "تمت إعادة فتح المهمة" : "تم إكمال المهمة");
  };
  const move = (t, status) => {
    if (t.status === status) return;
    saveTask({ ...t, status });
    notify(`تم نقل المهمة إلى «${status}»`);
  };
  const del = (t) => {
    if (window.confirm(`حذف المهمة «${t.title}»؟`)) {
      removeTask(t.id);
      setModal(null);
      notify("تم حذف المهمة");
    }
  };
  const onSave = (t) => {
    const isNew = !tasks.some((x) => x.id === t.id);
    saveTask(t);
    setModal(null);
    notify(isNew ? "تمت إضافة المهمة" : "تم حفظ التعديلات");
  };

  return (
    <div dir="rtl" className="max-w-full">
      <PageHeader
        title="المهام والتنفيذ"
        subtitle="تابع تنفيذ مهام المشاريع وحالاتها وأولوياتها من لوحة واحدة."
      >
        <button
          onClick={() =>
            setModal({ defaults: projectId !== "all" ? { projectId } : {} })
          }
          className={btnDark}
        >
          <Plus size={13} /> مهمة جديدة
        </button>
        <button
          onClick={() =>
            downloadCsv(
              "execution-tasks.csv",
              [
                "المهمة",
                "المشروع",
                "المسؤول",
                "الأولوية",
                "الحالة",
                "البدء",
                "التسليم",
              ],
              list.map((t) => [
                t.title,
                projectName(t.projectId),
                t.owner,
                t.priority,
                t.status,
                t.start,
                t.due,
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
          label="إجمالي المهام"
          value={list.length}
          badge={`${tasks.length} في كل المشاريع`}
        />
        <MetricCard
          label="قيد التنفيذ"
          value={inProgress}
          badge={`${list.length ? Math.round((inProgress / list.length) * 100) : 0}% من المعروض`}
          tone="gray"
        />
        <MetricCard
          label="متأخرة"
          value={overdue}
          badge={overdue ? "تحتاج متابعة" : "لا يوجد تأخير"}
          tone={overdue ? "red" : "gray"}
        />
        <MetricCard
          label="مكتملة"
          value={completed}
          badge={`${list.length ? Math.round((completed / list.length) * 100) : 0}% من المعروض`}
          tone="green"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div
          className="flex rounded-lg border border-line bg-white p-0.5"
          role="tablist"
        >
          {[
            ["board", "لوحة", Columns3],
            ["list", "قائمة", List],
          ].map(([k, label, Icon]) => (
            <button
              key={k}
              role="tab"
              aria-selected={view === k}
              onClick={() => setView(k)}
              className={`flex h-8 items-center gap-1.5 rounded-md px-3 text-[11.5px] font-semibold ${view === k ? "bg-ink text-white" : "text-neutral-500"}`}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>
        <SearchBox
          value={q}
          onChange={reset(setQ)}
          placeholder="ابحث عن مهمة أو مشروع أو مسؤول"
          className="min-w-[220px] flex-1"
        />
        <div className="w-[150px]">
          <Select value={projectId} onChange={reset(setProjectId)}>
            <option value="all">كل المشاريع</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-[130px]">
          <Select value={owner} onChange={reset(setOwner)}>
            <option value="all">كل المسؤولين</option>
            {OWNERS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </div>
        <div className="w-[120px]">
          <Select value={priority} onChange={reset(setPriority)}>
            <option value="all">كل الأولويات</option>
            {PRIORITIES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </Select>
        </div>
        <div className="w-[110px]">
          <Select value={type} onChange={reset(setType)}>
            <option value="all">كل الأنواع</option>
            {TASK_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Select>
        </div>
      </div>

      {view === "board" ? (
        <div className="mt-4 overflow-x-auto pb-2">
          <div className="grid min-w-[960px] auto-cols-[minmax(230px,1fr)] grid-flow-col gap-3 lg:min-w-0 lg:grid-flow-row lg:grid-cols-4">
            {TASK_STATUSES.map((st) => {
              const col = list.filter((t) => t.status === st);
              return (
                <div
                  key={st}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const t = tasks.find(
                      (x) => x.id === e.dataTransfer.getData("text/plain"),
                    );
                    if (t) move(t, st);
                  }}
                  className="min-h-[160px] rounded-xl border border-line bg-neutral-100/70 p-2.5"
                >
                  <div className="flex items-center justify-between px-1 pb-2">
                    <span className={`text-[12px] font-bold ${COL_TITLE[st]}`}>
                      {st}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9.5px] ${STATUS_CLS[st]}`}
                    >
                      {col.length}
                    </span>
                  </div>
                  <div
                    className={`space-y-2.5 ${col.length > VISIBLE_CARDS ? "max-h-[410px] overflow-y-auto pl-1 [scrollbar-width:thin]" : ""}`}
                  >
                    {col.map((t) => (
                      <TaskCard
                        key={t.id}
                        t={t}
                        projectName={projectName(t.projectId)}
                        onOpen={(x) => setModal({ task: x })}
                        onComplete={complete}
                        onMove={move}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setModal({
                        defaults: {
                          status: st,
                          ...(projectId !== "all" ? { projectId } : {}),
                        },
                      })
                    }
                    className="mt-2 h-8 w-full rounded-lg border border-dashed border-neutral-300 text-[10.5px] text-neutral-500 hover:bg-white"
                  >
                    + إضافة مهمة
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <section className={`${card} mt-4 overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead className="border-b border-line bg-neutral-50/70">
                <tr>
                  {[
                    "المهمة",
                    "المشروع",
                    "المسؤول",
                    "الأولوية",
                    "الحالة",
                    "التسليم",
                    "",
                  ].map((h, i) => (
                    <th key={i} className={th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-line last:border-0 hover:bg-neutral-50/60"
                  >
                    <td className={td}>
                      <button
                        onClick={() => setModal({ task: t })}
                        className="text-right"
                      >
                        <div
                          className={`text-[12px] font-bold hover:underline ${t.status === "مكتملة" ? "line-through opacity-60" : ""}`}
                        >
                          {t.title}
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {t.type} · {t.stage}
                        </div>
                      </button>
                    </td>
                    <td className={td}>
                      <Link
                        to={`/projects/${t.projectId}`}
                        className="hover:underline"
                      >
                        {projectName(t.projectId)}
                      </Link>
                    </td>
                    <td className={td}>{t.owner}</td>
                    <td className={td}>
                      <Badge cls={PRIORITY_CLS[t.priority]}>{t.priority}</Badge>
                    </td>
                    <td className={td}>
                      <Badge
                        cls={
                          taskOverdue(t)
                            ? "bg-red-50 text-red-500"
                            : STATUS_CLS[t.status]
                        }
                      >
                        {taskOverdue(t) ? "متأخرة" : t.status}
                      </Badge>
                    </td>
                    <td className={`${td} text-neutral-500`}>
                      {fmtDate(t.due)}
                    </td>
                    <td className={td}>
                      <button
                        onClick={() => complete(t)}
                        className="h-6 rounded-full border border-line px-3 text-[10px] hover:bg-neutral-50"
                      >
                        {t.status === "مكتملة" ? "إعادة فتح" : "إكمال"}
                      </button>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-8 text-center text-[11px] text-neutral-400"
                    >
                      لا توجد مهام مطابقة
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
      )}

      <Timeline tasks={list} projectName={projectName} />

      {modal && (
        <ProjectTaskModal
          task={modal.task}
          defaults={modal.defaults}
          projects={projects}
          onSave={onSave}
          onDelete={del}
          onClose={() => setModal(null)}
        />
      )}
      <Toast message={toast} />
    </div>
  );
}
