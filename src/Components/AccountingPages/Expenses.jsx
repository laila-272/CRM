import { useMemo, useState } from "react";
import { Plus, FileText } from "lucide-react";
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
  sar,
  num,
  fmtDate,
  MONTH_OPTIONS,
  inMonth,
  nextId,
  today,
  Ltr,
} from "./Accountingui.jsx;";

const REF = new Date("2026-10-31");
const CATS = [
  "مشتريات ومخزون",
  "تسويق وإعلانات",
  "إيجارات ومرافق",
  "خدمات فنية واستشارات",
  "صيانة وتشغيل",
  "أخرى",
];
const STATUS = {
  due: "مستحقة",
  approved: "معتمدة",
  pending: "معلقة",
  overdue: "متأخرة",
  paid: "مدفوعة",
  draft: "مسودة",
};
const TONE = {
  overdue: "red",
  paid: "green",
  due: "orange",
  approved: "gray",
  pending: "gray",
  draft: "gray",
};
const UNPAID = ["due", "approved", "pending", "overdue"];
const SEED = [
  {
    ref: "BILL-0313",
    party: "مزود الاستضافة السحابية",
    note: "خدمات سحابية",
    kind: "bill",
    cat: "خدمات فنية واستشارات",
    date: "2026-10-22",
    due: "2026-11-05",
    amount: 14300,
    status: "due",
    method: "—",
  },
  {
    ref: "BILL-0312",
    party: "شركة الإعلانات الرقمية",
    note: "حملة تسويق أكتوبر",
    kind: "bill",
    cat: "تسويق وإعلانات",
    date: "2026-10-24",
    due: "2026-11-11",
    amount: 32000,
    status: "approved",
    method: "—",
  },
  {
    ref: "BILL-0311",
    party: "المطابع المتحدة",
    note: "مطبوعات وإعلانات",
    kind: "bill",
    cat: "تسويق وإعلانات",
    date: "2026-10-28",
    due: "2026-11-20",
    amount: 18600,
    status: "pending",
    method: "—",
  },
  {
    ref: "BILL-0307",
    party: "مؤسسة النقل واللوجستيات",
    note: "شحن وتوصيل",
    kind: "bill",
    cat: "صيانة وتشغيل",
    date: "2026-10-16",
    due: "2026-10-26",
    amount: 22500,
    status: "overdue",
    method: "—",
  },
  {
    ref: "EXP-0223",
    party: "شركة العقارات المتحدة",
    note: "إيجار المكتب · أكتوبر",
    kind: "expense",
    cat: "إيجارات ومرافق",
    date: "2026-10-01",
    due: "",
    amount: 20000,
    status: "paid",
    method: "تحويل بنكي",
  },
  {
    ref: "BILL-0310",
    party: "مؤسسة الطاقة",
    note: "كهرباء ومياه",
    kind: "bill",
    cat: "إيجارات ومرافق",
    date: "2026-10-15",
    due: "",
    amount: 9400,
    status: "paid",
    method: "تحويل بنكي",
  },
  {
    ref: "EXP-0222",
    party: "صيانة واجتماعات",
    note: "ضيافة اجتماعات",
    kind: "expense",
    cat: "صيانة وتشغيل",
    date: "2026-10-12",
    due: "",
    amount: 2150,
    status: "paid",
    method: "بطاقة",
  },
  {
    ref: "BILL-0309",
    party: "شركة الصيانة الذكية",
    note: "عقد صيانة",
    kind: "bill",
    cat: "صيانة وتشغيل",
    date: "2026-10-30",
    due: "",
    amount: 6300,
    status: "draft",
    method: "—",
  },
  {
    ref: "BILL-0314",
    party: "مورد المخزون الأول",
    note: "توريد أجهزة",
    kind: "bill",
    cat: "مشتريات ومخزون",
    date: "2026-10-05",
    due: "",
    amount: 85000,
    status: "paid",
    method: "تحويل بنكي",
  },
  {
    ref: "BILL-0315",
    party: "مورد المخزون الثاني",
    note: "قطع غيار",
    kind: "bill",
    cat: "مشتريات ومخزون",
    date: "2026-10-09",
    due: "",
    amount: 40000,
    status: "paid",
    method: "تحويل بنكي",
  },
  {
    ref: "EXP-0224",
    party: "مصروفات متنوعة",
    note: "نثريات",
    kind: "expense",
    cat: "أخرى",
    date: "2026-10-18",
    due: "",
    amount: 5000,
    status: "paid",
    method: "بطاقة",
  },
  {
    ref: "BILL-0301",
    party: "مورد المخزون الأول",
    note: "توريد سبتمبر",
    kind: "bill",
    cat: "مشتريات ومخزون",
    date: "2026-09-14",
    due: "",
    amount: 60000,
    status: "paid",
    method: "تحويل بنكي",
  },
  {
    ref: "EXP-0220",
    party: "شركة الإعلانات الرقمية",
    note: "إعلانات سبتمبر",
    kind: "expense",
    cat: "تسويق وإعلانات",
    date: "2026-09-22",
    due: "",
    amount: 12000,
    status: "paid",
    method: "بطاقة",
  },
];
const EMPTY = {
  party: "",
  note: "",
  kind: "bill",
  cat: CATS[0],
  date: today(),
  due: "",
  amount: "",
  status: "pending",
  method: "—",
};

