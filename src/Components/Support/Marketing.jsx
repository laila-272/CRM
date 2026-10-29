import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Download,
  Megaphone,
  Plus,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import {
  PageHeader,
  SearchBox,
  Select,
  Chip,
  StatCard,
  PagerBar,
  downloadCsv,
  card,
  btnDark,
  btnLight,
  th,
  td,
} from "../Shared/ui.jsx";
import { Toast, useToast } from "../CRMPages/TaskModal.jsx";
import { MONTHS, addDays, todayIso } from "../../data/Tasks.js";

/* ---------- demo data (same campaigns as the reference + filler rows so paging works) ---------- */
const KIND = {
  إنستقرام: "إعلانات مدفوعة",
  فيسبوك: "إعلانات اجتماعية",
  جوجل: "بحث مدفوع",
  واتساب: "رسائل مباشرة",
  "البريد الإلكتروني": "بريد إلكتروني",
  فعاليات: "فعاليات",
  "لينك إن": "إعلانات مهنية",
  يوتيوب: "فيديو",
  "تيك توك": "إعلانات اجتماعية",
};
const CHANNELS = Object.keys(KIND);
const STATUSES = ["نشطة", "مجدولة", "منتهية", "متوقفة"];
const STATUS_CLS = {
  نشطة: "bg-green-50 text-green-600 rounded-xl ",
  مجدولة: "bg-orange-50 text-orange-600  rounded-xl",
  منتهية: "bg-neutral-100 text-neutral-500  rounded-xl",
  متوقفة: "bg-red-50 text-red-500  rounded-xl",
};
const OWNERS = ["سارة طارق", "فهد القحطاني", "ريم السالم", "أحمد سمير"];
const ATTENTION_CPL = 500; // campaigns whose cost per lead is above this need attention
const PAGE_SIZE = 7;
const STORE_KEY = "crm.marketing.campaigns.v1"; // only campaigns added by the user are stored

const SORTS = {
  recent: ["الأحدث", (a, b) => b.start.localeCompare(a.start)],
  budget: ["الميزانية", (a, b) => b.budget - a.budget],
  leads: ["العملاء المحتملون", (a, b) => (b.leads ?? -1) - (a.leads ?? -1)],
  conversion: [
    "التحويل",
    (a, b) => (b.conversion ?? -1) - (a.conversion ?? -1),
  ],
};

const CHANNEL_PERFORMANCE = [
  ["واتساب", 96],
  ["إنستقرام", 84],
  ["جوجل", 62],
  ["فيسبوك", 48],
  ["البريد الإلكتروني", 22],
];

const pad = (n) => String(n).padStart(2, "0");
const c = (
  id,
  name,
  channel,
  status,
  budget,
  leads,
  cpl,
  conversion,
  start,
  end,
  owner,
) => ({
  id,
  name,
  channel,
  status,
  budget,
  leads,
  cpl,
  conversion,
  start,
  end,
  owner,
});

