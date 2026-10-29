import { useMemo, useRef, useState } from "react";
import { Download, Plus } from "lucide-react";
import {
  PageHeader,
  Select,
  card,
  btnDark,
  btnLight,
  downloadCsv,
} from "../Shared/ui.jsx";
import { MetricCard } from "../Shared/ProjectUI.jsx";
import ProjectTaskModal from "../Shared/ProjectTaskModal.jsx";
import { Toast, useToast } from "../CRMPages/TaskModal.jsx";
import { MONTHS, addDays, fmtDate, todayIso } from "../../data/Tasks.js";
import {
  useProjects,
  taskOverdue,
  daysBetween,
  taskCode,
  sundayOf,
  completedOn,
  PRIORITY_CLS,
  TASK_STATUSES,
  OWNERS,
} from "../../data/projects.js";

const VISIBLE_CARDS = 3; // columns with more cards than this become scrollable
const WEEKS = 6;
const WINDOW_DAYS = WEEKS * 7;

const shortDate = (iso) => fmtDate(iso).replace(/ \d{4}$/, "");

// done -> "تمت", overdue -> "متأخرة", otherwise the priority
function stateBadge(t) {
  if (t.status === "مكتملة")
    return { label: "تمت", cls: "bg-green-50 text-green-600" };
  if (taskOverdue(t)) return { label: "متأخرة", cls: "bg-red-50 text-red-500" };
  return { label: t.priority, cls: PRIORITY_CLS[t.priority] };
}

function inPeriod(t, period) {
  if (period === "all") return true;
  const today = todayIso();
  const open = t.status !== "مكتملة";
  const d = open ? t.due : completedOn(t);
  if (period === "week") {
    const ws = sundayOf(today);
    return (d >= ws && d <= addDays(ws, 6)) || (open && d < ws);
  }
  const m = today.slice(0, 7);
  return d.startsWith(m) || (open && d < `${m}-01`);
}

function TaskCard({ t, projectName, onOpen }) {
  const badge = stateBadge(t);
  const late = taskOverdue(t);
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", t.id)}
      onClick={() => onOpen(t)}
      className="cursor-grab rounded-xl border border-line bg-white p-3 active:cursor-grabbing hover:border-neutral-300"
    >
      <div className="flex items-center justify-between">
        <span dir="ltr" className="text-[10px] text-neutral-400">
          #{taskCode(t)}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[9.5px] font-semibold ${badge.cls}`}
        >
          {badge.label}
        </span>
      </div>
      <div className="mt-2 text-[12.5px] font-bold text-ink">{t.title}</div>
      <div className="mt-1 truncate text-[10px] text-neutral-400">
        {projectName}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px]">
        <span className="flex items-center gap-1.5 text-neutral-600">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-neutral-100 text-[9px] font-bold text-ink">
            {t.owner[0]}
          </span>
          {t.owner}
        </span>
        <span className={late ? "font-bold text-red-500" : "text-neutral-400"}>
          {shortDate(t.due)}
        </span>
      </div>
    </div>
  );
}

