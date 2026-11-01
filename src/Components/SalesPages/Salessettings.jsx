import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader, Chip, card, btnDark} from "../Shared/ui.jsx";
import {
  Toggle,
  Field,
  SelectField,
  UnitInput,
  inputCls,
  useToast,
} from "./Shared.jsx";
import {
  APPROVERS,
  PAY_METHODS,
  PAY_TERMS,
  CURRENCIES,
} from "../../data/salesData.js";

const DEFAULTS = {
  orderPrefix: "ط-",
  validity: 14,
  autoConfirm: true,
  allowEdit: false,
  soPrefix: "أ-",
  autoApprove: 100000,
  approver: APPROVERS[0],
  requireApproval: true,
  methods: ["نقدي", "تحويل بنكي", "بطاقة ائتمان"],
  vat: 14,
  terms: "خلال 30 يوماً",
  currency: CURRENCIES[0],
  notifyNew: true,
  notifyLate: true,
  weekly: false,
};

function Card({ title, sub, children }) {
  return (
    <section className={`${card} p-6 shadow-sm`}>
      <h2 className="text-[18px] font-medium text-ink">{title}</h2>
      <p className="mb-5 mt-1 text-[10px] text-neutral-500">{sub}</p>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
const Sw = ({ title, desc, checked, onChange }) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <div className="text-[12px] font-semibold text-ink">{title}</div>
      <div className="mt-0.5 text-[10px] text-neutral-500">{desc}</div>
    </div>
    <Toggle checked={checked} onChange={onChange} label={title} />
  </div>
);

export default function SalesSettings() {
  const [s, setS] = useState(DEFAULTS);
  const [err, setErr] = useState({});
  const [toast, show] = useToast();
  const set = (k) => (v) => setS((p) => ({ ...p, [k]: v }));
  const txt = (k) => (
    <input
      className={inputCls}
      value={s[k]}
      onChange={(e) => set(k)(e.target.value)}
    />
  );
  const toggleMethod = (m) =>
    set("methods")(
      s.methods.includes(m)
        ? s.methods.filter((x) => x !== m)
        : [...s.methods, m],
    );

  const save = () => {
    const e = {};
    if (!s.orderPrefix.trim()) e.orderPrefix = "أدخل بادئة الترقيم";
    if (!s.soPrefix.trim()) e.soPrefix = "أدخل بادئة الترقيم";
    if (s.validity < 1) e.validity = "يجب أن تكون المدة يوماً واحداً على الأقل";
    if (s.vat > 100) e.vat = "النسبة بين 0 و100";
    if (!s.methods.length) e.methods = "اختر طريقة دفع واحدة على الأقل";
    setErr(e);
    if (!Object.keys(e).length) show("تم حفظ التغييرات");
  };
  const E = ({ k }) =>
    err[k] ? (
      <p className="mt-1.5 text-[10.5px] text-red-600">{err[k]}</p>
    ) : null;

  return (
    <div dir="rtl" className="space-y-4">
      {toast}
      <PageHeader
        title="إعدادات المبيعات"
        subtitle="تحكم في ترقيم الطلبات وقواعد الاعتماد وطرق الدفع والضرائب والإشعارات."
      >
        <button className={btnDark} onClick={save}>
          <Plus size={13} /> حفظ التغييرات
        </button>
      </PageHeader>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Card title="الطلبات" sub="قواعد إنشاء الطلبات وتأكيدها">
            <Field label="بادئة ترقيم الطلبات" error={err.orderPrefix}>
              {txt("orderPrefix")}
            </Field>
            <Field label="مدة صلاحية الطلب" error={err.validity}>
              <UnitInput
                unit="يوماً"
                value={s.validity}
                onChange={set("validity")}
              />
            </Field>
            <Sw
              title="تأكيد الطلبات تلقائياً"
              desc="يتم تأكيد الطلب فور استلام الدفعة الأولى."
              checked={s.autoConfirm}
              onChange={set("autoConfirm")}
            />
            <Sw
              title="السماح بالتعديل بعد التأكيد"
              desc="يتطلب موافقة المسؤول."
              checked={s.allowEdit}
              onChange={set("allowEdit")}
            />
          </Card>
          <Card title="أوامر البيع" sub="قواعد إصدار أوامر البيع واعتمادها">
            <Field label="بادئة ترقيم الأوامر" error={err.soPrefix}>
              {txt("soPrefix")}
            </Field>
            <Field label="حد الاعتماد التلقائي">
              <UnitInput
                commas
                unit="ج.م"
                value={s.autoApprove}
                onChange={set("autoApprove")}
              />
            </Field>
            <Field label="المعتمِد الافتراضي">
              <SelectField value={s.approver} onChange={set("approver")}>
                {APPROVERS.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </SelectField>
            </Field>
            <Sw
              title="اشتراط اعتماد أوامر البيع"
              desc="لا يصدر الأمر قبل موافقة المعتمد."
              checked={s.requireApproval}
              onChange={set("requireApproval")}
            />
          </Card>
        </div>
        <div className="space-y-4">
          <Card title="الدفع والضرائب" sub="طرق الدفع والضريبة وشروط السداد">
            <Field label="طرق الدفع المتاحة">
              <div className="flex flex-wrap gap-2">
                {PAY_METHODS.map((m) => (
                  <Chip
                    key={m}
                    active={s.methods.includes(m)}
                    onClick={() => toggleMethod(m)}
                  >
                    {m}
                  </Chip>
                ))}
              </div>
              <E k="methods" />
            </Field>
            <Field label="ضريبة القيمة المضافة" error={err.vat}>
              <UnitInput unit="%" value={s.vat} onChange={set("vat")} />
            </Field>
            <Field label="شروط الدفع الافتراضية">
              <SelectField value={s.terms} onChange={set("terms")}>
                {PAY_TERMS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </SelectField>
            </Field>
            <Field label="العملة الافتراضية">
              <SelectField value={s.currency} onChange={set("currency")}>
                {CURRENCIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </SelectField>
            </Field>
          </Card>
          <Card title="الإشعارات" sub="تنبيهات فريق المبيعات">
            <Sw
              title="إشعار عند وصول طلب جديد"
              desc="تنبيه للمسؤول عن العميل."
              checked={s.notifyNew}
              onChange={set("notifyNew")}
            />
            <Sw
              title="إشعار عند تأخر الدفع"
              desc="تنبيه بعد تجاوز موعد الاستحقاق."
              checked={s.notifyLate}
              onChange={set("notifyLate")}
            />
            <Sw
              title="ملخص أسبوعي بالبريد الإلكتروني"
              desc="تقرير مختصر كل أحد."
              checked={s.weekly}
              onChange={set("weekly")}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
