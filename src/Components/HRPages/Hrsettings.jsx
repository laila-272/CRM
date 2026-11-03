import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader, btnDark, btnLight, card } from "../Shared/ui.jsx";
import {
  Modal,
  Field,
  inputCls,
  useToast,
} from "../AccountingPages/Accountingui.jsx";
import { createStore } from "../../data/Hrstores.js";

// Rows are [label, value] text pairs. Values such as "12 موظف" are editable text in this demo (no backend).
const DEFAULTS = [
  {
    id: "depts",
    title: "الأقسام",
    desc: "أقسام الشركة وعدد موظفي كل قسم",
    rows: [
      ["المبيعات", "12 موظف"],
      ["خدمة العملاء", "10 موظفين"],
      ["التسويق", "8 موظفين"],
      ["المالية", "6 موظفين"],
      ["الموارد البشرية", "3 موظفين"],
    ],
  },
  {
    id: "titles",
    title: "المسميات الوظيفية",
    desc: "المسميات والمستويات الوظيفية المعتمدة",
    rows: [
      ["مدير", "8"],
      ["مشرف", "6"],
      ["مسؤول مبيعات", "14"],
      ["محاسب", "9"],
      ["إجمالي المسميات", "5"],
    ],
  },
  {
    id: "leaves",
    title: "أنواع الإجازات",
    desc: "الأرصدة السنوية لكل نوع إجازة",
    rows: [
      ["سنوية", "21 يوم"],
      ["مرضية", "15 يوم"],
      ["طارئة", "5 أيام"],
      ["براتب رقمي", "حسب الموافقة"],
      ["أمومة", "90 يوم"],
    ],
  },
  {
    id: "hours",
    title: "ساعات الدوام",
    desc: "أيام وأوقات العمل المعتمدة",
    rows: [
      ["أيام العمل", "الأحد - الخميس"],
      ["بداية الدوام", "09:00 ص"],
      ["نهاية الدوام", "05:00 م"],
      ["مدة السماح", "15 دقيقة"],
      ["العطلة الأسبوعية", "الجمعة والسبت"],
    ],
  },
  {
    id: "payroll",
    title: "سياسات الرواتب",
    desc: "مواعيد الصرف والخصم والبدلات",
    rows: [
      ["يوم صرف الراتب", "25 من كل شهر"],
      ["حد المستحقات", "500 ج.م"],
      ["خصم التأخير", "1% من الراتب"],
      ["خصم الغياب", "يوم لكل غياب"],
      ["التأمينات", "11%"],
    ],
  },
  {
    id: "roles",
    title: "الأدوار والصلاحيات",
    desc: "من يرى ويعدل بيانات الموارد البشرية",
    rows: [
      ["مدير الموارد البشرية", "صلاحيات كاملة"],
      ["مدير القسم", "عرض الفريق فقط"],
      ["المحاسب", "الرواتب فقط"],
      ["الموظف", "بياناته فقط"],
      ["مشاهد", "قراءة فقط"],
    ],
  },
];
const useSettings = createStore("hr-settings-v1", DEFAULTS);

function EditModal({ card: c, onClose, onSave }) {
  const [rows, setRows] = useState(c.rows.map((r) => [...r]));
  const [err, setErr] = useState("");
  const set = (i, j, v) =>
    setRows(
      rows.map((r, k) => (k === i ? r.map((x, m) => (m === j ? v : x)) : r)),
    );
  const submit = () => {
    if (rows.some(([l, v]) => !l.trim() || !v.trim()))
      return setErr("لا يمكن ترك أي حقل فارغاً");
    onSave(rows.map(([l, v]) => [l.trim(), v.trim()]));
  };
  return (
    <Modal title={`تعديل: ${c.title}`} onClose={onClose} onSubmit={submit}>
      <div className="col-span-2 space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-end gap-2">
            <Field label={i === 0 ? "البند" : ""}>
              <input
                className={inputCls}
                value={r[0]}
                onChange={(e) => set(i, 0, e.target.value)}
              />
            </Field>
            <Field label={i === 0 ? "القيمة" : ""}>
              <input
                className={inputCls}
                value={r[1]}
                onChange={(e) => set(i, 1, e.target.value)}
              />
            </Field>
            <button
              type="button"
              aria-label="حذف البند"
              className="mb-2 text-neutral-400 hover:text-red-600"
              onClick={() => setRows(rows.filter((_, k) => k !== i))}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          className={btnLight}
          onClick={() => setRows([...rows, ["", ""]])}
        >
          <Plus size={12} /> إضافة بند
        </button>
        {err && (
          <p role="alert" className="text-[11px] text-red-600">
            {err}
          </p>
        )}
      </div>
    </Modal>
  );
}

export default function HRSettings() {
  const [saved, setSaved] = useSettings();
  const [work, setWork] = useState(saved);
  const [editing, setEditing] = useState(null);
  const [toast, showToast] = useToast();
  const dirty = JSON.stringify(work) !== JSON.stringify(saved);

  return (
    <div dir="rtl" className="space-y-4">
      <PageHeader
        title="إعدادات الموارد البشرية"
        subtitle="الأقسام والمسميات الوظيفية والإجازات وساعات الدوام وسياسات الرواتب"
      >
        <button
          className={`${btnDark} disabled:opacity-40`}
          disabled={!dirty}
          onClick={() => {
            setSaved(work);
            showToast("تم حفظ التغييرات على هذا المتصفح (عرض تجريبي)");
          }}
        >
          <Plus size={13} /> حفظ التغييرات
        </button>
      </PageHeader>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {work.map((c) => (
          <section key={c.id} className={`${card} p-4`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-[13px] font-semibold text-ink">
                  {c.title}
                </h2>
                <p className="mt-0.5 text-[10px] text-neutral-500">{c.desc}</p>
              </div>
              <button
                className={`${btnLight} h-6 !px-3 !text-[10px]`}
                onClick={() => setEditing(c)}
              >
                تعديل
              </button>
            </div>
            <dl className="mt-3 divide-y divide-line">
              {c.rows.map(([l, v], i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 py-2.5 text-[11px]"
                >
                  <dt className="text-neutral-600">{l}</dt>
                  <dd className="font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      {editing && (
        <EditModal
          card={editing}
          onClose={() => setEditing(null)}
          onSave={(rows) => {
            setWork(
              work.map((x) => (x.id === editing.id ? { ...x, rows } : x)),
            );
            setEditing(null);
            showToast("تم تحديث البطاقة — اضغط «حفظ التغييرات» للتثبيت");
          }}
        />
      )}
      {toast}
    </div>
  );
}
