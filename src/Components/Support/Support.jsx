import { useState } from "react";
import { Clock, Mail, Plus, Send, Smile, Timer, X } from "lucide-react";
import { PageHeader, Select, card, btnDark, btnLight } from "../Shared/ui.jsx";
import { Toast, useToast } from "../CRMPages/TaskModal.jsx";

/* ---------- static display data (as in the reference design) ---------- */
const RATINGS = [
  { label: "ممتاز", count: 79, unit: "تقييمًا", bar: "bg-ink" },
  { label: "جيد", count: 31, unit: "تقييمًا", bar: "bg-neutral-400" },
  { label: "متوسط", count: 13, unit: "تقييمًا", bar: "bg-neutral-400" },
  { label: "ضعيف", count: 5, unit: "تقييمات", bar: "bg-neutral-300" },
];
const ARTICLES = [
  { title: "كيفية تجديد الاشتراك", reads: 211 },
  { title: "إعداد المصادقة الثنائية", reads: 167 },
  { title: "طلب تعديل بيانات الفاتورة", reads: 122 },
  { title: "جدولة اجتماع مع الفريق", reads: 96 },
];
const SEED_INQUIRIES = [
  {
    id: "i1",
    name: "هاني عبد الرحمن",
    company: "شركة آفاق التقنية",
    kind: "جديد",
    channel: "إيميل",
    time: "اليوم 08:40",
    message:
      "أرجو توضيح آلية تجديد الاشتراك السنوي، وهل يمكن السداد على أقساط؟",
    owner: "سارة أحمد",
  },
  {
    id: "i2",
    name: "ميرا إبراهيم",
    company: "مؤسسة الندى",
    kind: "عاجل",
    channel: "هاتف",
    time: "اليوم 08:40",
    message: "لم يصلني تأكيد الاجتماع المحتمل يوم الأحد، أرجو المراجعة.",
    owner: "ماجد الرفاعي",
  },
  {
    id: "i3",
    name: "ليلى العلي",
    company: "مجموعة النخبة",
    kind: "مكتمل",
    channel: "إيميل",
    time: "أمس 14:20",
    message: "سعدت بتجربة التسليم وأتمنى إضافة تقارير أسبوعية تلقائية.",
    owner: "ميرا أحمد",
  },
  {
    id: "i4",
    name: "فهد الدوسري",
    company: "شركة ثمر",
    kind: "استبيان",
    channel: "استبيان",
    time: "أمس 11:05",
    message: "تقييم 5 من 5: فريق ممتاز وسريع الاستجابة.",
    owner: "ميرا أحمد",
  },
];
const KINDS = ["جديد", "عاجل", "مكتمل", "استبيان"];
const CHANNELS = ["إيميل", "هاتف", "واتساب", "استبيان"];
const NOTES_KEY = "crm.support.notes.v1"; // only notes added by the user are stored

const loadNotes = () => {
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY)) || [];
  } catch {
    return [];
  }
};
const SURVEY_TEXT =
  "نشكرك على تعاملك معنا. يسعدنا أن نعرف رأيك في الخدمة، ويستغرق الاستبيان أقل من دقيقة.";

/* ---------- small local pieces ---------- */
function SupportStat({ icon: Icon, label, value, badge, tone = "green" }) {
  const tones = {
    green: "bg-green-50 text-green-600",
    red: "bg-red-50 text-red-500",
  };
  return (
    <div className={`${card} p-4`}>
      <div className="flex items-start justify-between gap-2">
        <span className="grid h-7 w-7 bg-[#E7E8EA] shrink-0 place-items-center rounded-lg border border-line text-neutral-500">
          <Icon size={13} />
        </span>
        <span className="text-[11.5px] font-semibold text-ink">{label}</span>
      </div>
      <div className="mt-3 text-[26px] font-bold leading-none text-ink">
        {value}
      </div>
      <span
        className={`mt-3 inline-block rounded-md px-2 py-0.5 text-[10px] ${tones[tone]}`}
      >
        {badge}
      </span>
    </div>
  );
}

