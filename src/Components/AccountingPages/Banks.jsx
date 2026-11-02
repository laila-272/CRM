import { useMemo, useState } from "react";
import {
  Plus,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
} from "lucide-react";
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

const SEED = [
  {
    id: "a1",
    bank: "مصرف الراجحي",
    name: "الحساب الجاري الرئيسي",
    no: "1002-4455",
    recon: "2026-10-20",
    type: "جاري",
    cur: "ريال سعودي",
    balance: 2450000,
    status: "active",
    unmatched: 0,
  },
  {
    id: "a2",
    bank: "البنك الأهلي السعودي",
    name: "حساب الرواتب",
    no: "2008-7712",
    recon: "2026-10-19",
    type: "جاري",
    cur: "ريال سعودي",
    balance: 1180000,
    status: "active",
    unmatched: 0,
  },
  {
    id: "a3",
    bank: "بنك الرياض",
    name: "حساب المصروفات التشغيلية",
    no: "3011-9084",
    recon: "2026-10-18",
    type: "جاري",
    cur: "ريال سعودي",
    balance: 370000,
    status: "active",
    unmatched: 14,
  },
  {
    id: "a4",
    bank: "بنك الإنماء",
    name: "حساب الاحتياطي",
    no: "4020-1166",
    recon: "2026-10-15",
    type: "توفير",
    cur: "ريال سعودي",
    balance: 820000,
    status: "active",
    unmatched: 0,
  },
  {
    id: "a5",
    bank: "البنك السعودي الفرنسي",
    name: "حساب العمولات الخارجية",
    no: "5107-3302",
    recon: "2026-10-12",
    type: "توفير",
    cur: "ريال سعودي",
    balance: 240000,
    status: "active",
    unmatched: 0,
  },
  {
    id: "a6",
    bank: "البنك العربي الوطني",
    name: "حساب مغلق — بانتظار الإغلاق",
    no: "6003-1450",
    recon: "2026-10-10",
    type: "توفير",
    cur: "ريال سعودي",
    balance: 0,
    status: "closed",
    unmatched: 0,
  },
];
// Movements newest-first; "balance after" is derived from the account balance so it always reconciles.
const MOVES = {
  a1: [
    ["2026-10-20", "إيداع — دفعة صفقة IN-0142", 180000],
    ["2026-10-19", "سداد فاتورة مشتريات BILL-0312", -32000],
    ["2026-10-12", "صرف رواتب شهر سبتمبر", -48000],
  ],
  a2: [
    ["2026-10-19", "إيداع من الحساب الرئيسي", 200000],
    ["2026-10-15", "صرف رواتب الموظفين", -150000],
    ["2026-09-30", "رسوم بنكية", -500],
  ],
  a3: [
    ["2026-10-18", "دفع مصروفات تشغيلية", -22500],
    ["2026-10-14", "تحويل من الحساب الرئيسي", 100000],
    ["2026-10-02", "رسوم خدمات مصرفية", -350],
  ],
  a4: [
    ["2026-10-15", "أرباح ادخار", 4000],
    ["2026-10-01", "تحويل احتياطي", 100000],
  ],
  a5: [
    ["2026-10-12", "عمولة وساطة خارجية", 90000],
    ["2026-09-28", "رسوم تحويل دولي", -1200],
  ],
  a6: [],
};
const ST = { active: ["نشط", "green"], closed: ["مغلق", "gray"] };
const EMPTY = {
  bank: "",
  name: "",
  no: "",
  type: "جاري",
  cur: "ريال سعودي",
  balance: "",
};
const stOf = (a) =>
  a.status === "closed"
    ? ["مغلق", "gray"]
    : a.unmatched > 0
      ? ["بحاجة لمطابقة", "orange"]
      : ST.active;

