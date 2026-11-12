import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MessageCircle,
  Pencil,
  CheckCircle2,
  UserCheck,
  Wallet,
  Repeat,
  Share2,
} from "lucide-react";

import { StatCard, btnLight, card } from "../Shared/ui.jsx";
import { Badge, useToast, Ltr } from "../AccountingPages/Accountingui.jsx";
import { getCustomerById } from "../../Services/contactService.js";
import { dmy, waLink } from "../../data/contacts.js";

const TONE = {
  نشط: "green",
  جديد: "gray",
  "يحتاج متابعة": "orange",
  "غير نشط": "red",
  مرفوض: "red",
  "تم الرفض": "red",
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

const formatDate = (date) => {
  if (!date) return "—";
  return dmy(date);
};

export default function ContactDetails() {
  const { id } = useParams();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast] = useToast();

  useEffect(() => {
    let cancelled = false;

    const fetchCustomer = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getCustomerById(id);

        if (!cancelled) {
          setCustomer(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "حدث خطأ أثناء تحميل بيانات العميل",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCustomer();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div
        dir="rtl"
        className={`${card} p-10 text-center text-[12px] text-neutral-500`}
      >
        جاري تحميل بيانات العميل...
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div dir="rtl" className={`${card} p-10 text-center`}>
        <p className="text-[12px] text-red-500">
          {error || "لم يتم العثور على العميل"}
        </p>

        <Link
          to="/contacts"
          className="mt-3 inline-block text-[12px] font-semibold text-ink underline"
        >
          العودة للقائمة
        </Link>
      </div>
    );
  }

  const customerData = {
    ...customer,
    status: customer.status_label || customer.status || "—",
    owner: customer.assigned_to?.name || "—",
    source: customer.source?.name || "—",
    whatsapp: customer.whatsapp || customer.phone,
    last: customer.communications?.[0]?.communicated_at || customer.updated_at,
    created: customer.created_at,
    timeline: customer.communications || [],
  };

  const statusTone = TONE[customerData.status] || "gray";

  return (
    <div dir="rtl" className="space-y-4">
      <nav className="text-[10px] text-neutral-500">
        <Link to="/contacts" className="hover:text-ink">
          جهات الاتصال والعملاء
        </Link>{" "}
        / {customerData.name}
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-semibold leading-tight text-ink">
              {customerData.name}
            </h1>

            <Badge tone={statusTone}>{customerData.status}</Badge>
          </div>

          <p className="mt-1 text-[11px] text-neutral-500">
            {customerData.source} · آخر تعامل{" "}
            <Ltr>{formatDate(customerData.last)}</Ltr>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="grid h-8 w-8 place-items-center rounded-full bg-green-600 text-white"
            aria-label="مراسلة واتساب"
            onClick={() =>
              window.open(waLink(customerData.whatsapp), "_blank", "noopener")
            }
          >
            <MessageCircle size={15} />
          </button>

          <button className={btnLight} disabled>
            <Pencil size={12} /> تعديل
          </button>
        </div>
      </div>

      {customer.status === "active" && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3"
        >
          <div>
            <div className="text-[13px] font-semibold text-green-800">
              العميل نشط
            </div>
          </div>

          <CheckCircle2 size={22} className="shrink-0 text-green-600" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={UserCheck}
          tag="الحالة"
          value={customerData.status}
          label="حالة العميل"
        />

        <StatCard
          icon={Wallet}
          tag="التعاملات"
          value="—"
          label="قيمة التعاملات"
        />

        <StatCard
          icon={Repeat}
          tag="تواصل"
          value={customerData.timeline.length}
          label="عدد مرات التواصل"
        />

        <StatCard
          icon={Share2}
          tag={`أضيف ${formatDate(customerData.created)}`}
          value={customerData.source}
          label="المصدر"
        />
      </div>

      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_270px]">
        <div className="space-y-3">
          <Section title="معلومات التواصل">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
              <Info label="الاسم الكامل" value={customerData.name} />

              <Info label="الهاتف" value={customerData.phone} ltr />

              <Info label="واتساب" value={customerData.whatsapp} ltr />

              <Info label="البريد الإلكتروني" value={customerData.email} ltr />

              <Info label="العنوان" value={customerData.address} />
            </div>
          </Section>

          <Section title="تفاصيل العميل">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
              <Info label="المصدر" value={customerData.source} />

              <Info label="الحالة" value={customerData.status} />

              <Info
                label="تاريخ الإضافة"
                value={formatDate(customerData.created)}
              />

              <Info
                label="تمت الإضافة بواسطة"
                value={customer.created_by?.name}
              />

              <Info label="المسؤول عن العميل" value={customerData.owner} />
            </div>
          </Section>

          <Section title="ملاحظات">
            <p className="text-[12px] leading-relaxed text-neutral-700">
              {customerData.notes || "لا توجد ملاحظات."}
            </p>
          </Section>
        </div>

        <aside className="space-y-3">
          <Section title="المسؤول عن العميل">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-orange-50 text-[13px] font-semibold text-orange-600">
                {customerData.owner !== "—" ? customerData.owner[0] : "—"}
              </span>

              <div>
                <div className="text-[12px] font-semibold text-ink">
                  {customerData.owner}
                </div>

                <div className="text-[10px] text-neutral-500">مسؤول العميل</div>
              </div>
            </div>
          </Section>

          <Section title="سجل التواصل">
            {customerData.timeline.length === 0 ? (
              <p className="text-[11px] text-neutral-400">لا يوجد سجل تواصل.</p>
            ) : (
              <ol className="space-y-4 border-r border-line pr-4">
                {customerData.timeline.map((t) => (
                  <li key={t.id} className="relative">
                    <i className="absolute -right-[21px] top-1 h-2 w-2 rounded-full bg-orange-400" />

                    <div className="text-[11px] font-semibold text-ink">
                      {t.subject || t.type_label || t.type}
                    </div>

                    {t.content && (
                      <p className="mt-1 text-[10px] leading-relaxed text-neutral-500">
                        {t.content}
                      </p>
                    )}

                    <div className="mt-1 text-[9.5px] text-neutral-400">
                      <Ltr>{formatDate(t.communicated_at)}</Ltr>
                      {" · "}
                      {t.created_by?.name || "—"}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Section>
        </aside>
      </div>

      {toast}
    </div>
  );
}
