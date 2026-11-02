import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  PageHeader,
  SearchBox,
  Select,
  downloadCsv,
  btnDark,
  btnLight,
  card,
  KpiCard,
  SectionHead,
  DataTable,
  Modal,
  Field,
  inputCls,
  useToast,
  sar,
  num,
  fmtDate,
  today,
} from "./Accountingui.jsx;";

const MONTHS = ["مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر"];
const REV = [1257000, 1470000, 1285000, 1610000, 1723000, 1846300];
const EXP = [986000, 972000, 962000, 996000, 1074000, 1052600];
const REV_SHARE = [
  ["إيرادات الصفقات", 1420000],
  ["إيرادات الخدمات والعمولات", 426300],
];
const EXP_SHARE = [
  ["رواتب وأجور", 480000],
  ["تسويق وإعلانات", 214500],
  ["إيجارات", 120000],
  ["مشتريات وتشغيل", 168100],
  ["مصروفات إدارية وبنكية", 70000],
];
const TABS = [
  ["income", "قائمة الدخل"],
  ["balance", "الميزانية العمومية"],
  ["cash", "التدفقات النقدية"],
  ["trial", "ميزان المراجعة"],
  ["stmt", "كشف حساب"],
  ["tax", "تقرير الضريبة"],
];
const REPORTS0 = [
  {
    name: "قائمة الدخل الشهرية",
    sub: "ملخص الإيرادات والمصروفات",
    fmt: "PDF",
    date: "2026-10-01",
    sched: "شهرياً · أول الشهر",
  },
  {
    name: "ميزان المراجعة",
    sub: "أرصدة كل الحسابات",
    fmt: "Excel",
    date: "2026-10-18",
    sched: "أسبوعياً · الأحد",
  },
  {
    name: "إقرار ضريبة القيمة المضافة",
    sub: "الضريبة المحصلة والمدخلة",
    fmt: "PDF",
    date: "2026-09-30",
    sched: "ربع سنوي",
  },
  {
    name: "أعمار الذمم المدينة",
    sub: "متأخرات العملاء حسب الفترة",
    fmt: "Excel",
    date: "2026-10-15",
    sched: "يدوي",
  },
];

// split a total across the October proportions, last item absorbs rounding so sections always add up
const split = (shares, total) => {
  const base = shares.reduce((s, [, v]) => s + v, 0);
  let used = 0;
  return shares.map(([l, v], i) => {
    const x =
      i === shares.length - 1 ? total - used : Math.round((v / base) * total);
    used += x;
    return [l, x];
  });
};
const m = (n) => (n < 0 ? "−" : "") + num(Math.abs(n));

