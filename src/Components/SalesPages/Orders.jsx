import { useMemo, useState } from "react";
import { ShoppingCart, Clock, Package, Wallet, Plus } from "lucide-react";
import {
  PageHeader,
  StatCard,
  PagerBar,
  Select,
  btnDark,
  downloadCsv,
} from "../Shared/ui.jsx";
import {
  Badge,
  Toolbar,
  AdvancedPanel,
  MiniField,
  Chips,
  SalesTable,
  CustCell,
  usePaged,
  useToast,
} from "./Shared.jsx";
import AddOrderModal from "./AddOrderModal.jsx";
import {
  SEED_ORDERS,
  ORDER_STATUS,
  ORDER_CHIPS,
  PAY_STATUS,
  TEAM,
  calcTotals,
  fmtDate,
  jm,
  jmM,
  first,
} from "../../data/salesData.js";

const totalOf = (o) => calcTotals(o.items, o.taxRate).total;
const dateCls =
  "h-9 w-full rounded-lg border border-line bg-white px-2 text-[11px]";

export default function Orders() {
  const [orders, setOrders] = useState(SEED_ORDERS);
  const [q, setQ] = useState("");
  const [chip, setChip] = useState("all");
  const [owner, setOwner] = useState("all");
  const [adv, setAdv] = useState(false);
  const [pay, setPay] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [modal, setModal] = useState(null);
  const [toast, show] = useToast();

  const inChip = (o, k) =>
    k === "all" ||
    (k === "new"
      ? o.status === "new" || o.status === "awaiting"
      : o.status === k);
  const counts = Object.fromEntries(
    ORDER_CHIPS.map(([k]) => [k, orders.filter((o) => inChip(o, k)).length]),
  );
  const list = useMemo(
    () =>
      orders
        .filter(
          (o) =>
            inChip(o, chip) &&
            (owner === "all" || o.owner === owner) &&
            (pay === "all" || o.payStatus === pay),
        )
        .filter((o) => (!from || o.date >= from) && (!to || o.date <= to))
        .filter(
          (o) =>
            !q.trim() ||
            `${o.number} ${o.customer} ${o.company} ${o.items.map((i) => i.name).join(" ")}`.includes(
              q.trim(),
            ),
        )
        .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id),
    [orders, q, chip, owner, pay, from, to],
  );
  const paged = usePaged(list);

  const save = (o) => {
    const isNew = !orders.some((x) => x.id === o.id);
    setOrders((p) =>
      isNew
        ? [{ ...o, id: Date.now() }, ...p]
        : p.map((x) => (x.id === o.id ? o : x)),
    );
    setModal(null);
    show(isNew ? "تمت إضافة الطلب" : "تم حفظ التعديلات");
  };
  const del = (o) => {
    if (window.confirm(`حذف الطلب ${o.number}؟`)) {
      setOrders((p) => p.filter((x) => x.id !== o.id));
      setModal(null);
      show("تم حذف الطلب");
    }
  };
  const exportCsv = () =>
    downloadCsv(
      "orders.csv",
      [
        "رقم الطلب",
        "العميل",
        "الشركة",
        "المنتج أو الخدمة",
        "تاريخ الطلب",
        "القيمة",
        "حالة الدفع",
        "حالة الطلب",
        "المسؤول",
      ],
      list.map((o) => [
        o.number,
        o.customer,
        o.company,
        o.items.map((i) => i.name).join(" / "),
        o.date,
        totalOf(o),
        PAY_STATUS[o.payStatus],
        ORDER_STATUS[o.status],
        o.owner,
      ]),
    );

  const cols = [
    {
      h: "رقم الطلب",
      cell: (o) => <span className="font-medium">{o.number}</span>,
    },
    {
      h: "العميل",
      cell: (o) => <CustCell name={o.customer} company={o.company} />,
    },
    {
      h: "المنتج أو الخدمة",
      cell: (o) =>
        o.items[0].name + (o.items.length > 1 ? ` +${o.items.length - 1}` : ""),
    },
    { h: "تاريخ الطلب", cell: (o) => fmtDate(o.date) },
    { h: "القيمة", cell: (o) => jm(totalOf(o)) },
    {
      h: "حالة الدفع",
      cell: (o) => <Badge k={o.payStatus}>{PAY_STATUS[o.payStatus]}</Badge>,
    },
    {
      h: "حالة الطلب",
      cell: (o) => <Badge k={o.status}>{ORDER_STATUS[o.status]}</Badge>,
    },
    { h: "المسؤول", cell: (o) => first(o.owner) },
  ];

  return (
    <div dir="rtl" className="space-y-4">
      {toast}
      <PageHeader
        title="الطلبات"
        subtitle="تابع طلبات العملاء من الإنشاء حتى التجهيز والتسليم والتحصيل."
      >
        <button className={btnDark} onClick={() => setModal({})}>
          <Plus size={13} /> طلب جديد
        </button>
      </PageHeader>
      <Toolbar
        q={q}
        onQ={setQ}
        placeholder="ابحث برقم الطلب أو العميل"
        owner={owner}
        onOwner={setOwner}
        owners={TEAM}
        onExport={exportCsv}
        onAdv={() => setAdv((v) => !v)}
      />
      {adv && (
        <AdvancedPanel>
          <MiniField label="حالة الدفع">
            <Select value={pay} onChange={setPay}>
              <option value="all">الكل</option>
              {Object.entries(PAY_STATUS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </MiniField>
          <MiniField label="من تاريخ">
            <input
              type="date"
              className={dateCls}
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </MiniField>
          <MiniField label="إلى تاريخ">
            <input
              type="date"
              className={dateCls}
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </MiniField>
          <button
            className="h-9 text-[11px] font-semibold text-[#FF7E52]"
            onClick={() => {
              setPay("all");
              setFrom("");
              setTo("");
            }}
          >
            مسح الفلاتر
          </button>
        </AdvancedPanel>
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={ShoppingCart}
          tag="هذا الشهر"
          value={orders.length}
          label="إجمالي الطلبات"
        />
        <StatCard
          icon={Clock}
          tag="بانتظار التأكيد"
          value={counts.new}
          label="طلبات جديدة"
        />
        <StatCard
          icon={Package}
          tag="قيد التنفيذ"
          value={counts.processing}
          label="طلبات قيد التجهيز"
        />
        <StatCard
          icon={Wallet}
          tag="هذا الشهر"
          value={
            <span dir="rtl">
              {jmM(orders.reduce((s, o) => s + totalOf(o), 0))}
            </span>
          }
          label="قيمة الطلبات"
        />
      </div>
      <Chips
        items={ORDER_CHIPS}
        value={chip}
        onChange={setChip}
        counts={counts}
      />
      <SalesTable
        cols={cols}
        rows={paged.slice}
        onRow={(o) => setModal({ item: o })}
      >
        <PagerBar
          page={paged.page}
          pages={paged.pages}
          onPage={paged.setPage}
          info={paged.info}
        />
      </SalesTable>
      {modal && (
        <AddOrderModal
          initial={modal.item}
          orders={orders}
          onSave={save}
          onDelete={() => del(modal.item)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
