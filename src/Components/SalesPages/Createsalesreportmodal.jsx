import { useState } from "react";
import { Mail } from "lucide-react";
import { TEAM, CATEGORIES, REPORT_TYPES, COMPARES } from "../../data/salesData.js";
import {
  Modal,
  Field,
  SelectField,
  DateField,
  PillGroup,
  inputCls,
  pBtn,
  sBtn,
} from "./Shared.jsx";

const MAILS = /^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/;

export default function CreateSalesReportModal({ onCreate, onClose }) {
  const [f, setF] = useState({
    name: "",
    type: "summary",
    owner: "",
    from: "",
    to: "",
    category: "",
    compare: "none",
    format: "PDF",
    email: "",
  });
  const [err, setErr] = useState({});
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const submit = () => {
    const e = {};
    if (!f.name.trim()) e.name = "أدخل اسم التقرير";
    if (!f.from) e.from = "حدد بداية الفترة";
    if (!f.to) e.to = "حدد نهاية الفترة";
    else if (f.from && f.to < f.from) e.to = "يجب أن يكون بعد تاريخ البداية";
    const mails = f.email
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (mails.some((m) => !MAILS.test(m)))
      e.email = "تحقق من صيغة البريد الإلكتروني";
    setErr(e);
    if (!Object.keys(e).length) onCreate({ ...f, name: f.name.trim(), mails });
  };

  return (
    <Modal
      title="إنشاء تقرير مبيعات"
      onClose={onClose}
      footer={
        <>
          <button className={pBtn} onClick={submit}>
            إنشاء التقرير
          </button>
          <button className={sBtn} onClick={onClose}>
            إلغاء
          </button>
        </>
      }
    >
      <Field label="اسم التقرير" required error={err.name}>
        <input
          className={inputCls}
          value={f.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="مثال: تقرير مبيعات الربع الأخير"
        />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="نوع التقرير" required>
          <SelectField value={f.type} onChange={(v) => set("type", v)}>
            {Object.entries(REPORT_TYPES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </SelectField>
        </Field>
        <Field label="المسؤول">
          <SelectField value={f.owner} onChange={(v) => set("owner", v)}>
            <option value="">كل المسؤولين</option>
            {TEAM.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </SelectField>
        </Field>
        <Field label="من تاريخ" required error={err.from}>
          <DateField value={f.from} onChange={(v) => set("from", v)} />
        </Field>
        <Field label="إلى تاريخ" required error={err.to}>
          <DateField value={f.to} onChange={(v) => set("to", v)} />
        </Field>
        <Field label="الفئة">
          <SelectField value={f.category} onChange={(v) => set("category", v)}>
            <option value="">كل الفئات</option>
            {CATEGORIES.map((c) => (
              <option key={c.name}>{c.name}</option>
            ))}
          </SelectField>
        </Field>
        <Field label="المقارنة">
          <SelectField value={f.compare} onChange={(v) => set("compare", v)}>
            {Object.entries(COMPARES).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </SelectField>
        </Field>
      </div>
      <Field label="صيغة التصدير">
        <PillGroup
          options={[
            ["PDF", "PDF"],
            ["Excel", "Excel"],
            ["CSV", "CSV"],
          ]}
          active={(k) => f.format === k}
          onPick={(k) => set("format", k)}
        />
      </Field>
      <Field
        label="إرسال نسخة بالبريد"
        error={err.email}
        hint="يمكن إدخال أكثر من بريد مفصولة بفاصلة."
      >
        <div className="relative">
          <input
            dir="rtl"
            className={`${inputCls} pl-9`}
            value={f.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="أدخل بريد المستلم (اختياري)"
          />
          <Mail
            size={14}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
          />
        </div>
      </Field>
    </Modal>
  );
}
