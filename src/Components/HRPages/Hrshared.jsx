import { useState } from "react";
import { Modal, Field, inputCls } from "../AccountingPages/Accountingui.jsx";
import { DEPTS, STATUS, TYPES } from "../../data/Employeesstore.js";

export const dmy = (iso) => (iso ? iso.split("-").reverse().join("/") : "—");

export function Avatar({ name, size = 28, dark }) {
  return (
    <span
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className={`grid shrink-0 place-items-center rounded-full font-semibold ${dark ? "bg-ink text-white" : "bg-neutral-100 text-neutral-600"}`}
    >
      {name?.[0] || "؟"}
    </span>
  );
}

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  dept: DEPTS[0],
  title: "",
  hired: new Date().toISOString().slice(0, 10),
  status: "active",
  type: TYPES[0],
  baseSalary: "",
};

/** Add (no `employee`) or edit (with `employee`). onSave receives the validated values. */
export function EmployeeFormModal({ employee, onClose, onSave }) {
  const [f, setF] = useState(employee ? { ...EMPTY, ...employee } : EMPTY);
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = () => {
    if (!f.name.trim()) return setErr("أدخل اسم الموظف");
    if (!/^\S+@\S+\.\S+$/.test(f.email))
      return setErr("أدخل بريداً إلكترونياً صحيحاً");
    onSave({
      ...f,
      name: f.name.trim(),
      baseSalary: Number(f.baseSalary) || 0,
    });
  };
  return (
    <Modal
      title={employee ? "تعديل بيانات الموظف" : "موظف جديد"}
      onClose={onClose}
      onSubmit={submit}
      submitLabel={employee ? "حفظ التعديلات" : "إضافة الموظف"}
    >
      <Field label="الاسم الكامل" full>
        <input
          className={inputCls}
          value={f.name}
          onChange={set("name")}
          autoFocus
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
      <Field label="رقم الهاتف">
        <input
          dir="ltr"
          className={inputCls}
          value={f.phone}
          onChange={set("phone")}
        />
      </Field>
      <Field label="القسم">
        <select className={inputCls} value={f.dept} onChange={set("dept")}>
          {DEPTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </Field>
      <Field label="المسمى الوظيفي">
        <input className={inputCls} value={f.title} onChange={set("title")} />
      </Field>
      <Field label="تاريخ التعيين">
        <input
          type="date"
          className={inputCls}
          value={f.hired}
          onChange={set("hired")}
        />
      </Field>
      <Field label="الحالة">
        <select className={inputCls} value={f.status} onChange={set("status")}>
          {Object.entries(STATUS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </Field>
      <Field label="نوع التوظيف">
        <select className={inputCls} value={f.type} onChange={set("type")}>
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field label="الراتب الأساسي (ج.م)">
        <input
          type="number"
          min="0"
          className={inputCls}
          value={f.baseSalary}
          onChange={set("baseSalary")}
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
