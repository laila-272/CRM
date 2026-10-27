import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Download,
  SlidersHorizontal,
  ChevronDown,
  Landmark,
  Briefcase,
  Target,
  Timer,
  MoreHorizontal,
} from "lucide-react";
import { getDeals, STAGES } from "../../data/deals.js";

const STATUS_CLS = {
  نشطة: "bg-green-50 text-green-600",
  متابعة: "bg-amber-50 text-amber-600",
  متوقفة: "bg-red-50 text-red-500",
};

function Stat({ icon: Icon, tag, value, label }) {
  return (
    <div className="bg-white border border-line rounded-xl p-3.5">
      <div className="flex items-center justify-between">
        <Icon size={20} className="text-neutral-500" />
        <span className="text-[9.5px] bg-neutral-100 text-neutral-500  rounded-full px-2 py-0.5">
          {tag}
        </span>
      </div>
      <div className="mt-3 text-[26px] leading-none font-semibold text-ink">
        {value}
      </div>
      <div className="mt-1.5 text-[10.5px] text-neutral-500">{label}</div>
    </div>
  );
}

function DealCard({ d }) {
  return (
    <Link
      to={`/deals/${d.id}`}
      className="block bg-white border border-line rounded-xl p-3 shadow-sm hover:border-orange-300 transition-colors"
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-[9.5px] font-semibold rounded-full px-2 py-0.5 ${STATUS_CLS[d.status]}`}
        >
          {d.status}
        </span>
        <MoreHorizontal size={14} className="text-neutral-400" />
      </div>
      <div className="mt-2 text-[12.5px] font-bold text-ink">{d.customer}</div>
      <div className="text-[10.5px] text-neutral-500">{d.company}</div>
      <div className="mt-2 text-[10px] text-neutral-500 leading-relaxed">
        الخطوة التالية: <span className="text-ink">{d.nextStep}</span>
      </div>
      <div className="mt-2.5 flex items-center justify-between text-[9.5px]">
        <span className="bg-neutral-100 text-neutral-500 rounded-md px-1.5 py-0.5">
          {d.updatedAt}
        </span>
        <span className="bg-neutral-100 text-ink rounded-md px-1.5 py-0.5">
          {d.owner}
        </span>
      </div>
    </Link>
  );
}

export default function Deals() {
  const [deals] = useState(getDeals);
  const [q, setQ] = useState("");
  const [owner, setOwner] = useState("all");
  const [status, setStatus] = useState("all");

  const owners = useMemo(
    () => [...new Set(deals.map((d) => d.owner))],
    [deals],
  );

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return deals.filter(
      (d) =>
        (owner === "all" || d.owner === owner) &&
        (status === "all" || d.status === status) &&
        (!s ||
          [d.customer, d.company, d.title, d.number].some((v) =>
            v.toLowerCase().includes(s),
          )),
    );
  }, [deals, q, owner, status]);

  const avgAge = list.length
    ? Math.round(list.reduce((a, d) => a + d.ageDays, 0) / list.length)
    : 0;
  const count = (st) => list.filter((d) => d.stage === st).length;

  const exportCsv = () => {
    const head = ["الرقم", "العميل", "الشركة", "المرحلة", "الحالة", "المسؤول"];
    const body = list.map((d) => [
      d.number,
      d.customer,
      d.company,
      STAGES[d.stage],
      d.status,
      d.owner,
    ]);
    const csv =
      "\ufeff" +
      [head, ...body].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    a.download = "deals.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const selectCls =
    "appearance-none h-8 rounded-lg border border-line bg-white pr-3 pl-7 text-[11px] text-neutral-600 outline-none cursor-pointer";

  return (
    <div dir="rtl" className="   max-w-full">
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
        <Link
          to="/potential-clients?add=1"
          className="shrink-0 inline-flex items-center gap-1.5 h-8 rounded-full bg-ink text-white px-3.5 text-[11.5px] font-semibold"
        >
          <Plus size={13} /> إضافة عميل
        </Link>
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
            placeholder="بحث عن عميل أو شركة"
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
            {owners.map((o) => (
              <option key={o}>{o}</option>
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
            <option value="all">فلاتر متقدمة</option>
            {Object.keys(STATUS_CLS).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <ChevronDown
            size={11}
            className="absolute top-1/2 -translate-y-1/2 left-2 text-neutral-400 pointer-events-none"
          />
        </div>
        <button
          onClick={exportCsv}
          className="inline-flex items-center gap-1.5 h-8 rounded-lg border border-line bg-white px-3 text-[11px] text-neutral-600"
        >
          <Download size={12} /> تصدير
        </button>
      </div>

      {/* Summary */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat
          icon={Timer}
          tag="٣٠ يوم"
          value={`${avgAge} يومًا`}
          label="متوسط عمر الصفقة"
        />
        <Stat
          icon={Target}
          tag="قيد التفاوض"
          value={count(3)}
          label="صفقات في مرحلة التفاوض"
        />
        <Stat
          icon={Briefcase}
          tag="مكتملة"
          value={count(4)}
          label="صفقات في مرحلة التعاقد"
        />
        <Stat
          icon={Landmark}
          tag="هذا الشهر"
          value={list.length}
          label="عملاء في الصفقات"
        />
      </div>

      {/* Board */}
      <div className="mt-5 overflow-x-auto pb-2">
        <div className="grid grid-flow-col auto-cols-[minmax(190px,1fr)] gap-3 min-w-[980px] lg:min-w-0 lg:grid-flow-row lg:grid-cols-5">
          {STAGES.map((name, i) => {
            const col = list.filter((d) => d.stage === i);
            return (
              <div key={name} className="min-w-0">
                <div className="flex items-center justify-between px-0.5 pb-2">
                  <span className="text-[11.5px] font-bold text-ink">
                    {name}
                  </span>
                  <span className="text-[9.5px] bg-neutral-100 text-neutral-500 rounded-full px-2 py-0.5">
                    {col.length} عملاء
                  </span>
                </div>
                <div className="space-y-2.5">
                  {col.map((d) => (
                    <DealCard key={d.id} d={d} />
                  ))}
                  {!col.length && (
                    <div className="border border-dashed border-line rounded-xl p-4 text-center text-[10.5px] text-neutral-400">
                      لا توجد صفقات
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
