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
  FileText,
  FileSpreadsheet,
  Plus,
  X,
} from "lucide-react";

import { StatCard, btnLight, card } from "../Shared/ui.jsx";
import { Badge, useToast, Ltr } from "../AccountingPages/Accountingui.jsx";

import {
  getCustomerById,
  exportCustomerPDF,
  exportCustomerExcel,
  createCustomerCommunication,
} from "../../Services/contactService.js";

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

const getLocalDateTime = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
};

const formatApiDateTime = (value) => {
  return value.replace("T", " ") + ":00";
};

/* ---------- Communication Modal ---------- */

function CommunicationModal({ onClose, onSubmit, saving }) {
  const [form, setForm] = useState({
    type: "call",
    subject: "",
    notes: "",
    communicated_at: getLocalDateTime(),
  });

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      type: form.type,
      subject: form.subject.trim(),
      notes: form.notes.trim(),
      communicated_at: formatApiDateTime(form.communicated_at),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
      onMouseDown={onClose}
    >
      <div
        dir="rtl"
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-[460px] rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-ink">
            إضافة سجل تواصل
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="grid h-8 w-8 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100"
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-neutral-600">
              نوع التواصل
            </label>

            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              className="h-10 w-full rounded-lg border border-line bg-white px-3 text-[12px] outline-none focus:border-orange-400"
              required
            >
              <option value="call">مكالمة هاتفية</option>
              <option value="meeting">اجتماع</option>
              <option value="email">بريد إلكتروني</option>
              <option value="whatsapp">واتساب</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-neutral-600">
              عنوان التواصل
            </label>

            <input
              type="text"
              value={form.subject}
              onChange={(e) => update("subject", e.target.value)}
              placeholder="مثال: متابعة العرض المالي"
              className="h-10 w-full rounded-lg border border-line px-3 text-[12px] outline-none focus:border-orange-400"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-neutral-600">
              تفاصيل التواصل
            </label>

            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="اكتبي تفاصيل التواصل مع العميل..."
              rows={4}
              className="w-full resize-none rounded-lg border border-line p-3 text-[12px] outline-none focus:border-orange-400"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-neutral-600">
              تاريخ ووقت التواصل
            </label>

            <input
              type="datetime-local"
              value={form.communicated_at}
              onChange={(e) => update("communicated_at", e.target.value)}
              className="h-10 w-full rounded-lg border border-line px-3 text-[12px] outline-none focus:border-orange-400"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="h-9 rounded-full bg-neutral-900 px-5 text-[11px] font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
            >
              {saving ? "جاري الحفظ..." : "حفظ سجل التواصل"}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-9 rounded-full border border-line px-5 text-[11px] font-semibold text-ink hover:bg-neutral-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- Customer Details ---------- */

export default function ContactDetails() {
  const { id } = useParams();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState("");

  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [savingCommunication, setSavingCommunication] = useState(false);

  const [toast, notify] = useToast();

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

  // Export customer as PDF or Excel
  const handleExport = async (type) => {
    try {
      setExporting(type);

      if (type === "pdf") {
        await exportCustomerPDF(id);
      } else {
        await exportCustomerExcel(id);
      }
    } catch (err) {
      console.error("CUSTOMER EXPORT ERROR:", err);

      alert(err.response?.data?.message || "حدث خطأ أثناء تصدير بيانات العميل");
    } finally {
      setExporting("");
    }
  };

  // Add communication record
  const handleAddCommunication = async (communication) => {
    try {
      setSavingCommunication(true);

      const newCommunication = await createCustomerCommunication(
        id,
        communication,
      );

      setCustomer((prev) => ({
        ...prev,
        communications: [newCommunication, ...(prev.communications || [])],
      }));

      setShowCommunicationModal(false);
      notify("تم تسجيل سجل التواصل بنجاح");
    } catch (err) {
      console.error("ADD COMMUNICATION ERROR:", err);

      notify(
        err.response?.data?.message ||
          err.message ||
          "حدث خطأ أثناء تسجيل التواصل",
      );
    } finally {
      setSavingCommunication(false);
    }
  };

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
      {/* Breadcrumb */}
      <nav className="text-[10px] text-neutral-500">
        <Link to="/contacts" className="hover:text-ink">
          جهات الاتصال والعملاء
        </Link>{" "}
        / {customerData.name}
      </nav>

      {/* Header */}
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

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
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
            <Pencil size={12} />
            تعديل
          </button>

          <button
            className={btnLight}
            onClick={() => handleExport("excel")}
            disabled={!!exporting}
          >
            <FileSpreadsheet size={13} />
            {exporting === "excel" ? "جاري التصدير..." : "تصدير Excel"}
          </button>

          <button
            className={btnLight}
            onClick={() => handleExport("pdf")}
            disabled={!!exporting}
          >
            <FileText size={13} />
            {exporting === "pdf" ? "جاري التصدير..." : "تصدير PDF"}
          </button>
        </div>
      </div>

      {/* Active Customer Message */}
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

      {/* Statistics */}
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

      {/* Customer Details */}
      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_270px]">
        <div className="space-y-3">
          {/* Contact Information */}
          <Section title="معلومات التواصل">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
              <Info label="الاسم الكامل" value={customerData.name} />
              <Info label="الهاتف" value={customerData.phone} ltr />
              <Info label="واتساب" value={customerData.whatsapp} ltr />
              <Info label="البريد الإلكتروني" value={customerData.email} ltr />
              <Info label="العنوان" value={customerData.address} />
            </div>
          </Section>

          {/* Customer Information */}
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

          {/* Notes */}
          <Section title="ملاحظات">
            <p className="text-[12px] leading-relaxed text-neutral-700">
              {customerData.notes || "لا توجد ملاحظات."}
            </p>
          </Section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-3">
          {/* Assigned User */}
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

          {/* Communication Timeline */}
          <Section title="سجل التواصل">
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowCommunicationModal(true)}
                className="flex h-8 w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 text-[11px] font-semibold text-white transition hover:bg-neutral-700"
              >
                <Plus size={14} />
                إضافة سجل تواصل
              </button>
            </div>

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

                    {(t.notes || t.content) && (
                      <p className="mt-1 text-[10px] leading-relaxed text-neutral-500">
                        {t.notes || t.content}
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

      {showCommunicationModal && (
        <CommunicationModal
          onClose={() => setShowCommunicationModal(false)}
          onSubmit={handleAddCommunication}
          saving={savingCommunication}
        />
      )}

      {toast}
    </div>
  );
}