export default function Banks() {
  const [rows, setRows] = useState(SEED);
  const [q, setQ] = useState("");
  const [month, setMonth] = useState("2026-10");
  const [chip, setChip] = useState("all");
  const [sel, setSel] = useState("a1");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [toast, showToast] = useToast();

  const allMoves = Object.values(MOVES)
    .flat()
    .filter(([d]) => inMonth(d, month));
  const deposits = allMoves
    .filter(([, , a]) => a > 0)
    .reduce((s, [, , a]) => s + a, 0);
  const withdrawals = allMoves
    .filter(([, , a]) => a < 0)
    .reduce((s, [, , a]) => s - a, 0);
  const totalBal = rows.reduce((s, r) => s + r.balance, 0);
  const unmatched = rows.reduce((s, r) => s + r.unmatched, 0);

  const cnt = {
    all: rows.length,
    جاري: rows.filter((r) => r.type === "جاري").length,
    توفير: rows.filter((r) => r.type === "توفير").length,
    recon: rows.filter((r) => r.unmatched > 0).length,
    closed: rows.filter((r) => r.status === "closed").length,
  };
  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          (chip === "all" ||
            (chip === "recon"
              ? r.unmatched > 0
              : chip === "closed"
                ? r.status === "closed"
                : r.type === chip)) &&
          (!q ||
            `${r.bank} ${r.name} ${r.no}`
              .toLowerCase()
              .includes(q.toLowerCase())),
      ),
    [rows, chip, q],
  );
  const pg = usePaged(filtered, 8);

  const account = rows.find((r) => r.id === sel) || rows[0];
  const moves = useMemo(() => {
    if (!account) return [];
    let bal = account.balance;
    return (MOVES[account.id] || []).map(([date, desc, amt]) => {
      const row = { date, desc, amt, after: bal };
      bal -= amt;
      return row;
    });
  }, [account]);
  const netMoves = moves.reduce((s, m) => s + m.amt, 0);

  const reconcile = (id) => {
    setRows(
      rows.map((r) =>
        r.id === id ? { ...r, unmatched: 0, recon: today() } : r,
      ),
    );
    showToast("تمت المطابقة البنكية");
  };
  const add = () => {
    if (!form.bank.trim() || !form.no.trim())
      return showToast("أدخل اسم البنك ورقم الحساب");
    const id = "a" + (rows.length + 1 + Math.floor(Math.random() * 1000));
    setRows([
      ...rows,
      {
        id,
        ...form,
        balance: Number(form.balance) || 0,
        recon: today(),
        status: "active",
        unmatched: 0,
      },
    ]);
    setModal(false);
    setForm(EMPTY);
    showToast("تمت إضافة الحساب البنكي");
  };
  const exportCsv = () =>
    downloadCsv(
      "bank-accounts.csv",
      [
        "البنك",
        "الحساب",
        "رقم الحساب",
        "آخر مطابقة",
        "النوع",
        "العملة",
        "الرصيد",
        "الحالة",
      ],
      filtered.map((r) => [
        r.bank,
        r.name,
        r.no,
        r.recon,
        r.type,
        r.cur,
        r.balance,
        stOf(r)[0],
      ]),
    );

  const columns = [
    {
      key: "bank",
      label: "اسم البنك",
      render: (r) => (
        <div>
          <div className="font-semibold">{r.bank}</div>
          <div className="mt-0.5 text-[10.5px] text-neutral-500">{r.name}</div>
        </div>
      ),
    },
    { key: "no", label: "رقم الحساب", render: (r) => <Ltr>{r.no}</Ltr> },
    {
      key: "recon",
      label: "آخر مطابقة",
      render: (r) => (
        <span className="text-neutral-500">{fmtDate(r.recon)}</span>
      ),
    },
    { key: "type", label: "نوع الحساب" },
    { key: "cur", label: "العملة" },
    {
      key: "balance",
      label: "الرصيد",
      render: (r) => (
        <span className="font-semibold">
          <Ltr>{sar(r.balance)}</Ltr>
        </span>
      ),
    },
    {
      key: "status",
      label: "الحالة",
      render: (r) => {
        const [l, t] = stOf(r);
        return <Badge tone={t}>{l}</Badge>;
      },
    },
    {
      key: "act",
      label: "",
      render: (r) => (
        <RowMenu
          items={[
            { label: "عرض الحركات", onClick: () => setSel(r.id) },
            ...(r.unmatched > 0
              ? [{ label: "مطابقة الحساب", onClick: () => reconcile(r.id) }]
              : []),
            {
              label: r.status === "closed" ? "إعادة التفعيل" : "إغلاق الحساب",
              onClick: () =>
                setRows(
                  rows.map((x) =>
                    x.id === r.id
                      ? {
                          ...x,
                          status: x.status === "closed" ? "active" : "closed",
                        }
                      : x,
                  ),
                ),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div dir="rtl" className="space-y-4">
      <PageHeader
        title="البنوك والحسابات"
        subtitle="إدارة الحسابات البنكية ومتابعة الأرصدة والمطابقة مع كشوف الحساب"
      >
        <button
          className={btnLight}
          onClick={() => account && reconcile(account.id)}
        >
          مطابقة بنكية
        </button>
        <button className={btnDark} onClick={() => setModal(true)}>
          <Plus size={13} /> حساب بنكي جديد
        </button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBox
          className="min-w-[220px] flex-1"
          value={q}
          onChange={setQ}
          placeholder="ابحث باسم البنك أو رقم الحساب"
        />
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
          icon={Wallet}
          tag="هذا الشهر"
          value={sar(totalBal)}
          label="إجمالي الأرصدة"
        />
        <KpiCard
          icon={ArrowDownToLine}
          tag="الإيرادات"
          value={sar(deposits)}
          label="إجمالي الإيداعات"
        />
        <KpiCard
          icon={ArrowUpFromLine}
          tag="السحوبات"
          value={sar(withdrawals)}
          label="إجمالي السحوبات"
        />
        <KpiCard
          icon={AlertTriangle}
          tag="مطابقة"
          value={`${num(unmatched)} حركة`}
          label="حركات غير مطابقة"
        />
      </div>

      <div className={card}>
        <div className="flex flex-wrap justify-end gap-2 p-4">
          {[
            ["all", "الكل"],
            ["جاري", "جاري"],
            ["توفير", "توفير"],
            ["recon", "بحاجة لمطابقة"],
            ["closed", "مغلق"],
          ].map(([k, l]) => (
            <Chip key={k} active={chip === k} onClick={() => setChip(k)}>
              {l} {cnt[k]}
            </Chip>
          ))}
        </div>
        <DataTable
          columns={columns}
          rows={pg.slice}
          rowKey={(r) => r.id}
          onRowClick={(r) => setSel(r.id)}
          selectedKey={account?.id}
          minWidth={860}
        />
        <Pager pg={pg} />
      </div>

      {account && (
        <div className={card}>
          <SectionHead
            title={`حركات الحساب — ${account.bank}`}
            sub={`آخر الحركات على الحساب ${account.no} · الرصيد الحالي ${sar(account.balance)}`}
          >
            <Badge tone={stOf(account)[1]}>{stOf(account)[0]}</Badge>
          </SectionHead>
          <DataTable
            minWidth={560}
            rows={moves}
            rowKey={(m) => m.date + m.desc}
            columns={[
              { key: "date", label: "التاريخ", render: (m) => fmtDate(m.date) },
              { key: "desc", label: "البيان" },
              {
                key: "amt",
                label: "المبلغ",
                render: (m) => (
                  <span
                    className={m.amt < 0 ? "text-red-600" : "text-green-700"}
                  >
                    <Ltr>{(m.amt > 0 ? "+" : "−") + num(Math.abs(m.amt))}</Ltr>
                  </span>
                ),
              },
              {
                key: "after",
                label: "الرصيد بعد الحركة",
                render: (m) => <Ltr>{num(m.after)}</Ltr>,
              },
            ]}
          />
          {moves.length > 0 && (
            <div className="flex items-center justify-between border-t border-line bg-[#F7F7F8] px-4 py-3 text-[11px] font-semibold">
              <span>صافي آخر الحركات</span>
              <span
                dir="ltr"
                className={netMoves < 0 ? "text-red-600" : "text-ink"}
              >
                {(netMoves > 0 ? "+" : netMoves < 0 ? "−" : "") +
                  num(Math.abs(netMoves))}
              </span>
            </div>
          )}
        </div>
      )}

      {modal && (
        <Modal
          title="حساب بنكي جديد"
          onClose={() => setModal(false)}
          onSubmit={add}
          submitLabel="إضافة الحساب"
        >
          <Field label="اسم البنك">
            <input
              className={inputCls}
              value={form.bank}
              onChange={(e) => setForm({ ...form, bank: e.target.value })}
            />
          </Field>
          <Field label="اسم الحساب">
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="رقم الحساب">
            <input
              dir="ltr"
              className={inputCls}
              value={form.no}
              onChange={(e) => setForm({ ...form, no: e.target.value })}
            />
          </Field>
          <Field label="نوع الحساب">
            <select
              className={inputCls}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option>جاري</option>
              <option>توفير</option>
            </select>
          </Field>
          <Field label="العملة">
            <select
              className={inputCls}
              value={form.cur}
              onChange={(e) => setForm({ ...form, cur: e.target.value })}
            >
              <option>ريال سعودي</option>
              <option>جنيه مصري</option>
              <option>دولار أمريكي</option>
            </select>
          </Field>
          <Field label="الرصيد الافتتاحي">
            <input
              type="number"
              min="0"
              className={inputCls}
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: e.target.value })}
            />
          </Field>
        </Modal>
      )}
      {toast}
    </div>
  );
}
