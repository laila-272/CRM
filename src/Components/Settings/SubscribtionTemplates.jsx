import { useState, useRef } from "react";
import {
  PageHeader,
  card,
  btnDark,
  btnLight,
  Chip,
  SearchBox,
  Select,
} from "../Shared/ui.jsx";
import { Switch, useToast, field } from "./SettingsKit.jsx";

const CATS = ["الكل", "الطلبات", "المواعيد", "الحجوزات", "عامة"];
const CHANNELS = ["داخل النظام", "بريد إلكتروني", "SMS", "واتساب"];
const VARS = [
  "{اسم_العميل}",
  "{رقم_العقد}",
  "{قيمة_العقد}",
  "{تاريخ_الانتهاء}",
  "{اسم_المسؤول}",
];
const SAMPLE = {
  "{اسم_العميل}": "خالد منصور",
  "{رقم_العقد}": "CT-2026-041",
  "{قيمة_العقد}": "480,000 ج.م",
  "{تاريخ_الانتهاء}": "25 نوفمبر 2026",
  "{اسم_المسؤول}": "سارة أحمد",
};
const EVENTS = [
  "قبل انتهاء العقد بـ 30 يوماً",
  "عند إنشاء طلب جديد",
  "قبل الموعد بـ 24 ساعة",
  "عند تأكيد الحجز",
];

const INITIAL = [
  {
    id: 1,
    cat: "الحجوزات",
    name: "تنبيه قرب انتهاء العقد",
    event: EVENTS[0],
    on: true,
    channels: ["داخل النظام", "بريد إلكتروني"],
    subject: "تنبيه: عقدك رقم {رقم_العقد} قارب على الانتهاء",
    body: "مرحباً {اسم_العميل}،\nنود تذكيرك بأن عقدك رقم {رقم_العقد} بقيمة {قيمة_العقد} سينتهي يوم {تاريخ_الانتهاء}.\nلو رغبت بتجديد أو تعديل الشروط، تواصل مع {اسم_المسؤول}.\nشكراً لثقتك.",
  },
  {
    id: 2,
    cat: "المواعيد",
    name: "تنبيه متابعة هاتفية",
    event: EVENTS[2],
    on: true,
    channels: ["داخل النظام", "واتساب"],
    subject: "تذكير بالمتابعة مع {اسم_العميل}",
    body: "مرحباً {اسم_المسؤول}،\nلديك متابعة مع {اسم_العميل} غداً.",
  },
  {
    id: 3,
    cat: "المواعيد",
    name: "تذكير بالاجتماع القادم",
    event: EVENTS[2],
    on: true,
    channels: ["SMS"],
    subject: "تذكير بالاجتماع",
    body: "مرحباً {اسم_العميل}،\nموعدك غداً مع {اسم_المسؤول}.",
  },
  {
    id: 4,
    cat: "الطلبات",
    name: "ترحيب بعميل جديد",
    event: EVENTS[1],
    on: false,
    channels: ["بريد إلكتروني"],
    subject: "أهلاً بك {اسم_العميل}",
    body: "مرحباً {اسم_العميل}،\nيسعدنا انضمامك.",
  },
  {
    id: 5,
    cat: "عامة",
    name: "تأكيد استلام دفعة",
    event: EVENTS[3],
    on: true,
    channels: ["بريد إلكتروني", "SMS"],
    subject: "تم استلام دفعتك",
    body: "شكراً {اسم_العميل}،\nتم استلام دفعة بقيمة {قيمة_العقد}.",
  },
  {
    id: 6,
    cat: "عامة",
    name: "الملخص اليومي",
    event: EVENTS[1],
    on: true,
    channels: ["بريد إلكتروني"],
    subject: "ملخص يومك",
    body: "صباح الخير {اسم_المسؤول}،\nهذا ملخص نشاط اليوم.",
  },
];

const fill = (s) =>
  Object.entries(SAMPLE).reduce((t, [k, v]) => t.split(k).join(v), s);

