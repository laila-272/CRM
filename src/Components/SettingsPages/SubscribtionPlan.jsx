import { useState } from "react";
import { Check, Download, ChevronDown } from "lucide-react";
import {
  PageHeader,
  card,
  btnDark,
  egp,
  downloadCsv,
  th,
  td,
} from "../Shared/ui.jsx";
import { useToast } from "./SettingsKit.jsx";

const PLANS = [
  {
    id: "basic",
    name: "الأساسية",
    desc: "تناسب الفرق الصغيرة في بداية الطريق",
    price: 590,
    features: [
      "حتى 10 مستخدمين",
      "مساحة تخزين 10 GB",
      "2,000 عميل محتمل",
      "تقارير أساسية",
      "قوالب إشعارات جاهزة",
      "دعم عبر البريد الإلكتروني",
    ],
  },
  {
    id: "pro",
    name: "الاحترافية",
    desc: "الأنسب لنمو المبيعات — باقة الشركات",
    price: 1490,
    features: [
      "حتى 60 مستخدماً",
      "مساحة تخزين 50 GB",
      "10,000 عميل محتمل",
      "تقارير متقدمة ولوحات المبيعات",
      "أتمتة المتابعات وقوالب الحجوزات",
      "دعم عبر أولوية وربط API",
    ],
  },
  {
    id: "ent",
    name: "المؤسسات",
    desc: "تشغيل مخصص لعدة فروع — حسب الاحتياج",
    price: null,
    features: [
      "مستخدمون غير محدودين",
      "مساحة تخزين 500 GB",
      "عملاء محتملون غير محدودين",
      "صلاحيات متقدمة وسجل تدقيق كامل",
      "مدير حساب مخصص وتدريب دوري",
      "اتفاقيات مستوى الخدمة",
    ],
  },
];
const USAGE = [
  ["المستخدمون", 40, 60, "40 / 60", "bg-[#FF7E52]"],
  ["العملاء المحتملون", 8400, 10000, "8,400 / 10,000", "bg-[#FF7E52]"],
  ["مساحة التخزين", 30, 50, "30 / 50 GB", "bg-ink"],
  ["رسائل البريد الشهرية", 5200, 10000, "5,200 / 10,000", "bg-ink"],
];
const INVOICES = [
  ["INV-2026-010", "13 أكتوبر 2026", 1490],
  ["INV-2026-009", "13 سبتمبر 2026", 1490],
  ["INV-2026-008", "13 أغسطس 2026", 1490],
  ["INV-2026-007", "13 يوليو 2026", 1490],
  ["INV-2026-006", "13 يونيو 2026", 590],
];

