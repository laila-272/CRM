import { ChevronDown, Plus, Search, Pencil, Archive } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import CustomerAnalytics from "../Customers/CustomerAnalytics.jsx";
import CustomerFormModal from "../Customers/CustomerFormModal.jsx";
import StatusBadge from "../Customers/StatusBadge.jsx";
import { PagerBar } from "../Shared/ui.jsx";

import {
  getLeads,
  getLeadSources,
  getTeamMembers,
  createLead,
  updateLead,
  deleteLead,
  exportLeadsExcel,
  exportLeadsPdf,
} from "../../Services/leadService.js";

const PAGE_SIZE = 7;

const STATUS_OPTIONS = [
  { value: "new", label: "جديد" },
  { value: "contacted", label: "تم التواصل" },
  { value: "qualified", label: "مؤهَّل" },
  { value: "proposal", label: "عرض سعر" },
  { value: "negotiation", label: "تفاوض" },
  { value: "declined", label: "مرفوض" },
  { value: "converted", label: "تم التحويل" },
];

function Stat({ label, value }) {
  return (
    <div className="card px-4 py-3">
      <div className="text-[11px] text-neutral-500">{label}</div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function mapLead(lead) {
  return {
    ...lead,
    owner: lead.assigned_to?.name || "—",
    source: lead.source?.name || "—",
    status: lead.status_label || lead.status,
    nextFollowUp: formatDate(lead.next_follow_up_at),
    budget: lead.budget ?? "—",
    project: "—",
  };
}

export default function PotentialClients() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({});
  const [meta, setMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });

  const [sources, setSources] = useState([]);
  const [members, setMembers] = useState([]);

  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [exportMenu, setExportMenu] = useState(false);
  const [exportLoading, setExportLoading] = useState("");

  const [filters, setFilters] = useState({
    status: "",
    source: "",
    project: "",
  });

  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(params.get("add") === "1");
  const [editing, setEditing] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (params.get("add") === "1") {
      setAdding(true);
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  // Fetch leads from API
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getLeads({
        page,
        per_page: PAGE_SIZE,
        search: q,
        status: filters.status,
      });

      setLeads(response.data || []);
      setStats(response.stats || {});
      setMeta(
        response.meta || {
          current_page: 1,
          last_page: 1,
          total: 0,
        },
      );
    } catch (err) {
      console.error("FETCH LEADS ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "حصل خطأ أثناء تحميل العملاء",
      );
    } finally {
      setLoading(false);
    }
  }, [page, q, filters.status]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Fetch sources and team members
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [sourcesData, membersData] = await Promise.all([
          getLeadSources(),
          getTeamMembers(),
        ]);

        setSources(sourcesData);
        setMembers(membersData);
      } catch (err) {
        console.error("FETCH OPTIONS ERROR:", err);

        setError(
          err.response?.data?.message ||
            err.message ||
            "حصل خطأ أثناء تحميل المصادر وأعضاء الفريق",
        );
      }
    };

    fetchOptions();
  }, []);

  const customers = useMemo(() => leads.map(mapLead), [leads]);

  const filtered = useMemo(() => {
    return customers.filter(
      (customer) =>
        (!filters.source || customer.source === filters.source) &&
        (!filters.project || customer.project === filters.project),
    );
  }, [customers, filters.source, filters.project]);

  const pages = Math.max(1, Number(meta.last_page || 1));
  const cur = Math.min(Number(meta.current_page || page), pages);

  // Export Excel or PDF from API
  const handleExport = async (type) => {
    try {
      setExportLoading(type);
      setExportMenu(false);
      setError("");

      const blob =
        type === "excel" ? await exportLeadsExcel() : await exportLeadsPdf();

      const file = new Blob([blob], {
        type:
          type === "excel"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "application/pdf",
      });

      const url = URL.createObjectURL(file);
      const a = document.createElement("a");

      a.href = url;
      a.download =
        type === "excel" ? "العملاء المحتملون.xlsx" : "العملاء المحتملون.pdf";

      document.body.appendChild(a);
      a.click();
      a.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("EXPORT ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "حصل خطأ أثناء تصدير البيانات",
      );
    } finally {
      setExportLoading("");
    }
  };

  const setF = (k) => (e) => {
    setFilters((prev) => ({ ...prev, [k]: e.target.value }));
    setPage(1);
  };

  const handleAddLead = async (data) => {
    await createLead(data);
    setAdding(false);
    setPage(1);

    if (page === 1) {
      await fetchLeads();
    }
  };

  // Open edit modal with the original API lead
  const handleEditLead = (id) => {
    const originalLead = leads.find((lead) => String(lead.id) === String(id));

    if (!originalLead) {
      setError("لم يتم العثور على بيانات العميل.");
      return;
    }

    setEditing(originalLead);
  };

  // Update lead
  const handleUpdateLead = async (data) => {
    try {
      setActionLoading(true);
      await updateLead(editing.id, data);
      setEditing(null);
      await fetchLeads();
    } finally {
      setActionLoading(false);
    }
  };

  // Archive lead
  const handleArchiveLead = async (id, name) => {
    const confirmed = window.confirm(`هل أنت متأكد من أرشفة العميل "${name}"؟`);

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");

      await deleteLead(id);

      // If this was the only row on the current page, go to previous page
      if (leads.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await fetchLeads();
      }
    } catch (err) {
      console.error("ARCHIVE LEAD ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "حصل خطأ أثناء أرشفة العميل",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const statsTotal = Number(stats.total || 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h1 className="text-2xl pt-2 font-extrabold">العملاء المحتملون</h1>
      </div>

      <div className="search flex items-center justify-between gap-3 flex-wrap">
        <div className="relative w-full sm:w-[360px]">
          <Search
            size={14}
            className="absolute top-1/2 -translate-y-1/2 left-3 text-neutral-400"
          />

          <input
            className="input"
            placeholder="ابحث بالاسم أو رقم الهاتف"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <button
              className="btn"
              onClick={() => setExportMenu((prev) => !prev)}
              disabled={!!exportLoading}
            >
              {exportLoading ? "جاري التصدير..." : "تصدير"}
              <ChevronDown size={12} />
            </button>

            {exportMenu && (
              <div className="absolute top-full right-0 mt-2 z-20 min-w-[150px] card p-2 shadow-lg">
                <button
                  className="w-full text-right text-sm p-2 rounded-lg hover:bg-neutral-100"
                  onClick={() => handleExport("excel")}
                >
                  تصدير Excel
                </button>

                <button
                  className="w-full text-right text-sm p-2 rounded-lg hover:bg-neutral-100"
                  onClick={() => handleExport("pdf")}
                >
                  تصدير PDF
                </button>
              </div>
            )}
          </div>

          <button className="btn btn-dark" onClick={() => setAdding(true)}>
            <Plus size={13} /> إضافة عميل
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="card p-3 grid sm:grid-cols-4 gap-2 items-end">
          <select
            className="input"
            value={filters.status}
            onChange={setF("status")}
          >
            <option value="">كل الحالات</option>

            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            className="input"
            value={filters.source}
            onChange={setF("source")}
          >
            <option value="">كل المصادر</option>

            {sources.map((source) => (
              <option key={source.id} value={source.name}>
                {source.name}
              </option>
            ))}
          </select>

          <button
            className="btn justify-center"
            onClick={() => {
              setFilters({
                status: "",
                source: "",
                project: "",
              });
              setPage(1);
            }}
          >
            مسح الفلاتر
          </button>
        </div>
      )}

      {error && (
        <div className="card p-3 text-sm text-red-600 flex items-center justify-between gap-3">
          <span>{error}</span>

          <button className="btn" onClick={fetchLeads}>
            إعادة المحاولة
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2 pb-8">
        <Stat label="عملاء مؤهلون" value={stats.qualified || 0} />
        <Stat label="عملاء قيد التفاوض" value={stats.negotiation || 0} />
        <Stat label="عملاء جدد" value={stats.new || 0} />
        <Stat label="إجمالي العملاء" value={statsTotal} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] text-right min-w-[1000px]">
            <thead>
              <tr className="text-[#111111] text-[14px] border-b border-line bg-[#F5F5F5]">
                {[
                  "اسم العميل",
                  "الشخص المسؤول",
                  "الهاتف",
                  "المشروع المهتم به",
                  "الميزانية",
                  "المصدر",
                  "الحالة",
                  "المتابعة القادمة",
                  "الإجراءات",
                ].map((h) => (
                  <th
                    key={h}
                    className="font-semibold px-3 py-6 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-10 text-neutral-500"
                  >
                    جاري تحميل العملاء...
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-line last:border-0 hover:bg-neutral-50 even:bg-[#F5F5F5] odd:bg-white transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-[14px] whitespace-nowrap">
                      {c.name}
                    </td>

                    <td className="px-3 py-3 text-neutral-600">{c.owner}</td>

                    <td className="px-3 py-3">
                      <span className="ltr-text">{c.phone}</span>
                    </td>

                    <td className="px-3 py-3">{c.project}</td>

                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="ltr-text">{c.budget}</span>
                    </td>

                    <td className="px-3 py-3">{c.source}</td>

                    <td className="px-3 py-3">
                      <StatusBadge status={c.status} />
                    </td>

                    <td className="px-3 py-3">{c.nextFollowUp}</td>

                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="btn text-[#7F7F7F] !px-3 !h-7 !bg-[#E3E3E3] !border-transparent !rounded-3xl"
                          onClick={() => navigate(`/customer-details/${c.id}`)}
                        >
                          عرض
                        </button>

                        <button
                          className=" !px-3 !h-7   !border-transparent !rounded-3xl"
                          onClick={() => handleEditLead(c.id)}
                          disabled={actionLoading}
                          title="تعديل"
                        >
                          <Pencil size={13} />
                        </button>

                        <button
                          className=" !px-3 !h-7   !border-transparent !rounded-3xl"
                          onClick={() => handleArchiveLead(c.id, c.name)}
                          disabled={actionLoading}
                          title="أرشفة"
                        >
                          <Archive size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {!loading && !filtered.length && (
                <tr>
                  <td
                    colSpan={9}
                    className="text-center py-10 text-neutral-500"
                  >
                    لا توجد نتائج مطابقة. جرّب تغيير البحث أو مسح الفلاتر.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div>
          <PagerBar
            page={cur}
            pages={pages}
            onPage={setPage}
            info={`عرض ${
              filtered.length ? (cur - 1) * PAGE_SIZE + 1 : 0
            }–${Math.min(
              (cur - 1) * PAGE_SIZE + filtered.length,
              Number(meta.total || 0),
            )} من ${meta.total || 0} نتيجة`}
          />
        </div>
      </div>

      <CustomerAnalytics customers={customers} />

      {adding && (
        <CustomerFormModal
          sources={sources}
          members={members}
          onClose={() => setAdding(false)}
          onSave={handleAddLead}
        />
      )}

      {editing && (
        <CustomerFormModal
          initial={editing}
          sources={sources}
          members={members}
          onClose={() => setEditing(null)}
          onSave={handleUpdateLead}
        />
      )}
    </div>
  );
}