const BASE = (() => {
  const rows = [
    c(
      "c1",
      "إطلاق مشروع النور",
      "إنستقرام",
      "نشطة",
      95000,
      94,
      412,
      9.1,
      "2026-10-20",
      "2026-10-30",
      OWNERS[0],
    ),
    c(
      "c2",
      "عروض حدائق المعاصمة",
      "فيسبوك",
      "نشطة",
      60000,
      71,
      506,
      7.8,
      "2026-10-01",
      "2026-10-28",
      OWNERS[1],
    ),
    c(
      "c3",
      "بحث جوجل - وحدات سكنية",
      "جوجل",
      "نشطة",
      70000,
      88,
      648,
      6.8,
      "2026-10-15",
      "2026-10-31",
      OWNERS[2],
    ),
    c(
      "c4",
      "رسائل واتساب للعملاء القدامى",
      "واتساب",
      "نشطة",
      12000,
      42,
      118,
      14.3,
      "2026-10-10",
      "2026-10-25",
      OWNERS[3],
    ),
    c(
      "c5",
      "النشرة البريدية - أكتوبر",
      "البريد الإلكتروني",
      "منتهية",
      8500,
      23,
      210,
      8.7,
      "2026-10-01",
      "2026-10-14",
      OWNERS[0],
    ),
    c(
      "c6",
      "المعرض العقاري السنوي",
      "فعاليات",
      "مجدولة",
      120000,
      null,
      null,
      null,
      "2026-11-12",
      "2026-11-12",
      OWNERS[1],
    ),
    c(
      "c7",
      "إعلانات لينكدإن للمستثمرين",
      "لينك إن",
      "متوقفة",
      45000,
      24,
      780,
      3.2,
      "2026-10-05",
      "2026-10-30",
      OWNERS[2],
    ),
  ];
  const names = [
    "حملة التقسيط المرن",
    "عرض الوحدات الجاهزة",
    "ويبينار الاستثمار العقاري",
    "إعلانات يوتيوب للمشروع",
    "رسائل SMS للعملاء المحتملين",
    "حملة الإحالات",
    "نشرة نوفمبر",
    "استهداف المقيمين بالخارج",
    "عرض نهاية العام",
    "إعلانات تيك توك",
    "بحث جوجل - المكاتب الإدارية",
    "حملة الوحدات التجارية",
    "رسائل واتساب - عروض الشتاء",
    "تسويق عبر المؤثرين",
    "حملة المقارنة العقارية",
    "إعلانات إنستقرام - الفيلات",
    "بريد المتابعة الأسبوعي",
    "مؤتمر المطورين",
    "حملة الشراكات",
    "استهداف الشركات",
    "إعلانات لينكدإن - الشركات",
  ];
  // 8 active, 8 scheduled, 3 ended, 2 paused -> totals become 12 / 9 / 4 / 3 with the rows above
  const plan = [
    "نشطة",
    "مجدولة",
    "نشطة",
    "مجدولة",
    "منتهية",
    "نشطة",
    "مجدولة",
    "متوقفة",
    "نشطة",
    "مجدولة",
    "نشطة",
    "منتهية",
    "مجدولة",
    "نشطة",
    "مجدولة",
    "نشطة",
    "مجدولة",
    "منتهية",
    "نشطة",
    "متوقفة",
    "مجدولة",
  ];
  names.forEach((name, i) => {
    const status = plan[i];
    const channel = CHANNELS[i % CHANNELS.length];
    const scheduled = status === "مجدولة";
    const start = scheduled
      ? `2026-11-${pad(1 + ((i * 2) % 25))}`
      : `2026-10-${pad(1 + ((i * 3) % 20))}`;
    rows.push(
      c(
        `c${8 + i}`,
        name,
        channel,
        status,
        10000 + ((i * 7919) % 90) * 1000,
        scheduled ? null : 15 + ((i * 13) % 80),
        scheduled ? null : 150 + ((i * 37) % 320),
        scheduled ? null : (30 + ((i * 17) % 110)) / 10,
        start,
        addDays(start, scheduled ? 10 : 7 + (i % 9)),
        OWNERS[i % 4],
      ),
    );
  });
  return rows;
})();

/* ---------- helpers ---------- */
const money = (n) => `${Number(n).toLocaleString("en-US")} ج.م`;
function rangeLabel(a, b) {
  const [, m1, d1] = a.split("-").map(Number);
  const [, m2, d2] = b.split("-").map(Number);
  if (a === b) return `${d1} ${MONTHS[m1 - 1]}`;
  return m1 === m2
    ? `${d1} – ${d2} ${MONTHS[m1 - 1]}`
    : `${d1} ${MONTHS[m1 - 1]} – ${d2} ${MONTHS[m2 - 1]}`;
}
const loadAdded = () => {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
  } catch {
    return [];
  }
};

const fieldCls = (err) =>
  `w-full h-9 rounded-lg border bg-white px-3 text-[12px] outline-none focus:border-neutral-500 placeholder:text-neutral-400 ${err ? "border-red-400" : "border-line"}`;

