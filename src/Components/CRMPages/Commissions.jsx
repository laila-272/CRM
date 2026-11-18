import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  CircleDollarSign,
  Wallet,
  X,
  Plus,
  Pencil,
  LoaderCircle,
} from "lucide-react";

import {
  getCommissions,
  getCommissionStats,
  getDealsForCommissions,
  createCommission,
  updateCommission,
} from "../../Services/commissionService.js";

import {
  card,
  Chip,
  egp,
  PageHeader,
  PagerBar,
  SearchBox,
  StatCard,
  td,
  th,
} from "../Shared/ui.jsx";

const PAGE_SIZE = 5;

const MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const STATUS_LABELS = {
  paid: "مدفوعة",
  pending: "قيد الانتظار",
  overdue: "متأخرة",
};

const ST_CLS = {
  مدفوعة: "text-green-600 font-bold",
  "قيد الانتظار": "text-neutral-600",
  متأخرة: "text-red-500 font-bold",
};

const formatDate = (date) => {
  if (!date) return "—";

  return date.split("T")[0];
};

const normalizeCommission = (item) => ({
  id: item.id,
  dealId: item.deal_id,
  dealNumber: item.deal_number || "—",
  dealName: item.deal_name || "—",
  customer: item.customer?.name || "—",
  beneficiary: item.beneficiary_name || "—",
  dealValue: Number(item.deal_value) || 0,
  pct: Number(item.commission_rate) || 0,
  amount: Number(item.commission_amount) || 0,
  status: STATUS_LABELS[item.status] || item.status || "—",
  due: formatDate(item.due_date),
  paidAt: formatDate(item.paid_date),
  contract: item.contract,
  currency: item.currency,
  rawStatus: item.status,
});

