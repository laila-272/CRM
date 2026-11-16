import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { getCustomers } from "../../Services/contactService.js";
import { getPartners } from "../../Services/partnerService.js";
import { getTeamMembers } from "../../Services/leadService.js";

const TYPES = [
  { value: "new_business", label: "عميل جديد" },
  { value: "existing_business", label: "عميل حالي" },
];

const STAGES = [
  { value: "new_customer", label: "عميل جديد" },
  { value: "initial_contact", label: "تواصل أولي" },
  { value: "meeting", label: "اجتماع / عرض" },
  { value: "negotiation", label: "تفاوض" },
  { value: "contracted", label: "تعاقد" },
];

const COMMISSION_STATUSES = [
  { value: "pending", label: "قيد الانتظار" },
  { value: "approved", label: "معتمدة" },
  { value: "paid", label: "مدفوعة" },
  { value: "cancelled", label: "ملغاة" },
];

const COMMISSION_RECORD_STATUSES = [
  { value: "pending", label: "قيد الانتظار" },
  { value: "overdue", label: "متأخرة" },
  { value: "paid", label: "مدفوعة" },
];

const emptyForm = {
  name: "",
  type: "new_business",
  number: "",
  customer_id: "",
  partner_id: "",
  assigned_to: "",
  value: "",
  discount: "",
  payment_terms: "",
  commission_rate: "",
  commission_record_status: "pending",
  commission_contract_id: "",
  commission_due_date: "",
  commission_deal_status: "negotiation",
  commission_paid_date: "",
  commission_status: "pending",
  stage: "new_customer",
  closing_probability: "",
  expected_close_date: "",
  expected_commission: "",
  notes: "",
};

function Field({ label, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-[11px] text-neutral-500">{label}</span>
      {children}
    </label>
  );
}

const inputClass = "input w-full";

function getList(result) {
  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  return [];
}

