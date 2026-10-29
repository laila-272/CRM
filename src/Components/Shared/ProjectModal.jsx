import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { btnDark, btnLight } from "./ui.jsx";
import { Field, fieldCls } from "./ProjectUI.jsx";
import { todayIso, addDays } from "../../data/Tasks.js";
import {
  CLIENTS,
  OWNERS,
  PRIORITIES,
  PROJECT_STATUSES,
  loadProjectSettings,
  nextProjectCode,
} from "../../data/projects.js";

/** project: project to edit (omit for new). projects: all projects (used to generate the next code). */
export default function ProjectModal({
  project,
  projects,
  onSave,
  onDelete,
  onClose,
}) {
  const [f, setF] = useState(() => ({
    name: "",
    client: "",
    owner: OWNERS[0],
    priority: loadProjectSettings().defaultPriority,
    start: todayIso(),
    due: addDays(todayIso(), 60),
    value: "",
    description: "",
    status: "جاري",
    ...project,
  }));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const set = (k) => (e) => {
    setF({ ...f, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: undefined });
  };

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (f.name.trim().length < 2)
      err.name = "اسم المشروع مطلوب (حرفان على الأقل)";
    if (!f.client.trim()) err.client = "العميل مطلوب";
    if (!f.start) err.start = "تاريخ البدء مطلوب";
    if (!f.due) err.due = "تاريخ التسليم مطلوب";
    else if (f.start && f.due < f.start)
      err.due = "التسليم يجب أن يكون بعد البدء";
    if (f.value !== "" && (isNaN(Number(f.value)) || Number(f.value) < 0))
      err.value = "أدخل قيمة صحيحة";
    setErrors(err);
    if (Object.keys(err).length) return;

    const base = project || {
      id: `p${Date.now()}`,
      code: nextProjectCode(projects),
      stages: loadProjectSettings().stages.map((s) => s.name),
      stageIndex: 0,
      payments: [
        { label: "الدفعة الأولى — عند التعاقد", percent: 30, paid: false },
        { label: "الدفعة الثانية — منتصف التنفيذ", percent: 40, paid: false },
        { label: "الدفعة الأخيرة — عند التسليم", percent: 30, paid: false },
      ],
    };
    onSave({
      ...base,
      ...f,
      name: f.name.trim(),
      client: f.client.trim(),
      value: f.value === "" ? 0 : Number(f.value),
      description: f.description.trim(),
    });
  };

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
        className="mx-auto mt-4 w-full max-w-[560px] rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-ink">
            {project ? "تعديل المشروع" : "إضافة مشروع"}
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
          <Field label="اسم المشروع" required error={errors.name}>
            <input
              className={fieldCls(errors.name)}
              placeholder="مثال: تطوير موقع الشركة"
              value={f.name}
              onChange={set("name")}
            />
          </Field>
          <Field label="العميل" required error={errors.client}>
            <input
              className={fieldCls(errors.client)}
              list="project-clients"
              placeholder="اختر عميلًا أو اكتب اسمه"
              value={f.client}
              onChange={set("client")}
            />
            <datalist id="project-clients">
              {CLIENTS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          <div className="grid grid-cols-2 gap-3">
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
            <Field label="الأولوية">
              <select
                className={fieldCls()}
                value={f.priority}
                onChange={set("priority")}
              >
                {PRIORITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="تاريخ البدء" required error={errors.start}>
              <input
                type="date"
                dir="ltr"
                className={fieldCls(errors.start)}
                value={f.start}
                onChange={set("start")}
              />
            </Field>
            <Field label="تاريخ التسليم المتوقع" required error={errors.due}>
              <input
                type="date"
                dir="ltr"
                className={fieldCls(errors.due)}
                value={f.due}
                onChange={set("due")}
              />
            </Field>
            <Field label="قيمة المشروع (ج.م)" error={errors.value}>
              <input
                type="number"
                min="0"
                dir="ltr"
                className={fieldCls(errors.value)}
                placeholder="0"
                value={f.value}
                onChange={set("value")}
              />
            </Field>
            {project && (
              <Field label="الحالة">
                <select
                  className={fieldCls()}
                  value={f.status}
                  onChange={set("status")}
                >
                  {PROJECT_STATUSES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
            )}
          </div>

          <Field label="وصف المشروع">
            <textarea
              rows={3}
              className="w-full resize-none rounded-lg border border-line p-3 text-[12px] outline-none focus:border-neutral-500 placeholder:text-neutral-400"
              placeholder="نطاق العمل والتفاصيل المهمة"
              value={f.description}
              onChange={set("description")}
            />
          </Field>
        </div>

        <div className="mt-5 flex items-center justify-between gap-2 border-t border-line pt-4">
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className={`${btnDark} !rounded-full !h-9 px-5`}
            >
              {project ? "حفظ التعديلات" : "إضافة المشروع"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-2 text-[11.5px] text-neutral-500 hover:text-ink"
            >
              إلغاء
            </button>
          </div>
          {project && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(project)}
              className={`${btnLight} !text-red-500 !border-red-200`}
            >
              حذف المشروع
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
