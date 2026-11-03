// src/Components/HRPages/Payroll.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useEmployees } from "../../data/Employeesstore.js";
import {
  CURRENT,
  YEARS,
  periodLabel,
  periodsFor,
  money,
  totals,
  recordOf,
  payrollApi,
  usePayroll,
} from "../../data/Payrollstore.js";
import {
  PageHeader,
  Chip,
  Select,
  PagerBar,
  btnDark,
  card,
  th,
  td,
} from "../Shared/ui.jsx";
import { Avatar } from "./Hrshared.jsx";
import { KpiCard } from "./Hrwidgets.jsx";
import { Badge, useToast } from "./Hrextras.jsx";
import SalaryModal from "./Salarymodal.jsx";

const PAY = {
  paid: { label: "مصروف", cls: "bg-emerald-50 text-emerald-600" },
  awaiting: { label: "بانتظار الصرف", cls: "bg-amber-50 text-amber-600" },
  pending: { label: "قيد الانتظار", cls: "bg-neutral-100 text-neutral-600" },
};
const PAGE = 6;

export default function Payroll() {
  const employees = useEmployees();
  const overrides = usePayroll();
  const navigate = useNavigate();
  const [toast, show] = useToast();

  const [year, setYear] = useState(2026);
  const [period, setPeriod] = useState(CURRENT);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);

  const rows = useMemo(
    () =>
      employees.map((e) => {
        const rec = recordOf(overrides, e, period);
        return { e, rec, t: totals(rec) };
      }),
    [employees, overrides, period],
  );

  const stats = useMemo(
    () => ({
      gross: rows.reduce((s, r) => s + r.t.gross, 0),
      ded: rows.reduce((s, r) => s + r.t.ded, 0),
      paid: rows
        .filter((r) => r.rec.status === "paid")
        .reduce((s, r) => s + r.t.net, 0),
      waiting: rows.filter((r) => r.rec.status !== "paid").length,
    }),
    [rows],
  );

  const s = q.trim().toLowerCase();
  const filtered = rows.filter(
    ({ e }) => !s || `${e.name} ${e.dept} ${e.id}`.toLowerCase().includes(s),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const cur = Math.min(page, pages);
  const shown = filtered.slice((cur - 1) * PAGE, cur * PAGE);

  const changeYear = (y) => {
    const yr = Number(y);
    setYear(yr);
    setPeriod(periodsFor(yr)[0]);
    setPage(1);
  };
  const runPayroll = () => {
    const n = payrollApi.payAll(period, employees);
    show(
      n
        ? `تم صرف رواتب ${n} موظف لشهر ${periodLabel(period)}`
        : "جميع الرواتب مصروفة بالفعل",
    );
  };

  return (
    <div className="space-y-5" dir="rtl">
      <PageHeader
        title="الرواتب"
        subtitle="سجلّ الرواتب والبدلات والخصومات وقسائم الرواتب الشهرية"
      >
        <button
          onClick={runPayroll}
          className={`${btnDark} transition-opacity hover:opacity-90`}
        >
          <Plus size={12} /> تشغيل الرواتب
        </button>
      </PageHeader>

      {/* search + year/month filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-[230px]">
          <Search
            size={12}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="ابحث عن موظف..."
            className="h-8 w-full rounded-full border border-line bg-white pl-3 pr-8 text-[11px] outline-none transition-colors focus:border-neutral-400"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {periodsFor(year).map((p) => (
            <Chip
              key={p}
              active={period === p}
              onClick={() => {
                setPeriod(p);
                setPage(1);
              }}
            >
              {periodLabel(p)}
            </Chip>
          ))}
        </div>
        <div className="w-[84px]">
          <Select
            value={year}
            onChange={changeYear}
            className="!h-7 !rounded-full"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          title="إجمالي الرواتب"
          value={stats.gross.toLocaleString("en-US")}
          unit="ج.م"
          note={periodLabel(period)}
        />
        <KpiCard
          title="صافي المدفوع"
          value={stats.paid.toLocaleString("en-US")}
          unit="ج.م"
        />
        <KpiCard
          title="إجمالي الخصومات"
          value={stats.ded.toLocaleString("en-US")}
          unit="ج.م"
        />
        <KpiCard
          title="بانتظار الصرف"
          value={stats.waiting}
          tone="warn"
          note="موظفين"
        />
      </div>

      {/* table */}
      <div className={`${card} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line bg-neutral-50/60">
                <th className={th}>الموظف</th>
                <th className={th}>الراتب الأساسي</th>
                <th className={th}>البدلات</th>
                <th className={th}>الخصومات</th>
                <th className={th}>صافي الراتب</th>
                <th className={th}>الحالة</th>
                <th className={th} />
              </tr>
            </thead>
            <tbody>
              {shown.map(({ e, rec, t }) => (
                <tr
                  key={e.id}
                  className="border-b border-line transition-colors last:border-0 hover:bg-neutral-50"
                >
                  <td className={td}>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={e.name} size={26} />
                      <span className="font-semibold">{e.name}</span>
                    </div>
                  </td>
                  <td className={td}>{money(rec.base)}</td>
                  <td className={td}>{money(t.allow)}</td>
                  <td className={td}>{money(t.ded)}</td>
                  <td className={`${td} font-semibold`}>{money(t.net)}</td>
                  <td className={td}>
                    <Badge cls={PAY[rec.status].cls}>
                      {PAY[rec.status].label}
                    </Badge>
                  </td>
                  <td className={td}>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setEditing({ e, rec })}
                        className="h-6 rounded-full bg-ink px-3 text-[10px] font-semibold text-white transition-opacity hover:opacity-90"
                      >
                        تعديل الراتب
                      </button>
                      <button
                        onClick={() =>
                          navigate(`/payroll/${e.id}?period=${period}`)
                        }
                        className="h-6 rounded-full border border-line bg-white px-3 text-[10px] font-semibold text-ink transition-colors hover:bg-neutral-100"
                      >
                        عرض القسيمة
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!shown.length && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-[11px] text-neutral-400"
                  >
                    لا توجد نتائج مطابقة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PagerBar
          page={cur}
          pages={pages}
          onPage={setPage}
          info={`عرض ${filtered.length ? (cur - 1) * PAGE + 1 : 0}–${Math.min(cur * PAGE, filtered.length)} من ${filtered.length} موظف`}
        />
      </div>

      {editing && (
        <SalaryModal
          key={editing.e.id}
          employee={editing.e}
          record={editing.rec}
          onClose={() => setEditing(null)}
          onSave={(rec) => {
            payrollApi.save(period, editing.e.id, rec);
            show(`تم حفظ راتب ${editing.e.name}`);
          }}
        />
      )}
      {toast}
    </div>
  );
}
