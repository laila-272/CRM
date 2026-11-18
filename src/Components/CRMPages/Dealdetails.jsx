import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronDown,
  Pencil,
  Save,
  X,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

import {
  getDealById,
  updateDeal,
  createDealCommunication,
} from "../../Services/dealService.js";

import CommunicationLog from "../Shared/communication/CommunicationLog.jsx";

/* ---------- Constants ---------- */

const STAGES = [
  { value: "new_customer", label: "عميل جديد" },
  { value: "initial_contact", label: "تواصل أولي" },
  { value: "meeting", label: "اجتماع / عرض" },
  { value: "negotiation", label: "تفاوض" },
  { value: "contracted", label: "تعاقد" },
];

const DEAL_TYPES = {
  existing_business: "عميل حالي",
  renewal: "تجديد",
  new_business: "عميل جديد",
  upsell: "بيع إضافي",
};

const COMMISSION_STATUSES = {
  paid: "مدفوعة",
  pending: "قيد الانتظار",
  approved: "معتمدة",
};

/* ---------- Helpers ---------- */

const formatDate = (date) => {
  if (!date) return "غير محدد";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const money = (value) =>
  new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "حدث خطأ، حاول مرة أخرى.";

/* ---------- UI Components ---------- */

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
        dir="rtl"
      >
        {value || "غير متوفر"}
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

/* ---------- Edit Deal Modal ---------- */

function EditDealModal({ editForm, setEditForm, onSave, onClose, saving }) {
  const handleChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-line pb-3">
          <div>
            <h2 className="text-[16px] font-extrabold text-ink">
              تعديل بيانات الصفقة
            </h2>

            <p className="mt-1 text-[10px] text-neutral-400">
              يمكنك تعديل بيانات الصفقة وحفظ التغييرات
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="grid h-8 w-8 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
          >
            <X size={17} />
          </button>
        </div>

        {/* Form */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Stage */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-neutral-500">
              مرحلة الصفقة
            </label>

            <select
              name="stage"
              value={editForm.stage}
              onChange={handleChange}
              className="h-10 w-full rounded-lg border border-line bg-white px-3 text-[12px] outline-none focus:border-neutral-400"
            >
              {STAGES.map((stage) => (
                <option key={stage.value} value={stage.value}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>

          {/* Probability */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-neutral-500">
              احتمالية الإغلاق %
            </label>

            <input
              type="number"
              min="0"
              max="100"
              name="closing_probability"
              value={editForm.closing_probability}
              onChange={handleChange}
              className="h-10 w-full rounded-lg border border-line px-3 text-[12px] outline-none focus:border-neutral-400"
            />
          </div>

          {/* Deal Value */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-neutral-500">
              قيمة الصفقة
            </label>

            <input
              type="number"
              min="0"
              name="value"
              value={editForm.value}
              onChange={handleChange}
              className="h-10 w-full rounded-lg border border-line px-3 text-[12px] outline-none focus:border-neutral-400"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-neutral-500">
              ملاحظات الصفقة
            </label>

            <textarea
              name="notes"
              value={editForm.notes}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-line p-3 text-[12px] outline-none resize-none focus:border-neutral-400"
              placeholder="أضف ملاحظات الصفقة..."
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="h-9 rounded-lg bg-ink px-5 text-[11px] font-semibold text-white flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}

            {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="h-9 rounded-lg border border-line px-5 text-[11px] text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Deal Details ---------- */

export default function DealDetails() {
  const { id } = useParams();

  const [deal, setDeal] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [saving, setSaving] = useState(false);
  const [savingCommunication, setSavingCommunication] = useState(false);

  const [editing, setEditing] = useState(false);
  const [menu, setMenu] = useState(false);

  const [editForm, setEditForm] = useState({
    stage: "",
    closing_probability: "",
    value: "",
    notes: "",
  });

  // Fetch deal details
  const loadDeal = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDealById(id);

      setDeal(data);

      setEditForm({
        stage: data.stage || "new_customer",
        closing_probability: data.closing_probability ?? 0,
        value: data.value ?? 0,
        notes: data.notes || "",
      });
    } catch (err) {
      console.error("LOAD DEAL ERROR:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDeal();
  }, [loadDeal]);

  // Commission
  const commission = useMemo(() => {
    if (!deal) return 0;

    return Number(deal.expected_commission) || 0;
  }, [deal]);

  const commissionRate = Number(deal?.commissions?.[0]?.commission_rate || 0);

  const currentStageIndex = STAGES.findIndex(
    (stage) => stage.value === deal?.stage,
  );

  const customer = deal?.customer || {};
  const assignedTo = deal?.assigned_to || {};
  const partner = deal?.partner;
  const commissions = deal?.commissions || [];

  const phone = String(customer.phone || "");
  const whatsappNumber = phone.replace(/\D/g, "");

  // Open edit modal
  const openEditModal = () => {
    setEditForm({
      stage: deal.stage || "new_customer",
      closing_probability: deal.closing_probability ?? 0,
      value: deal.value ?? 0,
      notes: deal.notes || "",
    });

    setError("");
    setEditing(true);
  };

  // Update deal
  const handleSaveDeal = async () => {
    try {
      setSaving(true);
      setError("");

      const payload = {
        stage: editForm.stage,
        closing_probability: Number(editForm.closing_probability),
        value: Number(editForm.value),
        notes: editForm.notes,
      };

      const updatedDeal = await updateDeal(id, payload);

      setDeal((prev) => ({
        ...prev,
        ...updatedDeal,
      }));

      setEditForm({
        stage: updatedDeal.stage,
        closing_probability: updatedDeal.closing_probability,
        value: updatedDeal.value,
        notes: updatedDeal.notes || "",
      });

      setEditing(false);
    } catch (err) {
      console.error("SAVE DEAL ERROR:", err);
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Move deal to another stage
  const handleMoveStage = async (nextStage) => {
    if (!deal || nextStage === deal.stage || saving) return;

    try {
      setSaving(true);
      setError("");

      const payload = {
        stage: nextStage,
        closing_probability:
          nextStage === "contracted"
            ? 100
            : Number(deal.closing_probability) || 0,
        value: Number(deal.value) || 0,
        notes: deal.notes || "",
      };

      const updatedDeal = await updateDeal(id, payload);

      setDeal((prev) => ({
        ...prev,
        ...updatedDeal,
      }));

      setEditForm({
        stage: updatedDeal.stage,
        closing_probability: updatedDeal.closing_probability,
        value: updatedDeal.value,
        notes: updatedDeal.notes || "",
      });
    } catch (err) {
      console.error("MOVE DEAL STAGE ERROR:", err);
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // Add communication
  const handleAddCommunication = async (communication) => {
    try {
      setSavingCommunication(true);
      setError("");

      const newCommunication = await createDealCommunication(id, communication);

      setDeal((prev) => ({
        ...prev,
        communication_logs: [
          newCommunication,
          ...(prev.communication_logs || []),
        ],
      }));

      return true;
    } catch (err) {
      console.error(
        "ADD DEAL COMMUNICATION ERROR:",
        err.response?.data || err.message,
      );

      setError(getErrorMessage(err));

      return false;
    } finally {
      setSavingCommunication(false);
    }
  };

  // Export deal CSV
  const exportDeal = () => {
    if (!deal) return;

    const rows = [
      ["رقم الصفقة", deal.number],
      ["اسم الصفقة", deal.name],
      ["نوع الصفقة", DEAL_TYPES[deal.type] || deal.type],
      ["المرحلة", deal.stage_label],
      ["قيمة الصفقة", deal.value],
      ["الخصم", deal.discount],
      ["صافي القيمة", deal.net_value],
      ["احتمالية الإغلاق", deal.closing_probability],
      ["الإغلاق المتوقع", deal.expected_close_date],
      ["العمولة المتوقعة", deal.expected_commission],
      ["العميل", customer.name],
      ["الهاتف", customer.phone],
      ["البريد الإلكتروني", customer.email],
      ["المسؤول", assignedTo.name],
      ["الشريك", partner?.name || ""],
    ];

    const csvContent =
      "\uFEFF" +
      rows
        .map((row) =>
          row
            .map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`)
            .join(","),
        )
        .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${deal.number || "deal"}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
    setMenu(false);
  };

  // Loading
  if (loading) {
    return (
      <div
        dir="rtl"
        className="min-h-[300px] flex flex-col items-center justify-center gap-3 text-neutral-500"
      >
        <LoaderCircle className="animate-spin" size={28} />
        <p className="text-[12px]">جاري تحميل بيانات الصفقة...</p>
      </div>
    );
  }

  // Error
  if (error && !deal) {
    return (
      <div dir="rtl" className="p-10 text-center">
        <p className="text-[13px] font-bold text-red-600">{error}</p>

        <button onClick={loadDeal} className="mt-4 btn btn-dark">
          <RefreshCw size={13} />
          إعادة المحاولة
        </button>

        <Link to="/deals" className="block mt-4 text-[11px] text-neutral-500">
          العودة إلى الصفقات
        </Link>
      </div>
    );
  }

  if (!deal) {
    return (
      <div dir="rtl" className="p-10 text-center">
        <p className="text-[13px] font-bold text-ink">
          لم يتم العثور على الصفقة
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

  return (
    <div dir="rtl" className="max-w-full">
      {/* Breadcrumb */}
      <Link
        to="/deals"
        className="text-[10.5px] text-neutral-500 hover:text-ink"
      >
        → الصفقات
      </Link>

      {error && (
        <div className="mt-3 rounded-lg bg-red-50 border border-red-100 text-red-600 p-3 text-[11px]">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="mt-2 flex flex-col-reverse lg:flex-row lg:items-start lg:justify-between gap-3">
        <div className="flex flex-wrap gap-2 items-center lg:order-2">
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              aria-label="واتساب"
              className="w-9 h-9 rounded-lg bg-green-500 text-white grid place-items-center hover:bg-green-600"
            >
              <FaWhatsapp size={20} />
            </a>
          )}

          <div className="relative">
            <button className="btn" onClick={() => setMenu((prev) => !prev)}>
              تصدير <ChevronDown size={12} />
            </button>

            {menu && (
              <div className="absolute z-10 mt-1 left-0 bg-white border border-line rounded-lg shadow-md min-w-[130px] text-[12px]">
                <button
                  className="w-full text-right px-3 py-2 hover:bg-neutral-50"
                  onClick={exportDeal}
                >
                  ملف CSV
                </button>
              </div>
            )}
          </div>

          <button className="btn" onClick={openEditModal}>
            <Pencil size={12} />
            تعديل
          </button>

          <button
            className="btn btn-dark !rounded-4xl"
            disabled={saving || deal.stage === "contracted"}
            onClick={() => handleMoveStage("contracted")}
          >
            {saving ? (
              <LoaderCircle size={13} className="animate-spin" />
            ) : (
              "+ تحويل إلى تعاقد"
            )}
          </button>
        </div>

        <div className="lg:order-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-[22px] font-extrabold text-ink leading-tight">
              {deal.name}
            </h1>

            <span className="text-[10px] font-semibold bg-orange-50 text-orange-600 rounded-full px-2.5 py-0.5">
              {STAGES.find((s) => s.value === deal.stage)?.label ||
                deal.stage_label}
            </span>
          </div>

          <p className="mt-1.5 text-[10.5px] text-neutral-500">
            العميل: {customer.name || "غير محدد"} · رقم الصفقة: {deal.number} ·
            أنشئت {formatDate(deal.created_at)} · آخر تحديث{" "}
            {formatDate(deal.updated_at)}
          </p>
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric
          label="احتمالية الإغلاق"
          value={`${deal.closing_probability ?? 0}%`}
          sub={
            Number(deal.closing_probability) >= 70
              ? "فرصة قوية (+70%)"
              : "فرصة متوسطة"
          }
          subCls={
            Number(deal.closing_probability) >= 70
              ? "text-orange-600"
              : "text-neutral-400"
          }
        />

        <Metric
          label="قيمة الصفقة"
          value={money(deal.value)}
          sub={`عرض السعر رقم ${deal.number}`}
        />

        <Metric
          label="الإغلاق المتوقع"
          value={formatDate(deal.expected_close_date)}
          sub={`تاريخ الإنشاء ${formatDate(deal.created_at)}`}
        />

        <Metric
          label="العمولة المتوقعة"
          value={money(commission)}
          sub={
            commissionRate
              ? `${commissionRate}% من قيمة الصفقة`
              : "حسب بيانات العمولة"
          }
        />
      </div>

      {/* Pipeline */}
      <Card title="مرحلة الصفقة" className="mt-4">
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {STAGES.map((stage, index) => {
            const state =
              index < currentStageIndex
                ? "done"
                : index === currentStageIndex
                  ? "current"
                  : "todo";

            return (
              <button
                key={stage.value}
                type="button"
                disabled={saving}
                onClick={() => handleMoveStage(stage.value)}
                className="min-w-0 text-right"
              >
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
                  className={`mt-3 text-[11px] sm:text-[12px] font-bold truncate ${
                    state === "todo" ? "text-neutral-400" : "text-ink"
                  }`}
                >
                  {stage.label}
                </div>

                <div
                  className={`mt-1 text-[9.5px] ${
                    state === "current" ? "text-orange-600" : "text-neutral-400"
                  }`}
                >
                  {state === "current"
                    ? "المرحلة الحالية"
                    : state === "done"
                      ? "تمت"
                      : "المرحلة التالية"}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 rounded-lg bg-orange-50 text-orange-700 text-[10.5px] px-3 py-2">
          المرحلة الحالية:{" "}
          {STAGES.find((s) => s.value === deal.stage)?.label ||
            deal.stage_label}
        </div>
      </Card>

      {/* Body */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_290px] gap-4 items-start">
        <div className="space-y-4 min-w-0">
          {/* Deal Information */}
          <Card title="بيانات الصفقة">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4">
              <Field label="الاسم / الخدمة" value={deal.name} />

              <Field
                label="نوع الصفقة"
                value={DEAL_TYPES[deal.type] || deal.type}
              />

              <Field label="رقم الصفقة" value={deal.number} />

              <Field label="شروط الدفع" value={deal.payment_terms} />

              <Field label="قيمة الصفقة" value={money(deal.value)} />

              <Field label="الخصم" value={`${deal.discount ?? 0}%`} />

              <Field label="صافي قيمة الصفقة" value={money(deal.net_value)} />

              <Field
                label="حالة العمولة"
                value={
                  COMMISSION_STATUSES[deal.commission_status] ||
                  deal.commission_status
                }
              />

              <Field label="المصدر" value={customer.source?.name} />

              <Field
                label="العمولة المتوقعة"
                value={money(deal.expected_commission)}
              />

              <Field
                label="تاريخ الإغلاق المتوقع"
                value={formatDate(deal.expected_close_date)}
              />

              <Field
                label="احتمالية الإغلاق"
                value={`${deal.closing_probability ?? 0}%`}
              />
            </div>

            {deal.notes && (
              <div className="mt-4 pt-3 border-t border-line">
                <div className="text-[9.5px] text-neutral-400">
                  ملاحظات الصفقة
                </div>

                <p className="mt-1 text-[11px] text-ink whitespace-pre-wrap">
                  {deal.notes}
                </p>
              </div>
            )}
          </Card>

          {/* Customer Information */}
          <Card title="بيانات العميل">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-4">
              <Field label="الاسم الكامل" value={customer.name} />
              <Field label="الهاتف" value={customer.phone} />
              <Field label="البريد الإلكتروني" value={customer.email} />
              <Field label="مصدر العميل" value={customer.source?.name} />
            </div>
          </Card>

          {/* Partner Information */}
          {partner && (
            <Card title="بيانات الشريك">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Field label="الاسم" value={partner.name} />
                <Field label="الهاتف" value={partner.phone} />
                <Field label="البريد الإلكتروني" value={partner.email} />
              </div>
            </Card>
          )}

          {/* Commissions */}
          <Card title="العمولات">
            {commissions.length === 0 ? (
              <p className="text-[11px] text-neutral-400">
                لا توجد عمولات مسجلة لهذه الصفقة.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-[10.5px]">
                  <thead>
                    <tr className="text-neutral-400 border-b border-line">
                      <th className="py-2 px-2">المستفيد</th>
                      <th className="py-2 px-2">قيمة الصفقة</th>
                      <th className="py-2 px-2">النسبة</th>
                      <th className="py-2 px-2">العمولة</th>
                      <th className="py-2 px-2">الحالة</th>
                    </tr>
                  </thead>

                  <tbody>
                    {commissions.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-line last:border-0"
                      >
                        <td className="py-3 px-2 font-semibold text-ink">
                          {item.beneficiary_name}
                        </td>

                        <td className="py-3 px-2">{money(item.deal_value)}</td>

                        <td className="py-3 px-2">{item.commission_rate}%</td>

                        <td className="py-3 px-2 font-bold">
                          {money(item.commission_amount)}
                        </td>

                        <td className="py-3 px-2">
                          {COMMISSION_STATUSES[item.status] || item.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Secondary Column */}
        <div className="space-y-4 min-w-0">
          {/* Assigned User */}
          <Card title="المسؤول عن الصفقة">
            <div className="flex items-center gap-2.5 rounded-lg bg-orange-50/60 p-2.5">
              <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 grid place-items-center text-[11px] font-bold">
                {assignedTo.name?.[0] || "؟"}
              </span>

              <div className="leading-tight min-w-0">
                <div className="text-[11.5px] font-bold text-orange-600">
                  {assignedTo.name || "غير محدد"}
                </div>

                <div className="text-[9.5px] text-neutral-500 break-all">
                  {assignedTo.email || ""}
                </div>
              </div>
            </div>
          </Card>

          {/* Created By */}
          <Card title="منشئ الصفقة">
            <div className="text-[11px] font-bold text-ink">
              {deal.created_by?.name || "غير محدد"}
            </div>

            <div className="mt-1 text-[9.5px] text-neutral-500 break-all">
              {deal.created_by?.email || ""}
            </div>
          </Card>

          {/* Shared Communication Log */}
          <CommunicationLog
            logs={deal.communication_logs || []}
            onAdd={handleAddCommunication}
            loading={savingCommunication}
          />
        </div>
      </div>

      {/* Edit Deal Modal */}
      {editing && (
        <EditDealModal
          editForm={editForm}
          setEditForm={setEditForm}
          onSave={handleSaveDeal}
          onClose={() => setEditing(false)}
          saving={saving}
        />
      )}
    </div>
  );
}
