import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { btnDark, btnLight } from "./ui.jsx";
import { Field, fieldCls } from "./ProjectUI.jsx";
import { todayIso, addDays } from "../../data/Tasks.js";
import {
  OWNERS,
  PRIORITIES,
  TASK_STATUSES,
  TASK_TYPES,
  loadProjectSettings,
} from "../../data/projects.js";

/** task: task to edit (omit for new). defaults: initial values for a new task. */
export default function ProjectTaskModal({
  task,
  defaults,
  projects,
  onSave,
  onDelete,
  onClose,
}) {
  const [f, setF] = useState(() => ({
    type: "تطوير",
    title: "",
    projectId: projects[0]?.id || "",
    stage: "",
    owner: OWNERS[0],
    priority: loadProjectSettings().defaultPriority,
    start: todayIso(),
    due: addDays(todayIso(), 7),
    status: "للتنفيذ",
    notes: "",
    ...defaults,
    ...task,
  }));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const project = projects.find((p) => p.id === f.projectId);
  const stages = project?.stages || [];

  const set = (k) => (e) => {
    setF({ ...f, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: undefined });
  };

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (f.title.trim().length < 2)
      err.title = "عنوان المهمة مطلوب (حرفان على الأقل)";
    if (!project) err.projectId = "اختر المشروع";
    if (!f.due) err.due = "موعد التسليم مطلوب";
    else if (f.start && f.due < f.start)
      err.due = "التسليم يجب أن يكون بعد البدء";
    setErrors(err);
    if (Object.keys(err).length) return;
    onSave({
      ...f,
      title: f.title.trim(),
      notes: f.notes.trim(),
      stage: stages.includes(f.stage) ? f.stage : stages[0] || "",
      id: task?.id ?? `t${Date.now()}`,
      code: task?.code ?? `T-${String(Date.now()).slice(-4)}`,
    });
  };

  const chip = (on) =>
    `h-7 rounded-full border px-3.5 text-[11px] font-semibold ${on ? "bg-ink text-white border-ink" : "bg-white text-neutral-600 border-line"}`;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/45 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <form
        dir="rtl"
        noValidate
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="mx-auto mt-4 w-full max-w-[540px] rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-ink">
            {task ? "تفاصيل المهمة" : "إضافة مهمة"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="text-neutral-400 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 space-y-3.5">
          <div>
            <span className="mb-1.5 block text-[11px] font-bold text-ink">
              نوع المهمة
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TASK_TYPES.map((t) => (
                <button
                  type="button"
                  key={t}
                  aria-pressed={f.type === t}
                  onClick={() => setF({ ...f, type: t })}
                  className={chip(f.type === t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <Field label="عنوان المهمة" required error={errors.title}>
            <input
              className={fieldCls(errors.title)}
              placeholder="مثال: تصميم شاشة الحجز"
              value={f.title}
              onChange={set("title")}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="المشروع" required error={errors.projectId}>
              <select
                className={fieldCls(errors.projectId)}
                value={f.projectId}
                onChange={(e) =>
                  setF({ ...f, projectId: e.target.value, stage: "" })
                }
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="المرحلة">
              <select
                className={fieldCls()}
                value={stages.includes(f.stage) ? f.stage : stages[0] || ""}
                onChange={set("stage")}
              >
                {stages.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="المسؤول" required>
              <select
                className={fieldCls()}
                value={f.owner}
                onChange={set("owner")}
              >
                {OWNERS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="الحالة">
              <select
                className={fieldCls()}
                value={f.status}
                onChange={set("status")}
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="تاريخ البدء">
              <input
                type="date"
                dir="ltr"
                className={fieldCls()}
                value={f.start}
                onChange={set("start")}
              />
            </Field>
            <Field label="موعد التسليم" required error={errors.due}>
              <input
                type="date"
                dir="ltr"
                className={fieldCls(errors.due)}
                value={f.due}
                onChange={set("due")}
              />
            </Field>
          </div>

          <div>
            <span className="mb-1.5 block text-[11px] font-bold text-ink">
              الأولوية
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRIORITIES.map((p) => (
                <button
                  type="button"
                  key={p}
                  aria-pressed={f.priority === p}
                  onClick={() => setF({ ...f, priority: p })}
                  className={chip(f.priority === p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <Field label="ملاحظات">
            <textarea
              rows={3}
              className="w-full resize-none rounded-lg border border-line p-3 text-[12px] outline-none focus:border-neutral-500 placeholder:text-neutral-400"
              placeholder="تفاصيل إضافية عن المهمة"
              value={f.notes}
              onChange={set("notes")}
            />
          </Field>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2 border-t border-line pt-4">
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className={`${btnDark} !rounded-full !h-9 px-5`}
            >
              {task ? "حفظ التعديلات" : "إضافة المهمة"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-2 text-[11.5px] text-neutral-500 hover:text-ink"
            >
              إلغاء
            </button>
          </div>
          {task && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(task)}
              className={`${btnLight} !text-red-500 !border-red-200`}
            >
              حذف
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