const inputCls = (err) =>
  `w-full h-9 rounded-lg border bg-white px-3 text-[12px] outline-none focus:border-neutral-500 placeholder:text-neutral-400 ${err ? "border-red-400" : "border-line"}`;

function NoteModal({ onSave, onClose }) {
  const [f, setF] = useState({
    name: "",
    company: "",
    kind: "جديد",
    channel: "إيميل",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => {
    setF({ ...f, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: undefined });
  };
  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (f.name.trim().length < 2) err.name = "اسم العميل مطلوب";
    if (f.message.trim().length < 3) err.message = "نص الملاحظة مطلوب";
    setErrors(err);
    if (Object.keys(err).length) return;
    onSave({
      ...f,
      name: f.name.trim(),
      company: f.company.trim() || "—",
      message: f.message.trim(),
    });
  };
  const Field = ({ label, error, children }) => (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold text-ink">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-[10px] text-red-500">{error}</span>
      )}
    </label>
  );
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
        className="mx-auto mt-10 w-full max-w-[460px] rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-ink">تسجيل ملاحظة</h2>
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
          <Field label="العميل *" error={errors.name}>
            <input
              className={inputCls(errors.name)}
              value={f.name}
              onChange={set("name")}
              placeholder="اسم العميل"
            />
          </Field>
          <Field label="الشركة">
            <input
              className={inputCls()}
              value={f.company}
              onChange={set("company")}
              placeholder="اسم الشركة"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="النوع">
              <select
                className={inputCls()}
                value={f.kind}
                onChange={set("kind")}
              >
                {KINDS.map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </Field>
            <Field label="القناة">
              <select
                className={inputCls()}
                value={f.channel}
                onChange={set("channel")}
              >
                {CHANNELS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="الملاحظة *" error={errors.message}>
            <textarea
              rows={3}
              className="w-full resize-none rounded-lg border border-line p-3 text-[12px] outline-none focus:border-neutral-500"
              value={f.message}
              onChange={set("message")}
              placeholder="نص الاستفسار أو الملاحظة"
            />
          </Field>
        </div>
        <div className="mt-5 flex items-center gap-2 border-t border-line pt-4">
          <button
            type="submit"
            className={`${btnDark} !rounded-full !h-9 px-5`}
          >
            حفظ الملاحظة
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-2 text-[11.5px] text-neutral-500 hover:text-ink"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Support() {
  const [notes, setNotes] = useState(loadNotes);
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(false);
  const [toast, notify] = useToast();

  const inquiries = [...notes, ...SEED_INQUIRIES];
  const shown =
    filter === "all" ? inquiries : inquiries.filter((i) => i.kind === filter);
  const maxRating = Math.max(...RATINGS.map((r) => r.count));

  const addNote = (n) => {
    const d = new Date();
    const time = `اليوم ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    const next = [
      { ...n, id: `n${Date.now()}`, time, owner: "محمد العمري" },
      ...notes,
    ];
    setNotes(next);
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setModal(false);
    notify("تم تسجيل الملاحظة");
  };
  const sendSurvey = async () => {
    try {
      await navigator.clipboard.writeText(SURVEY_TEXT);
      notify("تم نسخ رسالة الاستبيان");
    } catch {
      notify("تعذر النسخ");
    }
  };

  return (
    <div dir="rtl" className="max-w-full">
      <PageHeader
        title="الدعم وخدمة العملاء"
        subtitle="متابعة استفسارات العملاء وملاحظاتهم ومستوى رضاهم"
      >
        <button onClick={() => setModal(true)} className={btnDark}>
          <Plus size={13} /> تسجيل ملاحظة
        </button>
        <button onClick={sendSurvey} className={`${btnLight} !rounded-md`}>
          <Send size={12} /> إرسال استبيان
        </button>
      </PageHeader>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SupportStat
          icon={Smile}
          label="متوسط رضا العملاء"
          value="4.6 / 5"
          badge="+0.2 عن الشهر الماضي"
        />
        <SupportStat
          icon={Mail}
          label="استبيانات مكتملة"
          value={RATINGS.reduce((s, r) => s + r.count, 0)}
          badge="+17 هذا الشهر"
        />
        <SupportStat
          icon={Timer}
          label="متوسط وقت الرد"
          value="2.4 ساعة"
          badge="−18 دقيقة عن الشهر الماضي"
        />
        <SupportStat
          icon={Clock}
          label="عملاء بحاجة لمتابعة"
          value="7"
          badge="2 تجاوزوا الموعد"
          tone="red"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_260px]">
        <section className={`${card} min-w-0 p-4`}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-[15px] font-semibold text-ink">
                استفسارات وملاحظات العملاء
              </h2>
              <p className="mt-0.5 text-[10.5px] text-neutral-500">
                آخر ما وصلنا من العملاء عبر القنوات المختلفة
              </p>
            </div>
            <div className="w-[120px]">
              <Select value={filter} onChange={setFilter}>
                <option value="all">عرض الكل</option>
                {KINDS.map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </Select>
            </div>
          </div>

          <ul className="mt-3 divide-y divide-line">
            {shown.map((i) => (
              <li key={i.id} className="py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-neutral-100 text-[11px] font-bold text-ink">
                      {i.name[0]}
                    </span>
                    <div className="leading-tight">
                      <div className="text-[12.5px] font-bold text-ink">
                        {i.name}
                      </div>
                      <div className="mt-0.5 text-[10px] text-neutral-400">
                        {i.company}
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[10px] ${i.kind === "عاجل" ? "bg-red-50 text-red-500" : "bg-neutral-100 text-neutral-600"}`}
                    >
                      {i.kind}
                      {i.kind === "جديد" ? ` (${i.channel})` : ""}
                    </span>
                    <div className="mt-1 text-[9.5px] text-neutral-400">
                      {i.time}
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-[11.5px] text-ink">{i.message}</p>
                <p className="mt-1.5 text-[10px] text-neutral-400">
                  المسؤول: {i.owner}
                </p>
              </li>
            ))}
            {!shown.length && (
              <li className="py-8 text-center text-[11px] text-neutral-400">
                لا توجد عناصر مطابقة
              </li>
            )}
          </ul>
        </section>

        <aside className="space-y-4">
          <section className={`${card} p-4`}>
            <h2 className="text-[15px] font-semibold text-ink">رضا العملاء</h2>
            <p className="mb-3 mt-0.5 text-[10.5px] text-neutral-500">
              توزيع التقييمات التفصيلية
            </p>
            <ul className="space-y-3">
              {RATINGS.map((r) => (
                <li key={r.label}>
                  <div className="mb-1 flex items-center justify-between text-[10.5px]">
                    <span className="font-semibold text-ink">{r.label}</span>
                    <span className="text-neutral-400">
                      {r.count} {r.unit}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-neutral-100">
                    <div
                      className={`h-full rounded-full ${r.bar}`}
                      style={{ width: `${(r.count / maxRating) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className={`${card} p-4`}>
            <h2 className="text-[15px] font-semibold text-ink">
              المقالات الأكثر قراءة
            </h2>
            <p className="mb-3 mt-0.5 text-[10.5px] text-neutral-500">
              قاعدة المعرفة للعملاء والفريق
            </p>
            <ul className="space-y-2.5">
              {ARTICLES.map((a) => (
                <li
                  key={a.title}
                  className="flex items-center justify-between gap-2 border-b border-line py-2"
                >
                  <span className="text-[11px] font-semibold text-ink">
                    {a.title}
                  </span>
                  <span className="shrink-0 rounded-md bg-neutral-100 px-2 py-0.5 text-[9.5px] text-neutral-500">
                    {a.reads} قراءة
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      {modal && <NoteModal onSave={addNote} onClose={() => setModal(false)} />}
      <Toast message={toast} />
    </div>
  );
}
