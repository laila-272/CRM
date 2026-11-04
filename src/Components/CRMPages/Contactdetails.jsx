import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  MessageCircle,
  Trash2,
  Pencil,
  CheckCircle2,
  UserCheck,
  Wallet,
  Repeat,
  Share2,
} from "lucide-react";
import { StatCard, btnLight, card } from "../Shared/ui.jsx";
import {
  Badge,
  Modal,
  useToast,
  Ltr,
} from "../AccountingPages/Accountingui.jsx";
import { useContactsApi, dmy, money, waLink } from "../../data/contacts.js";
import ContactForm from "./Contactform.jsx";

const TONE = {
  نشط: "green",
  جديد: "gray",
  "يحتاج متابعة": "orange",
  "غير نشط": "red",
};
const DOT = {
  green: "bg-green-500",
  orange: "bg-orange-400",
  gray: "bg-neutral-300",
};
const Info = ({ label, value, ltr }) => (
  <div>
    <div className="text-[10px] text-neutral-400">{label}</div>
    <div className="mt-1 text-[12px] font-semibold text-ink">
      {ltr ? <Ltr>{value || "—"}</Ltr> : value || "—"}
    </div>
  </div>
);
const Section = ({ title, children }) => (
  <section className={`${card} p-5`}>
    <h2 className="mb-4 text-[13px] font-semibold text-ink">{title}</h2>
    {children}
  </section>
);

export default function ContactDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const { contacts, update, remove } = useContactsApi();
  const c = contacts.find((x) => x.id === id);
  const [edit, setEdit] = useState(false);
  const [del, setDel] = useState(false);
  const [toast, showToast] = useToast();

  if (!c)
    return (
      <div
        dir="rtl"
        className={`${card} p-10 text-center text-[12px] text-neutral-500`}
      >
        لم يتم العثور على جهة الاتصال.{" "}
        <Link to="/contacts" className="font-semibold text-ink underline">
          العودة للقائمة
        </Link>
      </div>
    );
  const handled = contacts.filter((x) => x.owner === c.owner).length;

  return (
    <div dir="rtl" className="space-y-4">
      <nav className="text-[10px] text-neutral-500">
        <Link to="/contacts" className="hover:text-ink">
          جهات الاتصال والعملاء
        </Link>{" "}
        / {c.name}
      </nav>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-semibold leading-tight text-ink">
              {c.name}
            </h1>
            <Badge tone={TONE[c.status]}>{c.status}</Badge>
          </div>
          <p className="mt-1 text-[11px] text-neutral-500">
            {c.kind === "فرد" ? "عميل فردي" : "شركة"} · {c.project} · آخر تعامل{" "}
            <Ltr>{dmy(c.last)}</Ltr>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="grid h-8 w-8 place-items-center rounded-full bg-green-600 text-white"
            aria-label="مراسلة واتساب"
            onClick={() => window.open(waLink(c.phone), "_blank", "noopener")}
          >
            <MessageCircle size={15} />
          </button>
          <button className={btnLight} onClick={() => setEdit(true)}>
            <Pencil size={12} /> تعديل
          </button>
          <button
            className={`${btnLight} !text-red-600`}
            onClick={() => setDel(true)}
          >
            <Trash2 size={12} /> حذف
          </button>
        </div>
      </div>

      {c.closed && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3"
        >
          <div>
            <div className="text-[13px] font-semibold text-green-800">
              تم إغلاق الصفقة بنجاح
            </div>
            <div className="mt-0.5 text-[10.5px] text-green-700">
              تم الاتفاق على جميع الشروط وتوقيع العقد واستلام الدفعة الأولى، ولا
              توجد خطوات معلقة.
            </div>
          </div>
          <CheckCircle2 size={22} className="shrink-0 text-green-600" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={UserCheck}
          tag={c.klass}
          value={c.status}
          label="حالة العميل"
        />
        <StatCard
          icon={Wallet}
          tag={c.payment}
          value={money(c.value)}
          label="قيمة التعاملات"
        />
        <StatCard
          icon={Repeat}
          tag="تعامل"
          value={c.deals}
          label="عدد مرات التعامل"
        />
        <StatCard
          icon={Share2}
          tag={`أضيف ${dmy(c.created)}`}
          value={c.source}
          label="المصدر"
        />
      </div>

      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_270px]">
        <div className="space-y-3">
          <Section title="معلومات التواصل">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
              <Info label="الاسم الكامل" value={c.name} />
              <Info label="الهاتف" value={c.phone} ltr />
              <Info label="واتساب" value={c.phone} ltr />
              <Info label="البريد الإلكتروني" value={c.email} ltr />
              <Info label="المدينة" value={c.city} />
              <Info label="الوظيفة" value={c.job} />
            </div>
          </Section>
          <Section title="تفاصيل العميل">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
              <Info label="نوع العميل" value={c.kind} />
              <Info label="التصنيف" value={c.klass} />
              <Info label="المشروع المرتبط" value={c.project} />
              <Info label="الوحدة" value={c.unit} />
              <Info label="طريقة الدفع" value={c.payment} />
              <Info label="قيمة التعاملات" value={money(c.value)} />
              <Info label="المصدر" value={c.source} />
              <Info label="الحالة" value={c.status} />
            </div>
          </Section>
          <Section title="ملاحظات">
            <p className="text-[12px] leading-relaxed text-neutral-700">
              {c.notes || "لا توجد ملاحظات."}
            </p>
          </Section>
        </div>

        <aside className="space-y-3">
          <Section title="المسؤول عن العميل">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-50 text-[13px] font-semibold text-orange-600">
                {c.owner[0]}
              </span>
              <div>
                <div className="text-[12px] font-semibold text-ink">
                  {c.owner}
                </div>
                <div className="text-[10px] text-neutral-500">
                  مسؤول مبيعات · يتابع {handled} عميل
                </div>
              </div>
            </div>
          </Section>
          <Section title="سجل التواصل">
            <ol className="space-y-4 border-r border-line pr-4">
              {c.timeline.map((t, i) => (
                <li key={i} className="relative">
                  <i
                    className={`absolute -right-[21px] top-1 h-2 w-2 rounded-full ${DOT[t.tone]}`}
                  />
                  <div className="text-[11px] font-semibold text-ink">
                    {t.text}
                  </div>
                  <div className="mt-0.5 text-[9.5px] text-neutral-400">
                    <Ltr>{dmy(t.date)}</Ltr> · {t.by}
                  </div>
                </li>
              ))}
            </ol>
          </Section>
        </aside>
      </div>

      {edit && (
        <ContactForm
          contact={c}
          onClose={() => setEdit(false)}
          onSave={(v) => {
            update(c.id, v);
            setEdit(false);
            showToast("تم حفظ التعديلات");
          }}
        />
      )}
      {del && (
        <Modal
          title="حذف العميل"
          onClose={() => setDel(false)}
          onSubmit={() => {
            remove(c.id);
            nav("/contacts");
          }}
          submitLabel="تأكيد الحذف"
        >
          <p className="col-span-2 text-[12px] text-neutral-600">
            هل تريد حذف «{c.name}» نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
        </Modal>
      )}
      {toast}
    </div>
  );
}