function CampaignModal({ onSave, onClose }) {
  const [f, setF] = useState({
    name: "",
    channel: CHANNELS[0],
    budget: "",
    start: todayIso(),
    end: addDays(todayIso(), 14),
    owner: OWNERS[0],
  });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => {
    setF({ ...f, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: undefined });
  };
  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (f.name.trim().length < 2) err.name = "اسم الحملة مطلوب";
    if (f.budget === "" || isNaN(Number(f.budget)) || Number(f.budget) < 0)
      err.budget = "أدخل ميزانية صحيحة";
    if (!f.start) err.start = "تاريخ البدء مطلوب";
    if (!f.end || f.end < f.start) err.end = "النهاية يجب أن تكون بعد البدء";
    setErrors(err);
    if (Object.keys(err).length) return;
    onSave({ ...f, name: f.name.trim(), budget: Number(f.budget) });
  };
  const Field = ({ label, error, children }) => (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold text-ink">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-[10px] text-red-500">{error}</span>
      )}
    </label>
  );
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/45 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <form
        dir="rtl"
        noValidate
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="mx-auto mt-10 w-full max-w-[460px] rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-ink">حملة جديدة</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="text-neutral-400 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>
        <div className="mt-4 space-y-3.5">
          <Field label="اسم الحملة *" error={errors.name}>
            <input
              className={fieldCls(errors.name)}
              value={f.name}
              onChange={set("name")}
              placeholder="مثال: إطلاق مشروع جديد"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="القناة">
              <select
                className={fieldCls()}
                value={f.channel}
                onChange={set("channel")}
              >
                {CHANNELS.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="المسؤول">
              <select
                className={fieldCls()}
                value={f.owner}
                onChange={set("owner")}
              >
                {OWNERS.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="الميزانية (ج.م) *" error={errors.budget}>
              <input
                type="number"
                min="0"
                dir="ltr"
                className={fieldCls(errors.budget)}
                value={f.budget}
                onChange={set("budget")}
              />
            </Field>
            <span />
            <Field label="تاريخ البدء *" error={errors.start}>
              <input
                type="date"
                dir="ltr"
                className={fieldCls(errors.start)}
                value={f.start}
                onChange={set("start")}
              />
            </Field>
            <Field label="تاريخ الانتهاء *" error={errors.end}>
              <input
                type="date"
                dir="ltr"
                className={fieldCls(errors.end)}
                value={f.end}
                onChange={set("end")}
              />
            </Field>
          </div>
        </div>
        <div className="mt-5 flex items-center gap-2 border-t border-line pt-4">
          <button
            type="submit"
            className={`${btnDark} !rounded-full !h-9 px-5`}
          >
            إضافة الحملة
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-2 text-[11.5px] text-neutral-500 hover:text-ink"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}

export default function Marketing() {
  const [added, setAdded] = useState(loadAdded);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [channel, setChannel] = useState("all");
  const [period, setPeriod] = useState("30");
  const [sort, setSort] = useState("recent");
  const [attention, setAttention] = useState(false);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [toast, notify] = useToast();

  const all = useMemo(() => [...added, ...BASE], [added]);
  const count = (s) => all.filter((x) => x.status === s).length;
  const attentionList = all.filter((x) => x.cpl && x.cpl > ATTENTION_CPL);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const since =
      period === "all" ? null : addDays(todayIso(), -Number(period));
    return all
      .filter(
        (x) =>
          (!attention || (x.cpl && x.cpl > ATTENTION_CPL)) &&
          (status === "all" || x.status === status) &&
          (channel === "all" || x.channel === channel) &&
          (!since || x.end >= since) &&
          (!s ||
            [x.name, x.channel, x.owner].some((v) =>
              v.toLowerCase().includes(s),
            )),
      )
      .sort(SORTS[sort][1]);
  }, [all, q, status, channel, period, sort, attention]);

  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const rows = list.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const from = list.length ? (cur - 1) * PAGE_SIZE + 1 : 0;
  const maxLeads = Math.max(...CHANNEL_PERFORMANCE.map((x) => x[1]));

  // any manual filter change clears the "attention" shortcut
  const f = (fn) => (v) => {
    fn(v);
    setAttention(false);
    setPage(1);
  };

  const showAttention = () => {
    setAttention(true);
    setStatus("all");
    setPage(1);
    document
      .getElementById("campaigns-table")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const addCampaign = (x) => {
    const next = [
      {
        ...x,
        id: `u${Date.now()}`,
        status: x.start > todayIso() ? "مجدولة" : "نشطة",
        leads: null,
        cpl: null,
        conversion: null,
      },
      ...added,
    ];
    setAdded(next);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setModal(false);
    setPage(1);
    notify("تمت إضافة الحملة");
  };

  return (
    <div dir="rtl" className="max-w-full">
      <PageHeader
        title="التسويق"
        subtitle="أدر حملاتك التسويقية وتابع أداء القنوات وجودة العملاء المحتملين القادمين منها في مكان واحد."
      >
        <button onClick={() => setModal(true)} className={btnDark}>
          <Plus size={13} /> حملة جديدة
        </button>
        <button
          onClick={() =>
            downloadCsv(
              "marketing-report.csv",
              [
                "الحملة",
                "القناة",
                "الحالة",
                "الميزانية",
                "العملاء المحتملون",
                "تكلفة العميل",
                "التحويل %",
                "البدء",
                "الانتهاء",
              ],
              list.map((x) => [
                x.name,
                x.channel,
                x.status,
                x.budget,
                x.leads ?? "",
                x.cpl ?? "",
                x.conversion ?? "",
                x.start,
                x.end,
              ]),
            )
          }
          className={`${btnLight} !rounded-md`}
        >
          <Download size={12} /> تصدير تقرير التسويق
        </button>
      </PageHeader>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SearchBox
          value={q}
          onChange={f(setQ)}
          placeholder="ابحث باسم الحملة أو القناة أو المسؤول"
          className="min-w-[240px] flex-1"
        />
        <div className="w-[130px]">
          <Select value={status} onChange={f(setStatus)}>
            <option value="all">كل الحالات</option>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </div>
        <div className="w-[130px]">
          <Select value={channel} onChange={f(setChannel)}>
            <option value="all">كل القنوات</option>
            {CHANNELS.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </Select>
        </div>
        <div className="w-[130px]">
          <Select value={period} onChange={f(setPeriod)}>
            <option value="30">آخر 30 يومًا</option>
            <option value="90">آخر 90 يومًا</option>
            <option value="all">كل الفترات</option>
          </Select>
        </div>
        <div className="w-[120px]">
          <Select value={sort} onChange={f(setSort)}>
            {Object.entries(SORTS).map(([k, [label]]) => (
              <option key={k} value={k}>
                {k === "recent" ? "ترتيب" : label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Megaphone}
          tag="+3 هذا الشهر"
          value={count("نشطة")}
          label="حملات نشطة الآن"
        />
        <StatCard
          icon={Users}
          tag="+18% عن الشهر السابق "
          value="312"
          label="عملاء محتملون من الحملات"
        />
        <StatCard
          icon={Wallet}
          tag="−12% عن الشهر السابق"
          value="438 ج.م"
          label="متوسط تكلفة العميل المحتمل"
        />
        <StatCard
          icon={TrendingUp}
          tag="+0.8  نقطة"
          value="7.4%"
          label="معدل تحويل العملاء المحتملين إلى صفقات"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <Chip
          active={status === "all" && !attention}
          onClick={() => f(setStatus)("all")}
        >
          الكل ({all.length} حملة)
        </Chip>
        {STATUSES.map((s) => (
          <Chip
            key={s}
            active={status === s && !attention}
            onClick={() => f(setStatus)(s)}
          >
            {s} {count(s)}
          </Chip>
        ))}
      </div>

      <section
        id="campaigns-table"
        className={`${card} mt-3 overflow-hidden scroll-mt-4`}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead className="border-b border-line bg-neutral-50/70">
              <tr>
                {[
                  "الحملة",
                  "الجهه",
                  "الحالة",
                  "الميزانية",
                  "العملاء المحتملون",
                  "تكلفة العميل",
                  "التحويل",
                ].map((h) => (
                  <th key={h} className={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((x) => (
                <tr
                  key={x.id}
                  className="border-b border-line last:border-0 hover:bg-neutral-50/60"
                >
                  <td className={`${td} !py-3.5`}>
                    <div className="text-[12px] font-bold">{x.name}</div>
                    <div className="mt-0.5 text-[10px] text-neutral-400">
                      {KIND[x.channel]} · {rangeLabel(x.start, x.end)}
                    </div>
                  </td>
                  <td className={td}>{x.channel}</td>
                  <td className={td}>
                    <span
                      className={`rounded-md px-2.5 py-1 text-[10px] font-semibold ${STATUS_CLS[x.status]}`}
                    >
                      {x.status}
                    </span>
                  </td>
                  <td className={td}>{money(x.budget)}</td>
                  <td className={td}>{x.leads ?? "—"}</td>
                  <td className={td}>{x.cpl ? money(x.cpl) : "—"}</td>
                  <td className={td}>
                    {x.conversion != null ? `${x.conversion}%` : "—"}
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-[11px] text-neutral-400"
                  >
                    لا توجد حملات مطابقة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PagerBar
          page={cur}
          pages={pages}
          onPage={setPage}
          info={`عرض ${from}–${from ? from + rows.length - 1 : 0} من ${list.length} حملة`}
        />
      </section>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className={`${card} p-5 `}>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[16px] font-semibold text-ink">
              حملات تحتاج اهتمامك
            </h2>
            <span className="rounded-md bg-orange-50 px-2 py-0.5 text-[10px] text-orange-600">
              {attentionList.length} حملات
            </span>
          </div>
          <p className="mt-3 text-[11.5px] text-ink">
            تكلفة العميل المحتمل فيها أعلى من {ATTENTION_CPL} ج.م.
          </p>
          <p className="mt-2 text-[10.5px] leading-relaxed text-neutral-500">
            ابدأ بحملتي إعلانات رويال ريزيدنس وبحث جوجل، وراجع الاستهداف
            والميزانية قبل نهاية الأسبوع. .
          </p>
          <button
            onClick={showAttention}
            className="mt-4 inline-flex items-center gap-1 text-[11px] font-semibold text-red-500 hover:underline"
          >
            عرض الحملات المتأثرة <ArrowLeft size={12} />
          </button>
        </section>

        <section className={`${card} p-5`}>
          <h2 className="mb-4 text-[16px] font-semibold text-ink ">
            أداء القنوات (العملاء المحتملون)
          </h2>
          <ul className="space-y-3.5">
            {CHANNEL_PERFORMANCE.map(([name, n]) => (
              <li key={name}>
                <div className="mb-1 flex items-center justify-between text-[10.5px]">
                  <span className="font-semibold text-ink">{name}</span>
                  <span className="text-neutral-500">{n} عميل</span>
                </div>
                <div className="h-1.5 rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{ width: `${(n / maxLeads) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {modal && (
        <CampaignModal onSave={addCampaign} onClose={() => setModal(false)} />
      )}
      <Toast message={toast} />
    </div>
  );
}
