import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaWhatsapp } from "react-icons/fa";
import { ArrowRight, Pencil, ChevronDown, Plus, X } from "lucide-react";

import { useCustomers } from "../../context/CustomersContext.jsx";

import {
  getLeadById,
  updateLead,
  exportLeadExcel,
  exportLeadPdf,
  getLeadSources,
  getTeamMembers,
  createLeadCommunication,
  convertLead,
} from "../../Services/leadService.js";

import StatusBadge from "../Customers/StatusBadge.jsx";
import CustomerFormModal from "../Customers/CustomerFormModal.jsx";
import ConfirmDialog from "../Customers/ConfirmDialog.jsx";
import { useToast } from "../AccountingPages/Accountingui.jsx";

/* ---------- Helpers ---------- */

function Info({ label, value, ltr }) {
  return (
    <div>
      <div className="text-[11px] text-neutral-500 mb-1">{label}</div>
      <div className="text-[13px] font-semibold">
        {ltr ? <span className="ltr-text">{value || "—"}</span> : value || "—"}
      </div>
    </div>
  );
}

function Summary({ label, value, sub, subClass = "text-neutral-400", ltr }) {
  return (
    <div className="card px-5 py-4">
      <div className="text-[11px] text-neutral-500">{label}</div>
      <div className="text-2xl font-extrabold my-1.5">
        {ltr ? <span className="ltr-text">{value || "—"}</span> : value || "—"}
      </div>
      <div className={`text-[11px] ${subClass}`}>{sub}</div>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function getListData(result) {
  const data = result?.data?.data ?? result?.data ?? result;
  return Array.isArray(data) ? data : [];
}

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

    if (!form.subject.trim() || !form.notes.trim()) return;

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

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { deleteCustomer } = useCustomers();

  const [lead, setLead] = useState(null);
  const [sources, setSources] = useState([]);
  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [menu, setMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [savingCommunication, setSavingCommunication] = useState(false);

  const [converting, setConverting] = useState(false);

  const [toast, notify] = useToast();

  // Check if lead is qualified
  const isQualified = lead?.status === "qualified";

  // Fetch lead details and form options
  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [leadResult, sourcesResult, membersResult] =
          await Promise.allSettled([
            getLeadById(id),
            getLeadSources(),
            getTeamMembers(),
          ]);

        if (leadResult.status === "rejected") {
          throw leadResult.reason;
        }

        if (cancelled) return;

        setLead(leadResult.value);

        if (sourcesResult.status === "fulfilled") {
          setSources(getListData(sourcesResult.value));
        } else {
          console.error("GET SOURCES ERROR:", sourcesResult.reason);
        }

        if (membersResult.status === "fulfilled") {
          setMembers(getListData(membersResult.value));
        } else {
          console.error("GET MEMBERS ERROR:", membersResult.reason);
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

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Add communication record
  const handleAddCommunication = async (communication) => {
    try {
      setSavingCommunication(true);

      const newCommunication = await createLeadCommunication(id, communication);

      setLead((prev) => ({
        ...prev,
        communications: [newCommunication, ...(prev.communications || [])],
        last_activity_at:
          newCommunication.communicated_at || prev.last_activity_at,
      }));

      setShowCommunicationModal(false);
      notify("تم تسجيل سجل التواصل بنجاح");
    } catch (err) {
      console.error(
        "ADD LEAD COMMUNICATION ERROR:",
        err.response?.data || err.message,
      );

      notify(
        err.response?.data?.message ||
          err.message ||
          "حدث خطأ أثناء تسجيل التواصل",
      );
    } finally {
      setSavingCommunication(false);
    }
  };

  // Convert lead into customer
  const handleConvertLead = async () => {
    if (converting) return;

    if (!isQualified) {
      notify("لا يمكن تحويل العميل إلا إذا كانت حالته مؤهَّل");
      return;
    }

    try {
      setConverting(true);

      const customer = await convertLead(id);

      notify("تم تحويل العميل المحتمل إلى عميل بنجاح");

navigate(`/contacts/${customer.id}`);    } catch (err) {
      console.error("CONVERT LEAD ERROR:", err.response?.data || err.message);

      notify(
        err.response?.data?.message ||
          err.message ||
          "حدث خطأ أثناء تحويل العميل المحتمل",
      );
    } finally {
      setConverting(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="card p-8 text-center text-neutral-500">
        جاري تحميل بيانات العميل...
      </div>
    );
  }

  // Error
  if (error || !lead) {
    return (
      <div className="card p-8 text-center">
        <p className="mb-3">
          {error || "لم يتم العثور على هذا العميل. ربما تم حذفه."}
        </p>

        <Link to="/potential-clients" className="btn btn-dark">
          العودة إلى العملاء المحتملين
        </Link>
      </div>
    );
  }

  // Map API data to existing UI fields
  const c = {
    ...lead,
    name: lead.name,
    phone: lead.phone,
    altPhone: lead.whatsapp,
    whatsapp: lead.whatsapp,
    email: lead.email,
    project: lead.project?.name || "—",
    budget: lead.budget,
    source: lead.source?.name || "—",
    status: lead.status_label || lead.status,
    note: lead.notes,
    owner: lead.assigned_to?.name || lead.created_by?.name || "—",
    createdAt: formatDate(lead.created_at),
    nextFollowUp: formatDate(lead.next_follow_up_at),
    lastActivity: formatDate(
      lead.last_activity_at || lead.communications?.[0]?.communicated_at,
    ),
    communications: lead.communications || [],
  };

  const strong = typeof c.score === "number" && c.score >= 70;

  // WhatsApp
  const whatsappNumber = String(c.whatsapp || c.phone || "").trim();
  const whatsappDigits = whatsappNumber.replace(/\D/g, "");

  const waNumber = whatsappNumber.startsWith("+")
    ? whatsappDigits
    : whatsappDigits.startsWith("0")
      ? `20${whatsappDigits.slice(1)}`
      : whatsappDigits;

  const wa = `https://wa.me/${waNumber}`;

  // Export file
  const downloadFile = (blob, extension) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `${c.name}.${extension}`;

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
    setMenu(false);
  };

  const exportOne = async (type) => {
    try {
      setExporting(true);

      const blob =
        type === "excel" ? await exportLeadExcel(id) : await exportLeadPdf(id);

      downloadFile(blob, type === "excel" ? "xlsx" : "pdf");
    } catch (error) {
      console.error(
        "LEAD EXPORT ERROR:",
        error.response?.data || error.message,
      );

      alert("حدث خطأ أثناء تصدير بيانات العميل");
    } finally {
      setExporting(false);
    }
  };

  // Update lead using PATCH
  const handleUpdate = async (payload) => {
    try {
      const updatedLead = await updateLead(id, payload);

      setLead((prev) => ({
        ...prev,
        ...updatedLead,
        communications: prev.communications || [],
      }));

      setEditing(false);
    } catch (error) {
      console.error(
        "UPDATE LEAD ERROR:",
        error.response?.data || error.message,
      );

      throw error;
    }
  };

  // Communications timeline
  const history = c.communications.map((communication) => ({
    id: communication.id,
    title: [
      communication.subject,
      communication.type_label || communication.type || "تواصل",
    ]
      .filter(Boolean)
      .join(" · "),
    description: communication.notes || communication.content || "—",
    date: formatDate(communication.communicated_at || communication.created_at),
    owner: communication.created_by?.name || "—",
  }));

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <Link
        to="/potential-clients"
        className="inline-flex items-center gap-1 text-[12px] text-neutral-500 hover:text-ink"
      >
        <ArrowRight size={13} /> العملاء المحتملون
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold">{c.name}</h1>
            <StatusBadge status={c.status} />
          </div>

          <p className="text-[12px] text-neutral-500 mt-1.5">
            عميل محتمل · أُضيف في {c.createdAt} · آخر تواصل {c.lastActivity}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            aria-label="واتساب"
            className="w-9 h-9 rounded-lg bg-green-500 text-white grid place-items-center hover:bg-green-600"
          >
            <FaWhatsapp size={20} />
          </a>

          <div className="relative">
            <button
              className="btn"
              onClick={() => setMenu(!menu)}
              disabled={exporting}
            >
              {exporting ? "جاري التصدير..." : "تصدير"}
              <ChevronDown size={12} />
            </button>

            {menu && (
              <div className="absolute z-10 mt-1 card shadow-md min-w-[130px] text-[12px]">
                <button
                  className="w-full text-right px-3 py-2 hover:bg-neutral-50"
                  onClick={() => exportOne("excel")}
                  disabled={exporting}
                >
                  Excel
                </button>

                <button
                  className="w-full text-right px-3 py-2 hover:bg-neutral-50"
                  onClick={() => exportOne("pdf")}
                  disabled={exporting}
                >
                  PDF
                </button>
              </div>
            )}
          </div>

          <button className="btn" onClick={() => setEditing(true)}>
            <Pencil size={12} /> تعديل
          </button>

          <button
            className="btn btn-dark disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleConvertLead}
            disabled={converting || !isQualified}
            title={
              !isQualified
                ? "يجب تغيير حالة العميل إلى مؤهَّل أولاً"
                : "تحويل العميل إلى عميل فعلي"
            }
          >
            {converting ? "جاري التحويل..." : "+ تحويل إلى عميل"}
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Summary
          label="درجة العميل"
          value={c.score}
          sub={strong ? "فرصة قوية (+70)" : "فرصة متوسطة"}
          subClass={strong ? "text-orange-700" : "text-neutral-500"}
        />

        <Summary label="الميزانية" value={c.budget} ltr sub="حسب طلب العميل" />

        <Summary
          label="المتابعة القادمة"
          value={c.nextFollowUp}
          sub="موعد المتابعة المسجل"
        />

        <Summary label="المصدر" value={c.source} sub={`أُضيف ${c.createdAt}`} />
      </div>

      {/* Details */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-4 items-start">
        <div className="space-y-4">
          {/* Contact Information */}
          <section className="card p-5">
            <h2 className="text-base font-bold mb-4">معلومات التواصل</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-4">
              <Info label="الاسم الكامل" value={c.name} />
              <Info label="الهاتف" value={c.phone} ltr />
              <Info label="رقم بديل" value={c.altPhone} ltr />
              <Info label="البريد الإلكتروني" value={c.email} ltr />
              <Info label="المدينة" value={c.city} />
              <Info label="الوظيفة" value={c.job} />
            </div>
          </section>

          {/* Interest and Budget */}
          <section className="card p-5">
            <h2 className="text-base font-bold mb-4">الاهتمام والميزانية</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-4">
              <Info label="المشروع المهتم به" value={c.project} />
              <Info label="نوع الوحدة" value={c.unitType} />
              <Info label="الميزانية" value={c.budget} ltr />
              <Info label="طريقة الدفع" value={c.payment} />
              <Info label="المصدر" value={c.source} />
              <Info label="الحالة" value={c.status} />
            </div>
          </section>

          {/* Notes */}
          <section className="card !p-6">
            <h2 className="text-base font-bold mb-3">ملاحظات</h2>

            <p className="text-[13px] leading-7 text-neutral-700">
              {c.note || "لا توجد ملاحظات."}
            </p>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Assigned User */}
          <section className="card p-5">
            <h2 className="text-base font-bold mb-3">المسؤول عن العميل</h2>

            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 grid place-items-center font-bold text-sm">
                {c.owner !== "—" ? c.owner[0] : "—"}
              </span>

              <div className="leading-tight">
                <div className="text-[13px] font-semibold text-orange-700">
                  {c.owner}
                </div>

                <div className="text-[11px] text-neutral-500">
                  مسؤول المبيعات
                </div>
              </div>
            </div>
          </section>

          {/* Communication Timeline */}
          <section className="card p-5">
            <h2 className="text-base font-bold mb-3">سجل التواصل</h2>

            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowCommunicationModal(true)}
                className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 text-[11px] font-semibold text-white transition hover:bg-neutral-700"
              >
                <Plus size={14} />
                إضافة سجل تواصل
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-[12px] text-neutral-500">
                لا يوجد سجل تواصل لهذا العميل حتى الآن.
              </p>
            ) : (
              <ol className="space-y-3 pr-4 border-r border-line">
                {history.map((h) => (
                  <li key={h.id} className="relative">
                    <i className="absolute -right-[21px] top-1.5 w-2 h-2 rounded-full bg-orange-400" />

                    <div className="text-[12.5px] font-semibold">{h.title}</div>

                    <div className="text-[11px] text-neutral-500 mt-1">
                      {h.date} · {h.owner}
                    </div>

                    <p className="text-[12px] text-neutral-600 leading-6 mt-1">
                      {h.description}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>

      {/* Edit Lead */}
      {editing && (
        <CustomerFormModal
          initial={lead}
          sources={sources}
          members={members}
          onClose={() => setEditing(false)}
          onSave={handleUpdate}
        />
      )}

      {/* Delete Confirmation */}
      {confirmDel && (
        <ConfirmDialog
          title="حذف العميل"
          message={`هل أنت متأكد من حذف ${c.name}؟ لا يمكن التراجع عن هذا الإجراء.`}
          onCancel={() => setConfirmDel(false)}
          onConfirm={() => {
            deleteCustomer(c.id);
            navigate("/potential-clients");
          }}
        />
      )}

      {/* Add Communication Modal */}
      {showCommunicationModal && (
        <CommunicationModal
          onClose={() => {
            if (!savingCommunication) {
              setShowCommunicationModal(false);
            }
          }}
          onSubmit={handleAddCommunication}
          saving={savingCommunication}
        />
      )}

      {toast}
    </div>
  );
}
