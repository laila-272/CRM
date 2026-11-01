import { useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader, card, btnDark, Select } from "../Shared/ui.jsx";
import { Switch, useToast, field } from "./SettingsKit.jsx";

const KEY = "general-settings";
const DEFAULTS = {
  company: {
    name: "شركة النخبة للأعمال",
    activity: "خدمات واستشارات",
    email: "info@example.com",
    phone: "0100 000 0000",
  },
  region: {
    currency: "الجنيه المصري (EGP)",
    dateFormat: "12 أكتوبر 2026",
    timezone: "توقيت القاهرة",
    language: "العربية",
  },
  security: { twoFactor: false, sessionExpiry: false, loginAlerts: true },
  notify: {
    followups: false,
    meetings: false,
    contractEnd: false,
    daily: true,
  },
};

const load = () => {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY)) };
  } catch {
    return DEFAULTS;
  }
};

function Row({ label, on, onChange, dim }) {
  return (
    <div className="flex items-center justify-between border-b border-line py-3.5 last:border-0">
      <span className="text-[11.5px] font-semibold">{label}</span>
      <Switch on={on} onChange={onChange} label={label} />
    </div>
  );
}
function Card({ title, sub, children }) {
  return (
    <div className={`${card} p-5`}>
      <h3 className="text-[14px] font-semibold">{title}</h3>
      <p className="mb-3 text-[10.5px] text-neutral-500">{sub}</p>
      {children}
    </div>
  );
}
function Field({ label, children }) {
  return (
    <label className="mb-3 block text-[10.5px] text-neutral-500">
      {label}
      <div className="mt-1">{children}</div>
    </label>
  );
}

export default function GeneralSettings() {
  const [s, setS] = useState(load);
  const [toast, show] = useToast();
  const set = (g, k, v) => setS((p) => ({ ...p, [g]: { ...p[g], [k]: v } }));
  const save = () => {
    if (!s.company.name.trim()) return show("اسم الشركة مطلوب");
    if (!/^\S+@\S+\.\S+$/.test(s.company.email))
      return show("البريد الإلكتروني غير صالح");
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      /* ignore */
    }
    show("تم حفظ الإعدادات");
  };
  const inp = (g, k, dir) => (
    <input
      dir={dir}
      className={field}
      value={s[g][k]}
      onChange={(e) => set(g, k, e.target.value)}
    />
  );
  const sel = (k, opts) => (
    <Select
      value={s.region[k]}
      onChange={(v) => set("region", k, v)}
      className="!h-10 !bg-[#F5F5F5] !border-transparent !text-[12px]"
    >
      {opts.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </Select>
  );

  return (
    <div dir="rtl" className="">
      <PageHeader
        title="الإعدادات العامة"
        subtitle="إعدادات الشركة والتنسيق والإشعارات والأمان"
      >
        <button className={btnDark} onClick={save}>
          <Plus size={13} />
          حفظ التغييرات
        </button>
      </PageHeader>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Card
            title="معلومات الشركة"
            sub="البيانات الأساسية التي تظهر في العقود والفواتير"
          >
            <Field label="اسم الشركة">{inp("company", "name")}</Field>
            <Field label="مجال النشاط">{inp("company", "activity")}</Field>
            <Field label="البريد الإلكتروني">
              {inp("company", "email", "ltr")}
            </Field>
            <Field label="رقم الهاتف">{inp("company", "phone", "ltr")}</Field>
          </Card>
          <Card title="الإشعارات" sub="اختر التنبيهات التي ترغب في استلامها">
            <Row
              label="تنبيه المتابعات المتأخرة"
              on={s.notify.followups}
              onChange={(v) => set("notify", "followups", v)}
            />
            <Row
              label="تذكير بالاجتماعات القادمة"
              on={s.notify.meetings}
              onChange={(v) => set("notify", "meetings", v)}
            />
            <Row
              label="تنبيه قرب انتهاء العقود"
              on={s.notify.contractEnd}
              onChange={(v) => set("notify", "contractEnd", v)}
            />
            <Row
              label="الملخص اليومي بالبريد الإلكتروني"
              on={s.notify.daily}
              onChange={(v) => set("notify", "daily", v)}
            />
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="العملة والتنسيق" sub="تفضيلات العرض في كل صفحات النظام">
            <Field label="العملة">
              {sel("currency", [
                "الجنيه المصري (EGP)",
                "الدولار الأمريكي (USD)",
                "الريال السعودي (SAR)",
              ])}
            </Field>
            <Field label="تنسيق التاريخ">
              {sel("dateFormat", [
                "12 أكتوبر 2026",
                "2026/10/12",
                "12/10/2026",
              ])}
            </Field>
            <Field label="المنطقة الزمنية">
              {sel("timezone", ["توقيت القاهرة", "توقيت الرياض", "توقيت دبي"])}
            </Field>
            <Field label="اللغة">
              {sel("language", ["العربية", "English"])}
            </Field>
          </Card>
          <Card title="الأمان" sub="حماية الحسابات والوصول إلى النظام">
            <Row
              label="المصادقة الثنائية"
              on={s.security.twoFactor}
              onChange={(v) => set("security", "twoFactor", v)}
            />
            <Row
              label="تسجيل الخروج التلقائي بعد 30 دقيقة"
              on={s.security.sessionExpiry}
              onChange={(v) => set("security", "sessionExpiry", v)}
            />
            <Row
              label="تقييد الدخول بعناوين IP محددة"
              on={s.security.loginAlerts}
              onChange={(v) => set("security", "loginAlerts", v)}
            />
          </Card>
        </div>
      </div>
      {toast}
    </div>
  );
}