export default function NotificationTemplates() {
  const [items, setItems] = useState(INITIAL);
  const [sel, setSel] = useState(1);
  const [cat, setCat] = useState("الكل");
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState(INITIAL[0]);
  const [toast, show] = useToast();
  const bodyRef = useRef();

  const list = items.filter(
    (i) => (cat === "الكل" || i.cat === cat) && i.name.includes(q),
  );
  const pick = (i) => {
    setSel(i.id);
    setDraft(i);
  };
  const toggle = (id, on) => {
    setItems(items.map((i) => (i.id === id ? { ...i, on } : i)));
    if (id === sel) setDraft((d) => ({ ...d, on }));
  };
  const insert = (v) => {
    const el = bodyRef.current;
    const s = el ? el.selectionStart : draft.body.length;
    const e = el ? el.selectionEnd : s;
    setDraft({
      ...draft,
      body: draft.body.slice(0, s) + v + draft.body.slice(e),
    });
  };
  const toggleCh = (c) =>
    setDraft({
      ...draft,
      channels: draft.channels.includes(c)
        ? draft.channels.filter((x) => x !== c)
        : [...draft.channels, c],
    });
  const save = () => {
    if (!draft.name.trim() || !draft.subject.trim())
      return show("اسم القالب وعنوان الرسالة مطلوبان");
    setItems(items.map((i) => (i.id === sel ? draft : i)));
    show("تم حفظ التعديلات");
  };
  const addNew = () => {
    const n = {
      id: Date.now(),
      cat: "عامة",
      name: "قالب جديد",
      event: EVENTS[0],
      on: false,
      channels: ["داخل النظام"],
      subject: "عنوان جديد",
      body: "",
    };
    setItems([n, ...items]);
    pick(n);
  };

  return (
    <div dir="rtl" className="">
      <PageHeader
        title="قوالب الإشعارات"
        subtitle="تحكم في نص الرسائل التلقائية والقنوات التي تُرسل منها"
      >
        <button className={btnDark} onClick={addNew}>
          قالب جديد
        </button>
      </PageHeader>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className={`${card} order-2 p-5 lg:order-2`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-[14px] font-semibold">{draft.name}</h3>
              <p className="text-[10.5px] text-neutral-500">
                يُرسل تلقائياً: {draft.event}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${draft.on ? "bg-emerald-50 text-emerald-600" : "bg-neutral-100 text-neutral-500"}`}
              >
                {draft.on ? "مفعّل" : "متوقف"}
              </span>
              <Switch
                on={draft.on}
                onChange={(v) => toggle(sel, v)}
                label="تفعيل القالب"
              />
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-[10.5px] text-neutral-500">
              اسم القالب
              <input
                className={`${field} mt-1`}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>
            <label className="text-[10.5px] text-neutral-500">
              الحدث المُشغِّل
              <div className="mt-1">
                <Select
                  value={draft.event}
                  onChange={(v) => setDraft({ ...draft, event: v })}
                  className="!h-10 !bg-[#F5F5F5] !border-transparent"
                >
                  {EVENTS.map((e) => (
                    <option key={e}>{e}</option>
                  ))}
                </Select>
              </div>
            </label>
          </div>

          <div className="mt-4 text-[10.5px] text-neutral-500">
            قنوات الإرسال
          </div>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {CHANNELS.map((c) => (
              <Chip
                key={c}
                active={draft.channels.includes(c)}
                onClick={() => toggleCh(c)}
              >
                {c}
              </Chip>
            ))}
          </div>

          <label className="mt-4 block text-[10.5px] text-neutral-500">
            عنوان الرسالة (للبريد)
            <input
              className={`${field} mt-1`}
              value={draft.subject}
              onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
            />
          </label>
          <label className="mt-3 block text-[10.5px] text-neutral-500">
            نص الرسالة
            <textarea
              ref={bodyRef}
              rows={5}
              className="mt-1 w-full resize-none rounded-lg border border-transparent bg-[#F5F5F5] p-3 text-[12px] leading-6 text-ink outline-none focus:border-neutral-400"
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            />
          </label>

          <div className="mt-3 text-[10.5px] text-neutral-500">
            المتغيرات المتاحة — اضغط لإدراجها في النص
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {VARS.map((v) => (
              <button
                key={v}
                onClick={() => insert(v)}
                className="rounded-md bg-[#FFF1EC] px-2 py-1 text-[10px] font-semibold text-[#E4572E]"
              >
                {v}
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl bg-[#F5F5F5] p-3">
            <div className="mb-2 text-[10.5px] text-neutral-500">
              معاينة الرسالة
            </div>
            <div className="rounded-lg bg-white p-4 text-[11.5px] leading-6">
              <div className="font-semibold">{fill(draft.subject)}</div>
              <div className="mt-2 whitespace-pre-line text-neutral-700">
                {fill(draft.body)}
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button className={btnDark} onClick={save}>
              حفظ التغييرات
            </button>
            <button
              className={btnLight}
              onClick={() =>
                show(
                  `تم إرسال رسالة تجريبية عبر: ${draft.channels.join("، ") || "—"}`,
                )
              }
            >
              إرسال رسالة تجريبية
            </button>
          </div>
        </div>

        <div className={`${card} order-1 p-4 lg:order-1`}>
          <h3 className="text-[14px] font-semibold">القوالب</h3>
          <p className="mb-3 text-[10.5px] text-neutral-500">
            {items.length} قوالب · {items.filter((i) => i.on).length} مفعّلة
          </p>
          <SearchBox
            value={q}
            onChange={setQ}
            placeholder="بحث في القوالب..."
          />
          <div className="my-3 flex flex-wrap gap-1.5">
            {CATS.map((c) => (
              <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
                {c}
              </Chip>
            ))}
          </div>
          <div className="space-y-2">
            {list.map((i) => (
              <div
                key={i.id}
                onClick={() => pick(i)}
                className={`cursor-pointer rounded-xl border p-3 ${sel === i.id ? "border-2 border-ink" : "border-line"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11.5px] font-semibold">{i.name}</span>
                  <span onClick={(e) => e.stopPropagation()}>
                    <Switch
                      on={i.on}
                      onChange={(v) => toggle(i.id, v)}
                      label={i.name}
                    />
                  </span>
                </div>
                <div className="mt-0.5 text-[10px] text-neutral-500">
                  {i.event}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {i.channels.map((c) => (
                    <span
                      key={c}
                      className="rounded bg-[#F1F2F4] px-1.5 py-0.5 text-[9px] text-neutral-500"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ))}
            {!list.length && (
              <div className="py-6 text-center text-[11px] text-neutral-400">
                لا توجد قوالب مطابقة
              </div>
            )}
          </div>
        </div>
      </div>
      {toast}
    </div>
  );
}