function DetailsModal({ c, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const Row = ({ label, value, tint = "" }) => (
    <div
      className={`flex min-w-0 items-center justify-between gap-3 rounded-xl px-3 py-2 text-[11px] sm:text-xs ${tint}`}
    >
      <span className="shrink-0 text-neutral-500">{label}</span>

      <b
        dir="rtl"
        className="min-w-0 break-words text-left font-medium text-ink"
      >
        {value}
      </b>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3 sm:p-5"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        dir="rtl"
        className="w-full max-w-[560px] rounded-xl bg-white px-5 py-6 shadow-xl sm:px-9 sm:py-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-extrabold text-ink sm:text-xl">
            تفاصيل العمولة
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 transition hover:bg-neutral-50"
          >
            <X size={17} />
          </button>
        </div>

        <div className="mt-5 rounded-lg border border-[#E5E7EB] bg-[#F8F9FA] p-3 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 text-right">
              <b dir="ltr" className="text-xs text-ink sm:text-sm">
                {c.dealNumber}
              </b>

              <p className="mt-2 break-words text-xs leading-6 text-neutral-500 sm:text-sm">
                {c.dealName}
              </p>

              <p className="mt-1 break-words text-xs text-neutral-500">
                {c.customer} — {c.beneficiary}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-[10px] ${ST_CLS[c.status] || "text-neutral-600"}`}
            >
              {c.status}
            </span>
          </div>
        </div>

        <div className="mt-5 border-y border-dotted border-neutral-300 py-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <p className="text-[11px] text-neutral-500 sm:text-xs">
                قيمة الصفقة
              </p>
              <p className="mt-2 text-xs text-ink sm:text-sm">
                {egp(c.dealValue)}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-neutral-500 sm:text-xs">
                نسبة العمولة
              </p>
              <p className="mt-2 text-xs text-ink sm:text-sm">{c.pct}%</p>
            </div>

            <div className="col-span-2">
              <Row
                label="مبلغ العمولة"
                value={egp(c.amount)}
                tint="bg-green-50/70 text-green-700"
              />
            </div>

            <div>
              <p className="text-[11px] text-neutral-500 sm:text-xs">
                تاريخ الدفع
              </p>
              <p className="mt-2 text-xs text-ink sm:text-sm">{c.paidAt}</p>
            </div>

            <div>
              <p className="text-[11px] text-neutral-500 sm:text-xs">
                تاريخ الاستحقاق
              </p>
              <p className="mt-2 text-xs text-ink sm:text-sm">{c.due}</p>
            </div>

            <div className="col-span-2">
              <Row label="رقم العقد" value={c.contract?.number || "—"} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateCommissionModal({ deals, onClose, onCreate, loading }) {
  const [form, setForm] = useState({
    deal_id: "",
    beneficiary_name: "",
    commission_rate: "",
    status: "pending",
    contract_id: "",
    due_date: "",
    paid_date: "",
  });

  const [error, setError] = useState("");

  const selectedDeal = deals.find(
    (deal) => String(deal.id) === String(form.deal_id),
  );

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleDealChange = (value) => {
    const deal = deals.find((item) => String(item.id) === String(value));

    setForm((prev) => ({
      ...prev,
      deal_id: value,
      beneficiary_name: deal?.partner?.name || deal?.assigned_to?.name || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.deal_id) {
      setError("من فضلك اختاري الصفقة");
      return;
    }

    if (!form.beneficiary_name.trim()) {
      setError("من فضلك أدخلي اسم المستفيد");
      return;
    }

    if (form.commission_rate === "" || Number(form.commission_rate) < 0) {
      setError("من فضلك أدخلي نسبة عمولة صحيحة");
      return;
    }

    if (form.status === "paid" && !form.paid_date) {
      setError("من فضلك أدخلي تاريخ الدفع");
      return;
    }

    const payload = {
      deal_id: Number(form.deal_id),
      beneficiary_name: form.beneficiary_name.trim(),
      commission_rate: Number(form.commission_rate),
      status: form.status,
      contract_id: form.contract_id ? Number(form.contract_id) : null,
      due_date: form.due_date || null,
      paid_date: form.status === "paid" ? form.paid_date || null : null,
    };

    try {
      await onCreate(payload);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "حدث خطأ أثناء إنشاء العمولة",
      );
    }
  };

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-neutral-500";

  const labelClass = "text-xs font-medium text-neutral-600";

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3 sm:p-5"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <form
        dir="rtl"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-7"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-ink">إضافة عمولة جديدة</h2>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-50"
          >
            <X size={17} />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className={labelClass}>الصفقة *</label>

            <select
              value={form.deal_id}
              onChange={(e) => handleDealChange(e.target.value)}
              className={inputClass}
              required
            >
              <option value="">اختاري الصفقة</option>

              {deals.map((deal) => (
                <option key={deal.id} value={deal.id}>
                  {deal.number} - {deal.name}
                </option>
              ))}
            </select>
          </div>

          {selectedDeal && (
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-neutral-500">العميل</span>
                <b>{selectedDeal.customer?.name || "—"}</b>
              </div>

              <div className="mt-2 flex justify-between gap-3">
                <span className="text-neutral-500">قيمة الصفقة</span>
                <b>{egp(selectedDeal.net_value ?? selectedDeal.value)}</b>
              </div>
            </div>
          )}

          <div>
            <label className={labelClass}>اسم المستفيد *</label>

            <input
              type="text"
              value={form.beneficiary_name}
              onChange={(e) => updateField("beneficiary_name", e.target.value)}
              placeholder="اسم المستفيد"
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>نسبة العمولة (%) *</label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={form.commission_rate}
                onChange={(e) => updateField("commission_rate", e.target.value)}
                placeholder="مثال: 5"
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className={labelClass}>الحالة</label>

              <select
                value={form.status}
                onChange={(e) => {
                  const value = e.target.value;

                  setForm((prev) => ({
                    ...prev,
                    status: value,
                    paid_date: value === "paid" ? prev.paid_date : "",
                  }));
                }}
                className={inputClass}
              >
                <option value="pending">قيد الانتظار</option>
                <option value="paid">مدفوعة</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>تاريخ الاستحقاق</label>

              <input
                type="date"
                value={form.due_date}
                onChange={(e) => updateField("due_date", e.target.value)}
                className={inputClass}
              />
            </div>

            {form.status === "paid" && (
              <div>
                <label className={labelClass}>تاريخ الدفع *</label>

                <input
                  type="date"
                  value={form.paid_date}
                  onChange={(e) => updateField("paid_date", e.target.value)}
                  className={inputClass}
                  required
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className={labelClass}>رقم العقد (اختياري)</label>

              <input
                type="number"
                min="1"
                value={form.contract_id}
                onChange={(e) => updateField("contract_id", e.target.value)}
                placeholder="Contract ID"
                className={inputClass}
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 p-3 text-xs text-red-600">
              {error}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="btn flex-1 !rounded-lg"
            disabled={loading}
          >
            إلغاء
          </button>

          <button
            type="submit"
            disabled={loading}
            className="btn flex flex-1 items-center justify-center gap-2 !rounded-lg !bg-black text-white disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle size={15} className="animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Plus size={15} />
                إضافة العمولة
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Edit commission modal
function EditCommissionModal({ commission, onClose, onUpdate, loading }) {
  const [form, setForm] = useState({
    commission_rate: String(commission.pct),
    status: commission.rawStatus || "pending",
    due_date: commission.due === "—" ? "" : commission.due,
  });

  const [error, setError] = useState("");

  const updateField = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      form.commission_rate === "" ||
      Number(form.commission_rate) < 0 ||
      !Number.isFinite(Number(form.commission_rate))
    ) {
      setError("من فضلك أدخلي نسبة عمولة صحيحة");
      return;
    }

    const payload = {
      commission_rate: Number(form.commission_rate),
      status: form.status,
      due_date: form.due_date || null,
    };

    try {
      await onUpdate(payload);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "حدث خطأ أثناء تعديل العمولة",
      );
    }
  };

  const inputClass =
    "mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-xs outline-none transition focus:border-neutral-500";

  const labelClass = "text-xs font-medium text-neutral-600";

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-3 sm:p-5"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <form
        dir="rtl"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-xl bg-white p-5 shadow-xl sm:p-7"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-ink">تعديل العمولة</h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 hover:bg-neutral-50"
          >
            <X size={17} />
          </button>
        </div>

        <div className="mt-5 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs">
          <div className="flex justify-between gap-3">
            <span className="text-neutral-500">رقم الصفقة</span>
            <b dir="ltr">{commission.dealNumber}</b>
          </div>

          <div className="mt-2 flex justify-between gap-3">
            <span className="text-neutral-500">العميل</span>
            <b>{commission.customer}</b>
          </div>

          <div className="mt-2 flex justify-between gap-3">
            <span className="text-neutral-500">المستفيد</span>
            <b>{commission.beneficiary}</b>
          </div>

          <div className="mt-2 flex justify-between gap-3">
            <span className="text-neutral-500">قيمة الصفقة</span>
            <b>{egp(commission.dealValue)}</b>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>نسبة العمولة (%) *</label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={form.commission_rate}
              onChange={(e) => updateField("commission_rate", e.target.value)}
              placeholder="مثال: 5"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className={labelClass}>الحالة</label>

            <select
              value={form.status}
              onChange={(e) => updateField("status", e.target.value)}
              className={inputClass}
            >
              <option value="pending">قيد الانتظار</option>
              <option value="paid">مدفوعة</option>
              <option value="overdue">متأخرة</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>تاريخ الاستحقاق</label>

            <input
              type="date"
              value={form.due_date}
              onChange={(e) => updateField("due_date", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-600">
            {error}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="btn flex-1 !rounded-lg"
            disabled={loading}
          >
            إلغاء
          </button>

          <button
            type="submit"
            disabled={loading}
            className="btn flex flex-1 items-center justify-center gap-2 !rounded-lg !bg-black text-white disabled:opacity-60"
          >
            {loading ? (
              <>
                <LoaderCircle size={15} className="animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Pencil size={15} />
                حفظ التعديلات
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Commissions() {
  const [all, setAll] = useState([]);
  const [deals, setDeals] = useState([]);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const [selected, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [commissionsResponse, statsResponse, dealsResponse] =
        await Promise.all([
          getCommissions(),
          getCommissionStats(),
          getDealsForCommissions(),
        ]);

      setAll((commissionsResponse.data || []).map(normalizeCommission));

      setStats(statsResponse);
      setDeals(dealsResponse || []);
    } catch (err) {
      console.error("Failed to load commissions:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "حدث خطأ أثناء تحميل العمولات",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (payload) => {
    try {
      setSaving(true);

      const response = await createCommission(payload);

      if (response.data) {
        setAll((prev) => [normalizeCommission(response.data), ...prev]);
      }

      if (response.stats) {
        setStats(response.stats);
      } else {
        const updatedStats = await getCommissionStats();
        setStats(updatedStats);
      }

      setShowCreate(false);
      setPage(1);
      setStatus("all");
      setQ("");
    } finally {
      setSaving(false);
    }
  };

  // Update commission
  const handleUpdate = async (payload) => {
    if (!editing) return;

    try {
      setSaving(true);

      const response = await updateCommission(editing.id, payload);

      if (response.data) {
        const updatedCommission = normalizeCommission(response.data);

        setAll((prev) =>
          prev.map((commission) =>
            commission.id === updatedCommission.id
              ? updatedCommission
              : commission,
          ),
        );

        setSelected((prev) =>
          prev?.id === updatedCommission.id ? updatedCommission : prev,
        );
      }

      if (response.stats) {
        setStats(response.stats);
      } else {
        const updatedStats = await getCommissionStats();
        setStats(updatedStats);
      }

      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  const list = useMemo(() => {
    const search = q.trim().toLowerCase();

    return all.filter((c) => {
      const matchesStatus = status === "all" || c.status === status;

      const matchesSearch =
        !search ||
        [c.dealNumber, c.dealName, c.customer, c.beneficiary].some((value) =>
          String(value).toLowerCase().includes(search),
        );

      return matchesStatus && matchesSearch;
    });
  }, [all, q, status]);

  const statuses = useMemo(() => [...new Set(all.map((c) => c.status))], [all]);

  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const cur = Math.min(page, pages);

  const rows = list.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

  const from = list.length ? (cur - 1) * PAGE_SIZE + 1 : 0;

  const monthly = useMemo(() => {
    return (
      stats?.monthly_commissions?.map((item) => ({
        month: MONTHS[item.month - 1] || item.month,
        value: Number(item.amount) || 0,
      })) || []
    );
  }, [stats]);

  const max = Math.max(0, ...monthly.map((item) => item.value));

  const setFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  return (
    <div dir="rtl" className="max-w-full">
      <PageHeader
        title="العمولات"
        subtitle="راجع استحقاقات فريق المبيعات والوسطاء وتابع كل عمولة حتى صرفها."
      >
        <button
          className="btn flex h-9 items-center gap-2 !rounded-lg !bg-black text-white"
          onClick={() => setShowCreate(true)}
        >
          <Plus size={15} />
          إضافة عمولة
        </button>
      </PageHeader>

      {error && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600">
          <span>{error}</span>

          <button onClick={loadData} className="font-bold underline">
            إعادة المحاولة
          </button>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={CircleDollarSign}
          value={egp(stats?.total_amount ?? 0, 2)}
          label="إجمالي العمولات"
        />

        <StatCard
          icon={Wallet}
          value={egp(stats?.paid_amount ?? 0, 2)}
          label="العمولات المدفوعة"
        />

        <StatCard
          icon={Briefcase}
          value={stats?.total_commissions ?? all.length}
          label="إجمالي عدد العمولات"
        />
      </div>

      <div className="my-5 flex flex-wrap items-center gap-2">
        <SearchBox
          value={q}
          onChange={setFilter(setQ)}
          placeholder="ابحث برقم الصفقة أو العميل أو المستفيد..."
          className="order-2 min-w-[240px] flex-1 sm:order-none"
        />

        <div className="flex flex-wrap gap-1.5">
          <Chip
            active={status === "all"}
            onClick={() => setFilter(setStatus)("all")}
          >
            الكل {all.length}
          </Chip>

          {statuses.map((s) => (
            <Chip
              key={s}
              active={status === s}
              onClick={() => setFilter(setStatus)(s)}
            >
              {s} {all.filter((c) => c.status === s).length}
            </Chip>
          ))}
        </div>
      </div>

      <div className={`${card} mt-3 overflow-x-auto`}>
        <table className="w-full min-w-[900px]">
          <thead className="bg-neutral-50/70">
            <tr>
              {[
                "رقم الصفقة",
                "العميل",
                "المستفيد",
                "قيمة الصفقة",
                "نسبة العمولة",
                "مبلغ العمولة",
                "تاريخ الاستحقاق",
                "الحالة",
                "الإجراءات",
              ].map((heading) => (
                <th key={heading} className={th}>
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="p-10 text-center">
                  <LoaderCircle
                    size={22}
                    className="mx-auto animate-spin text-neutral-500"
                  />
                  <p className="mt-2 text-xs text-neutral-400">
                    جاري تحميل العمولات...
                  </p>
                </td>
              </tr>
            ) : (
              <>
                {rows.map((c) => {
                  const dim = c.status === "ملغاة" ? "text-neutral-400" : "";

                  return (
                    <tr
                      key={c.id}
                      className={`border-t border-line ${
                        c.status === "مدفوعة" ? "bg-green-50/40" : ""
                      }`}
                    >
                      <td className={`${td} ${dim} py-6`}>{c.dealNumber}</td>

                      <td className={`${td} ${dim} py-6`}>{c.customer}</td>

                      <td className={`${td} ${dim} py-6`}>{c.beneficiary}</td>

                      <td
                        className={`${td} ${dim} py-6`}
                        dir="ltr"
                        style={{ textAlign: "right" }}
                      >
                        {egp(c.dealValue)}
                      </td>

                      <td className={`${td} ${dim} py-6`}>{c.pct}%</td>

                      <td
                        className={`${td} ${dim} py-6`}
                        dir="ltr"
                        style={{ textAlign: "right" }}
                      >
                        {egp(c.amount)}
                      </td>

                      <td className={`${td} ${dim} py-6`}>{c.due}</td>

                      <td className={`${td} ${ST_CLS[c.status] || ""} py-6`}>
                        {c.status}
                      </td>

                      <td className={`${td} py-6`}>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelected(c)}
                            className="h-6 rounded-full border border-neutral-300 px-3 text-[10px] hover:bg-neutral-50"
                          >
                            التفاصيل
                          </button>

                          <button
                            onClick={() => setEditing(c)}
                            className="flex h-6 items-center gap-1 rounded-full border border-neutral-300 px-3 text-[10px] transition hover:bg-neutral-50"
                          >
                            <Pencil size={11} />
                            تعديل
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!rows.length && (
                  <tr>
                    <td
                      colSpan={9}
                      className="p-8 text-center text-[11px] text-neutral-400"
                    >
                      لا توجد عمولات مطابقة
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>

        {!loading && (
          <PagerBar
            page={cur}
            pages={pages}
            onPage={setPage}
            info={`إظهار ${from}–${from ? from + rows.length - 1 : 0} من ${list.length} عمولة`}
          />
        )}
      </div>

      <section className={`${card} mt-4 p-4 py-7`}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[12.5px] font-extrabold text-ink">
            نظرة عامة على العمولات الشهرية
          </h2>

          <span className="text-[10px] text-neutral-400">2026 · جنيه مصري</span>
        </div>

        {monthly.length > 0 ? (
          <div className="mt-4 flex h-[150px] items-end justify-around gap-2 select-none">
            {monthly.map((item, index) => {
              const isLast = index === monthly.length - 1;

              const heightPercentage =
                max > 0 ? Math.min((item.value / max) * 100, 100) : 0;

              const shades = [
                "bg-neutral-200",
                "bg-neutral-300",
                "bg-neutral-500",
                "bg-neutral-300",
                "bg-slate-700",
                "bg-ink",
              ];

              return (
                <div
                  key={item.month}
                  className="flex h-full max-w-[40px] flex-1 flex-col items-center justify-end"
                >
                  <div className="mb-1 flex h-4 items-center justify-center">
                    <span
                      className={`whitespace-nowrap text-[9px] leading-none ${
                        isLast ? "font-extrabold text-ink" : "text-neutral-500"
                      }`}
                    >
                      {Math.round(item.value).toLocaleString("en-US")}
                    </span>
                  </div>

                  <div className="flex w-full flex-1 items-end">
                    <div
                      className={`w-full rounded-t-sm ${
                        shades[index % shades.length]
                      }`}
                      style={{
                        height: `${heightPercentage}%`,
                      }}
                    />
                  </div>

                  <div className="mt-1.5 flex h-4 items-center justify-center">
                    <span
                      className={`whitespace-nowrap text-[9px] leading-none ${
                        isLast ? "font-extrabold text-ink" : "text-neutral-500"
                      }`}
                    >
                      {item.month}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-10 text-center text-xs text-neutral-400">
            لا توجد بيانات شهرية
          </p>
        )}
      </section>

      {selected && (
        <DetailsModal c={selected} onClose={() => setSelected(null)} />
      )}

      {showCreate && (
        <CreateCommissionModal
          deals={deals}
          loading={saving}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}

      {editing && (
        <EditCommissionModal
          commission={editing}
          loading={saving}
          onClose={() => setEditing(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