export default function SubscriptionPlan() {
  const [current, setCurrent] = useState("pro");
  const [period, setPeriod] = useState("monthly");
  const [editPay, setEditPay] = useState(false);
  const [pay, setPay] = useState({
    last4: "4242",
    email: "billing@example.com",
  });
  const [toast, show] = useToast();
  const cur = PLANS.find((p) => p.id === current);
  const price = (p) => (period === "yearly" ? Math.round(p * 0.8) : p);

  const choose = (p) => {
    if (p.id === current) return;
    if (!p.price) return show("تم إرسال طلب التواصل مع المبيعات");
    setCurrent(p.id);
    show(`تم التحويل إلى باقة ${p.name}`);
  };

  return (
    <div dir="rtl" className="">
      <PageHeader
        title="خطة الاشتراك"
        subtitle="إدارة باقتك الحالية والاستهلاك والفواتير وطرق الدفع"
      >
        <button
          className={btnDark}
          onClick={() => show("أحدث باقة متاحة بالفعل ضمن الباقات أدناه")}
        >
          ترقية الباقة
        </button>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="rounded-xl bg-ink p-5 text-white">
          <span className="rounded-full bg-[#FF7E52] px-2.5 py-0.5 text-[10px] font-semibold">
            الباقة الحالية
          </span>
          <h2 className="mt-3 text-[22px] font-bold">{cur.name}</h2>
          <div className="mt-2 flex items-baseline gap-1" dir="ltr">
            <span className="text-[26px] font-bold">
              {cur.price ? egp(price(cur.price)) : "مخصص"}
            </span>
            <span className="text-[10px] text-neutral-400">
              / {period === "yearly" ? "شهرياً (سنوي)" : "شهرياً"}
            </span>
          </div>
          <dl className="mt-4 space-y-2 border-t border-white/10 pt-3 text-[11px]">
            {[
              ["حالة الاشتراك", "نشط"],
              ["دورة الفوترة", period === "yearly" ? "سنوي" : "شهري"],
              ["تاريخ البداية", "13 أكتوبر 2026"],
              ["التجديد القادم", "13 نوفمبر 2026"],
              ["طريقة الدفع", `VISA •••• ${pay.last4}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <dt className="text-neutral-400">{k}</dt>
                <dd className="font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => show("تم فتح إدارة الاشتراك")}
              className="h-8 flex-1 rounded-full bg-white text-[11px] font-semibold text-ink"
            >
              إدارة الاشتراك
            </button>
            <button
              onClick={() => show("تم إيقاف تجديد الاشتراك")}
              className="h-8 flex-1 rounded-full border border-white/30 text-[11px] font-semibold"
            >
              إلغاء الاشتراك
            </button>
          </div>
        </div>

        <div className={`${card} p-5`}>
          <h3 className="text-[14px] font-semibold">استهلاك الاشتراك</h3>
          <p className="text-[10.5px] text-neutral-500">
            الاستخدام الحالي مقارنة بحدود باقتك
          </p>
          <div className="mt-4 space-y-4">
            {USAGE.map(([n, v, max, t, c]) => (
              <div key={n}>
                <div className="mb-1 flex justify-between text-[11px]">
                  <span className="font-semibold">{n}</span>
                  <span dir="ltr" className="text-neutral-500">
                    {t}
                  </span>
                </div>
                <div className="h-[5px] rounded-full bg-neutral-200">
                  <div
                    className={`h-full rounded-full ${c}`}
                    style={{ width: `${(v / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg bg-[#FFF1EC] px-3 py-2 text-[10.5px] text-[#E4572E]">
            اقتربت من الحد الأقصى للعملاء المحتملين — يمكنك الترقية لباقة أعلى.
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-[16px] font-semibold">الباقات المتاحة</h3>
          <p className="text-[10.5px] text-neutral-500">
            اختر الباقة الأنسب لحجم فريقك
          </p>
        </div>
        <div className="flex rounded-full bg-[#F1F2F4] p-0.5 text-[10.5px] font-semibold">
          {[
            ["monthly", "شهري"],
            ["yearly", "سنوي"],
          ].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setPeriod(k)}
              className={`h-6 rounded-full px-3 ${period === k ? "bg-ink text-white" : "text-neutral-500"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => {
          const is = p.id === current;
          return (
            <div
              key={p.id}
              className={`rounded-xl bg-white p-5 ${is ? "border-2 border-ink" : "border border-line"}`}
            >
              {is && (
                <span className="rounded-full bg-[#FF7E52] px-2 py-0.5 text-[9.5px] font-semibold text-white">
                  الباقة الحالية
                </span>
              )}
              <h4 className="mt-2 text-[15px] font-semibold">{p.name}</h4>
              <p className="text-[10.5px] text-neutral-500">{p.desc}</p>
              <div
                className="mt-3 text-[24px] font-bold"
                dir="ltr"
                style={{ textAlign: "right" }}
              >
                {p.price ? egp(price(p.price)) : "مخصص"}
                {p.price && (
                  <span className="ms-1 text-[10px] font-normal text-neutral-500">
                    / شهرياً
                  </span>
                )}
              </div>
              <button
                onClick={() => choose(p)}
                disabled={is}
                className={`mt-3 h-9 w-full rounded-full text-[11.5px] font-semibold ${is ? "bg-[#F1F2F4] text-neutral-500" : p.price ? "border border-line bg-white text-ink hover:bg-neutral-50" : "bg-ink text-white"}`}
              >
                {is
                  ? "الباقة الحالية"
                  : p.price
                    ? "التحويل لهذه الباقة"
                    : "تواصل مع المبيعات"}
              </button>
              <ul className="mt-4 space-y-2.5">
                {p.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-[11px] text-neutral-700"
                  >
                    <Check size={12} className="shrink-0 text-emerald-600" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className={`${card} p-5`}>
          <h3 className="text-[14px] font-semibold">طريقة الدفع</h3>
          <p className="mb-3 text-[10.5px] text-neutral-500">
            البطاقة المستخدمة في التجديد التلقائي
          </p>
          <div className="rounded-xl bg-ink p-4 text-white">
            <div className="flex justify-between text-[11px]">
              <span className="font-bold italic">VISA</span>
              <span className="text-neutral-400">بطاقة ائتمان</span>
            </div>
            <div className="mt-6 text-[15px] tracking-[3px]" dir="ltr">
              •••• •••• •••• {pay.last4}
            </div>
            <div className="mt-3 flex justify-between text-[10px] text-neutral-400">
              <span>ينتهي 08/28</span>
              <span>شركة الأعمال</span>
            </div>
          </div>
          <div className="mt-3 text-[10.5px] text-neutral-500">
            بريد الفوترة
          </div>
          {editPay ? (
            <div className="mt-1 space-y-2">
              <input
                dir="ltr"
                value={pay.email}
                onChange={(e) => setPay({ ...pay, email: e.target.value })}
                className="h-9 w-full rounded-lg border border-line px-3 text-[11px]"
              />
              <input
                dir="ltr"
                maxLength={4}
                value={pay.last4}
                onChange={(e) =>
                  setPay({ ...pay, last4: e.target.value.replace(/\D/g, "") })
                }
                className="h-9 w-full rounded-lg border border-line px-3 text-[11px]"
              />
            </div>
          ) : (
            <div
              dir="ltr"
              className="mt-1 rounded-lg bg-[#F5F5F5] px-3 py-2 text-[11px]"
            >
              {pay.email}
            </div>
          )}
          <button
            onClick={() => {
              if (editPay) show("تم تحديث طريقة الدفع");
              setEditPay(!editPay);
            }}
            className="mt-3 h-9 w-full rounded-full border border-line text-[11.5px] font-semibold"
          >
            {editPay ? "حفظ طريقة الدفع" : "تحديث طريقة الدفع"}
          </button>
        </div>

        <div className={`${card} overflow-hidden`}>
          <div className="flex items-start justify-between p-5 pb-3">
            <div>
              <h3 className="text-[14px] font-semibold">سجل الفواتير</h3>
              <p className="text-[10.5px] text-neutral-500">
                آخر 5 فواتير للاشتراك
              </p>
            </div>
            <button
              onClick={() =>
                downloadCsv(
                  "invoices.csv",
                  ["الفاتورة", "التاريخ", "المبلغ"],
                  INVOICES,
                )
              }
              className="inline-flex h-7 items-center gap-1 rounded-lg border border-line px-2.5 text-[10.5px] font-semibold"
            >
              <Download size={11} />
              تحميل الكل
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={th}>رقم الفاتورة</th>
                  <th className={th}>التاريخ</th>
                  <th className={th}>المبلغ</th>
                  <th className={th}>الحالة</th>
                  <th className={th}>تحميل</th>
                </tr>
              </thead>
              <tbody>
                {INVOICES.map(([id, d, a]) => (
                  <tr key={id} className="border-t border-line">
                    <td className={td} dir="ltr" style={{ textAlign: "right" }}>
                      {id}
                    </td>
                    <td className={td}>{d}</td>
                    <td className={td}>{egp(a)}</td>
                    <td className={td}>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                        مدفوعة
                      </span>
                    </td>
                    <td className={td}>
                      <button
                        aria-label="تحميل"
                        onClick={() =>
                          downloadCsv(
                            `${id}.csv`,
                            ["الفاتورة", "التاريخ", "المبلغ"],
                            [[id, d, a]],
                          )
                        }
                      >
                        <Download size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {toast}
    </div>
  );
}
