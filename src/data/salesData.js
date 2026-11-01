// Mock data + pure helpers for the Sales module (no UI here).

export const TEAM = ["سارة طارق", "فهد الحربي", "ريم السعيد", "أحمد علي"];
export const first = (n) => String(n).split(" ")[0];
export const APPROVERS = ["مدير المبيعات", "المدير المالي", "المدير العام"];
export const PAY_METHODS = ["نقدي", "تحويل بنكي", "بطاقة ائتمان", "شيك"];
export const PAY_TERMS = [
  "فوري",
  "خلال 15 يوماً",
  "خلال 30 يوماً",
  "خلال 60 يوماً",
];
export const CURRENCIES = [
  "الجنيه المصري",
  "الدولار الأمريكي",
  "الريال السعودي",
];
export const VAT = 14;

export const CUSTOMERS = [
  { name: "خالد منصور", company: "شركة آفاق التقنية", terms: "خلال 30 يوماً" },
  { name: "ليان العتيبي", company: "مجموعة النخبة", terms: "خلال 15 يوماً" },
  { name: "تركي العزي", company: "مجموعة النخبة", terms: "خلال 30 يوماً" },
  { name: "منى الشريف", company: "شركة الرؤية", terms: "فوري" },
  { name: "أحمد السيد", company: "مؤسسة الأفق", terms: "خلال 60 يوماً" },
  { name: "هدى القحطاني", company: "شركة بدر", terms: "خلال 30 يوماً" },
  { name: "عمر الدوسري", company: "شركة المدار", terms: "خلال 30 يوماً" },
  { name: "نورة الحارثي", company: "مؤسسة الريادة", terms: "خلال 15 يوماً" },
  { name: "سلمان البكري", company: "شركة الأفق الرقمي", terms: "فوري" },
  { name: "دانة الفهد", company: "مجموعة الندى", terms: "خلال 60 يوماً" },
];
export const CATALOG = [
  { name: "ترخيص نظام إدارة العملاء", price: 180000 },
  { name: "باقة دعم فني سنوية", price: 48250 },
  { name: "تجهيز أجهزة نقاط البيع", price: 242000 },
  { name: "خدمات التدريب والتأهيل", price: 54000 },
  { name: "تجديد عقد الخدمات المدارة", price: 128000 },
  { name: "ترقية الباقة إلى المؤسسات", price: 76000 },
];

export const ORDER_STATUS = {
  new: "جديد",
  awaiting: "بانتظار التأكيد",
  processing: "قيد التنفيذ",
  completed: "مكتمل",
  cancelled: "ملغي",
};
export const ORDER_CHIPS = [
  ["all", "الكل"],
  ["new", "جديدة"],
  ["processing", "قيد التنفيذ"],
  ["completed", "مكتملة"],
  ["cancelled", "ملغاة"],
];
export const PAY_STATUS = {
  paid: "مدفوع",
  partial: "مدفوع جزئياً",
  unpaid: "غير مدفوع",
  draft: "مسودة",
};
export const SO_STATUS = {
  draft: "مسودة",
  pending: "بانتظار الاعتماد",
  approved: "معتمد",
  delivered: "تم التسليم",
  cancelled: "ملغي",
};
export const SO_CHIPS = [
  ["all", "الكل"],
  ["draft", "مسودة"],
  ["pending", "بانتظار الاعتماد"],
  ["approved", "معتمدة"],
  ["delivered", "تم التسليم"],
];

export const TONES = {
  green: "bg-emerald-50 text-emerald-700",
  orange: "bg-orange-50 text-orange-600",
  red: "bg-red-50 text-red-600",
  blue: "bg-blue-50 text-blue-600",
  gray: "bg-neutral-100 text-neutral-500",
};
export const STATUS_TONE = {
  new: "blue",
  awaiting: "gray",
  processing: "orange",
  completed: "green",
  cancelled: "red",
  paid: "green",
  partial: "orange",
  unpaid: "red",
  draft: "gray",
  pending: "orange",
  approved: "green",
  delivered: "green",
};

