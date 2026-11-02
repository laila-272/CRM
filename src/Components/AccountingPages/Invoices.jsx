import { useMemo, useState } from "react";
import {
  Plus,
  Download,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  PageHeader,
  SearchBox,
  Select,
  downloadCsv,
  egp,
  btnDark,
  btnLight,
  card,
  KpiCard,
  SectionHead,
  Badge,
  DataTable,
  RowMenu,
  Modal,
  Field,
  inputCls,
  usePaged,
  Pager,
  useToast,
  fmtDate,
  nextId,
  today,
  Ltr,
} from "./Accountingui.jsx";

const REF = new Date("2026-10-31");
const SEED = [
  {
    id: "INV-0032",
    client: "مجموعة شموخ",
    issue: "2026-10-12",
    due: "",
    amount: 35000,
    status: "draft",
  },
  {
    id: "INV-0031",
    client: "شركة آفاق للتقنية",
    issue: "2026-10-01",
    due: "2026-10-31",
    amount: 180000,
    status: "due",
  },
  {
    id: "INV-0030",
    client: "مجموعة النخبة",
    issue: "2026-09-24",
    due: "2026-10-24",
    amount: 260000,
    status: "paid",
  },
  {
    id: "INV-0029",
    client: "مؤسسة المدار",
    issue: "2026-09-10",
    due: "2026-10-10",
    amount: 48500,
    status: "overdue",
  },
  {
    id: "INV-0028",
    client: "شركة سمار",
    issue: "2026-09-02",
    due: "2026-10-02",
    amount: 200000,
    status: "paid",
  },
  {
    id: "INV-0027",
    client: "شركة الأفق للتجارة",
    issue: "2026-08-28",
    due: "2026-09-27",
    amount: 69500,
    status: "overdue",
  },
  {
    id: "INV-0026",
    client: "شركة سما للمقاولات",
    issue: "2026-08-10",
    due: "2026-09-09",
    amount: 220000,
    status: "paid",
  },
  {
    id: "INV-0025",
    client: "شركة الرؤية للتطوير",
    issue: "2026-07-15",
    due: "2026-08-14",
    amount: 310000,
    status: "paid",
  },
  {
    id: "INV-0024",
    client: "مؤسسة الندى",
    issue: "2026-07-01",
    due: "2026-07-31",
    amount: 150000,
    status: "paid",
  },
];
const LABEL = {
  draft: "مسودة",
  due: "مستحقة",
  paid: "مدفوعة",
  overdue: "متأخرة",
};
const EMPTY = { client: "", issue: today(), due: "", amount: "" };