export default function DealFormModal({ onSave, onClose }) {
  const [form, setForm] = useState(emptyForm);

  const [customers, setCustomers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [members, setMembers] = useState([]);

  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const update = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      try {
        setLoadingOptions(true);

        const results = await Promise.allSettled([
          getCustomers(),
          getPartners(),
          getTeamMembers(),
        ]);

        if (!active) return;

        if (results[0].status === "fulfilled") {
          setCustomers(getList(results[0].value));
        }

        if (results[1].status === "fulfilled") {
          setPartners(getList(results[1].value));
        }

        if (results[2].status === "fulfilled") {
          setMembers(getList(results[2].value));
        }
      } catch (err) {
        console.error("LOAD DEAL FORM OPTIONS ERROR:", err);
      } finally {
        if (active) setLoadingOptions(false);
      }
    };

    loadOptions();

    return () => {
      active = false;
    };
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("اسم الصفقة مطلوب.");
      return;
    }

    if (
      !form.value ||
      !Number.isFinite(Number(form.value)) ||
      Number(form.value) < 0
    ) {
      setError("من فضلك أدخل قيمة صحيحة للصفقة.");
      return;
    }

    if (
      form.discount !== "" &&
      (!Number.isFinite(Number(form.discount)) ||
        Number(form.discount) < 0 ||
        Number(form.discount) > 100)
    ) {
      setError("نسبة الخصم يجب أن تكون من 0 إلى 100.");
      return;
    }

    if (
      form.commission_rate !== "" &&
      (!Number.isFinite(Number(form.commission_rate)) ||
        Number(form.commission_rate) < 0 ||
        Number(form.commission_rate) > 100)
    ) {
      setError("نسبة العمولة يجب أن تكون من 0 إلى 100.");
      return;
    }

    const data = new FormData();

    // Required fields
    data.append("name", form.name.trim());
    data.append("type", form.type);
    data.append("value", String(Number(form.value)));

    // Optional fields
    const optionalFields = [
      "number",
      "customer_id",
      "partner_id",
      "assigned_to",
      "discount",
      "payment_terms",
      "commission_status",
      "stage",
      "closing_probability",
      "expected_close_date",
      "expected_commission",
      "notes",
    ];

    optionalFields.forEach((key) => {
      const value = form[key];

      if (value !== "" && value !== null && value !== undefined) {
        data.append(key, value);
      }
    });

    // Commission record fields.
    // A commission record is created only when a commission rate is entered.
    if (form.commission_rate !== "") {
      data.append("commission[commission_rate]", form.commission_rate);
      data.append("commission[status]", form.commission_record_status);

      if (form.commission_contract_id) {
        data.append("commission[contract_id]", form.commission_contract_id);
      }

      if (form.commission_due_date) {
        data.append("commission[due_date]", form.commission_due_date);
      }

      if (form.commission_deal_status) {
        data.append("commission[deal_status]", form.commission_deal_status);
      }

      if (form.commission_paid_date) {
        data.append("commission[paid_date]", form.commission_paid_date);
      }
    }

    try {
      setSaving(true);
      await onSave(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "حدث خطأ أثناء إنشاء الصفقة.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <form
        onSubmit={submit}
        dir="rtl"
        className="card w-full max-w-3xl max-h-[90vh] overflow-y-auto p-5 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink">إضافة صفقة جديدة</h2>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="إغلاق"
            className="text-neutral-500 hover:text-ink disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="اسم الصفقة *">
            <input
              className={inputClass}
              value={form.name}
              onChange={update("name")}
              placeholder="اسم الصفقة"
              required
            />
          </Field>

          <Field label="نوع الصفقة *">
            <select
              className={inputClass}
              value={form.type}
              onChange={update("type")}
              required
            >
              {TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="رقم الصفقة">
            <input
              className={inputClass}
              value={form.number}
              onChange={update("number")}
              placeholder="اختياري - يُمكن تركه فارغًا"
              dir="ltr"
            />
          </Field>

          <Field label="العميل (اختياري)">
            <select
              className={inputClass}
              value={form.customer_id}
              onChange={update("customer_id")}
              disabled={loadingOptions}
            >
              <option value="">
                {loadingOptions ? "جاري تحميل العملاء..." : "بدون عميل"}
              </option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="الشريك (اختياري)">
            <select
              className={inputClass}
              value={form.partner_id}
              onChange={update("partner_id")}
              disabled={loadingOptions}
            >
              <option value="">
                {loadingOptions ? "جاري تحميل الشركاء..." : "بدون شريك"}
              </option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="المسؤول (اختياري)">
            <select
              className={inputClass}
              value={form.assigned_to}
              onChange={update("assigned_to")}
              disabled={loadingOptions}
            >
              <option value="">
                {loadingOptions ? "جاري تحميل الفريق..." : "بدون مسؤول"}
              </option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="قيمة الصفقة *">
            <input
              className={inputClass}
              type="number"
              min="0"
              step="any"
              value={form.value}
              onChange={update("value")}
              placeholder="45000"
              required
              dir="ltr"
            />
          </Field>

          <Field label="نسبة الخصم (%)">
            <input
              className={inputClass}
              type="number"
              min="0"
              max="100"
              step="any"
              value={form.discount}
              onChange={update("discount")}
              placeholder="0"
              dir="ltr"
            />
          </Field>

          <Field label="شروط الدفع">
            <input
              className={inputClass}
              value={form.payment_terms}
              onChange={update("payment_terms")}
              placeholder="مثال: 50% مقدم و50% عند التسليم"
            />
          </Field>

          <Field label="مرحلة الصفقة">
            <select
              className={inputClass}
              value={form.stage}
              onChange={update("stage")}
            >
              {STAGES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="احتمالية الإغلاق (%)">
            <input
              className={inputClass}
              type="number"
              min="0"
              max="100"
              value={form.closing_probability}
              onChange={update("closing_probability")}
              placeholder="0 - 100"
              dir="ltr"
            />
          </Field>

          <Field label="تاريخ الإغلاق المتوقع">
            <input
              className={inputClass}
              type="date"
              value={form.expected_close_date}
              onChange={update("expected_close_date")}
            />
          </Field>

          <Field label="العمولة المتوقعة">
            <input
              className={inputClass}
              type="number"
              min="0"
              step="any"
              value={form.expected_commission}
              onChange={update("expected_commission")}
              dir="ltr"
            />
          </Field>

          <Field label="حالة العمولة">
            <select
              className={inputClass}
              value={form.commission_status}
              onChange={update("commission_status")}
            >
              {COMMISSION_STATUSES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-5 border-t border-line pt-4">
          <h3 className="mb-3 text-[13px] font-bold text-ink">
            بيانات سجل العمولة (اختياري)
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="نسبة العمولة (%)">
              <input
                className={inputClass}
                type="number"
                min="0"
                max="100"
                step="any"
                value={form.commission_rate}
                onChange={update("commission_rate")}
                placeholder="مثال: 5"
                dir="ltr"
              />
            </Field>

            <Field label="حالة سجل العمولة">
              <select
                className={inputClass}
                value={form.commission_record_status}
                onChange={update("commission_record_status")}
              >
                {COMMISSION_RECORD_STATUSES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="تاريخ استحقاق العمولة">
              <input
                className={inputClass}
                type="date"
                value={form.commission_due_date}
                onChange={update("commission_due_date")}
              />
            </Field>

            <Field label="تاريخ دفع العمولة">
              <input
                className={inputClass}
                type="date"
                value={form.commission_paid_date}
                onChange={update("commission_paid_date")}
              />
            </Field>

            <Field label="معرّف العقد">
              <input
                className={inputClass}
                type="number"
                min="1"
                value={form.commission_contract_id}
                onChange={update("commission_contract_id")}
                dir="ltr"
              />
            </Field>

            <Field label="حالة الصفقة للعمولة">
              <select
                className={inputClass}
                value={form.commission_deal_status}
                onChange={update("commission_deal_status")}
              >
                {STAGES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <p className="mt-2 text-[10px] text-neutral-400">
            سيتم إنشاء سجل عمولة فقط عند إدخال نسبة العمولة.
          </p>
        </div>

        <div className="mt-4">
          <Field label="ملاحظات">
            <textarea
              className="input !h-20 py-2"
              value={form.notes}
              onChange={update("notes")}
              placeholder="ملاحظات عن الصفقة..."
            />
          </Field>
        </div>

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

        <div className="mt-5 flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="btn btn-dark disabled:opacity-50"
          >
            {saving ? "جاري الحفظ..." : "إضافة الصفقة"}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="btn disabled:opacity-50"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
