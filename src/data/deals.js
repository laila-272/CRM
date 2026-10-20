// Deals data + tiny localStorage "service".
// Replace getDeals / getDeal / updateDeal with API calls later; the UI only uses these functions.

export const STAGES = [
  "عميل جديد",
  "تواصل أولي",
  "اجتماع / عرض",
  "تفاوض",
  "تعاقد",
];
export const CLOSING_STAGE = STAGES.length - 1;

const KEY = "crm.deals.v1";
const DATES = ["2/7", "6/7", "8/7", "12/7", "30/7"];

// id, stage, title, customer, company, status, owner, value, probability, ageDays, nextStep, city
const rows = [
  [
    1021,
    0,
    "شقة التجمع الخامس",
    "منى السيد",
    "مكتب السيد للاستشارات",
    "نشطة",
    "سارة طارق",
    1850000,
    20,
    3,
    "مكالمة تعريفية",
    "القاهرة",
  ],
  [
    1022,
    0,
    "وحدة تجارية بالعاصمة",
    "عمر فاروق",
    "شركة فاروق للتجارة",
    "متابعة",
    "أحمد سمير",
    3200000,
    15,
    5,
    "إرسال الكتالوج",
    "القاهرة",
  ],
  [
    1023,
    1,
    "فيلا الشيخ زايد",
    "هبة الجندي",
    "مجموعة الجندي",
    "نشطة",
    "سارة طارق",
    7400000,
    35,
    9,
    "تحديد موعد معاينة",
    "الجيزة",
  ],
  [
    1019,
    1,
    "شقة المعادي",
    "ياسر عبد الله",
    "عبد الله للمقاولات",
    "متوقفة",
    "محمود صلاح",
    2600000,
    30,
    14,
    "إعادة الاتصال",
    "القاهرة",
  ],
  [
    1017,
    2,
    "مكتب إداري بالقاهرة الجديدة",
    "نهى حسين",
    "شركة نماء للبرمجيات",
    "نشطة",
    "أحمد سمير",
    4100000,
    50,
    12,
    "عرض سعر مفصل",
    "القاهرة",
  ],
  [
    1016,
    2,
    "دوبلكس الساحل الشمالي",
    "طارق منصور",
    "منصور للاستثمار",
    "متابعة",
    "سارة طارق",
    9800000,
    45,
    21,
    "اجتماع في المعرض",
    "الإسكندرية",
  ],
  [
    1024,
    3,
    "باقة الخدمات السنوية",
    "خالد منصور",
    "شركة آفاق التقنية",
    "نشطة",
    "سارة طارق",
    250000,
    75,
    18,
    "إرسال مسودة العقد",
    "القاهرة",
  ],
  [
    1012,
    3,
    "شقة مدينة نصر",
    "ليلى إبراهيم",
    "إبراهيم وشركاه",
    "متابعة",
    "محمود صلاح",
    2150000,
    65,
    25,
    "مناقشة خطة السداد",
    "القاهرة",
  ],
  [
    1008,
    4,
    "محل تجاري بالمهندسين",
    "سامي رضوان",
    "رضوان للأغذية",
    "نشطة",
    "أحمد سمير",
    5300000,
    95,
    33,
    "توقيع العقد",
    "الجيزة",
  ],
  [
    1006,
    4,
    "شقة الشروق",
    "دينا العطار",
    "العطار للتصميم",
    "نشطة",
    "سارة طارق",
    1700000,
    100,
    40,
    "استلام الدفعة الأولى",
    "القاهرة",
  ],
  [
    1003,
    4,
    "أرض سكنية بالعبور",
    "كريم الشامي",
    "الشامي العقارية",
    "متوقفة",
    "محمود صلاح",
    6100000,
    90,
    47,
    "مراجعة الأوراق",
    "القليوبية",
  ],
];

const seed = rows.map(
  ([
    id,
    stage,
    title,
    customer,
    company,
    status,
    owner,
    value,
    probability,
    ageDays,
    nextStep,
    city,
  ]) => ({
    id,
    number: `DL-${id}`,
    stage,
    title,
    customer,
    company,
    status,
    owner,
    ownerRole: "مسؤول مبيعات",
    value,
    probability,
    ageDays,
    nextStep,
    city,
    phone: `01${String(id * 7919)
      .padStart(9, "0")
      .slice(0, 9)}`,
    email: `client${id}@example.com`,
    job: "مدير مشتريات",
    source: id % 2 ? "إحالة" : "الموقع الإلكتروني",
    type: stage === CLOSING_STAGE ? "عقد" : "عقد جديد",
    commissionRate: id === 1024 ? 5 : 2.5,
    paymentTerms: id === 1024 ? "دفعتان (50% مقدم)" : "على أقساط",
    createdAt: "2/7",
    updatedAt: "اليوم 09:10",
    expectedClose: id === 1024 ? "30/7" : DATES[4],
    nextFollowUp: "غداً 11:00 ص",
    stageDates: DATES.slice(0, stage + 1),
    notes: [],
    log: [
      {
        id: 1,
        kind: "مكالمة",
        text: "اتصال هاتفي - تم الرد",
        when: "اليوم 09:10",
        by: owner,
        done: true,
      },
      {
        id: 2,
        kind: "واتساب",
        text: "إرسال تفاصيل العرض عبر واتساب",
        when: "أمس 04:30 م",
        by: owner,
        done: true,
      },
    ],
  }),
);

export function getDeals() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* storage unavailable: fall back to seed */
  }
  return seed;
}

export function getDeal(id) {
  return getDeals().find((d) => String(d.id) === String(id)) || null;
}

// patch: object or (deal) => object
export function updateDeal(id, patch) {
  const all = getDeals().map((d) =>
    String(d.id) === String(id)
      ? { ...d, ...(typeof patch === "function" ? patch(d) : patch) }
      : d,
  );
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
  return all.find((d) => String(d.id) === String(id)) || null;
}

export const money = (v) => `${Number(v).toLocaleString("en-US")} EGP`;