/* ---------- helpers ---------- */
export const today = () => new Date().toISOString().slice(0, 10);
export const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("ar-EG-u-nu-latn", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";
export const jm = (n) => `${Math.round(n).toLocaleString("en-US")} ج.م`;
export const jmM = (n) => `${Number((n / 1e6).toFixed(2))} مليون ج.م`;
export const emptyItem = () => ({ name: "", qty: 1, price: 0 });
export function calcTotals(items = [], taxRate = 0) {
  const subtotal = items.reduce(
    (s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0),
    0,
  );
  const tax = (subtotal * (Number(taxRate) || 0)) / 100;
  return { subtotal, tax, total: subtotal + tax };
}
export function nextNumber(prefix, list) {
  const max = list.reduce(
    (m, o) =>
      Math.max(m, parseInt(String(o.number).replace(/\D/g, ""), 10) || 0),
    0,
  );
  return `${prefix}${max + 1}`;
}
const addDays = (d, n) => {
  const x = new Date(`${d}T00:00:00Z`);
  x.setUTCDate(x.getUTCDate() + n);
  return x.toISOString().slice(0, 10);
};
const dateAt = (i) => {
  const d = new Date(Date.UTC(2026, 9, 14));
  d.setUTCDate(14 - Math.floor(i * 1.6));
  return d.toISOString().slice(0, 10);
};
const spread = (vals, target) => {
  const s = vals.reduce((a, b) => a + b, 0);
  const out = vals.map((v) => Math.round((v * target) / s / 500) * 500);
  out[out.length - 1] += target - out.reduce((a, b) => a + b, 0);
  return out;
};
const BASE = [
  18000, 24500, 31000, 12500, 46000, 38000, 27500, 52000, 21000, 35500,
];

/* ---------- Orders (48) ---------- */
const mkOrder = (num, ci, product, date, value, status, pay, owner) => ({
  id: num,
  number: `ط-${num}`,
  customer: CUSTOMERS[ci].name,
  company: CUSTOMERS[ci].company,
  date,
  items: [{ name: product, qty: 1, price: value }],
  taxRate: 0,
  payMethod: PAY_METHODS[num % 4],
  payTerms: CUSTOMERS[ci].terms,
  deliveryDate: "",
  status,
  payStatus: pay,
  owner,
  notes: "",
});
const HEAD = [
  [
    2048,
    0,
    "ترخيص نظام إدارة العملاء",
    "2026-10-24",
    180000,
    "processing",
    "paid",
    TEAM[0],
  ],
  [
    2047,
    1,
    "باقة دعم فني سنوية",
    "2026-10-23",
    96500,
    "new",
    "partial",
    TEAM[1],
  ],
  [
    2046,
    2,
    "تجهيز أجهزة نقاط البيع",
    "2026-10-21",
    242000,
    "awaiting",
    "unpaid",
    TEAM[2],
  ],
  [
    2045,
    3,
    "خدمات التدريب والتأهيل",
    "2026-10-19",
    54000,
    "completed",
    "paid",
    TEAM[0],
  ],
  [
    2044,
    4,
    "تجديد عقد الخدمات المدارة",
    "2026-10-17",
    128000,
    "completed",
    "paid",
    TEAM[3],
  ],
  [
    2043,
    5,
    "ترقية الباقة إلى المؤسسات",
    "2026-10-15",
    76000,
    "cancelled",
    "draft",
    TEAM[1],
  ],
].map((r) => mkOrder(...r));
const ST = [
  ...Array(4).fill("new"),
  ...Array(3).fill("awaiting"),
  ...Array(13).fill("processing"),
  ...Array(20).fill("completed"),
  ...Array(2).fill("cancelled"),
];
const OV = spread(
  Array.from({ length: 42 }, (_, i) => BASE[i % 10]),
  1573500,
);
const payFor = (s, i) =>
  ({
    completed: "paid",
    cancelled: "draft",
    awaiting: "unpaid",
    new: i % 2 ? "partial" : "unpaid",
    processing: i % 3 ? "paid" : "partial",
  })[s];
const GEN = Array.from({ length: 42 }, (_, i) => {
  const s = ST[(i * 17) % 42];
  return mkOrder(
    2042 - i,
    (i + 6) % CUSTOMERS.length,
    CATALOG[i % 6].name,
    dateAt(i),
    OV[i],
    s,
    payFor(s, i),
    TEAM[i % 4],
  );
});
export const SEED_ORDERS = [...HEAD, ...GEN]; // 48 orders, total value 2,350,000

/* ---------- Sales orders (32) ---------- */
const firstOf = (pay, v) =>
  pay === "paid"
    ? v
    : pay === "partial"
      ? Math.round((v * 0.3) / 500) * 500
      : 0;
const soRow = (n, ord, date, value, status, pay, owner) => ({
  id: n,
  number: `أ-${n}`,
  orderNumber: ord.number,
  customer: ord.customer,
  company: ord.company,
  date,
  deliveryDate: addDays(date, 10),
  value,
  status,
  payStatus: pay,
  approver: APPROVERS[0],
  firstPayment: firstOf(pay, value),
  payMethod: PAY_METHODS[n % 4],
  owner,
  notes: "",
});
const SOH = [
  [5031, 24, 180000, "approved", "paid"],
  [5030, 23, 96500, "pending", "partial"],
  [5029, 21, 242000, "draft", "unpaid"],
  [5028, 19, 54000, "delivered", "paid"],
  [5027, 17, 128000, "delivered", "paid"],
  [5026, 15, 76000, "cancelled", "draft"],
].map(([n, d, v, s, p], i) =>
  soRow(n, SEED_ORDERS[i], `2026-10-${d}`, v, s, p, SEED_ORDERS[i].owner),
);
const SO_ST = [
  ...Array(3).fill("draft"),
  ...Array(5).fill("pending"),
  ...Array(8).fill("approved"),
  ...Array(10).fill("delivered"),
];
const gst = Array.from({ length: 26 }, (_, i) => SO_ST[(i * 7) % 26]);
const openVals = spread(
  gst.filter((s) => s !== "delivered").map((_, k) => BASE[k % 10]),
  2681500,
);
let oi = 0,
  pend = 0;
const SOG = gst.map((st, i) => {
  const value = st === "delivered" ? BASE[i % 10] * 3 : openVals[oi++];
  const pay =
    st === "draft"
      ? "unpaid"
      : st === "pending"
        ? pend++ === 0
          ? "unpaid"
          : "partial"
        : st === "approved"
          ? i % 2
            ? "paid"
            : "partial"
          : "paid";
  return soRow(
    5025 - i,
    SEED_ORDERS[6 + i],
    dateAt(i),
    value,
    st,
    pay,
    TEAM[i % 4],
  );
});
export const SEED_SALES_ORDERS = [...SOH, ...SOG]; // open value 3,200,000 · unpaid 5

/* ---------- Reports ---------- */
export const MONTHS6 = [
  ["مايو", 0.9],
  ["يونيو", 1.1],
  ["يوليو", 1.0],
  ["أغسطس", 1.4],
  ["سبتمبر", 1.2],
  ["أكتوبر", 1.6],
];
export const TEAM_PERF = [
  { name: "سارة طارق", orders: 62, value: 2450000, target: 2800000 },
  { name: "فهد الحربي", orders: 54, value: 2180000, target: 2500000 },
  { name: "ريم السعيد", orders: 47, value: 1860000, target: 2200000 },
  { name: "أحمد علي", orders: 51, value: 1910000, target: 2000000 },
];
export const ANNUAL_TARGET = 9655000;
export const CATEGORIES = [
  { name: "التراخيص", share: 0.35 },
  { name: "الدعم الفني", share: 0.25 },
  { name: "الأجهزة", share: 0.25 },
  { name: "التدريب", share: 0.15 },
];
export const REPORT_TYPES = {
  summary: "ملخص المبيعات",
  owner: "حسب المسؤول",
  category: "حسب الفئة",
  customer: "حسب العميل",
};
export const COMPARES = {
  none: "بدون مقارنة",
  prev: "مقارنة بالفترة السابقة",
  year: "مقارنة بنفس الفترة من العام الماضي",
};

export function reportData(c) {
  const total = TEAM_PERF.reduce((s, t) => s + t.value, 0);
  if (c.type === "owner")
    return {
      head: ["المسؤول", "عدد الأوامر", "قيمة المبيعات", "الهدف"],
      rows: TEAM_PERF.filter((t) => !c.owner || t.name === c.owner).map((t) => [
        t.name,
        t.orders,
        t.value,
        t.target,
      ]),
    };
  if (c.type === "category")
    return {
      head: ["الفئة", "النسبة", "قيمة المبيعات"],
      rows: CATEGORIES.filter((x) => !c.category || x.name === c.category).map(
        (x) => [
          x.name,
          `${Math.round(x.share * 100)}%`,
          Math.round(total * x.share),
        ],
      ),
    };
  if (c.type === "customer")
    return {
      head: ["العميل", "الشركة", "قيمة المبيعات"],
      rows: CUSTOMERS.slice(0, 6).map((x, i) => [
        x.name,
        x.company,
        (6 - i) * 310000,
      ]),
    };
  return {
    head: ["الشهر", "قيمة المبيعات (مليون ج.م)"],
    rows: MONTHS6.map(([m, v]) => [m, v]),
  };
}
