import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
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
} from "./AccountingUI.jsx";

export const COA = {
  1102: "مصرف الراجحي — الحساب الجاري",
  1301: "ذمم مدينة",
  1401: "ضريبة القيمة المضافة المدخلة",
  1190: "مجمع الإهلاك",
  2101: "ذمم دائنة",
  2200: "ضريبة القيمة المضافة المحصلة",
  4101: "إيرادات الصفقات",
  5101: "رواتب وأجور",
  5301: "تسويق وإعلانات",
  5401: "مصروف استهلاك",
  5501: "مصروفات إدارية",
  5601: "مصروفات بنكية",
};
const L = (code, debit, credit) => ({ code, name: COA[code], debit, credit });
const SEED = [
  {
    ref: "JV-2026-0148",
    title: "دفعة صفقة IN-0142",
    sub: "شركة آفاق للتقنية",
    date: "2026-10-20",
    source: "دفعة (آلي)",
    auto: true,
    status: "posted",
    lines: [L(1102, 180000, 0), L(4101, 0, 156522), L(2200, 0, 23478)],
  },
  {
    ref: "JV-2026-0147",
    title: "فاتورة مشتريات BILL-0312",
    sub: "شركة الإعلانات الرقمية",
    date: "2026-10-19",
    source: "مشتريات (آلي)",
    auto: true,
    status: "posted",
    lines: [L(5301, 27826, 0), L(1401, 4174, 0), L(2101, 0, 32000)],
  },
  {
    ref: "JV-2026-0146",
    title: "رسوم خدمات مصرفية",
    sub: "مطابقة كشف الراجحي",
    date: "2026-10-18",
    source: "بنكية",
    auto: false,
    status: "draft",
    lines: [L(5601, 350, 0), L(1102, 0, 350)],
  },
  {
    ref: "JV-2026-0145",
    title: "قيد تسوية — استهلاك أصول ثابتة",
    sub: "إهلاك شهري",
    date: "2026-10-15",
    source: "يدوي",
    auto: false,
    status: "posted",
    lines: [L(5401, 4200, 0), L(1190, 0, 4200)],
  },
  {
    ref: "JV-2026-0144",
    title: "رواتب شهر سبتمبر",
    sub: "قسم الرواتب",
    date: "2026-10-12",
    source: "رواتب (آلي)",
    auto: true,
    status: "posted",
    lines: [L(5101, 48000, 0), L(1102, 0, 48000)],
  },
  {
    ref: "JV-2026-0143",
    title: "عكس القيد JV-2026-0139",
    sub: "تصحيح خطأ تصنيف",
    date: "2026-10-10",
    source: "يدوي",
    auto: false,
    status: "reversed",
    lines: [L(5501, 2150, 0), L(1102, 0, 2150)],
  },
  {
    ref: "JV-2026-0142",
    title: "فاتورة مشتريات BILL-0301",
    sub: "مورد المخزون الأول",
    date: "2026-09-28",
    source: "مشتريات (آلي)",
    auto: true,
    status: "posted",
    lines: [L(5501, 60000, 0), L(2101, 0, 60000)],
  },
  {
    ref: "JV-2026-0141",
    title: "رواتب شهر أغسطس",
    sub: "قسم الرواتب",
    date: "2026-09-27",
    source: "رواتب (آلي)",
    auto: true,
    status: "posted",
    lines: [L(5101, 46000, 0), L(1102, 0, 46000)],
  },
  {
    ref: "JV-2026-0140",
    title: "مصروفات تسويق مؤجلة",
    sub: "قيد قيد المراجعة",
    date: "2026-09-26",
    source: "يدوي",
    auto: false,
    status: "draft",
    lines: [L(5301, 12000, 0), L(2101, 0, 12000)],
  },
];
const ST = {
  posted: ["مرحّل", "green"],
  draft: ["مسودة", "orange"],
  reversed: ["معكوس", "gray"],
};
const dr = (e) => e.lines.reduce((s, l) => s + l.debit, 0);
const cr = (e) => e.lines.reduce((s, l) => s + l.credit, 0);
const EMPTY = {
  title: "",
  date: today(),
  debit: "5501",
  credit: "1102",
  amount: "",
  source: "يدوي",
};

