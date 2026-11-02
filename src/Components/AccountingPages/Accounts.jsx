import { useMemo, useState } from "react";
import { Plus, Clock, Briefcase, Target, Landmark } from "lucide-react";
import {
  PageHeader,
  SearchBox,
  Select,
  Chip,
  downloadCsv,
  btnDark,
  btnLight,
  card,
  KpiCard,
  DataTable,
  RowMenu,
  Modal,
  Field,
  inputCls,
  usePaged,
  Pager,
  useToast,
  sar,
  fmtDate,
  MONTH_OPTIONS,
  inMonth,
  nextId,
  today,
  Ltr,
} from "./Accountingui.jsx;";

const SEED = [
  {
    id: "IN-0142",
    party: "شركة آفاق للتقنية",
    note: "نظام خدمة العملاء",
    type: "in",
    cat: "دفعة صفقة",
    amount: 180000,
    status: "paid",
    date: "2026-10-12",
    method: "تحويل بنكي",
  },
  {
    id: "OUT-0088",
    party: "شركة الإعلانات الرقمية",
    note: "حملة تسويق أكتوبر",
    type: "out",
    cat: "تسويق",
    amount: 32000,
    status: "paid",
    date: "2026-10-11",
    method: "بطاقة",
  },
  {
    id: "IN-0141",
    party: "مجموعة النخبة",
    note: "دفعة جزئية · الخدمات المدارة",
    type: "in",
    cat: "عقد خدمات",
    amount: 120000,
    paidPart: 72000,
    status: "partial",
    date: "2026-10-10",
    method: "تحويل بنكي",
  },
  {
    id: "OUT-0087",
    party: "رواتب الفريق",
    note: "رواتب شهر أكتوبر",
    type: "out",
    cat: "رواتب",
    amount: 48000,
    status: "paid",
    date: "2026-10-08",
    method: "تحويل بنكي",
  },
  {
    id: "IN-0140",
    party: "مجموعة شموخ",
    note: "مشروع التحول الرقمي",
    type: "in",
    cat: "عقد",
    amount: 150000,
    status: "unpaid",
    date: "2026-10-07",
    method: "—",
  },
  {
    id: "OUT-0086",
    party: "شركة العقارات المتحدة",
    note: "إيجار المكتب",
    type: "out",
    cat: "إيجار",
    amount: 20000,
    status: "paid",
    date: "2026-10-05",
    method: "تحويل بنكي",
  },
  {
    id: "IN-0139",
    party: "مؤسسة المدار",
    note: "اشتراك سنوي موسع",
    type: "in",
    cat: "اشتراكات",
    amount: 260000,
    status: "paid",
    date: "2026-10-03",
    method: "شيك",
  },
  {
    id: "OUT-0085",
    party: "مزود الاستضافة السحابية",
    note: "خدمات سحابية",
    type: "out",
    cat: "موردون",
    amount: 14300,
    status: "review",
    date: "2026-10-01",
    method: "بطاقة",
  },
  {
    id: "IN-0138",
    party: "شركة سما للمقاولات",
    note: "دفعة مقدمة",
    type: "in",
    cat: "دفعة صفقة",
    amount: 90000,
    status: "paid",
    date: "2026-09-28",
    method: "تحويل بنكي",
  },
  {
    id: "OUT-0084",
    party: "مصروفات إدارية",
    note: "مستلزمات مكتبية",
    type: "out",
    cat: "إدارية",
    amount: 6500,
    status: "paid",
    date: "2026-09-25",
    method: "بطاقة",
  },
  {
    id: "IN-0137",
    party: "شركة الرؤية للتطوير",
    note: "عمولة وساطة",
    type: "in",
    cat: "عمولات",
    amount: 75000,
    status: "unpaid",
    date: "2026-09-20",
    method: "—",
  },
  {
    id: "OUT-0083",
    party: "صيانة المكتب",
    note: "صيانة دورية",
    type: "out",
    cat: "صيانة",
    amount: 4200,
    status: "paid",
    date: "2026-09-18",
    method: "شيك",
  },
];
const STATUS = {
  paid: "مدفوع",
  partial: "مدفوع جزئياً",
  unpaid: "غير مدفوع",
  review: "قيد المراجعة",
};
const METHODS = ["تحويل بنكي", "بطاقة", "شيك", "—"];
const EMPTY = {
  party: "",
  note: "",
  type: "in",
  cat: "",
  amount: "",
  status: "paid",
  method: "تحويل بنكي",
  date: today(),
};
const settled = (r) =>
  r.status === "paid" ? r.amount : r.status === "partial" ? r.paidPart || 0 : 0;