export default function Expenses() {
  const [rows, setRows] = useState(SEED);
  const [q, setQ] = useState("");
  const [month, setMonth] = useState("2026-10");
  const [cat, setCat] = useState("all");
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
  const bills = period.filter((r) => r.kind === "bill");
  const purchases = bills.reduce((s, r) => s + r.amount, 0);
  const expenses = period
    .filter((r) => r.kind === "expense")
    .reduce((s, r) => s + r.amount, 0);
  const dues = period
    .filter((r) => r.kind === "bill" && UNPAID.includes(r.status))
    .reduce((s, r) => s + r.amount, 0);
  const vat = Math.round(
    (bills
      .filter((r) => r.status !== "draft")
      .reduce((s, r) => s + r.amount, 0) *
      15) /
      115,
  );
  const total = purchases + expenses;

  const byCat = CATS.map((c) => [
    c,
    period.filter((r) => r.cat === c).reduce((s, r) => s + r.amount, 0),
  ])
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);
  const maxCat = Math.max(...byCat.map(([, v]) => v), 1);

  const soon = rows
    .filter((r) => r.kind === "bill" && UNPAID.includes(r.status) && r.due)
    .sort((a, b) => a.due.localeCompare(b.due))
    .slice(0, 4);
  const daysTo = (d) => Math.ceil((new Date(d) - REF) / 864e5);

  const filtered = useMemo(
    () =>
      period.filter(
        (r) =>
          (cat === "all" || r.cat === cat) &&
          (chip === "all" ||
            (chip === "bill" && r.kind === "bill") ||
            (chip === "expense" && r.kind === "expense") ||
            (chip === "unpaid" && UNPAID.includes(r.status)) ||
            (chip === "paid" && r.status === "paid")) &&
          (!q ||
            `${r.ref} ${r.party} ${r.note}`
              .toLowerCase()
              .includes(q.toLowerCase())),
      ),
    [period, cat, chip, q],
  );
  const pg = usePaged(filtered, 8);
  const cnt = {
    all: period.length,
    bill: bills.length,
    expense: period.length - bills.length,
    unpaid: period.filter((r) => UNPAID.includes(r.status)).length,
    paid: period.filter((r) => r.status === "paid").length,
  };

  const add = () => {
    const amount = Number(form.amount);
    if (!form.party.trim() || !(amount > 0))
      return showToast("أدخل اسم الجهة ومبلغاً صحيحاً");
    const ref = nextId(
      form.kind === "bill" ? "BILL-" : "EXP-",
      rows.filter((r) => r.kind === form.kind).map((r) => r.ref),
    );
    setRows([{ ...form, ref, amount }, ...rows]);
    setModal(false);
    setForm(EMPTY);
    showToast(`تمت إضافة ${ref}`);
  };
  const exportCsv = () =>
    downloadCsv(
      "expenses.csv",
      [
        "المستند",
        "الجهة",
        "البيان",
        "النوع",
        "التصنيف",
        "التاريخ",
        "المبلغ",
        "الحالة",
        "طريقة الدفع",
      ],
      filtered.map((r) => [
        r.ref,
        r.party,
        r.note,
        r.kind === "bill" ? "فاتورة" : "مصروف",
        r.cat,
        r.date,
        r.amount,
        STATUS[r.status],
        r.method,
      ]),
    );

  const columns = [
    {
      key: "party",
      label: "المورد / الجهة",
      render: (r) => (
        <div>
          <div className="font-semibold">{r.party}</div>
          <div className="mt-0.5 text-[10.5px] text-neutral-500">{r.note}</div>
        </div>
      ),
    },
    { key: "ref", label: "رقم المستند", render: (r) => <Ltr>{r.ref}</Ltr> },
    {
      key: "kind",
      label: "النوع",
      render: (r) => (r.kind === "bill" ? "فاتورة" : "مصروف"),
    },
    { key: "cat", label: "التصنيف" },
    {
      key: "date",
      label: "التاريخ",
      render: (r) => (
        <span className="text-neutral-500">{fmtDate(r.date)}</span>
      ),
    },
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
      render: (r) => <Badge tone={TONE[r.status]}>{STATUS[r.status]}</Badge>,
    },
    {
      key: "method",
      label: "طريقة الدفع",
      render: (r) => <span className="text-neutral-500">{r.method}</span>,
    },
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
                          x.ref === r.ref
                            ? {
                                ...x,
                                status: "paid",
                                method:
                                  x.method === "—" ? "تحويل بنكي" : x.method,
                              }
                            : x,
                        ),
                      );
                      showToast(`تم سداد ${r.ref}`);
                    },
                  },
                ]
              : []),
            {
              label: "حذف",
              danger: true,
              onClick: () => {
                setRows(rows.filter((x) => x.ref !== r.ref));
                showToast("تم الحذف");
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
        title="المشتريات والمصروفات"
        subtitle="سجل فواتير الموردين والمصروفات التشغيلية وتابع المستحقات وحصة التصنيف"
      >
        <button
          className={btnLight}
          onClick={() => {
            setForm({ ...EMPTY, kind: "bill" });
            setModal(true);
          }}
        >
          <FileText size={13} /> فاتورة مشتريات +
        </button>
        <button
          className={btnDark}
          onClick={() => {
            setForm({
              ...EMPTY,
              kind: "expense",
              status: "paid",
              method: "بطاقة",
            });
            setModal(true);
          }}
        >
          <Plus size={13} /> مصروف جديد
        </button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBox
          className="min-w-[220px] flex-1"
          value={q}
          onChange={setQ}
          placeholder="ابحث برقم المستند أو اسم المورد"
        />
        <div className="w-[150px]">
          <Select value={cat} onChange={setCat}>
            <option value="all">كل الأقسام</option>
            {CATS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Select>
        </div>
        <div className="w-[140px]">
          <Select value={month} onChange={setMonth}>
            {MONTH_OPTIONS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </div>
        <button className={btnLight} onClick={exportCsv}>
          تصدير
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          tag="هذا الشهر"
          value={sar(total)}
          label="إجمالي المشتريات والمصروفات"
        />
        <KpiCard
          tag="تشغيلية"
          value={sar(expenses)}
          label="المصروفات التشغيلية"
        />
        <KpiCard
          tag={`${soon.length} فواتير`}
          value={sar(dues)}
          label="مستحقات الموردين"
        />
        <KpiCard
          tag="قابلة للاسترداد"
          value={sar(vat)}
          label="ضريبة القيمة المضافة المدخلة"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className={card}>
          <SectionHead
            title="المشتريات والمصروفات حسب التصنيف"
            sub={`إجمالي ${sar(total)} · ${MONTH_OPTIONS.find((m) => m[0] === month)[1]}`}
          />
          <div className="space-y-4 px-4 pb-5">
            {byCat.map(([c, v]) => (
              <div key={c} className="flex items-center gap-3 text-[11px]">
                <span className="w-[150px] shrink-0 text-neutral-600">
                  {c} · {Math.round((v / total) * 100)}%
                </span>
                <div className="h-2 flex-1 rounded-full bg-neutral-100">
                  <div
                    className="h-2 rounded-full bg-ink"
                    style={{ width: `${(v / maxCat) * 100}%` }}
                  />
                </div>
                <span
                  dir="ltr"
                  className="w-[80px] shrink-0 text-left font-semibold"
                >
                  {sar(v)}
                </span>
              </div>
            ))}
            {byCat.length === 0 && (
              <div className="py-6 text-center text-[11px] text-neutral-400">
                لا توجد بيانات لهذه الفترة
              </div>
            )}
          </div>
        </div>
        <div className={`${card} self-start`}>
          <SectionHead
            title="مستحق قريباً"
            sub={`أقرب ${soon.length} فواتير للسداد`}
          />
          <ul className="divide-y divide-line">
            {soon.map((r) => {
              const d = daysTo(r.due);
              return (
                <li
                  key={r.ref}
                  className="flex items-center justify-between gap-2 px-4 py-3 text-[11px]"
                >
                  <div>
                    <div className="font-semibold text-ink">{r.party}</div>
                    <div className="mt-0.5 text-[10px] text-neutral-500">
                      {d < 0
                        ? `متأخر ${Math.abs(d)} يوماً`
                        : `مستحق خلال ${d} أيام`}{" "}
                      · <Ltr>{r.ref}</Ltr>
                    </div>
                  </div>
                  <span
                    dir="ltr"
                    className={`font-semibold ${d < 0 ? "text-red-600" : "text-ink"}`}
                  >
                    {sar(r.amount)}
                  </span>
                </li>
              );
            })}
            {soon.length === 0 && (
              <li className="px-4 py-6 text-center text-[11px] text-neutral-400">
                لا توجد مستحقات
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className={card}>
        <div className="flex flex-wrap justify-end gap-2 p-4">
          {[
            ["all", "الكل"],
            ["bill", "فواتير موردين"],
            ["expense", "مصروفات"],
            ["unpaid", "مستحقة"],
            ["paid", "مدفوعة"],
          ].map(([k, l]) => (
            <Chip key={k} active={chip === k} onClick={() => setChip(k)}>
              {l} {cnt[k]}
            </Chip>
          ))}
        </div>
        <DataTable
          columns={columns}
          rows={pg.slice}
          rowKey={(r) => r.ref}
          minWidth={900}
        />
        <Pager pg={pg} />
      </div>

      {modal && (
        <Modal
          title={form.kind === "bill" ? "فاتورة مشتريات" : "مصروف جديد"}
          onClose={() => setModal(false)}
          onSubmit={add}
        >
          <Field label="المورد / الجهة" full>
            <input
              className={inputCls}
              value={form.party}
              onChange={(e) => setForm({ ...form, party: e.target.value })}
            />
          </Field>
          <Field label="البيان" full>
            <input
              className={inputCls}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
            />
          </Field>
          <Field label="التصنيف">
            <select
              className={inputCls}
              value={form.cat}
              onChange={(e) => setForm({ ...form, cat: e.target.value })}
            >
              {CATS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="المبلغ (ر.س)">
            <input
              type="number"
              min="0"
              className={inputCls}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
          </Field>
          <Field label="الحالة">
            <select
              className={inputCls}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
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
              onChange={(e) => setForm({ ...form, method: e.target.value })}
            >
              {["—", "تحويل بنكي", "بطاقة", "شيك"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </Field>
          <Field label="التاريخ">
            <input
              type="date"
              className={inputCls}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </Field>
          <Field label="تاريخ الاستحقاق">
            <input
              type="date"
              className={inputCls}
              value={form.due}
              onChange={(e) => setForm({ ...form, due: e.target.value })}
            />
          </Field>
        </Modal>
      )}
      {toast}
    </div>
  );
}
