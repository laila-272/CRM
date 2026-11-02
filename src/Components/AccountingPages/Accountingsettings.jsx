import { useEffect, useState } from "react";
import {
  PageHeader,
  btnDark,
  btnLight,
  card,
  Toggle,
  inputCls,
  useToast,
} from "./Accountingui.jsx;";

const KEY = "accounting-settings";
const DEFAULTS = {
  currency: "SAR",
  method: "accrual",
  fiscalStart: "2026-01-01",
  decimals: "2",
  vatOn: true,
  taxIncl: false,
  vatRate: "15",
  taxNo: "310123456700003",
  jvPrefix: "JV-2026-",
  billPrefix: "BILL-",
  expPrefix: "EXP-",
  jvNext: "0149",
  accRecv: "1200",
  accPay: "2100",
  accVatOut: "2200",
  accVatIn: "1301",
  accRev: "4101",
  accBank: "1102",
  autoPost: true,
  lockPeriods: true,
  approveLarge: true,
  backdate: false,
};
const ACCOUNTS = [
  ["1102", "مصرف الراجحي"],
  ["1200", "الذمم المدينة"],
  ["1301", "ضريبة القيمة المضافة المدخلة"],
  ["2100", "الذمم الدائنة"],
  ["2200", "ضريبة القيمة المضافة المحصلة"],
  ["4101", "إيرادات الصفقات"],
];
const NAV = [
  ["general", "الإعدادات العامة"],
  ["fiscal", "السنة المالية والفترات"],
  ["tax", "الضرائب"],
  ["numbering", "ترقيم المستندات"],
  ["defaults", "الحسابات الافتراضية"],
  ["automation", "الأتمتة والقفل"],
  ["approval", "الصلاحيات والاعتماد"],
];

const load = () => {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return DEFAULTS;
  }
};

function Section({ id, title, sub, children }) {
  return (
    <section id={id} className={`${card} scroll-mt-20 p-5`}>
      <div className="text-[13px] font-semibold text-ink">{title}</div>
      <div className="mb-4 mt-0.5 text-[10.5px] text-neutral-500">{sub}</div>
      {children}
    </section>
  );
}
const Grid = ({ children }) => (
  <div className="grid gap-4 sm:grid-cols-2">{children}</div>
);
function F({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10.5px] text-neutral-500">
        {label}
      </span>
      {children}
    </label>
  );
}
function Row({ title, sub, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-3 last:border-0">
      <div>
        <div className="text-[11.5px] font-semibold text-ink">{title}</div>
        <div className="mt-0.5 text-[10.5px] text-neutral-500">{sub}</div>
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  );
}

