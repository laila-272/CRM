import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronDown, MessageCircle } from "lucide-react";
import {
  getDeal,
  updateDeal,
  STAGES,
  CLOSING_STAGE,
  money,
} from "../../data/deals.js";

const NOTE_TYPES = ["ملاحظة", "اجتماع", "إيميل", "واتساب", "مكالمة"];

const nowLabel = () =>
  "اليوم " +
  new Date().toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });

function Card({ title, children, className = "" }) {
  return (
    <section
      className={`bg-white border border-line rounded-xl p-4 ${className}`}
    >
      {title && (
        <h2 className="text-[13px] font-extrabold text-ink mb-3.5">{title}</h2>
      )}
      {children}
    </section>
  );
}

function Field({ label, value }) {
  return (
    <div className="min-w-0">
      <div className="text-[9.5px] text-neutral-400">{label}</div>
      <div
        className="mt-1 text-[11.5px] font-bold text-ink break-words"
        dir="auto"
      >
        {value}
      </div>
    </div>
  );
}

function Metric({ label, value, sub, subCls = "text-neutral-400" }) {
  return (
    <div className="bg-white border border-line rounded-xl p-4">
      <div className="text-[10.5px] text-neutral-500">{label}</div>
      <div
        className="mt-2 text-[24px] leading-none font-extrabold text-ink"
        dir="ltr"
        style={{ textAlign: "right" }}
      >
        {value}
      </div>
      <div className={`mt-2 text-[9.5px] ${subCls}`}>{sub}</div>
    </div>
  );
}

