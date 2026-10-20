import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Download,
  MoreHorizontal,
  Mail,
  PenLine,
  CalendarClock,
  BadgeDollarSign,
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

const compact = (n) => `${(n / 1e6).toFixed(2)} EGP M`;

export default function Contracts() {
  const navigate = useNavigate();
  const [all] = useState(getContracts);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");
  const [status, setStatus] = useState("all");
  const [owner, setOwner] = useState("all");

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return all.filter(
      (c) =>
        (tab === "all" ||
          (tab === "quote" ? c.kind === "عرض سعر" : c.kind === "عقد")) &&
        (status === "all" || c.status === status) &&
        (owner === "all" || c.owner === owner) &&
        (!s ||
          [c.id, c.customer, c.company, c.deal].some((v) =>
            v.toLowerCase().includes(s),
          )),
    );
  }, [all, q, tab, status, owner]);

  const quotes = all.filter((c) => c.kind === "عرض سعر");
  const open = quotes.filter((c) => c.status !== "مقبول");
  const count = (st) => all.filter((c) => c.status === st).length;

  return (
    <div dir="rtl" className=" max-w-full">
      <PageHeader
        title="العقود وعروض الأسعار"
        subtitle="تابع عروض الأسعار وحالة العقود من الإرسال حتى التوقيع والتجديد."
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SearchBox
          value={q}
          onChange={setQ}
          placeholder="ابحث برقم المستند أو العميل"
          className="flex-1 min-w-[220px]"
        />
        <Select value={status} onChange={setStatus}>
          <option value="all">فلاتر متقدمة (الحالة)</option>
          {[...QUOTE_STATUSES, ...CONTRACT_STATUSES].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Select>
        <Select value={owner} onChange={setOwner}>
          <option value="all">كل المالكين</option>
          {OWNERS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </Select>
        <button
          className={btnLight + " !rounded-lg h-9"}
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
          <Download size={12} /> تصدير
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
          <Chip key={k} active={tab === k} onClick={() => setTab(k)}>
            {label}
          </Chip>
        ))}
      </div>

      <div className={`${card} mt-3 overflow-x-auto`}>
        <table className="w-full min-w-[900px]">
          <thead className="bg-neutral-50/70">
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
                <th key={h} className={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr
                key={c.id}
                onClick={() => navigate(`/contracts/${c.id}`)}
                className="border-t border-line cursor-pointer hover:bg-neutral-50"
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
            {!list.length && (
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
      </div>
    </div>
  );
}
