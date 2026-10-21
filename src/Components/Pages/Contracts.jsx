import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Download,
  MoreHorizontal,
  Mail,
  PenLine,
  CalendarClock,
  BadgeDollarSign,
  Plus,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import {
  getContracts,
  OWNERS,
  QUOTE_STATUSES,
  CONTRACT_STATUSES,
} from "../../data/contracts.js";
import {
  PageHeader,
  StatCard,
  SearchBox,
  Select,
  Chip,
  card,
  btnLight,
  downloadCsv,
  egp,
  th,
  td,
} from "./ui.jsx";

const STATUS_CLS = {
  مرسل: "text-neutral-500",
  "تمت المشاهدة": "text-neutral-500",
  مسودة: "text-neutral-400",
  مقبول: "text-green-600",
  "بانتظار التوقيع": "text-orange-600",
  مفعل: "text-green-600",
  منتهي: "text-red-500",
};

const selectCls =
  "appearance-none h-8 rounded-lg border border-line bg-white pr-3 pl-4 text-[12px] text-[#717171] outline-none cursor-pointer";
const compact = (n) => `${(n / 1e6).toFixed(2)} EGP M`;

const ITEMS_PER_PAGE = 5;

export default function Contracts() {
  const navigate = useNavigate();
  const [all] = useState(getContracts);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");
  const [status, setStatus] = useState("all");
  const [owner, setOwner] = useState("all");
  const [page, setPage] = useState(1);

  // إعادة الصفحة إلى 1 عند تغيير الفلاتر أو البحث
  const handleFilterChange = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return all.filter(
      (c) =>
        (tab === "all" ||
          (tab === "quote" ? c.kind === "عقد " : c.kind === "عقد")) &&
        (status === "all" || c.status === status) &&
        (owner === "all" || c.owner === owner) &&
        (!s ||
          [c.id, c.customer, c.company, c.deal].some((v) =>
            v.toLowerCase().includes(s),
          )),
    );
  }, [all, q, tab, status, owner]);

  // حساب الصفحات
  const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE) || 1;
  const paginatedList = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return list.slice(start, start + ITEMS_PER_PAGE);
  }, [list, page]);

  const quotes = all.filter((c) => c.kind === "عقد ");
  const open = quotes.filter((c) => c.status !== "مقبول");
  const count = (st) => all.filter((c) => c.status === st).length;

  return (
    <div dir="rtl" className="max-w-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-extrabold text-ink leading-tight">
            العقود وعروض الأسعار
          </h1>
          <p className="mt-1 text-[11px] text-neutral-500">
            تابع عروض الأسعار وحالة العقود من الإرسال حتى التوقيع والتجديد.{" "}
          </p>
        </div>
        <Link className="shrink-0 inline-flex items-center gap-1.5 h-8 rounded-full bg-ink text-white px-3.5 text-[11.5px] font-semibold">
          <Plus size={13} /> مستند جديد
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SearchBox
          value={q}
          onChange={handleFilterChange(setQ)}
          placeholder="ابحث برقم المستند أو العميل"
          className="flex-1 min-w-[220px]"
        />
        <div className="relative inline-flex items-center">
          <SlidersHorizontal
            size={12}
            className="absolute right-3 text-[#171819] pointer-events-none z-10"
          />

          <Select
            value={status}
            onChange={handleFilterChange(setStatus)}
            className="!rounded-4xl text-[12px]"
          >
            <option value="all">فلترة متقدمة </option>
            {[...QUOTE_STATUSES, ...CONTRACT_STATUSES].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </div>
        <div className="relative">
          <select
            value={owner}
            onChange={(e) => handleFilterChange(setOwner)(e.target.value)}
            className={selectCls}
          >
            <option value="all">كل المالكين</option>
            {OWNERS.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
          <ChevronDown
            size={11}
            className="absolute top-1/2 -translate-y-1/2 left-2 text-neutral-400 pointer-events-none"
          />
        </div>

        <button
          className="inline-flex items-center gap-1.5 h-8 rounded-lg border border-line bg-white px-3 text-[12px] text-[#717171]"
          onClick={() =>
            downloadCsv(
              "contracts.csv",
              [
                "الرقم",
                "العميل",
                "النوع",
                "الصفقة",
                "القيمة",
                "الحالة",
                "تاريخ الانتهاء",
                "المسؤول",
              ],
              list.map((c) => [
                c.id,
                c.customer,
                c.kind,
                c.deal,
                c.value,
                c.status,
                c.expiry,
                c.owner,
              ]),
            )
          }
        >
          تصدير <ChevronDown size={12} />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={BadgeDollarSign}
          tag="قيمة"
          value={compact(open.reduce((a, c) => a + c.value, 0))}
          label="قيمة العروض المفتوحة"
        />
        <StatCard
          icon={PenLine}
          tag="توقيع"
          value={count("بانتظار التوقيع")}
          label="عقود بانتظار التوقيع"
        />
        <StatCard
          icon={CalendarClock}
          tag="عمل"
          value={count("مسودة")}
          label="عروض بانتظار الإرسال"
        />
        <StatCard
          icon={Mail}
          tag="بانتظار الرد"
          value={count("مرسل") + count("تمت المشاهدة")}
          label="عروض أسعار معلقة"
        />
      </div>

      <div className="mt-4 flex gap-2">
        {[
          ["all", `الكل ${all.length}`],
          ["quote", `عروض الأسعار ${quotes.length}`],
          ["contract", `العقود ${all.length - quotes.length}`],
        ].map(([k, label]) => (
          <Chip
            key={k}
            active={tab === k}
            onClick={() => handleFilterChange(setTab)(k)}
          >
            {label}
          </Chip>
        ))}
      </div>

      <div className={`${card} mt-3 overflow-x-auto`}>
        <table className="w-full min-w-[900px]">
          <thead className="bg-[#F0F0F0]">
            <tr>
              {[
                "الرقم",
                "العميل",
                "النوع",
                "الصفقة المرتبطة",
                "القيمة",
                "الحالة",
                "تاريخ الانتهاء",
                "المسؤول",
                "إجراء",
              ].map((h) => (
                <th
                  key={h}
                  className="px-3 py-3.5 text-[12px] font-semibold text-black-400 text-right whitespace-nowrap "
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedList.map((c) => (
              <tr
                key={c.id}
                onClick={() => navigate(`/contracts/${c.id}`)}
                className="border-t border-line cursor-pointer bg-[#FAFAFA] hover:bg-[#F7F7F7]"
              >
                <td className={`${td} text-neutral-400`}>{c.id}</td>
                <td className={td}>
                  <div className="font-bold">{c.customer}</div>
                  <div className="text-[10px] text-neutral-400">
                    {c.company}
                  </div>
                </td>
                <td
                  className={`${td} ${c.kind === "عقد" ? "" : "text-blue-600"}`}
                >
                  {c.kind}
                </td>
                <td className={td}>{c.deal}</td>
                <td className={td} dir="ltr" style={{ textAlign: "right" }}>
                  {egp(c.value)}
                </td>
                <td className={`${td} ${STATUS_CLS[c.status]}`}>{c.status}</td>
                <td className={`${td} text-neutral-500`}>{c.expiry}</td>
                <td className={td}>{c.owner}</td>
                <td className={td}>
                  <Link
                    to={`/contracts/${c.id}`}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="التفاصيل"
                    className="text-neutral-400 hover:text-ink"
                  >
                    <MoreHorizontal size={15} />
                  </Link>
                </td>
              </tr>
            ))}
            {!paginatedList.length && (
              <tr>
                <td
                  colSpan={9}
                  className="p-8 text-center text-[11px] text-neutral-400"
                >
                  لا توجد نتائج مطابقة
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* عناصر التنقل بين الصفحات (Pagination) */}

        {/* Pagination */}
        {list.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-white px-4 py-3">
            <span className="text-[11px] text-neutral-500">
              عرض{" "}
              <span className="font-semibold text-ink">
                {(page - 1) * ITEMS_PER_PAGE + 1}-
                {Math.min(page * ITEMS_PER_PAGE, list.length)}
              </span>{" "}
              من {list.length} نتيجة
            </span>

            <div className="flex items-center gap-1.5" dir="ltr">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-neutral-500 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronLeft size={15} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  aria-current={page === p ? "page" : undefined}
                  className={`flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-[11px] font-semibold transition ${
                    page === p
                      ? "bg-ink text-white shadow-sm"
                      : "bg-white text-neutral-500 hover:bg-neutral-100"
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-neutral-500 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Next page"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}