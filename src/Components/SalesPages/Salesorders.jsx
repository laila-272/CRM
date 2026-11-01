import { useMemo, useState } from "react";
import { Wallet, FileCheck, Clock, CheckCircle2, Plus } from "lucide-react";
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
import AddSalesOrderModal from "./AddSalesOrderModal.jsx";
import {
  SEED_SALES_ORDERS,
  SEED_ORDERS,
  SO_STATUS,
  SO_CHIPS,
  PAY_STATUS,
  TEAM,
  fmtDate,
  jm,
  jmM,
  first,
} from "../../data/salesData.js";

const dateCls =
  "h-9 w-full rounded-lg border border-line bg-white px-2 text-[11px]";
const LINKABLE = SEED_ORDERS.filter((o) => o.status !== "cancelled"); // linked-order options (mock)
const DELIVERED_EARLIER = 6; // mock: deliveries from earlier periods, so the card reads 18 like the reference

export default function SalesOrders() {
  const [orders, setOrders] = useState(SEED_SALES_ORDERS);
  const [q, setQ] = useState("");
  const [chip, setChip] = useState("all");
  const [owner, setOwner] = useState("all");
  const [adv, setAdv] = useState(false);
  const [pay, setPay] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [modal, setModal] = useState(null);
  const [toast, show] = useToast();

  const counts = Object.fromEntries(
    SO_CHIPS.map(([k]) => [
      k,
      k === "all" ? orders.length : orders.filter((o) => o.status === k).length,
    ]),
  );
  const list = useMemo(
    () =>
      orders
        .filter(
          (o) =>
            (chip === "all" || o.status === chip) &&
            (owner === "all" || o.owner === owner) &&
            (pay === "all" || o.payStatus === pay),
        )
        .filter((o) => (!from || o.date >= from) && (!to || o.date <= to))
        .filter(
          (o) =>
            !q.trim() ||
            `${o.number} ${o.orderNumber} ${o.customer} ${o.company}`.includes(
              q.trim(),
            ),
        )
        .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id),
    [orders, q, chip, owner, pay, from, to],
  );
  const paged = usePaged(list);

  const open = orders.filter((o) =>
    ["draft", "pending", "approved"].includes(o.status),
  );
  const save = (o) => {
    const isNew = !orders.some((x) => x.id === o.id);
    setOrders((p) =>
      isNew
        ? [{ ...o, id: Date.now() }, ...p]
        : p.map((x) => (x.id === o.id ? o : x)),
    );
    setModal(null);
    show(isNew ? "تمت إضافة أمر البيع" : "تم حفظ التعديلات");
  };
  const del = (o) => {
    if (window.confirm(`حذف أمر البيع ${o.number}؟`)) {
      setOrders((p) => p.filter((x) => x.id !== o.id));
      setModal(null);
      show("تم حذف أمر البيع");
    }
  };
  const exportCsv = () =>
    downloadCsv(
      "sales-orders.csv",
      [
        "رقم الأمر",
        "العميل",
        "الشركة",
        "الطلب المرتبط",
        "تاريخ الأمر",
        "القيمة",
        "حالة الدفع",
        "حالة الأمر",
        "المسؤول",
      ],
      list.map((o) => [
        o.number,
        o.customer,
        o.company,
        o.orderNumber,
        o.date,
        o.value,
        PAY_STATUS[o.payStatus],
        SO_STATUS[o.status],
        o.owner,
      ]),
    );

  const cols = [
    {
      h: "رقم الأمر",
      cell: (o) => <span className="font-medium">{o.number}</span>,
    },
    {
      h: "العميل",
      cell: (o) => <CustCell name={o.customer} company={o.company} />,
    },
    { h: "الطلب المرتبط", cell: (o) => o.orderNumber },
    { h: "تاريخ الأمر", cell: (o) => fmtDate(o.date) },
    { h: "القيمة", cell: (o) => jm(o.value) },
    {
      h: "حالة الدفع",
      cell: (o) => <Badge k={o.payStatus}>{PAY_STATUS[o.payStatus]}</Badge>,
    },
    {
      h: "حالة الأمر",
      cell: (o) => <Badge k={o.status}>{SO_STATUS[o.status]}</Badge>,
    },
    { h: "المسؤول", cell: (o) => first(o.owner) },
  ];

  return (
    <div dir="rtl" className="space-y-4">
      {toast}
      <PageHeader
        title="أوامر البيع"
        subtitle="أصدر أوامر البيع المعتمدة وتابع الاعتماد والدفع والتسليم لكل أمر."
      >
        <button className={btnDark} onClick={() => setModal({})}>
          <Plus size={13} /> أمر بيع جديد
        </button>
      </PageHeader>
      <Toolbar
        q={q}
        onQ={setQ}
        placeholder="ابحث برقم الأمر أو العميل"
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
          icon={Wallet}
          tag="المفتوحة"
          value={
            <span dir="rtl">{jmM(open.reduce((s, o) => s + o.value, 0))}</span>
          }
          label="قيمة الأوامر المفتوحة"
        />
        <StatCard
          icon={FileCheck}
          tag="عاجل"
          value={counts.pending}
          label="أوامر بانتظار الاعتماد"
        />
        <StatCard
          icon={Clock}
          tag="هذا الأسبوع"
          value={
            orders.filter(
              (o) => o.payStatus === "unpaid" && o.status !== "cancelled",
            ).length
          }
          label="أوامر بانتظار الدفع"
        />
        <StatCard
          icon={CheckCircle2}
          tag="هذا الشهر"
          value={counts.delivered + DELIVERED_EARLIER}
          label="أوامر تم تسليمها"
        />
      </div>
      <Chips items={SO_CHIPS} value={chip} onChange={setChip} counts={counts} />
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
        <AddSalesOrderModal
          initial={modal.item}
          salesOrders={orders}
          linkable={LINKABLE}
          onSave={save}
          onDelete={() => del(modal.item)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
