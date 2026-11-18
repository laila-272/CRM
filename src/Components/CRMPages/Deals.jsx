import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Download,
  SlidersHorizontal,
  ChevronDown,
  Landmark,
  Briefcase,
  Target,
  Timer,
  MoreHorizontal,
  Search,
  RefreshCw,
  Plus,
  Trash2,
  LoaderCircle,
} from "lucide-react";

import DealFormModal from "./DealFormModal.jsx";
import {
  getDeals,
  createDeal,
  deleteDeal,
  exportDealsPdf,
  exportDealsExcel,
} from "../../Services/dealService.js";
import KanbanColumn from "./Kanbancolumn.jsx";

const STAGES = [
  { value: "new_customer", label: "عميل جديد" },
  { value: "initial_contact", label: "تواصل أولي" },
  { value: "meeting", label: "اجتماع / عرض" },
  { value: "negotiation", label: "تفاوض" },
  { value: "contracted", label: "تعاقد" },
];

const STATUS_LABELS = {
  pending: "قيد الانتظار",
  approved: "معتمدة",
  paid: "مدفوعة",
};

const STATUS_CLS = {
  pending: "bg-amber-50 text-amber-600",
  approved: "bg-blue-50 text-blue-600",
  paid: "bg-green-50 text-green-600",
};

const formatMoney = (value) =>
  `${Number(value || 0).toLocaleString("en-US")} EGP`;

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

function mapDeal(deal) {
  return {
    id: deal.id,
    number: deal.number || "",
    title: deal.name || "",
    type: deal.type || "",
    customer: deal.customer?.name || "—",
    partner: deal.partner?.name || "—",
    owner: deal.assigned_to?.name || "—",
    stage: deal.stage,
    status: deal.commission_status || "pending",
    value: Number(deal.value || 0),
    netValue: Number(deal.net_value || 0),
    probability: Number(deal.closing_probability || 0),
    expectedClose: deal.expected_close_date,
    expectedCommission: Number(deal.expected_commission || 0),
    updatedAt: deal.updated_at,
    createdAt: deal.created_at,
  };
}

function Stat({ icon: Icon, tag, value, label }) {
  return (
    <div className="bg-white border border-line rounded-xl p-3.5">
      <div className="flex items-center justify-between">
        <Icon size={20} className="text-neutral-500" />

        <span className="text-[9.5px] bg-neutral-100 text-neutral-500 rounded-full px-2 py-0.5">
          {tag}
        </span>
      </div>

      <div className="mt-3 text-[22px] leading-tight font-semibold text-ink">
        {value}
      </div>

      <div className="mt-1.5 text-[10.5px] text-neutral-500">{label}</div>
    </div>
  );
}

