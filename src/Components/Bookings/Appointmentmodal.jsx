import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { btnDark, btnLight } from "../Shared/ui.jsx";
import { todayIso } from "../../data/Tasks.js";
import {
  APPT_TYPES,
  DURATIONS,
  REMINDERS,
  OWNERS,
  CUSTOMERS,
  loadSettings,
  toMin,
  dayOfWeek,
  overlaps,
  isActive,
  DAYS,
} from "../../data/scheduling.js";

const inputCls = (err) =>
  `w-full h-9 rounded-lg border bg-white px-3 text-[12px] outline-none focus:border-neutral-500 placeholder:text-neutral-400 ${err ? "border-red-400" : "border-line"}`;

function Field({ label, required, error, children }) {
  return (
    <label className="block min-w-0">
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

/** appt: appointment to edit (omit for new). defaults: initial values for a new one. */
export default function AppointmentModal({
  appt,
  defaults,
  resources,
  appointments,
  onSave,
  onDelete,
  onClose,
}) {
  const [f, setF] = useState(() => ({
    title: "",
    customer: "",
    type: "معاينة",
    resourceId: resources[0]?.id || "",
    date: todayIso(),
    time: "10:00",
    duration: loadSettings().duration,
    owner: OWNERS[0],
    status: "مؤكد",
    reminder: REMINDERS[1],
    amount: "",
    notes: "",
    ...defaults,
    ...appt,
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
    const duration = Number(f.duration);
    const res = resources.find((r) => r.id === f.resourceId);
    if (f.title.trim().length < 2)
      err.title = "عنوان الموعد مطلوب (حرفان على الأقل)";
    if (!f.customer.trim()) err.customer = "العميل مطلوب";
    if (!res) err.resourceId = "اختر المورد";
    if (!f.date) err.date = "التاريخ مطلوب";
    if (!f.time) err.time = "الوقت مطلوب";
    if (f.amount !== "" && (isNaN(Number(f.amount)) || Number(f.amount) < 0))
      err.amount = "أدخل مبلغًا صحيحًا";

    if (res && f.date && f.time && !err.time && !err.date) {
      if (!res.workDays.includes(dayOfWeek(f.date)))
        err.date = `${res.name} لا يعمل يوم ${DAYS[dayOfWeek(f.date)]}`;
      else if (
        toMin(f.time) < toMin(res.from) ||
        toMin(f.time) + duration > toMin(res.to)
      )
        err.time = `خارج ساعات العمل (${res.from} – ${res.to})`;
      else if (f.status !== "ملغي") {
        const probe = {
          date: f.date,
          resourceId: f.resourceId,
          time: f.time,
          duration,
        };
        if (
          appointments.some(
            (a) => a.id !== appt?.id && isActive(a) && overlaps(a, probe),
          )
        )
          err.time = "المورد محجوز في هذا الوقت";
      }
    }
    setErrors(err);
    if (Object.keys(err).length) return;
    onSave({
      ...f,
      title: f.title.trim(),
      customer: f.customer.trim(),
      duration,
      amount: f.amount === "" ? 0 : Number(f.amount),
      notes: f.notes.trim(),
      id: appt?.id ?? Date.now(),
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
            {appt ? "تفاصيل الموعد" : "إضافة موعد"}
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
          <Field label="عنوان الموعد" required error={errors.title}>
            <input
              className={inputCls(errors.title)}
              placeholder="مثال: معاينة وحدة المشروع"
              value={f.title}
              onChange={set("title")}
            />
          </Field>
          <Field label="العميل" required error={errors.customer}>
            <input
              className={inputCls(errors.customer)}
              list="appt-customers"
              placeholder="ابحث عن عميل أو اكتب اسمه"
              value={f.customer}
              onChange={set("customer")}
            />
            <datalist id="appt-customers">
              {CUSTOMERS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="النوع">
              <select
                className={inputCls()}
                value={f.type}
                onChange={set("type")}
              >
                {APPT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="المورد" required error={errors.resourceId}>
              <select
                className={inputCls(errors.resourceId)}
                value={f.resourceId}
                onChange={set("resourceId")}
              >
                {resources.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="التاريخ" required error={errors.date}>
              <input
                type="date"
                dir="ltr"
                className={inputCls(errors.date)}
                value={f.date}
                onChange={set("date")}
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
            <Field label="المدة">
              <select
                className={inputCls()}
                value={f.duration}
                onChange={set("duration")}
              >
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} دقيقة
                  </option>
                ))}
              </select>
            </Field>
            <Field label="المسؤول">
              <select
                className={inputCls()}
                value={f.owner}
                onChange={set("owner")}
              >
                {OWNERS.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </Field>
          </div>

          <div>
            <span className="block mb-1.5 text-[11px] font-bold text-ink">
              حالة الموعد
            </span>
            <div className="flex gap-1.5">
              {["مؤكد", "بانتظار التأكيد"].map((s) => (
                <button
                  type="button"
                  key={s}
                  aria-pressed={f.status === s}
                  onClick={() => setF({ ...f, status: s })}
                  className={`h-7 rounded-full border px-3.5 text-[11px] font-semibold ${f.status === s ? "bg-ink text-white border-ink" : "bg-white text-neutral-600 border-line"}`}
                >
                  {s}
                </button>
              ))}
              {appt &&
                ["مكتمل", "ملغي"].map((s) => (
                  <button
                    type="button"
                    key={s}
                    aria-pressed={f.status === s}
                    onClick={() => setF({ ...f, status: s })}
                    className={`h-7 rounded-full border px-3.5 text-[11px] font-semibold ${f.status === s ? "bg-ink text-white border-ink" : "bg-white text-neutral-600 border-line"}`}
                  >
                    {s}
                  </button>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <Field label="المبلغ / العربون (EGP)" error={errors.amount}>
              <input
                type="number"
                min="0"
                dir="ltr"
                className={inputCls(errors.amount)}
                placeholder="0"
                value={f.amount}
                onChange={set("amount")}
              />
            </Field>
          </div>

          <Field label="ملاحظات">
            <textarea
              rows={3}
              className="w-full resize-none rounded-lg border border-line p-3 text-[12px] outline-none focus:border-neutral-500 placeholder:text-neutral-400"
              placeholder="أي تفاصيل مهمة للموعد"
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
              {appt ? "حفظ التعديلات" : "إضافة الموعد"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-2 text-[11.5px] text-neutral-500 hover:text-ink"
            >
              إلغاء
            </button>
          </div>
          {appt && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(appt)}
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