export default function Accounts() {
  const [rows, setRows] = useState(SEED);
  const [q, setQ] = useState("");
  const [month, setMonth] = useState("2026-10");
  const [method, setMethod] = useState("all");
  const [chip, setChip] = useState("all");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [toast, showToast] = useToast();

  const period = useMemo(
    () =>
      rows
        .filter((r) => inMonth(r.date, month))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [rows, month],
  );
  const kpi = useMemo(() => {
    const inflow = period
      .filter((r) => r.type === "in")
      .reduce((s, r) => s + settled(r), 0);
    const outflow = period
      .filter((r) => r.type === "out")
      .reduce((s, r) => s + settled(r), 0);
    const pending = period
      .filter((r) => r.type === "in")
      .reduce((s, r) => s + r.amount - settled(r), 0);
    return { inflow, outflow, net: inflow - outflow, pending };
  }, [period]);
  const counts = {
    all: period.length,
    in: period.filter((r) => r.type === "in").length,
    out: period.filter((r) => r.type === "out").length,
    unpaid: period.filter((r) => r.status === "unpaid").length,
  };
  const filtered = useMemo(
    () =>
      period.filter(
        (r) =>
          (method === "all" || r.method === method) &&
          (chip === "all" ||
            (chip === "unpaid" ? r.status === "unpaid" : r.type === chip)) &&
          (!q ||
            `${r.id} ${r.party} ${r.note}`
              .toLowerCase()
              .includes(q.toLowerCase())),
      ),
    [period, method, chip, q],
  );
  const pg = usePaged(filtered, 8);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const add = () => {
    const prefix = form.type === "in" ? "IN-" : "OUT-";
    const id = nextId(
      prefix,
      rows.filter((r) => r.type === form.type).map((r) => r.id),
    );
    const amount = Number(form.amount);
    if (!form.party.trim() || !(amount > 0))
      return showToast("أدخل اسم الجهة ومبلغاً صحيحاً");
    setRows([
      {
        ...form,
        id,
        amount,
        paidPart:
          form.status === "partial" ? Math.round(amount / 2) : undefined,
        cat: form.cat || "—",
      },
      ...rows,
    ]);
    setModal(false);
    setForm(EMPTY);
    showToast(`تمت إضافة الحركة ${id}`);
  };
  const exportCsv = () =>
    downloadCsv(
      "accounts.csv",
      [
        "رقم الحركة",
        "الجهة",
        "البيان",
        "النوع",
        "التصنيف",
        "المبلغ",
        "الحالة",
        "التاريخ",
        "طريقة الدفع",
      ],
      filtered.map((r) => [
        r.id,
        r.party,
        r.note,
        r.type === "in" ? "وارد" : "صادر",
        r.cat,
        r.amount,
        STATUS[r.status],
        r.date,
        r.method,
      ]),
    );

  const columns = [
    { key: "id", label: "رقم الحركة", render: (r) => <Ltr>{r.id}</Ltr> },
    {
      key: "party",
      label: "الجهة",
      render: (r) => (
        <div>
          <div className="font-semibold">{r.party}</div>
          <div className="mt-0.5 text-[10.5px] text-neutral-500">{r.note}</div>
        </div>
      ),
    },
    {
      key: "type",
      label: "النوع",
      render: (r) => (
        <span className="text-neutral-500">
          {r.type === "in" ? "وارد" : "صادر"}
        </span>
      ),
    },
    { key: "cat", label: "التصنيف" },
    {
      key: "amount",
      label: "المبلغ",
      render: (r) => (
        <span className="font-semibold">
          <Ltr>{sar(r.amount)}</Ltr>
        </span>
      ),
    },
    {
      key: "status",
      label: "الحالة",
      render: (r) => (
        <span className="text-neutral-500">{STATUS[r.status]}</span>
      ),
    },
    {
      key: "date",
      label: "التاريخ",
      render: (r) => (
        <span className="text-neutral-500">{fmtDate(r.date)}</span>
      ),
    },
    { key: "method", label: "طريقة الدفع" },
    {
      key: "act",
      label: "",
      render: (r) => (
        <RowMenu
          items={[
            ...(r.status !== "paid"
              ? [
                  {
                    label: "تسجيل كمدفوع",
                    onClick: () => {
                      setRows(
                        rows.map((x) =>
                          x.id === r.id ? { ...x, status: "paid" } : x,
                        ),
                      );
                      showToast(`تم تسجيل ${r.id} كمدفوع`);
                    },
                  },
                ]
              : []),
            {
              label: "حذف",
              danger: true,
              onClick: () => {
                setRows(rows.filter((x) => x.id !== r.id));
                showToast("تم حذف الحركة");
              },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div dir="rtl" className="space-y-4">
      <PageHeader
        title="الحسابات"
        subtitle="تابع كل الأموال الداخلة والخارجة وحالة التحصيل والسداد"
      >
        <button className={btnDark} onClick={() => setModal(true)}>
          <Plus size={13} /> حركة جديدة
        </button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBox
          className="min-w-[220px] flex-1"
          value={q}
          onChange={setQ}
          placeholder="ابحث برقم الحركة أو الجهة"
        />
        <div className="w-[150px]">
          <Select value={month} onChange={setMonth}>
            {MONTH_OPTIONS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-[150px]">
          <Select value={method} onChange={setMethod}>
            <option value="all">كل الحسابات</option>
            {METHODS.slice(0, 3).map((m) => (
              <option key={m}>{m}</option>
            ))}
          </Select>
        </div>
        <button className={btnLight} onClick={exportCsv}>
          تصدير
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          icon={Clock}
          tag="هذا الشهر"
          value={sar(kpi.inflow)}
          label="إجمالي الوارد"
        />
        <KpiCard
          icon={Target}
          tag="هذا الشهر"
          value={sar(kpi.outflow)}
          label="إجمالي الصادر"
        />
        <KpiCard
          icon={Briefcase}
          tag="هذا الشهر"
          value={sar(kpi.net)}
          label="صافي الربح"
        />
        <KpiCard
          icon={Landmark}
          tag="بالانتظار التحصيل"
          value={sar(kpi.pending)}
          label="مستحقات لم تُحصّل"
        />
      </div>

      <div className={card}>
        <div className="flex flex-wrap justify-end gap-2 p-4">
          {[
            ["all", "الكل"],
            ["in", "وارد"],
            ["out", "صادر"],
            ["unpaid", "غير مدفوع"],
          ].map(([k, l]) => (
            <Chip key={k} active={chip === k} onClick={() => setChip(k)}>
              {l} {counts[k]}
            </Chip>
          ))}
        </div>
        <DataTable
          columns={columns}
          rows={pg.slice}
          rowKey={(r) => r.id}
          minWidth={860}
        />
        <Pager pg={pg} />
      </div>

      {modal && (
        <Modal
          title="حركة جديدة"
          onClose={() => setModal(false)}
          onSubmit={add}
          submitLabel="إضافة الحركة"
        >
          <Field label="الجهة" full>
            <input
              className={inputCls}
              value={form.party}
              onChange={set("party")}
            />
          </Field>
          <Field label="البيان" full>
            <input
              className={inputCls}
              value={form.note}
              onChange={set("note")}
            />
          </Field>
          <Field label="النوع">
            <select
              className={inputCls}
              value={form.type}
              onChange={set("type")}
            >
              <option value="in">وارد</option>
              <option value="out">صادر</option>
            </select>
          </Field>
          <Field label="التصنيف">
            <input
              className={inputCls}
              value={form.cat}
              onChange={set("cat")}
            />
          </Field>
          <Field label="المبلغ (ر.س)">
            <input
              type="number"
              min="0"
              className={inputCls}
              value={form.amount}
              onChange={set("amount")}
            />
          </Field>
          <Field label="الحالة">
            <select
              className={inputCls}
              value={form.status}
              onChange={set("status")}
            >
              {Object.entries(STATUS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field label="طريقة الدفع">
            <select
              className={inputCls}
              value={form.method}
              onChange={set("method")}
            >
              {METHODS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Field label="التاريخ">
            <input
              type="date"
              className={inputCls}
              value={form.date}
              onChange={set("date")}
            />
          </Field>
        </Modal>
      )}
      {toast}
    </div>
  );
}