export default function DealDetails() {
  const { id } = useParams();
  const [deal, setDeal] = useState(() => getDeal(id));
  const [noteType, setNoteType] = useState(NOTE_TYPES[0]);
  const [text, setText] = useState("");

  if (!deal) {
    return (
      <div dir="rtl" className="p-10 text-center">
        <p className="text-[13px] font-bold text-ink">
          لم يتم العثور على الصفقة
        </p>
        <p className="mt-1 text-[11px] text-neutral-500">
          قد تكون محذوفة أو أن الرابط غير صحيح.
        </p>
        <Link
          to="/deals"
          className="inline-block mt-4 h-8 leading-8 rounded-full bg-ink text-white px-4 text-[11.5px]"
        >
          العودة إلى الصفقات
        </Link>
      </div>
    );
  }

  const commission = (deal.value * deal.commissionRate) / 100;
  const stage = deal.stage;

  const moveStage = (next) => {
    if (next === stage) return;
    setDeal(
      updateDeal(deal.id, (d) => ({
        stage: next,
        stageDates: STAGES.map((_, i) => d.stageDates[i])
          .slice(0, next + 1)
          .map((v, i) => v || "اليوم"),
        updatedAt: nowLabel(),
        log: [
          {
            id: Date.now(),
            kind: "مرحلة",
            text: `تم نقل الصفقة إلى مرحلة «${STAGES[next]}»`,
            when: nowLabel(),
            by: d.owner,
            done: true,
          },
          ...d.log,
        ],
      })),
    );
  };

  const saveNote = () => {
    const t = text.trim();
    if (!t) return;
    setDeal(
      updateDeal(deal.id, (d) => ({
        updatedAt: nowLabel(),
        notes: [
          { id: Date.now(), kind: noteType, text: t, when: nowLabel() },
          ...d.notes,
        ],
        log: [
          {
            id: Date.now() + 1,
            kind: noteType,
            text: t,
            when: nowLabel(),
            by: d.owner,
            done: true,
          },
          ...d.log,
        ],
      })),
    );
    setText("");
  };

  const wa = `https://wa.me/2${deal.phone.replace(/^0/, "")}`;

  return (
    <div dir="rtl" className=" max-w-full">
      {" "}
      <Link
        to="/deals"
        className="text-[10.5px] text-neutral-500 hover:text-ink"
      >
        → الصفقات
      </Link>
      {/* Header */}
      <div className="mt-2 flex flex-col-reverse lg:flex-row lg:items-start lg:justify-between gap-3">
        <div className="flex items-center gap-2 lg:order-2">
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            aria-label="واتساب"
            className="w-8 h-8 rounded-lg bg-green-500 text-white grid place-items-center"
          >
            <MessageCircle size={15} />
          </a>
          <div className="relative">
            <select
              value={stage}
              onChange={(e) => moveStage(Number(e.target.value))}
              aria-label="تغيير المرحلة"
              className="appearance-none h-8 rounded-lg border border-line bg-white pr-3 pl-7 text-[11px] text-ink outline-none cursor-pointer"
            >
              {STAGES.map((s, i) => (
                <option key={s} value={i}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown
              size={11}
              className="absolute top-1/2 -translate-y-1/2 left-2 text-neutral-400 pointer-events-none"
            />
          </div>
          <button
            onClick={() => moveStage(CLOSING_STAGE)}
            disabled={stage === CLOSING_STAGE}
            className="h-8 rounded-lg bg-ink text-white px-3 text-[11px] font-semibold disabled:opacity-40"
          >
            + تحويل إلى تعاقد
          </button>
        </div>

        <div className="lg:order-1">
          <div className="flex items-center gap-2">
            <h1 className="text-[22px] font-extrabold text-ink leading-tight">
              {deal.title}
            </h1>
            <span className="text-[10px] font-semibold bg-orange-50 text-orange-600 rounded-full px-2.5 py-0.5">
              {STAGES[stage]}
            </span>
          </div>
          <p className="mt-1.5 text-[10.5px] text-neutral-500">
            العميل: {deal.customer} · {deal.company} · أنشئت {deal.createdAt} ·
            آخر تحديث {deal.updatedAt}
          </p>
        </div>
      </div>
      {/* Metrics */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric
          label="احتمالية الإغلاق"
          value={`${deal.probability}%`}
          sub={deal.probability >= 70 ? "فرصة قوية (+70%)" : "فرصة متوسطة"}
          subCls={
            deal.probability >= 70 ? "text-orange-600" : "text-neutral-400"
          }
        />
        <Metric
          label="قيمة الصفقة"
          value={money(deal.value)}
          sub={`عرض السعر رقم ${deal.number}`}
        />
        <Metric
          label="الإغلاق المتوقع"
          value={deal.expectedClose}
          sub={`بعد ${deal.ageDays} يومًا من الإنشاء`}
        />
        <Metric
          label="العمولة المتوقعة"
          value={money(commission)}
          sub={`${deal.commissionRate}% من قيمة الصفقة`}
        />
      </div>
      {/* Pipeline */}
      <Card title="مرحلة الصفقة" className="mt-4">
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {STAGES.map((s, i) => {
            const state = i < stage ? "done" : i === stage ? "current" : "todo";
            return (
              <div key={s} className="min-w-0">
                <div
                  className={`h-1 rounded-full ${
                    state === "current"
                      ? "bg-orange-500"
                      : state === "done"
                        ? "bg-ink"
                        : "bg-neutral-200"
                  }`}
                />
                <div
                  className={`mt-3 text-[11px] sm:text-[12px] font-bold truncate ${state === "todo" ? "text-neutral-400" : "text-ink"}`}
                >
                  {s}
                </div>
                <div
                  className={`mt-1 text-[9.5px] ${state === "current" ? "text-orange-600" : "text-neutral-400"}`}
                >
                  {state === "current"
                    ? "المرحلة الحالية - اليوم"
                    : state === "done"
                      ? deal.stageDates[i]
                      : "المرحلة التالية"}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 rounded-lg bg-orange-50 text-orange-700 text-[10.5px] px-3 py-2">
          الخطوة التالية: {deal.nextStep} · {deal.nextFollowUp}
        </div>
      </Card>
      {/* Body */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_290px] gap-4 items-start">
        {/* Main column */}
        <div className="space-y-4 min-w-0">
          <Card title="بيانات الصفقة">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4">
              <Field label="الاسم / الخدمة" value={deal.title} />
              <Field label="نوع الصفقة" value={deal.type} />
              <Field label="رقم الصفقة" value={deal.number} />
              <Field label="شروط الدفع" value={deal.paymentTerms} />
              <Field label="قيمة الصفقة" value={money(deal.value)} />
              <Field label="الخصم" value="10%" />
              <Field
                label="عمولة الشركة"
                value={`${deal.commissionRate}% - ${money(commission)}`}
              />
              <Field label="المصدر" value={deal.source} />
            </div>
          </Card>

          <Card title="بيانات العميل">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4">
              <Field label="الاسم الكامل" value={deal.customer} />
              <Field label="الشركة" value={deal.company} />
              <Field label="الوظيفة" value={deal.job} />
              <Field label="المدينة" value={deal.city} />
              <Field label="الهاتف" value={deal.phone} />
              <Field label="البريد الإلكتروني" value={deal.email} />
            </div>
          </Card>

          <Card title="إضافة ملاحظة">
            <div className="flex flex-wrap gap-1.5 justify-start">
              {NOTE_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setNoteType(t)}
                  className={`h-6 rounded-full px-3 text-[10.5px] border transition-colors ${
                    noteType === t
                      ? "bg-ink text-white border-ink"
                      : "bg-white text-neutral-600 border-line"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder="اكتب ملاحظاتك هنا... مثال: ملخص المحادثة، ما طلبه العميل، وما تم الاتفاق عليه."
              className="mt-3 w-full resize-none rounded-lg border border-line p-3 text-[11px] outline-none focus:border-neutral-400"
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={saveNote}
                  className="h-8 rounded-lg bg-ink text-white px-4 text-[11px] font-semibold"
                >
                  حفظ في السجل
                </button>
                <button
                  onClick={() => setText("")}
                  className="h-8 rounded-lg border border-line px-4 text-[11px]"
                >
                  إلغاء
                </button>
              </div>
              <div className="text-[10px] text-neutral-500 border border-line rounded-lg px-3 py-1.5">
                موعد المتابعة القادمة:{" "}
                <b className="text-ink">{deal.nextFollowUp}</b>
              </div>
            </div>

            {deal.notes.length > 0 && (
              <ul className="mt-4 space-y-2 border-t border-line pt-3">
                {deal.notes.map((n) => (
                  <li key={n.id} className="text-[11px]">
                    <div className="flex items-center gap-2 text-[9.5px] text-neutral-400">
                      <span className="bg-neutral-100 text-neutral-600 rounded-full px-2">
                        {n.kind}
                      </span>
                      {n.when}
                    </div>
                    <p className="mt-1 text-ink whitespace-pre-wrap">
                      {n.text}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Secondary column */}
        <div className="space-y-4 min-w-0">
          <Card title="المسؤول عن الصفقة">
            <div className="flex items-center gap-2.5 rounded-lg bg-orange-50/60 p-2.5">
              <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 grid place-items-center text-[11px] font-bold">
                {deal.owner[0]}
              </span>
              <div className="leading-tight">
                <div className="text-[11.5px] font-bold text-orange-600">
                  {deal.owner}
                </div>
                <div className="text-[9.5px] text-neutral-500">
                  {deal.ownerRole}
                </div>
              </div>
            </div>
          </Card>

          <Card title="سجل التواصل">
            <div className="rounded-lg bg-neutral-100 p-3 text-[10.5px] space-y-1">
              <div className="text-[9.5px] text-neutral-500">إجراء قادم</div>
              <div className="font-bold text-ink">{deal.nextStep}</div>
              <div className="text-neutral-500">{deal.nextFollowUp}</div>
            </div>
            <ul className="mt-3 space-y-3">
              {deal.log.map((l) => (
                <li key={l.id} className="flex gap-2">
                  <span
                    className={`mt-1 w-1.5 h-1.5 shrink-0 rounded-full ${l.done ? "bg-orange-500" : "bg-neutral-300"}`}
                  />
                  <div className="text-[10.5px] min-w-0">
                    <div className="font-semibold text-ink break-words">
                      {l.text}
                    </div>
                    <div className="text-[9.5px] text-neutral-400">
                      {l.when} · {l.by}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