function DealCard({ d, onDelete, deleting }) {
  return (
    <div className="bg-white border border-line rounded-xl p-3 shadow-sm transition-colors hover:border-neutral-300">
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-[9.5px] font-semibold rounded-full px-2 py-0.5 ${
            STATUS_CLS[d.status] || "bg-neutral-100 text-neutral-500"
          }`}
        >
          {STATUS_LABELS[d.status] || d.status}
        </span>

        <button
          type="button"
          disabled={deleting}
          onClick={() => onDelete(d)}
          title="حذف الصفقة"
          className="flex items-center justify-center w-7 h-7 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {deleting ? (
            <LoaderCircle size={14} className="animate-spin" />
          ) : (
            <Trash2 size={14} />
          )}
        </button>
      </div>

      <Link to={`/deals/${d.id}`} className="block mt-2">
        <div className="text-[12.5px] font-bold text-ink">{d.customer}</div>

        <div className="text-[10.5px] text-neutral-500">{d.title}</div>

        {/* <div className="mt-2 text-[10px] text-neutral-500">
          موعد الإغلاق المتوقع:{" "}
          <span className="text-ink">{formatDate(d.expectedClose)}</span>
        </div> */}
        <div className="mt-2 text-[10px] text-neutral-500">
          الخطوة التالية:  {" "}
          <span className="text-ink">{d.stage}</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-2 text-[9.5px]">
          <span className="bg-neutral-100 text-ink rounded-md px-1.5 py-0.5 truncate">
            {d.owner}
          </span>
          {/* <span className="bg-neutral-100 text-neutral-500 rounded-md px-1.5 py-0.5">
            {d.number}
          </span> */}
        </div>
      </Link>
    </div>
  );
}

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [stats, setStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [owner, setOwner] = useState("all");
  const [status, setStatus] = useState("all");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingDealId, setDeletingDealId] = useState(null);

  // Fetch deals
  const fetchDeals = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getDeals();

      setDeals((result.deals || []).map(mapDeal));
      setStats(result.stats || null);
    } catch (err) {
      console.error("FETCH DEALS ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "حدث خطأ أثناء تحميل الصفقات",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  // Owners filter
  const owners = useMemo(
    () => [
      ...new Set(deals.map((d) => d.owner).filter((name) => name !== "—")),
    ],
    [deals],
  );

  // Search and filters
  const list = useMemo(() => {
    const search = q.trim().toLowerCase();

    return deals.filter(
      (d) =>
        (owner === "all" || d.owner === owner) &&
        (status === "all" || d.status === status) &&
        (!search ||
          [d.customer, d.title, d.number, d.partner, d.owner].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(search),
          )),
    );
  }, [deals, q, owner, status]);

  // Count deals by stage
  const count = (stage) => list.filter((deal) => deal.stage === stage).length;

  // Create deal
  const handleCreateDeal = async (formData) => {
    try {
      await createDeal(formData);
      await fetchDeals();
      setShowCreateModal(false);
    } catch (err) {
      console.error("CREATE DEAL ERROR:", err);
      throw err;
    }
  };

  // Delete deal
  const handleDeleteDeal = async (deal) => {
    const confirmed = window.confirm(
      `هل أنتِ متأكدة من حذف الصفقة "${deal.title}"؟\nلا يمكن التراجع عن هذا الإجراء.`,
    );

    if (!confirmed) return;

    try {
      setDeletingDealId(deal.id);

      await deleteDeal(deal.id);

      // Refresh deals and statistics
      await fetchDeals();
    } catch (err) {
      console.error("DELETE DEAL ERROR:", err);

      window.alert(
        err.response?.data?.message ||
          err.message ||
          "حدث خطأ أثناء حذف الصفقة",
      );
    } finally {
      setDeletingDealId(null);
    }
  };

  const selectCls =
    "appearance-none h-8 rounded-lg border border-line bg-white pr-3 pl-7 text-[11px] text-neutral-600 outline-none cursor-pointer";

  return (
    <div dir="rtl" className="max-w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-extrabold text-ink leading-tight">
            الصفقات
          </h1>

          <p className="mt-1 text-[11px] text-neutral-500">
            تابع كل عميل في أي مرحلة يقف، وما آخر إجراء قام به وخطوته التالية.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="shrink-0 inline-flex items-center gap-1.5 h-8 rounded-full bg-ink text-white px-3.5 text-[11.5px] font-semibold"
        >
          <Plus size={13} />
          إضافة صفقة
        </button>
      </div>

      {/* Filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] order-first">
          <Search
            size={13}
            className="absolute top-1/2 -translate-y-1/2 right-3 text-neutral-400"
          />

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="بحث عن صفقة أو عميل أو رقم الصفقة"
            className="w-full h-8 rounded-lg border border-line bg-white pr-8 pl-3 text-[11px] outline-none focus:border-neutral-400"
          />
        </div>

        <div className="relative">
          <select
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className={selectCls}
          >
            <option value="all">كل المسؤولين</option>

            {owners.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>

          <ChevronDown
            size={11}
            className="absolute top-1/2 -translate-y-1/2 left-2 text-neutral-400 pointer-events-none"
          />
        </div>

        <div className="relative">
          <SlidersHorizontal
            size={11}
            className="absolute top-1/2 -translate-y-1/2 right-2.5 text-neutral-500 pointer-events-none"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`${selectCls} pr-7`}
          >
            <option value="all">كل حالات العمولة</option>

            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <ChevronDown
            size={11}
            className="absolute top-1/2 -translate-y-1/2 left-2 text-neutral-400 pointer-events-none"
          />
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportDealsPdf}
            className="inline-flex items-center gap-1.5 h-8 rounded-lg border border-line bg-white px-3 text-[11px] text-neutral-600"
          >
            <Download size={12} />
            PDF
          </button>

          <button
            type="button"
            onClick={exportDealsExcel}
            className="inline-flex items-center gap-1.5 h-8 rounded-lg border border-line bg-white px-3 text-[11px] text-neutral-600"
          >
            <Download size={12} />
            Excel
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat
          icon={Landmark}
          tag="إجمالي القيمة"
          value={formatMoney(stats?.total_value)}
          label="إجمالي قيمة الصفقات"
        />

        <Stat
          icon={Target}
          tag="قيد التفاوض"
          value={count("negotiation")}
          label="صفقات في مرحلة التفاوض"
        />

        <Stat
          icon={Briefcase}
          tag="مكتملة"
          value={count("contracted")}
          label="صفقات في مرحلة التعاقد"
        />

        <Stat
          icon={Timer}
          tag="كل المراحل"
          value={stats?.total ?? deals.length}
          label="إجمالي عدد الصفقات"
        />
      </div>

      {/* Board */}
      {loading ? (
        <div className="mt-6 p-10 text-center text-[12px] text-neutral-400">
          جاري تحميل الصفقات...
        </div>
      ) : error ? (
        <div className="mt-6 p-8 text-center bg-white border border-line rounded-xl">
          <p className="text-[12px] text-red-500 mb-3">{error}</p>

          <button
            type="button"
            onClick={fetchDeals}
            className="inline-flex items-center gap-2 text-[11px] text-ink"
          >
            <RefreshCw size={13} />
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto pb-2">
          <div className="grid grid-flow-col auto-cols-[minmax(190px,1fr)] gap-3 min-w-[980px] lg:min-w-0 lg:grid-flow-row lg:grid-cols-5">
            {STAGES.map((stage) => {
              const columnDeals = list.filter(
                (deal) => deal.stage === stage.value,
              );

              return (
                <KanbanColumn
                  key={stage.value}
                  title={stage.label}
                  count={`${columnDeals.length} صفقات`}
                  itemCount={columnDeals.length}
                >
                  {columnDeals.map((deal) => (
                    <DealCard
                      key={deal.id}
                      d={deal}
                      onDelete={handleDeleteDeal}
                      deleting={deletingDealId === deal.id}
                    />
                  ))}

                  {!columnDeals.length && (
                    <div className="border border-dashed border-neutral-300 rounded-xl p-4 text-center text-[10.5px] text-neutral-400">
                      لا توجد صفقات
                    </div>
                  )}
                </KanbanColumn>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Deal Modal */}
      {showCreateModal && (
        <DealFormModal
          onSave={handleCreateDeal}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}
