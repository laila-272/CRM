import { useState } from "react";
import { Modal, Field, inputCls } from "../AccountingPages/Accountingui.jsx";
import { PROJECTS, OWNERS, SOURCES, STATUSES, REF } from "../../data/contacts.js";

const iso = () => new Date(REF).toISOString().slice(0, 10);
const EMPTY = {
  name: "",
  kind: "فرد",
  phone: "",
  email: "",
  city: "",
  job: "",
  project: PROJECTS[0],
  owner: OWNERS[0],
  status: "جديد",
  source: SOURCES[0],
  value: "",
  notes: "",
};

export default function ContactForm({ contact, onClose, onSave }) {
  const [f, setF] = useState(contact ? { ...EMPTY, ...contact } : EMPTY);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = () => {
    if (!f.name.trim()) return setErr("أدخل اسم جهة الاتصال");
    if (!/^[+\d\s-]{8,}$/.test(f.phone)) return setErr("أدخل رقم هاتف صحيحاً");
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email))
      return setErr("البريد الإلكتروني غير صحيح");
    onSave({ ...f, name: f.name.trim(), value: Number(f.value) || 0 });
  };
  const sel = (k, list) => (
    <select className={inputCls} value={f[k]} onChange={set(k)}>
      {list.map((x) => (
        <option key={x}>{x}</option>
      ))}
    </select>
  );
  return (
    <Modal
      title={contact ? "تعديل بيانات العميل" : "إضافة جهة اتصال"}
      onClose={onClose}
      onSubmit={submit}
      submitLabel={contact ? "حفظ التعديلات" : "إضافة"}
    >
      <Field label="الاسم" full>
        <input
          className={inputCls}
          value={f.name}
          onChange={set("name")}
          autoFocus
        />
      </Field>
      <Field label="النوع">{sel("kind", ["فرد", "شركة"])}</Field>
      <Field label="الهاتف">
        <input
          dir="ltr"
          className={inputCls}
          value={f.phone}
          onChange={set("phone")}
        />
      </Field>
      <Field label="البريد الإلكتروني">
        <input
          dir="ltr"
          className={inputCls}
          value={f.email}
          onChange={set("email")}
        />
      </Field>
      <Field label="المدينة">
        <input className={inputCls} value={f.city} onChange={set("city")} />
      </Field>
      <Field label="المشروع">{sel("project", PROJECTS)}</Field>
      <Field label="المسؤول">{sel("owner", OWNERS)}</Field>
      <Field label="الحالة">{sel("status", STATUSES)}</Field>
      <Field label="المصدر">{sel("source", SOURCES)}</Field>
      <Field label="قيمة التعاملات (ج.م)">
        <input
          type="number"
          min="0"
          className={inputCls}
          value={f.value}
          onChange={set("value")}
        />
      </Field>
      <Field label="ملاحظات" full>
        <textarea
          rows={2}
          className={`${inputCls} h-auto py-2`}
          value={f.notes}
          onChange={set("notes")}
        />
      </Field>
      {err && (
        <p role="alert" className="col-span-2 text-[11px] text-red-600">
          {err}
        </p>
      )}
    </Modal>
  );
}
export { iso };
