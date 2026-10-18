import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  Plus,
  Download,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useCustomers } from "../../context/CustomersContext.jsx";
import { STATUSES, SOURCES, PROJECTS } from "../../data/customers.js";
import StatusBadge from "../Customers/StatusBadge.jsx";
import CustomerFormModal from "../Customers/CustomerFormModal.jsx";
import CustomerAnalytics from "../Customers/CustomerAnalytics.jsx";

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
    <div className="mx-auto w-full max-w-[1800px] min-w-0 space-y-4 px-2 sm:px-3 lg:space-y-5 lg:px-4 xl:px-6 2xl:space-y-6 2xl:px-8">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <h1 className="pt-2 text-xl font-extrabold sm:text-2xl 2xl:text-3xl">
          العملاء المحتملون
        </h1>
      </div>

      <div className="search flex min-w-0 flex-col items-stretch justify-between gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {" "}
        <div className="relative w-full min-w-0 sm:w-[min(360px,100%)] xl:w-[420px] 2xl:w-[480px]">
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
        <div className="flex min-w-0 flex-wrap gap-2 sm:justify-end">
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
        <div className="card grid grid-cols-1 items-end gap-2 p-3 sm:grid-cols-2 xl:grid-cols-4 2xl:gap-3">
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

      <div className="grid grid-cols-1 gap-3 pb-5 pt-2 sm:grid-cols-2 xl:grid-cols-4 2xl:gap-5 2xl:pb-8">
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

      <div className="card min-w-0 overflow-hidden">
        <div className="w-full overflow-x-auto overscroll-x-contain">
          <table className="w-full min-w-[1000px] text-right text-xs xl:min-w-[1100px] 2xl:min-w-full 2xl:text-[13px]">
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
                    className="whitespace-nowrap px-3 py-4 font-semibold xl:px-4 xl:py-5 2xl:px-5 2xl:py-6"
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
                  <td className="whitespace-nowrap px-3 py-3 text-[13px] font-medium xl:px-4 xl:text-sm 2xl:px-5 2xl:py-4">
                    {c.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-neutral-600 xl:px-4 2xl:px-5 2xl:py-4">
                    {c.owner}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 xl:px-4 2xl:px-5 2xl:py-4">
                    <span className="ltr-text">{c.phone}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 xl:px-4 2xl:px-5 2xl:py-4">
                    {c.project}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 xl:px-4 2xl:px-5 2xl:py-4">
                    <span className="ltr-text">{c.budget}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 xl:px-4 2xl:px-5 2xl:py-4">
                    {c.source}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 xl:px-4 2xl:px-5 2xl:py-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td
                    className={`whitespace-nowrap px-3 py-3 xl:px-4 2xl:px-5 2xl:py-4 ${c.status === "لا رد" ? "font-semibold text-red-600" : ""}`}
                  >
                    {c.nextFollowUp}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 xl:px-4 2xl:px-5 2xl:py-4">
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
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
        <span>
          عرض {filtered.length ? (cur - 1) * PAGE_SIZE + 1 : 0}–
          {Math.min(cur * PAGE_SIZE, filtered.length)} من {filtered.length}
        </span>
        <div className="flex max-w-full flex-wrap items-center gap-1" dir="rtl">
          <button
            className="w-7 h-7 grid place-items-center rounded-full hover:bg-neutral-200 disabled:opacity-30"
            disabled={cur === 1}
            onClick={() => setPage(cur - 1)}
            aria-label="السابق"
          >
            <ChevronRight size={14} />
          </button>
          {nums.map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-7 h-7 rounded-full text-[12px] ${n === cur ? "bg-ink text-white font-bold" : "hover:bg-neutral-200"}`}
            >
              {n}
            </button>
          ))}
          <button
            className="w-7 h-7 grid place-items-center rounded-full hover:bg-neutral-200 disabled:opacity-30"
            disabled={cur === pages}
            onClick={() => setPage(cur + 1)}
            aria-label="التالي"
          >
            <ChevronLeft size={14} />
          </button>
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