function statement(tab, i, basis) {
  const rev = REV[i],
    exp = EXP[i];
  if (tab === "income") {
    return {
      sections: [
        {
          title: "الإيرادات",
          rows: split(REV_SHARE, rev),
          total: ["إجمالي الإيرادات", rev],
        },
        {
          title: "المصروفات",
          rows: split(EXP_SHARE, exp),
          total: ["إجمالي المصروفات", exp],
        },
      ],
      final: ["صافي الربح", rev - exp],
    };
  }
  if (tab === "balance")
    return {
      sections: [
        {
          title: "الأصول",
          rows: [
            ["النقد والبنوك", 5060000],
            ["ذمم مدينة", 382200],
            ["أصول ثابتة", 940000],
          ],
          total: ["إجمالي الأصول", 6382200],
        },
        {
          title: "الالتزامات",
          rows: [
            ["ذمم دائنة", 87400],
            ["ضريبة مستحقة", 120800],
          ],
          total: ["إجمالي الالتزامات", 208200],
        },
      ],
      final: ["حقوق الملكية", 6174000],
    };
  if (tab === "cash")
    return {
      sections: [
        {
          title: "التشغيل",
          rows: [
            ["متحصلات العملاء", 1560000],
            ["مدفوعات الموردين", -612000],
            ["رواتب", -480000],
          ],
          total: ["صافي التشغيل", 468000],
        },
        {
          title: "الاستثمار",
          rows: [["شراء أصول", -75000]],
          total: ["صافي الاستثمار", -75000],
        },
      ],
      final: ["صافي التغير النقدي", 393000],
    };
  if (tab === "trial")
    return {
      sections: [
        {
          title: "المدين",
          rows: [
            ["الأصول", 6382200],
            ["المصروفات", 1052600],
          ],
          total: ["إجمالي المدين", 7434800],
        },
        {
          title: "الدائن",
          rows: [
            ["الالتزامات", 208200],
            ["الإيرادات", 1846300],
            ["حقوق الملكية", 5380300],
          ],
          total: ["إجمالي الدائن", 7434800],
        },
      ],
      final: ["الفرق", 0],
    };
  if (tab === "stmt")
    return {
      sections: [
        {
          title: "1102 · مصرف الراجحي",
          rows: [
            ["رصيد أول الفترة", 2302000],
            ["إيداعات", 180000],
            ["سحوبات", -32000],
          ],
          total: ["حركة الفترة", 148000],
        },
      ],
      final: ["الرصيد الختامي", 2450000],
    };
  const out = Math.round((rev * 15) / 115),
    inp = Math.round((exp * 15) / 115);
  return {
    sections: [
      {
        title: "ضريبة القيمة المضافة 15%",
        rows: [
          ["ضريبة المخرجات (المحصلة)", out],
          ["ضريبة المدخلات (المسترد)", inp],
        ],
        total: ["الأساس", basis === "cash" ? 0 : 1],
      },
    ],
    final: ["الصافي المستحق", out - inp],
    hideTotals: true,
  };
}

