import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { btnDark, btnLight } from "./ui.jsx";
import {
  TYPES,
  PRIORITIES,
  REMINDERS,
  EMPLOYEES,
  CUSTOMERS,
  todayIso,
} from "../../data/Tasks.js";

export function useToast() {
  const [message, setMessage] = useState("");
  const notify = (m) => {
    setMessage(m);
    setTimeout(() => setMessage(""), 2500);
  };
  return [message, notify];
}

export function Toast({ message }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[60] rounded-full bg-ink px-4 py-2 text-[11.5px] text-white shadow-lg"
    >
      {message}
    </div>
  );
}

const inputCls = (err) =>
  `w-full h-9 rounded-lg border bg-white px-3 text-[12px] outline-none focus:border-neutral-500 placeholder:text-neutral-400 ${
    err ? "border-red-400" : "border-line"
  }`;

function Field({ label, error, required, children }) {
  return (
    <label className="block">
      <span className="block mb-1.5 text-[11px] font-bold text-ink">
        {label} {required && <b className="text-red-500">*</b>}
      </span>
      {children}
      {error && (
        <span className="block mt-1 text-[10px] text-red-500">{error}</span>
      )}
    </label>
  );
}

/**
 * task: existing task to edit (omit for a new one). defaults: initial values for a new task.
 * onSave(task) / onDelete(task) / onClose()
 */
export default function TaskModal({
  task,
  defaults,
  onSave,
  onDelete,
  onClose,
}) {
  const [f, setF] = useState(() => ({
    type: "مكالمة",
    title: "",
    customer: "",
    priority: "متوسطة",
    due: todayIso(),
    time: "10:00",
    owner: EMPLOYEES[0],
    reminder: REMINDERS[1],
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

  const set = (k) => (e) => {
    setF({ ...f, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: undefined });
  };

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (f.title.trim().length < 2)
      err.title = "عنوان المهمة مطلوب (حرفان على الأقل)";
    if (!f.customer.trim()) err.customer = "العميل مطلوب";
    if (!f.due) err.due = "التاريخ مطلوب";
    if (!f.time) err.time = "الوقت مطلوب";
    setErrors(err);
    if (Object.keys(err).length) return;
    onSave({
      ...f,
      title: f.title.trim(),
      customer: f.customer.trim(),
      notes: f.notes.trim(),
      id: task?.id ?? Date.now(),
      done: task?.done ?? false,
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
        className="mx-auto mt-6 w-full max-w-[560px] rounded-2xl bg-white p-5 shadow-xl"
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
            <span className="block mb-1.5 text-[11px] font-bold text-ink">
              نوع المهمة
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TYPES.map((t) => (
                <button
                  type="button"
                  key={t}
                  aria-pressed={f.type === t}
                  onClick={() => setF({ ...f, type: t })}
                  className={`h-7 rounded-full border px-3.5 text-[11px] font-semibold ${
                    f.type === t
                      ? "bg-ink text-white border-ink"
                      : "bg-white text-neutral-600 border-line"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <Field label="عنوان المهمة" required error={errors.title}>
            <input
              className={inputCls(errors.title)}
              placeholder="مثال: الاتصال بعميل لمتابعة العرض"
              value={f.title}
              onChange={set("title")}
            />
          </Field>

          <Field label="العميل" required error={errors.customer}>
            <input
              className={inputCls(errors.customer)}
              list="task-customers"
              placeholder="ابحث عن عميل أو اكتب اسمه"
              value={f.customer}
              onChange={set("customer")}
            />
            <datalist id="task-customers">
              {CUSTOMERS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="التاريخ" required error={errors.due}>
              <input
                type="date"
                dir="ltr"
                className={inputCls(errors.due)}
                value={f.due}
                onChange={set("due")}
              />
            </Field>
            <Field label="الوقت" required error={errors.time}>
              <input
                type="time"
                dir="ltr"
                className={inputCls(errors.time)}
                value={f.time}
                onChange={set("time")}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="المسؤول">
              <select
                className={inputCls()}
                value={f.owner}
                onChange={set("owner")}
              >
                {EMPLOYEES.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
            <Field label="الأولوية">
              <select
                className={inputCls()}
                value={f.priority}
                onChange={set("priority")}
              >
                {PRIORITIES.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="التذكير">
            <select
              className={inputCls()}
              value={f.reminder}
              onChange={set("reminder")}
            >
              {REMINDERS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>

          <Field label="ملاحظات">
            <textarea
              rows={3}
              className="w-full resize-none rounded-lg border border-line p-3 text-[12px] outline-none focus:border-neutral-500 placeholder:text-neutral-400"
              placeholder="أضف تفاصيل مهمة للمتابعة"
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
              className="text-[11.5px] text-neutral-500 hover:text-ink px-2"
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