export default function Invoices() {
  const [rows, setRows] = useState(SEED);
  const [q, setQ] = useState("");
  const [st, setSt] = useState("all");
  const [showAll, setShowAll] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [toast, showToast] = useToast();

  const sum = (f) => rows.filter(f).reduce((s, r) => s + r.amount, 0);
  const total = sum(() => true);
  const collected = sum((r) => r.status === "paid");
  const open = rows.filter((r) => r.status === "due" || r.status === "overdue");
  const overdue = rows.filter((r) => r.status === "overdue");
  const pct = total ? Math.round((collected / total) * 100) : 0;

  const aging = useMemo(() => {
    const b = [0, 0, 0];
    open.forEach((r) => {
      const d = Math.max(0, Math.floor((REF - new Date(r.due)) / 864e5));
      b[d <= 30 ? 0 : d <= 60 ? 1 : 2] += r.amount;
    });
    return b;
  }, [rows]);
  const maxAge = Math.max(...aging, 1);

  const filtered = useMemo(
    () =>
      rows
        .filter(
          (r) =>
            (st === "all" || r.status === st) &&
            (!q ||
              `${r.id} ${r.client}`.toLowerCase().includes(q.toLowerCase())),
        )
        .sort((a, b) => b.id.localeCompare(a.id)),
    [rows, st, q],
  );
  const pg = usePaged(filtered, showAll ? 8 : 6);

  const add = () => {
    const amount = Number(form.amount);
    if (!form.client.trim() || !(amount > 0))
      return showToast("أدخل اسم العميل ومبلغاً صحيحاً");
    const id = nextId(
      "INV-",
      rows.map((r) => r.id),
    );
    setRows([
      {
        id,
        client: form.client,
        issue: form.issue,
        due: form.due,
        amount,
        status: form.due ? "due" : "draft",
      },
      ...rows,
    ]);
    setModal(false);
    setForm(EMPTY);
    showToast(`تم إنشاء الفاتورة ${id}`);
  };
  const exportCsv = () =>
    downloadCsv(
      "invoices.csv",
      [
        "رقم الفاتورة",
        "العميل",
        "تاريخ الإصدار",
        "الاستحقاق",
        "المبلغ",
        "الحالة",
      ],
      filtered.map((r) => [
        r.id,
        r.client,
        r.issue,
        r.due,
        r.amount,
        LABEL[r.status],
      ]),
    );

  const columns = [
    { key: "id", label: "رقم الفاتورة", render: (r) => <Ltr>{r.id}</Ltr> },
    {
      key: "client",
      label: "العميل",
      render: (r) => <span className="font-semibold">{r.client}</span>,
    },
    {
      key: "issue",
      label: "تاريخ الإصدار",
      render: (r) => (
        <span className="text-neutral-500">{fmtDate(r.issue)}</span>
      ),
    },
    {
      key: "due",
      label: "الاستحقاق",
      render: (r) => <span className="text-neutral-500">{fmtDate(r.due)}</span>,
    },
    {
      key: "amount",
      label: "المبلغ",
      render: (r) => (
        <span className="font-semibold">
          <Ltr>{egp(r.amount)}</Ltr>
        </span>
      ),
    },
    {
      key: "status",
      label: "الحالة",
      render: (r) => (
        <Badge tone={r.status === "overdue" ? "red" : "gray"}>
          {LABEL[r.status]}
        </Badge>
      ),
    },
    {
      key: "act",
      label: "",
      render: (r) => (
        <RowMenu
          items={[
            ...(r.status !== "paid" && r.status !== "draft"
              ? [
                  {
                    label: "تسجيل تحصيل",
                    onClick: () => {
                      setRows(
                        rows.map((x) =>
                          x.id === r.id ? { ...x, status: "paid" } : x,
                        ),
                      );
                      showToast(`تم تحصيل ${r.id}`);
                    },
                  },
                  {
                    label: "إرسال تذكير",
                    onClick: () =>
                      showToast(`تم تجهيز تذكير لـ ${r.client} (عرض تجريبي)`),
                  },
                ]
              : []),
            {
              label: "حذف",
              danger: true,
              onClick: () => {
                setRows(rows.filter((x) => x.id !== r.id));
                showToast("تم حذف الفاتورة");
              },
            },
          ]}
        />
      ),
    },
  ];

  const bars = [
    ["حتى 30 يوماً", aging[0]],
    ["من 31 إلى 60 يوماً", aging[1]],
    ["من 61 يوماً فأكثر", aging[2]],
  ];

  return (
    <div dir="rtl" className="space-y-4">
      <PageHeader
        title="الفواتير والتحصيل"
        subtitle="متابعة الفواتير الصادرة وحالات السداد والمستحقات"
      >
        <button className={btnLight} onClick={exportCsv}>
          <Download size={13} /> تصدير البيانات
        </button>
        <button className={btnDark} onClick={() => setModal(true)}>
          <Plus size={13} /> فاتورة جديدة
        </button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          titled
          icon={FileText}
          label="إجمالي الفواتير"
          value={egp(total)}
          sub={`${rows.length} فاتورة`}
        />
        <KpiCard
          titled
          icon={CheckCircle2}
          label="المحصّل"
          value={egp(collected)}
          sub={`${pct}% من الإجمالي`}
          subTone="green"
        />
        <KpiCard
          titled
          icon={Clock}
          label="المستحق"
          value={egp(open.reduce((s, r) => s + r.amount, 0))}
          sub={`${open.length} فاتورة`}
        />
        <KpiCard
          titled
          icon={AlertCircle}
          label="المتأخر"
          value={egp(overdue.reduce((s, r) => s + r.amount, 0))}
          sub={`${overdue.length} فواتير تحتاج متابعة`}
          subTone="red"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className={card}>
          <SectionHead title="الفواتير" sub="أحدث الفواتير الصادرة">
            <button
              className="text-[10.5px] text-neutral-500 hover:text-ink"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? "عرض الأحدث" : "عرض الكل"}
            </button>
          </SectionHead>
          <div className="flex flex-wrap gap-2 px-4 pb-3">
            <SearchBox
              className="min-w-[180px] flex-1"
              value={q}
              onChange={setQ}
              placeholder="ابحث برقم الفاتورة أو العميل"
            />
            <div className="w-[140px]">
              <Select value={st} onChange={setSt}>
                <option value="all">كل الحالات</option>
                {Object.entries(LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <DataTable
            columns={columns}
            rows={pg.slice}
            rowKey={(r) => r.id}
            minWidth={760}
          />
          <Pager pg={pg} />
        </div>

        <div className={`${card} self-start`}>
          <SectionHead
            title="أعمار المستحقات"
            sub="المبالغ المستحقة حسب مدة التأخر"
          />
          <div className="space-y-4 px-4 pb-5">
            {bars.map(([label, v], i) => (
              <div key={label}>
                <div className="mb-1.5 flex items-center justify-between text-[10.5px]">
                  <span className="font-semibold text-ink">{label}</span>
                  <span className="text-neutral-500">
                    <Ltr>{egp(v)}</Ltr>
                  </span>
                </div>
                <div className="h-2 rounded-full bg-neutral-100">
                  <div
                    className={`h-2 rounded-full ${i === 0 ? "bg-ink" : "bg-neutral-400"}`}
                    style={{ width: `${(v / maxAge) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal && (
        <Modal
          title="فاتورة جديدة"
          onClose={() => setModal(false)}
          onSubmit={add}
          submitLabel="إنشاء الفاتورة"
        >
          <Field label="العميل" full>
            <input
              className={inputCls}
              value={form.client}
              onChange={(e) => setForm({ ...form, client: e.target.value })}
            />
          </Field>
          <Field label="تاريخ الإصدار">
            <input
              type="date"
              className={inputCls}
              value={form.issue}
              onChange={(e) => setForm({ ...form, issue: e.target.value })}
            />
          </Field>
          <Field label="تاريخ الاستحقاق (اتركه فارغاً للمسودة)">
            <input
              type="date"
              className={inputCls}
              value={form.due}
              onChange={(e) => setForm({ ...form, due: e.target.value })}
            />
          </Field>
          <Field label="المبلغ (EGP)" full>
            <input
              type="number"
              min="0"
              className={inputCls}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </Field>
        </Modal>
      )}
      {toast}
    </div>
  );
}
