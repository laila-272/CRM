import { ChevronDown, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCustomers } from "../../context/CustomersContext.jsx";
import { PROJECTS, SOURCES, STATUSES } from "../../data/customers.js";
import CustomerAnalytics from "../Customers/CustomerAnalytics.jsx";
import CustomerFormModal from "../Customers/CustomerFormModal.jsx";
import StatusBadge from "../Customers/StatusBadge.jsx";
import { PagerBar } from "../Shared/ui.jsx";

const PAGE_SIZE = 7;

function Stat({ label, value }) {
  return (
    <div className="card px-4 py-3">
      <div className="text-[11px] text-neutral-500">{label}</div>
      <div className="text-2xl font-extrabold mt-1">{value}</div>
    </div>
  );
}

export default function PotentialClients() {
  const { customers, addCustomer } = useCustomers();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    source: "",
    project: "",
  });
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(params.get("add") === "1");

  useEffect(() => {
    if (params.get("add") === "1") {
      setAdding(true);
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return customers.filter(
      (c) =>
        (!t || c.name.toLowerCase().includes(t) || c.phone.includes(t)) &&
        (!filters.status || c.status === filters.status) &&
        (!filters.source || c.source === filters.source) &&
        (!filters.project || c.project === filters.project),
    );
  }, [customers, q, filters]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const rows = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const activeFilters = Object.values(filters).filter(Boolean).length;

  const exportCsv = () => {
    const head = [
      "اسم العميل",
      "الشخص\nالمسؤول",
      "الهاتف",
      "المشروع",
      "الميزانية",
      "المصدر",
      "الحالة",
      "المتابعة القادمة",
    ];
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lines = filtered.map((c) =>
      [
        c.name,
        c.owner,
        c.phone,
        c.project,
        c.budget,
        c.source,
        c.status,
        c.nextFollowUp,
      ]
        .map(esc)
        .join(","),
    );
    const blob = new Blob(
      ["\uFEFF" + [head.map(esc).join(","), ...lines].join("\n")],
      { type: "text/csv;charset=utf-8;" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "العملاء المحتملون.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const setF = (k) => (e) => {
    setFilters({ ...filters, [k]: e.target.value });
    setPage(1);
  };
  const nums = Array.from({ length: pages }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h1 className="text-2xl pt-2 font-extrabold">العملاء المحتملون</h1>
      </div>

      <div className="search flex items-center justify-between gap-3 flex-wrap">
        {" "}
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
        <div className="flex flex-wrap gap-2 ">
          <button className="btn" onClick={exportCsv}>
            تصدير
            <ChevronDown size={12} />
          </button>
          <button className="btn" onClick={exportCsv}>
            استيراد من Excel
          </button>
          {/* <button className="btn" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal size={13} /> فلاتر
            {activeFilters ? ` (${activeFilters})` : ""}
          </button> */}
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
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            className="input"
            value={filters.source}
            onChange={setF("source")}
          >
            <option value="">كل المصادر</option>
            {SOURCES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            className="input"
            value={filters.project}
            onChange={setF("project")}
          >
            <option value="">كل المشروعات</option>
            {PROJECTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button
            className="btn justify-center"
            onClick={() => {
              setFilters({ status: "", source: "", project: "" });
              setPage(1);
            }}
          >
            مسح الفلاتر
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2 pb-8">
        <Stat
          label=" صفقات اليوم "
          value={customers.filter((c) => c.status === "مهتم").length}
        />
        <Stat
          label="فرص قوية"
          value={customers.filter((c) => c.status === "لا رد").length}
        />
        <Stat
          label="عملاء جدد"
          value={customers.filter((c) => c.status === "جديد").length}
        />
        <Stat label="إجمالي العملاء" value={customers.length} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[12px] text-right min-w-[900px]">
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
                  "عرض",
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
              {rows.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-line last:border-0 hover:bg-neutral-50   even:bg-[#F5F5F5]
    odd:bg-white transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-[14px] whitespace-nowrap ">
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
                  <td
                    className={`px-3 py-3 ${c.status === "لا رد" ? "text-red-600 font-semibold" : ""}`}
                  >
                    {c.nextFollowUp}
                  </td>
                  <td className="px-3 py-3">
                    <button
                      className="btn text-[#7F7F7F] !px-4 !h-7 !px-3 !bg-[#E3E3E3] !border-transparent !rounded-3xl "
                      onClick={() => navigate(`/customer-details/${c.id}`)}
                    >
                      عرض
                    </button>
                  </td>
                </tr>
              ))}
              {!rows.length && (
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

        <div className="">
          <PagerBar
            page={cur}
            pages={pages}
            onPage={setPage}
            info={`عرض ${
              filtered.length ? (cur - 1) * PAGE_SIZE + 1 : 0
            }–${Math.min(cur * PAGE_SIZE, filtered.length)} من ${
              filtered.length
            } نتيجة`}
          />
        </div>
      </div>

      <CustomerAnalytics customers={filtered} />

      {adding && (
        <CustomerFormModal
          onClose={() => setAdding(false)}
          onSave={(d) => {
            addCustomer(d);
            setAdding(false);
            setPage(1);
          }}
        />
      )}
    </div>
  );
}