export default function AccountingSettings() {
  const [saved, setSaved] = useState(load);
  const [s, setS] = useState(saved);
  const [active, setActive] = useState("general");
  const [toast, showToast] = useToast();
  const dirty = JSON.stringify(s) !== JSON.stringify(saved);
  const set = (k) => (e) => setS({ ...s, [k]: e.target.value });
  const tog = (k) => (v) => setS({ ...s, [k]: v });

  useEffect(() => {
    if (!dirty) return;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* storage unavailable */
    }
    setSaved(s);
    showToast("تم حفظ التغييرات على هذا المتصفح (عرض تجريبي)");
  };
  const reset = () => {
    setS(saved);
    showToast("تم التراجع عن التغييرات غير المحفوظة");
  };
  const restoreDefaults = () => {
    setS(DEFAULTS);
    showToast("تمت استعادة القيم الافتراضية — اضغط حفظ للتأكيد");
  };
  const go = (id) => {
    const target =
      id === "fiscal" ? "general" : id === "approval" ? "automation" : id;
    setActive(id);
    document
      .getElementById(target)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const sel = (k, opts) => (
    <select className={inputCls} value={s[k]} onChange={set(k)}>
      {opts.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
  const acc = (k) =>
    sel(
      k,
      ACCOUNTS.map(([c, n]) => [c, `${c} · ${n}`]),
    );

  return (
    <div dir="rtl" className="space-y-4">
      <PageHeader
        title="إعدادات المحاسبة"
        subtitle="تحكم في السنة المالية والضرائب وترقيم المستندات والحسابات الافتراضية"
      >
        <button className={btnLight} onClick={reset} disabled={!dirty}>
          تراجع
        </button>
        <button className={btnLight} onClick={restoreDefaults}>
          استعادة الافتراضي
        </button>
        <button
          className={`${btnDark} disabled:opacity-40`}
          onClick={save}
          disabled={!dirty}
        >
          حفظ التغييرات
        </button>
      </PageHeader>

      <div className="grid items-start gap-4 lg:grid-cols-[190px_minmax(0,1fr)]">
        <nav className={`${card} p-3 lg:sticky lg:top-4`}>
          <div className="mb-2 px-2 text-[11px] font-semibold text-ink">
            أقسام الإعدادات
          </div>
          {NAV.map(([id, l]) => (
            <button
              key={id}
              onClick={() => go(id)}
              className={`block w-full rounded-md px-2 py-2 text-right text-[11px] transition-colors ${active === id ? "bg-neutral-100 font-semibold text-ink" : "text-neutral-500 hover:bg-neutral-50"}`}
            >
              {l}
            </button>
          ))}
        </nav>

        <div className="space-y-4">
          <Section
            id="general"
            title="الإعدادات العامة"
            sub="العملة وطريقة المحاسبة وبداية السنة المالية"
          >
            <Grid>
              <F label="العملة الأساسية">
                {sel("currency", [
                  ["SAR", "ريال سعودي (SAR)"],
                  ["EGP", "جنيه مصري (EGP)"],
                  ["USD", "دولار أمريكي (USD)"],
                ])}
              </F>
              <F label="طريقة المحاسبة">
                {sel("method", [
                  ["accrual", "الاستحقاق"],
                  ["cash", "النقدي"],
                ])}
              </F>
              <F label="بداية السنة المالية">
                {sel("fiscalStart", [
                  ["2026-01-01", "1 يناير 2026"],
                  ["2026-04-01", "1 أبريل 2026"],
                  ["2026-07-01", "1 يوليو 2026"],
                ])}
              </F>
              <F label="الخانات العشرية">
                {sel("decimals", [
                  ["0", "0"],
                  ["2", "2"],
                  ["3", "3"],
                ])}
              </F>
            </Grid>
          </Section>

          <Section
            id="tax"
            title="الضرائب"
            sub="ضريبة القيمة المضافة وبيانات التسجيل الضريبي"
          >
            <Row
              title="تفعيل ضريبة القيمة المضافة"
              sub="تُحتسب تلقائياً على فواتير المبيعات والمشتريات"
              checked={s.vatOn}
              onChange={tog("vatOn")}
            />
            <Row
              title="الأسعار شاملة للضريبة"
              sub="تعامل المبالغ المدخلة على أنها شاملة الضريبة"
              checked={s.taxIncl}
              onChange={tog("taxIncl")}
            />
            <div className="mt-4">
              <Grid>
                <F label="نسبة الضريبة">
                  {sel("vatRate", [
                    ["15", "15%"],
                    ["14", "14%"],
                    ["5", "5%"],
                    ["0", "0%"],
                  ])}
                </F>
                <F label="الرقم الضريبي">
                  <input
                    dir="ltr"
                    className={inputCls}
                    value={s.taxNo}
                    onChange={set("taxNo")}
                  />
                </F>
              </Grid>
            </div>
          </Section>

          <Section
            id="numbering"
            title="ترقيم المستندات"
            sub="بادئات التسلسل الآلي للقيود والمستندات"
          >
            <Grid>
              <F label="بادئة القيود">
                <input
                  dir="ltr"
                  className={inputCls}
                  value={s.jvPrefix}
                  onChange={set("jvPrefix")}
                />
              </F>
              <F label="بادئة فواتير المشتريات">
                <input
                  dir="ltr"
                  className={inputCls}
                  value={s.billPrefix}
                  onChange={set("billPrefix")}
                />
              </F>
              <F label="بادئة المصروفات">
                <input
                  dir="ltr"
                  className={inputCls}
                  value={s.expPrefix}
                  onChange={set("expPrefix")}
                />
              </F>
              <F label="التسلسل التالي للقيود">
                <input
                  dir="ltr"
                  inputMode="numeric"
                  className={inputCls}
                  value={s.jvNext}
                  onChange={set("jvNext")}
                />
              </F>
            </Grid>
          </Section>

          <Section
            id="defaults"
            title="الحسابات الافتراضية"
            sub="تستخدم عند إنشاء القيود الآلية"
          >
            <Grid>
              <F label="الذمم المدينة">{acc("accRecv")}</F>
              <F label="الذمم الدائنة">{acc("accPay")}</F>
              <F label="ضريبة المخرجات">{acc("accVatOut")}</F>
              <F label="ضريبة المدخلات">{acc("accVatIn")}</F>
              <F label="حساب الإيرادات">{acc("accRev")}</F>
              <F label="الحساب البنكي المقابل">{acc("accBank")}</F>
            </Grid>
          </Section>

          <Section
            id="automation"
            title="الأتمتة والقفل"
            sub="ضوابط الترحيل والاعتماد وإغلاق الفترات"
          >
            <Row
              title="ترحيل القيود الآلية تلقائياً"
              sub="القيود الناتجة عن الدفعات والفواتير تُرحّل دون مراجعة"
              checked={s.autoPost}
              onChange={tog("autoPost")}
            />
            <Row
              title="قفل الفترات المغلقة"
              sub="منع إنشاء أو تعديل قيود في فترة مقفلة"
              checked={s.lockPeriods}
              onChange={tog("lockPeriods")}
            />
            <Row
              title="اعتماد المصروفات الكبيرة"
              sub="يتطلب اعتماد المدير المالي للمصروفات فوق 10,000 ر.س"
              checked={s.approveLarge}
              onChange={tog("approveLarge")}
            />
            <Row
              title="السماح بقيود بتواريخ سابقة"
              sub="إتاحة تسجيل قيود في الشهور السابقة المفتوحة"
              checked={s.backdate}
              onChange={tog("backdate")}
            />
          </Section>
        </div>
      </div>
      {toast}
    </div>
  );
}