function Timeline({ tasks, onReschedule, onOpen }) {
  const areaRef = useRef(null);
  const [drag, setDrag] = useState(null); // { id, startX, dayW, days, moved }
  const start = sundayOf(todayIso());
  const end = addDays(start, WINDOW_DAYS);
  const pct = (iso) => (daysBetween(start, iso) / WINDOW_DAYS) * 100;

  const weekLabels = Array.from({ length: WEEKS }, (_, i) => {
    const d = addDays(start, i * 7);
    const m = Number(d.split("-")[1]);
    const day = Number(d.split("-")[2]);
    const prev = i ? Number(addDays(start, (i - 1) * 7).split("-")[1]) : null;
    return i === 0 || prev !== m
      ? `${String(day).padStart(2, "0")} ${MONTHS[m - 1]}`
      : String(day).padStart(2, "0");
  });

  const rows = tasks
    .filter((t) => t.due >= start && t.start < end)
    .sort((a, b) => a.start.localeCompare(b.start));

  const down = (e, t) => {
    const w = areaRef.current?.getBoundingClientRect().width || 1;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({
      id: t.id,
      startX: e.clientX,
      dayW: w / WINDOW_DAYS,
      days: 0,
      moved: false,
    });
  };
  const move = (e) =>
    setDrag((d) =>
      d
        ? {
            ...d,
            days: Math.round(-(e.clientX - d.startX) / d.dayW),
            moved: d.moved || Math.abs(e.clientX - d.startX) > 3,
          }
        : d,
    );
  const up = (t) => {
    if (drag?.days) onReschedule(t, drag.days);
    else if (drag && !drag.moved) onOpen(t);
    setDrag(null);
  };

  const barCls = (t) =>
    t.status === "مكتملة" || t.status === "للتنفيذ"
      ? "bg-neutral-300"
      : taskOverdue(t)
        ? "bg-red-600"
        : "bg-ink";

  return (
    <section className={`${card} mt-4 p-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[17px] font-semibold text-ink">الجدول الزمني</h2>
        <span className="text-[10.5px] text-neutral-400">
          {WEEKS} أسابيع · اسحب الشريط لتغيير الموعد
        </span>
      </div>

      <div className="mt-3 overflow-x-auto">
        <div className="min-w-[680px]">
          <div className="grid grid-cols-[150px_1fr] border-b border-line pb-2 text-[10px] text-neutral-400">
            <span>المهمة</span>
            <div
              ref={areaRef}
              className="grid"
              style={{
                gridTemplateColumns: `repeat(${WEEKS}, minmax(0, 1fr))`,
              }}
            >
              {weekLabels.map((l, i) => (
                <span key={i}>{l}</span>
              ))}
            </div>
          </div>

          <div className="max-h-[340px] overflow-y-auto">
            {rows.map((t) => {
              const dragging = drag?.id === t.id;
              const s = dragging ? addDays(t.start, drag.days) : t.start;
              const e = dragging ? addDays(t.due, drag.days) : t.due;
              return (
                <div
                  key={t.id}
                  className="grid grid-cols-[150px_1fr] items-center border-b border-line py-2.5 last:border-0"
                >
                  <div className="min-w-0 pl-3 leading-tight">
                    <div className="truncate text-[11.5px] font-bold text-ink">
                      {t.title}
                    </div>
                    <div className="truncate text-[10px] text-neutral-400">
                      {t.owner}
                    </div>
                  </div>
                  <div className="relative h-4 overflow-hidden">
                    <div
                      role="button"
                      aria-label={`${t.title}: ${fmtDate(s)} – ${fmtDate(e)}`}
                      title={`${fmtDate(s)} – ${fmtDate(e)}`}
                      onPointerDown={(ev) => down(ev, t)}
                      onPointerMove={move}
                      onPointerUp={() => up(t)}
                      onPointerCancel={() => setDrag(null)}
                      className={`absolute top-1 h-2 cursor-grab touch-none rounded-full ${barCls(t)} ${dragging ? "opacity-80" : ""}`}
                      style={{
                        right: `${pct(s)}%`,
                        width: `${Math.max(pct(e) - pct(s), 1.5)}%`,
                      }}
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
      </div>
    </section>
  );
}

export default function Execution() {
  const { projects, tasks, saveTask, removeTask } = useProjects();
  const [projectId, setProjectId] = useState("all");
  const [owner, setOwner] = useState("all");
  const [period, setPeriod] = useState("all");
  const [modal, setModal] = useState(null);
  const [toast, notify] = useToast();

  const projectName = (id) => projects.find((p) => p.id === id)?.name || "—";

  // filtered by project / owner only: used for the statistics
  const scoped = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (projectId === "all" || t.projectId === projectId) &&
          (owner === "all" || t.owner === owner),
      ),
    [tasks, projectId, owner],
  );
  // + period: used for the board and the timeline
  const list = useMemo(
    () =>
      scoped
        .filter((t) => inPeriod(t, period))
        .sort((a, b) => a.due.localeCompare(b.due)),
    [scoped, period],
  );

  const ws = sundayOf(todayIso());
  const doneBetween = (a, b) =>
    scoped.filter(
      (t) =>
        t.status === "مكتملة" && completedOn(t) >= a && completedOn(t) <= b,
    ).length;
  const doneThisWeek = doneBetween(ws, addDays(ws, 6));
  const doneLastWeek = doneBetween(addDays(ws, -7), addDays(ws, -1));
  const diff = doneThisWeek - doneLastWeek;

  const inProgress = scoped.filter((t) => t.status === "قيد التنفيذ");
  const inProgressLate = inProgress.filter(taskOverdue).length;
  const overdue = scoped.filter(taskOverdue).length;
  const projectCount = new Set(scoped.map((t) => t.projectId)).size;

  const move = (t, status) => {
    if (t.status === status) return;
    saveTask({ ...t, status });
    notify(`تم نقل المهمة إلى «${status}»`);
  };
  const reschedule = (t, days) => {
    saveTask({
      ...t,
      start: addDays(t.start, days),
      due: addDays(t.due, days),
    });
    notify(`تم تغيير موعد التسليم إلى ${fmtDate(addDays(t.due, days))}`);
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
        subtitle="نظّم مراحل تنفيذ المشاريع وتابع المهام والمسؤولين والمواعيد."
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
                "الكود",
                "المهمة",
                "المشروع",
                "المسؤول",
                "الأولوية",
                "الحالة",
                "البدء",
                "التسليم",
              ],
              list.map((t) => [
                taskCode(t),
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

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <div className="w-[150px]">
          <Select value={projectId} onChange={setProjectId}>
            <option value="all">كل المشاريع</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-[140px]">
          <Select value={owner} onChange={setOwner}>
            <option value="all">كل المسؤولين</option>
            {OWNERS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </Select>
        </div>
        <div className="w-[140px]">
          <Select value={period} onChange={setPeriod}>
            <option value="all">كل الفترات</option>
            <option value="week">الأسبوع الحالي</option>
            <option value="month">هذا الشهر</option>
          </Select>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          label="إجمالي المهام"
          value={scoped.length}
          badge={`عبر ${projectCount} مشروعًا`}
        />
        <MetricCard
          label="قيد التنفيذ"
          value={inProgress.length}
          badge={
            inProgressLate ? `${inProgressLate} منها متأخرة` : "على المسار"
          }
          tone={inProgressLate ? "orange" : "green"}
        />
        <MetricCard
          label="مهام متأخرة"
          value={overdue}
          badge={overdue ? "تحتاج متابعة" : "لا يوجد تأخير"}
          tone={overdue ? "orange" : "gray"}
        />
        <MetricCard
          label="أُنجزت هذا الأسبوع"
          value={doneThisWeek}
          badge={
            diff === 0
              ? "مثل الأسبوع الماضي"
              : `${diff > 0 ? "+" : "−"}${Math.abs(diff)} عن الأسبوع الماضي`
          }
          tone={diff > 0 ? "green" : "gray"}
        />
      </div>

      {/* board */}
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
                className="min-h-[200px] rounded-xl border border-line bg-white p-3"
              >
                <div className="flex items-center justify-between pb-3">
                  <h3 className="text-[13px] font-bold text-ink">{st}</h3>
                  <span className="grid h-5 min-w-5 place-items-center rounded-md bg-neutral-100 px-1.5 text-[10px] text-neutral-500">
                    {col.length}
                  </span>
                </div>
                <div
                  className={`space-y-2.5 ${col.length > VISIBLE_CARDS ? "max-h-[330px] overflow-y-auto pl-1 [scrollbar-width:thin]" : ""}`}
                >
                  {col.map((t) => (
                    <TaskCard
                      key={t.id}
                      t={t}
                      projectName={projectName(t.projectId)}
                      onOpen={(x) => setModal({ task: x })}
                    />
                  ))}
                  {!col.length && (
                    <p className="py-6 text-center text-[10.5px] text-neutral-400">
                      لا توجد مهام
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Timeline
        tasks={list}
        onReschedule={reschedule}
        onOpen={(t) => setModal({ task: t })}
      />

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
