import { useEffect, useMemo, useState } from "react";
import { Download, X, CircleDollarSign, Wallet, Briefcase } from "lucide-react";
import { getCommissions, MONTHLY, COMMISSION_STATUSES } from "../../data/commissions.js";
import { PageHeader, StatCard, SearchBox, Chip, PagerBar, card, btnDark, downloadCsv, egp, th, td } from "./ui.jsx";

const PAGE_SIZE = 5;
const ST_CLS = {
  مدفوعة: "text-green-600 font-bold",
  "قيد الانتظار": "text-neutral-600",
  معلقة: "text-neutral-600",
  ملغاة: "text-red-500 font-bold",
};

function DetailsModal({ c, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const Row = ({ label, value, tint }) => (
    <div className={`flex items-center justify-between rounded-md px-2 py-1.5 text-[11px] ${tint || ""}`}>
      <span className="text-neutral-500">{label}</span>
      <b dir="ltr" className="text-ink">{value}</b>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div dir="rtl" className="w-full max-w-[340px] bg-white rounded-xl p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-extrabold text-ink">تفاصيل العمولة</h2>
          <button onClick={onClose} aria-label="إغلاق" className="text-neutral-400 hover:text-ink">
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 rounded-lg bg-neutral-50 border border-line p-3">
          <div className="flex items-center justify-between">
            <b className="text-[11.5px] text-ink">{c.id}</b>
            <span className={`text-[10px] ${ST_CLS[c.status]}`}>{c.status}</span>
          </div>
          <div className="mt-1 text-[11px] text-neutral-500">
            {c.customer} — {c.beneficiary} ({c.role})
          </div>
        </div>

        <div className="mt-3 space-y-1">
          <Row label="قيمة الصفقة" value={egp(c.dealValue)} />
          <Row label="نسبة العمولة" value={`${c.pct}%`} />
          <Row label="مبلغ العمولة" value={egp(c.amount)} tint="bg-green-50" />
          <Row label="تاريخ الدفع" value={c.paidAt || "—"} />
          <Row label="تاريخ الاستحقاق" value={c.due} />
        </div>
      </div>
    </div>
  );
}

export default function Commissions() {
  const [all] = useState(getCommissions);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return all.filter(
      (c) =>
        (status === "all" || c.status === status) &&
        (!s || [c.id, c.customer, c.beneficiary].some((v) => v.toLowerCase().includes(s))),
    );
  }, [all, q, status]);

  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const rows = list.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const from = list.length ? (cur - 1) * PAGE_SIZE + 1 : 0;

  const total = list.reduce((a, c) => a + c.amount, 0);
  const paid = list.filter((c) => c.status === "مدفوعة").reduce((a, c) => a + c.amount, 0);
  const max = Math.max(...MONTHLY.map((m) => m.v));
  const setFilter = (fn) => (v) => {
    fn(v);
    setPage(1);
  };

  return (
    <div dir="rtl" className=" max-w-full">
      <PageHeader
        title="العمولات"
        subtitle="راجع استحقاقات فريق المبيعات والوسطاء وتابع كل عمولة حتى صرفها."
      >
        <button
          className="btn !bg-black text-white !rounded-lg h-9"
          onClick={() => document.getElementById("broker-name")?.focus()}
        >
          + تسجيل صرف عمولة
        </button>
        <button className="btn">قواعد العمولات</button>
      </PageHeader>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          icon={CircleDollarSign}
          value={egp(total, 2)}
          label="إجمالي العمولات"
        />
        <StatCard
          icon={Wallet}
          value={egp(paid, 2)}
          label="العمولات المدفوعة"
        />
        <StatCard
          icon={Briefcase}
          value={list.length}
          label="العمولات المعروضة"
        />
      </div>

      <div className="my-5 flex flex-wrap items-center gap-2">
        <SearchBox
          value={q}
          onChange={setFilter(setQ)}
          placeholder="ابحث برقم الصفقة أو العميل أو المندوب..."
          className="flex-1 min-w-[240px] order-2 sm:order-none "
        />
        <div className="flex flex-wrap gap-1.5">
          <Chip
            active={status === "all"}
            onClick={() => setFilter(setStatus)("all")}
          >
            الكل {all.length}
          </Chip>
          {COMMISSION_STATUSES.map((s) => (
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
        <table className="w-full min-w-[860px]">
          <thead className="bg-neutral-50/70">
            <tr>
              {[
                "رقم العقد",
                "العميل",
                "المستفيد",
                "قيمة الصفقة",
                "نسبة العمولة",
                "مبلغ العمولة",
                "تاريخ الاستحقاق",
                "الحالة",
                "الإجراءات",
              ].map((h) => (
                <th key={h} className={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const dim = c.status === "ملغاة" ? "text-neutral-400" : "";
              return (
                <tr
                  key={c.id}
                  className={`border-t border-line ${
                    c.status === "مدفوعة" ? "bg-green-50/40" : ""
                  }`}
                >
                  <td className={`${td} ${dim} py-6`}>{c.id}</td>
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
                    className={`${td} ${dim} py-7`}
                    dir="ltr"
                    style={{ textAlign: "right" }}
                  >
                    {egp(c.amount)}
                  </td>

                  <td className={`${td} ${dim} py-6`}>{c.due}</td>
                  <td className={`${td} ${ST_CLS[c.status]} py-6`}>
                    {c.status}
                  </td>

                  <td className={`${td} py-6`}>
                    <button
                      onClick={() => setSelected(c)}
                      className="h-6 rounded-full border border-neutral-300 px-3 text-[10px] hover:bg-neutral-50"
                    >
                      التفاصيل
                    </button>
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
          </tbody>
        </table>
      </div>

      <PagerBar
        page={cur}
        pages={pages}
        onPage={setPage}
        info={`إظهار ${from}–${from ? from + rows.length - 1 : 0} من ${list.length} عمولة`}
      />

      {/* Monthly chart (pure CSS) */}
      <section className={`${card} mt-4 p-4 py-7`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[12.5px] font-extrabold text-ink">
            نظرة عامة على العمولات الشهرية
          </h2>
          <span className="text-[10px] text-neutral-400">
            مايو – أكتوبر 2026 · جنيه مصري
          </span>
        </div>

        {/* Chart Container */}
        <div className="mt-4 flex h-[150px] items-end justify-around gap-2 select-none">
          {MONTHLY.map((m, i) => {
            const isLast = i === MONTHLY.length - 1;
            const heightPercentage =
              max > 0 ? Math.min((m.v / max) * 100, 100) : 0;

            const shades = [
              "bg-neutral-200",
              "bg-neutral-300",
              "bg-neutral-500",
              "bg-neutral-300",
              "bg-slate-700",
              "bg-ink",
            ];
            const shadeClass =
              shades[i] || (isLast ? "bg-ink" : "bg-neutral-300");

            return (
              <div
                key={m.m || i}
                className="flex h-full max-w-[40px] flex-1 flex-col items-center justify-end"
              >
                {/* Value Label - Fixed Height prevents layout shift */}
                <div className="h-4 flex items-center justify-center mb-1">
                  <span
                    className={`text-[10px] whitespace-nowrap leading-none ${
                      isLast
                        ? "font-extrabold text-ink"
                        : "font-normal text-neutral-500"
                    }`}
                  >
                    {m.v} ألف
                  </span>
                </div>

                {/* Bar Wrapper */}
                <div className="w-full flex-1 flex items-end">
                  <div
                    className={`w-full rounded-t-sm ${shadeClass}`}
                    style={{ height: `${heightPercentage}%` }}
                  />
                </div>

                {/* Month Label - Fixed Height prevents layout shift */}
                <div className="h-4 flex items-center justify-center mt-1.5">
                  <span
                    className={`text-[10px] whitespace-nowrap leading-none ${
                      isLast
                        ? "font-extrabold text-ink"
                        : "font-normal text-neutral-500"
                    }`}
                  >
                    {m.m}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {selected && (
        <DetailsModal c={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