export default function JournalEntries() {
  const [rows, setRows] = useState(SEED);
  const [q, setQ] = useState("");
  const [month, setMonth] = useState("2026-10");
  const [src, setSrc] = useState("all");
  const [chip, setChip] = useState("all");
  const [sel, setSel] = useState("JV-2026-0148");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [toast, showToast] = useToast();

  const period = useMemo(
    () =>
      rows
        .filter((r) => inMonth(r.date, month))
        .sort((a, b) => b.ref.localeCompare(a.ref)),
    [rows, month],
  );
  const totalD = period.reduce((s, e) => s + dr(e), 0),
    totalC = period.reduce((s, e) => s + cr(e), 0);
  const drafts = period.filter((e) => e.status === "draft");
  const cnt = {
    all: period.length,
    posted: period.filter((e) => e.status === "posted").length,
    draft: drafts.length,
    reversed: period.filter((e) => e.status === "reversed").length,
    auto: period.filter((e) => e.auto).length,
  };
  const filtered = useMemo(
    () =>
      period.filter(
        (e) =>
          (chip === "all" || (chip === "auto" ? e.auto : e.status === chip)) &&
          (src === "all" || (src === "auto" ? e.auto : !e.auto)) &&
          (!q ||
            `${e.ref} ${e.title} ${e.sub}`
              .toLowerCase()
              .includes(q.toLowerCase())),
      ),
    [period, chip, src, q],
  );
  const pg = usePaged(filtered, 8);
  const entry = rows.find((e) => e.ref === sel) || filtered[0];

  const patch = (ref, p) =>
    setRows(rows.map((e) => (e.ref === ref ? { ...e, ...p } : e)));
  const open = (title = "") => {
    setForm({ ...EMPTY, title });
    setModal(true);
  };
  const add = () => {
    const amount = Number(form.amount);
    if (!form.title.trim() || !(amount > 0))
      return showToast("أدخل البيان ومبلغاً صحيحاً");
    if (form.debit === form.credit)
      return showToast("يجب أن يختلف الحساب المدين عن الدائن");
    const ref = nextId(
      "JV-2026-",
      rows.map((r) => r.ref),
    );
    setRows([
      {
        ref,
        title: form.title,
        sub: "قيد يدوي",
        date: form.date,
        source: form.source,
        auto: false,
        status: "draft",
        lines: [L(+form.debit, amount, 0), L(+form.credit, 0, amount)],
      },
      ...rows,
    ]);
    setSel(ref);
    setModal(false);
    showToast(`تم إنشاء المسودة ${ref}`);
  };
  const exportCsv = () =>
    downloadCsv(
      "journal-entries.csv",
      [
        "رقم القيد",
        "التاريخ",
        "البيان",
        "المصدر",
        "المدين",
        "الدائن",
        "الحالة",
      ],
      filtered.map((e) => [
        e.ref,
        e.date,
        e.title,
        e.source,
        dr(e),
        cr(e),
        ST[e.status][0],
      ]),
    );

  const columns = [
    {
      key: "title",
      label: "البيان",
      render: (e) => (
        <div>
          <div className="font-semibold">{e.title}</div>
          <div className="mt-0.5 text-[10.5px] text-neutral-500">{e.sub}</div>
        </div>
      ),
    },
    { key: "ref", label: "رقم القيد", render: (e) => <Ltr>{e.ref}</Ltr> },
    {
      key: "date",
      label: "التاريخ",
      render: (e) => (
        <span className="text-neutral-500">{fmtDate(e.date)}</span>
      ),
    },
    { key: "source", label: "المصدر" },
    { key: "d", label: "المدين", render: (e) => <Ltr>{sar(dr(e))}</Ltr> },
    { key: "c", label: "الدائن", render: (e) => <Ltr>{sar(cr(e))}</Ltr> },
    {
      key: "st",
      label: "الحالة",
      render: (e) => <Badge tone={ST[e.status][1]}>{ST[e.status][0]}</Badge>,
    },
    {
      key: "act",
      label: "",
      render: (e) => (
        <RowMenu
          items={[
            { label: "معاينة", onClick: () => setSel(e.ref) },
            ...(e.status === "draft"
              ? [
                  {
                    label: "ترحيل القيد",
                    onClick: () => {
                      patch(e.ref, { status: "posted" });
                      showToast(`تم ترحيل ${e.ref}`);
                    },
                  },
                  {
                    label: "حذف",
                    danger: true,
                    onClick: () => {
                      setRows(rows.filter((x) => x.ref !== e.ref));
                      showToast("تم حذف المسودة");
                    },
                  },
                ]
              : []),
            ...(e.status === "posted"
              ? [
                  {
                    label: "عكس القيد",
                    onClick: () => {
                      patch(e.ref, { status: "reversed" });
                      showToast(`تم عكس ${e.ref}`);
                    },
                  },
                ]
              : []),
          ]}
        />
      ),
    },
  ];

  return (
    <div dir="rtl" className="space-y-4">
      <PageHeader
        title="القيود المحاسبية"
        subtitle="سجل القيود اليومية الآلية واليدوية مع ضمان توازن المدين والدائن قبل الترحيل"
      >
        <button className={btnLight} onClick={() => open("قيد تسوية — ")}>
          <Plus size={13} /> قيد تسوية
        </button>
        <button className={btnDark} onClick={() => open()}>
          <Plus size={13} /> قيد جديد
        </button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBox
          className="min-w-[220px] flex-1"
          value={q}
          onChange={setQ}
          placeholder="ابحث برقم القيد أو البيان"
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
        <div className="w-[130px]">
          <Select value={src} onChange={setSrc}>
            <option value="all">كل المصادر</option>
            <option value="auto">آلي</option>
            <option value="manual">يدوي</option>
          </Select>
        </div>
        <button className={btnLight} onClick={exportCsv}>
          تصدير البيانات
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          tag="هذا الشهر"
          value={`${num(period.length)} قيد`}
          label="إجمالي القيود"
        />
        <KpiCard tag="المدين" value={sar(totalD)} label="إجمالي المدين" />
        <KpiCard
          tag={totalD === totalC ? "متوازن" : "غير متوازن"}
          value={sar(totalC)}
          label="إجمالي الدائن"
        />
        <KpiCard
          tag="معلق"
          value={`${num(drafts.length)} قيود`}
          label="بانتظار الترحيل"
        />
      </div>

      <div className={card}>
        <div className="flex flex-wrap justify-end gap-2 p-4">
          {[
            ["all", "الكل"],
            ["posted", "مرحّل"],
            ["draft", "مسودة"],
            ["reversed", "معكوس"],
            ["auto", "آلي من النظام"],
          ].map(([k, l]) => (
            <Chip key={k} active={chip === k} onClick={() => setChip(k)}>
              {l} {cnt[k]}
            </Chip>
          ))}
        </div>
        <DataTable
          columns={columns}
          rows={pg.slice}
          rowKey={(e) => e.ref}
          onRowClick={(e) => setSel(e.ref)}
          selectedKey={entry?.ref}
          minWidth={900}
        />
        <Pager pg={pg} />
      </div>

      {entry && (
        <div className={card}>
          <SectionHead
            title={`معاينة القيد ${entry.ref}`}
            sub={`${fmtDate(entry.date)} · المصدر: ${entry.title}`}
          >
            <Badge tone={dr(entry) === cr(entry) ? "green" : "red"}>
              {dr(entry) === cr(entry) ? "متوازن" : "غير متوازن"}
            </Badge>
          </SectionHead>
          <DataTable
            minWidth={520}
            rows={entry.lines}
            rowKey={(l) => l.code}
            columns={[
              {
                key: "code",
                label: "الرقم",
                render: (l) => <Ltr>{l.code}</Ltr>,
              },
              { key: "name", label: "الحساب" },
              {
                key: "debit",
                label: "مدين",
                render: (l) => (l.debit ? <Ltr>{num(l.debit)}</Ltr> : "—"),
              },
              {
                key: "credit",
                label: "دائن",
                render: (l) => (l.credit ? <Ltr>{num(l.credit)}</Ltr> : "—"),
              },
            ]}
          />
          <div className="grid grid-cols-4 border-t border-line bg-[#F7F7F8] px-3 py-3 text-[11px] font-semibold">
            <span />
            <span>الإجمالي</span>
            <span dir="ltr" className="text-right">
              {num(dr(entry))}
            </span>
            <span dir="ltr" className="text-right">
              {num(cr(entry))}
            </span>
          </div>
        </div>
      )}

      {modal && (
        <Modal
          title="قيد محاسبي جديد"
          onClose={() => setModal(false)}
          onSubmit={add}
          submitLabel="حفظ كمسودة"
        >
          <Field label="البيان" full>
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
          <Field label="الحساب المدين">
            <select
              className={inputCls}
              value={form.debit}
              onChange={(e) => setForm({ ...form, debit: e.target.value })}
            >
              {Object.entries(COA).map(([c, n]) => (
                <option key={c} value={c}>
                  {c} · {n}
                </option>
              ))}
            </select>
          </Field>
          <Field label="الحساب الدائن">
            <select
              className={inputCls}
              value={form.credit}
              onChange={(e) => setForm({ ...form, credit: e.target.value })}
            >
              {Object.entries(COA).map(([c, n]) => (
                <option key={c} value={c}>
                  {c} · {n}
                </option>
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
          <Field label="التاريخ">
            <input
              type="date"
              className={inputCls}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </Field>
        </Modal>
      )}
      {toast}
    </div>
  );
}