export default function FinancialReports() {
  const [tab, setTab] = useState("income");
  const [pi, setPi] = useState(5);
  const [basis, setBasis] = useState("accrual");
  const [cmp, setCmp] = useState("on");
  const [q, setQ] = useState("");
  const [sched, setSched] = useState("all");
  const [reports, setReports] = useState(REPORTS0);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", fmt: "PDF", sched: "يدوي" });
  const [toast, showToast] = useToast();

  const rev = REV[pi],
    exp = EXP[pi],
    net = rev - exp;
  const margin = Math.round((net / rev) * 100);
  const delta = (a, b) => {
    const d = ((a - b) / b) * 100;
    return `${d >= 0 ? "▲" : "▼"} ${Math.abs(d).toFixed(1)}%`;
  };
  const prev = pi > 0 ? pi - 1 : null;
  const dSub = (cur, p, goodUp = true) =>
    cmp === "on" && prev !== null
      ? {
          sub: `${delta(cur, p)} عن ${MONTHS[prev]}`,
          subTone: cur >= p === goodUp ? "green" : "red",
        }
      : {};
  const period = `${MONTHS[pi]} 2026`;
  const st = useMemo(() => statement(tab, pi, basis), [tab, pi, basis]);
  const max = Math.max(...REV, ...EXP);

  const csvRows = st.sections
    .flatMap((s) => [
      [s.title, ""],
      ...s.rows,
      ...(st.hideTotals ? [] : [s.total]),
    ])
    .concat([st.final]);
  const exportStatement = () =>
    downloadCsv(`${tab}-${MONTHS[pi]}.csv`, ["البند", "القيمة"], csvRows);
  const shown = reports.filter(
    (r) =>
      (sched === "all" || r.sched.startsWith(sched)) &&
      (!q || `${r.name} ${r.sub}`.includes(q)),
  );

  const addReport = () => {
    if (!form.name.trim()) return showToast("أدخل اسم التقرير");
    setReports([
      {
        name: form.name,
        sub: "تقرير مخصص",
        fmt: form.fmt,
        date: today(),
        sched: form.sched,
      },
      ...reports,
    ]);
    setModal(false);
    showToast("تمت جدولة التقرير");
  };

  return (
    <div dir="rtl" className="space-y-4">
      <PageHeader
        title="التقارير المالية"
        subtitle="قوائم مالية جاهزة للمراجعة والتصدير مع مقارنة بالفترات السابقة"
      >
        <button
          className={btnLight}
          onClick={() => {
            setForm({ name: "", fmt: "PDF", sched: "يدوي" });
            setModal(true);
          }}
        >
          جدولة تقرير <Plus size={13} />
        </button>
        <button className={btnDark} onClick={exportStatement}>
          تصدير التقرير
        </button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBox
          className="min-w-[220px] flex-1"
          value={q}
          onChange={setQ}
          placeholder="ابحث عن تقرير أو حساب"
        />
        <div className="w-[130px]">
          <Select value={String(pi)} onChange={(v) => setPi(Number(v))}>
            {MONTHS.map((n, i) => (
              <option key={n} value={i}>
                {n} 2026
              </option>
            ))}
          </Select>
        </div>
        <div className="w-[140px]">
          <Select value={basis} onChange={setBasis}>
            <option value="accrual">الأساس: استحقاق</option>
            <option value="cash">الأساس: نقدي</option>
          </Select>
        </div>
        <div className="w-[190px]">
          <Select value={cmp} onChange={setCmp}>
            <option value="on">مقارنة بالفترة السابقة</option>
            <option value="off">بدون مقارنة</option>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`h-8 rounded-full border px-4 text-[11px] font-semibold transition-colors ${tab === k ? "border-ink bg-ink text-white" : "border-line bg-white text-ink hover:bg-neutral-50"}`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          tag={period}
          value={sar(rev)}
          label="إجمالي الإيرادات"
          {...dSub(rev, REV[pi - 1])}
        />
        <KpiCard
          tag={period}
          value={sar(exp)}
          label="إجمالي المصروفات"
          {...dSub(exp, EXP[pi - 1], false)}
        />
        <KpiCard
          tag="صافي"
          value={sar(net)}
          label="صافي الربح"
          {...dSub(net, REV[pi - 1] - EXP[pi - 1])}
        />
        <KpiCard tag="الهامش" value={`${margin}%`} label="هامش صافي الربح" />
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className={card}>
          <SectionHead
            title="الإيرادات مقابل المصروفات"
            sub="آخر 6 أشهر · بآلاف الريالات"
          >
            <span className="flex items-center gap-3 text-[10px] text-neutral-500">
              <span className="flex items-center gap-1">
                <i className="h-2 w-2 rounded-full bg-ink" />
                الإيرادات
              </span>
              <span className="flex items-center gap-1">
                <i className="h-2 w-2 rounded-sm bg-neutral-300" />
                المصروفات
              </span>
            </span>
          </SectionHead>
          <div className="flex h-[240px] items-end gap-3 border-b border-line px-6 pb-0 pt-8">
            {MONTHS.map((n, i) => (
              <div
                key={n}
                className="flex h-full flex-1 items-end justify-center gap-1.5"
              >
                {[
                  [REV[i], "bg-ink"],
                  [EXP[i], "bg-neutral-300"],
                ].map(([v, c], j) => (
                  <div
                    key={j}
                    className="flex h-full w-full max-w-[26px] flex-col items-center justify-end"
                  >
                    <span className="mb-1 text-[9px] text-neutral-500">
                      {num(Math.round(v / 1000))}
                    </span>
                    <div
                      className={`w-full rounded-t ${c} ${i === pi ? "" : "opacity-80"}`}
                      style={{ height: `${(v / max) * 85}%` }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="flex gap-3 px-6 py-2">
            {MONTHS.map((n, i) => (
              <span
                key={n}
                className={`flex-1 text-center text-[10px] ${i === pi ? "font-semibold text-ink" : "text-neutral-500"}`}
              >
                {n}
              </span>
            ))}
          </div>
        </div>

        <div className={`${card} self-start overflow-hidden`}>
          <SectionHead
            title={TABS.find(([k]) => k === tab)[1]}
            sub={`${period} · ${basis === "cash" ? "الأساس النقدي" : "أساس الاستحقاق"}`}
          />
          {st.sections.map((s) => (
            <div key={s.title}>
              <div className="border-y border-line bg-[#F7F7F8] px-4 py-2 text-[11px] font-semibold text-ink">
                {s.title}
              </div>
              {s.rows.map(([l, v]) => (
                <div
                  key={l}
                  className="flex justify-between border-b border-line px-4 py-2.5 text-[11px]"
                >
                  <span className="text-neutral-600">{l}</span>
                  <span dir="ltr" className="font-semibold">
                    {m(v)}
                  </span>
                </div>
              ))}
              {!st.hideTotals && (
                <div className="flex justify-between border-b border-line px-4 py-2.5 text-[11px] font-semibold">
                  <span>{s.total[0]}</span>
                  <span dir="ltr">{m(s.total[1])}</span>
                </div>
              )}
            </div>
          ))}
          <div className="flex justify-between bg-ink px-4 py-3 text-[11.5px] font-semibold text-white">
            <span>{st.final[0]}</span>
            <span dir="ltr">{m(st.final[1])}</span>
          </div>
        </div>
      </div>

      <div className={card}>
        <SectionHead
          title="التقارير المحفوظة والمجدولة"
          sub="تقارير تصدر تلقائياً وتُرسل للمحاسبين والإدارة"
        >
          <div className="w-[130px]">
            <Select value={sched} onChange={setSched}>
              <option value="all">كل الجداول</option>
              <option>شهرياً</option>
              <option>أسبوعياً</option>
              <option>ربع</option>
              <option>يدوي</option>
            </Select>
          </div>
        </SectionHead>
        <DataTable
          minWidth={640}
          rows={shown}
          rowKey={(r) => r.name}
          columns={[
            {
              key: "name",
              label: "التقرير",
              render: (r) => (
                <div>
                  <div className="font-semibold">{r.name}</div>
                  <div className="mt-0.5 text-[10.5px] text-neutral-500">
                    {r.sub}
                  </div>
                </div>
              ),
            },
            { key: "fmt", label: "الصيغة" },
            {
              key: "date",
              label: "آخر إصدار",
              render: (r) => (
                <span className="text-neutral-500">{fmtDate(r.date)}</span>
              ),
            },
            {
              key: "sched",
              label: "الجدولة",
              render: (r) => (
                <span className="text-neutral-500">{r.sched}</span>
              ),
            },
            {
              key: "dl",
              label: "",
              render: (r) => (
                <button
                  className={`${btnLight} h-7`}
                  onClick={() => {
                    downloadCsv(`${r.name}.csv`, ["البند", "القيمة"], csvRows);
                    showToast("تم تنزيل نسخة CSV (عرض تجريبي)");
                  }}
                >
                  تحميل
                </button>
              ),
            },
          ]}
        />
      </div>

      {modal && (
        <Modal
          title="جدولة تقرير"
          onClose={() => setModal(false)}
          onSubmit={addReport}
          submitLabel="جدولة"
        >
          <Field label="اسم التقرير" full>
            <input
              className={inputCls}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="الصيغة">
            <select
              className={inputCls}
              value={form.fmt}
              onChange={(e) => setForm({ ...form, fmt: e.target.value })}
            >
              <option>PDF</option>
              <option>Excel</option>
            </select>
          </Field>
          <Field label="الجدولة">
            <select
              className={inputCls}
              value={form.sched}
              onChange={(e) => setForm({ ...form, sched: e.target.value })}
            >
              <option>شهرياً</option>
              <option>أسبوعياً</option>
              <option>ربع سنوي</option>
              <option>يدوي</option>
            </select>
          </Field>
        </Modal>
      )}
      {toast}
    </div>
  );
}
