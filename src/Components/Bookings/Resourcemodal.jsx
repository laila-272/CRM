import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { btnDark, btnLight } from "../Shared/ui.jsx";
import { DAYS, RES_TYPES, RES_STATUSES, toMin } from "../../data/scheduling.js";

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

/** resource: resource to edit (omit for new). onDelete is optional (edit mode only). */
export default function ResourceModal({ resource, onSave, onDelete, onClose }) {
  const [f, setF] = useState(() => ({
    type: "فرد",
    name: "",
    role: "",
    phone: "",
    email: "",
    status: "متاح",
    slot: 30,
    from: "09:00",
    to: "17:00",
    workDays: [0, 1, 2, 3, 4],
    notes: "",
    ...resource,
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
  const toggleDay = (d) =>
    setF({
      ...f,
      workDays: f.workDays.includes(d)
        ? f.workDays.filter((x) => x !== d)
        : [...f.workDays, d].sort(),
    });

  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (f.name.trim().length < 2)
      err.name = "اسم المورد مطلوب (حرفان على الأقل)";
    if (f.role.trim().length < 2) err.role = "التخصص أو الوصف مطلوب";
    if (!f.from || !f.to || toMin(f.from) >= toMin(f.to))
      err.to = "نهاية الدوام يجب أن تكون بعد البداية";
    if (!f.workDays.length) err.workDays = "اختر يوم عمل واحدًا على الأقل";
    if (f.phone.trim() && !/^01[0125]\d{8}$/.test(f.phone.trim()))
      err.phone = "أدخل رقمًا مصريًا صحيحًا";
    if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim()))
      err.email = "البريد الإلكتروني غير صحيح";
    setErrors(err);
    if (Object.keys(err).length) return;
    onSave({
      ...f,
      name: f.name.trim(),
      role: f.role.trim(),
      phone: f.phone.trim(),
      email: f.email.trim(),
      slot: Number(f.slot),
      notes: f.notes.trim(),
      id: resource?.id ?? `r${Date.now()}`,
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
        className="mx-auto mt-4 w-full max-w-[520px] rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-ink">
            {resource ? "تعديل المورد" : "إضافة مورد"}
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
              نوع المورد
            </span>
            <div className="flex gap-1.5">
              {RES_TYPES.map((t) => (
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

          <Field label="اسم المورد" required error={errors.name}>
            <input
              className={inputCls(errors.name)}
              placeholder="مثال: د. منى سعيد"
              value={f.name}
              onChange={set("name")}
            />
          </Field>
          <Field label="التخصص / الوصف" required error={errors.role}>
            <input
              className={inputCls(errors.role)}
              placeholder="مثال: مستشارة تمويل عقاري"
              value={f.role}
              onChange={set("role")}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="الهاتف" error={errors.phone}>
              <input
                dir="ltr"
                style={{ textAlign: "right" }}
                className={inputCls(errors.phone)}
                placeholder="01XXXXXXXXX"
                value={f.phone}
                onChange={set("phone")}
              />
            </Field>
            <Field label="البريد الإلكتروني" error={errors.email}>
              <input
                dir="ltr"
                style={{ textAlign: "right" }}
                className={inputCls(errors.email)}
                placeholder="name@example.com"
                value={f.email}
                onChange={set("email")}
              />
            </Field>
            <Field label="بداية الدوام" required>
              <input
                type="time"
                dir="ltr"
                className={inputCls()}
                value={f.from}
                onChange={set("from")}
              />
            </Field>
            <Field label="نهاية الدوام" required error={errors.to}>
              <input
                type="time"
                dir="ltr"
                className={inputCls(errors.to)}
                value={f.to}
                onChange={set("to")}
              />
            </Field>
            <Field label="مدة الفترة">
              <select
                className={inputCls()}
                value={f.slot}
                onChange={set("slot")}
              >
                {[15, 30, 45, 60, 90].map((d) => (
                  <option key={d} value={d}>
                    {d} دقيقة
                  </option>
                ))}
              </select>
            </Field>
            <Field label="الحالة">
              <select
                className={inputCls()}
                value={f.status}
                onChange={set("status")}
              >
                {RES_STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>

          <div>
            <span className="block mb-1.5 text-[11px] font-bold text-ink">
              أيام العمل
            </span>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((d, i) => (
                <button
                  type="button"
                  key={d}
                  aria-pressed={f.workDays.includes(i)}
                  onClick={() => toggleDay(i)}
                  className={chip(f.workDays.includes(i))}
                >
                  {d}
                </button>
              ))}
            </div>
            {errors.workDays && (
              <span className="block mt-1 text-[10px] text-red-500">
                {errors.workDays}
              </span>
            )}
          </div>

          <Field label="ملاحظات">
            <textarea
              rows={3}
              className="w-full resize-none rounded-lg border border-line p-3 text-[12px] outline-none focus:border-neutral-500 placeholder:text-neutral-400"
              placeholder="تفاصيل إضافية عن المورد"
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
              {resource ? "حفظ التعديلات" : "إضافة المورد"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-2 text-[11.5px] text-neutral-500 hover:text-ink"
            >
              إلغاء
            </button>
          </div>
          {resource && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(resource)}
              className={`${btnLight} !text-red-500 !border-red-200`}
            >
              حذف المورد
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
