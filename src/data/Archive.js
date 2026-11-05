import { addDays, todayIso } from "./Tasks.js";

// Archived (soft-deleted) items. Kept 30 days, then removed permanently.
// Persisted in a dedicated, versioned localStorage key. Replace load/save with API calls later.
const KEY = "crm.archive.v1";

export const RETENTION_DAYS = 30;
export const SOON_DAYS = 7; // "deleted permanently soon" threshold

export const TYPES = {
  all: null,
  clients: "عميل",
  deals: "صفقة",
  contracts: "عقد",
  products: "منتج",
  leads: "عميل محتمل",
};

const utc = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
export const daysSince = (iso) =>
  Math.round((utc(todayIso()) - utc(iso)) / 864e5);
export const daysLeft = (item) => RETENTION_DAYS - daysSince(item.deletedAt);

const STAFF = ["أحمد حسن", "منى سمير", "كريم عادل", "هبة يوسف"];

// the first eight rows mirror the reference design: [name, type, deletedBy, daysAgo, time]
const FIRST = [
  ["خالد منصور", "عميل", "أحمد حسن", 1, "16:20"],
  ["صفقة فيلا التجمع الخامس", "صفقة", "منى سمير", 2, "11:05"],
  ["عقد بيع - شقة الشيخ زايد", "عقد", "كريم عادل", 4, "14:40"],
  ["كابل شحن USB-C", "منتج", "أحمد حسن", 8, "09:12"],
  ["فاتورة #INV-2041", "فاتورة", "منى سمير", 11, "17:30"],
  ["أحمد علي", "موظف", "هبة يوسف", 16, "10:15"],
  ["عرض أسعار #0042", "عرض سعر", "كريم عادل", 18, "13:45"],
  ["شقة 12 - برج النخيل", "وحدة عقارية", "هبة يوسف", 25, "15:00"],
];

const NAMES = {
  عميل: [
    "ليان العتيبي",
    "تركي العتيبي",
    "هبة الجندي",
    "طارق منصور",
    "نهى حسين",
    "سامي رضوان",
    "دينا العطار",
  ],
  صفقة: [
    "صفقة مكتب القاهرة الجديدة",
    "صفقة دوبلكس الساحل",
    "صفقة محل المهندسين",
    "صفقة أرض العبور",
  ],
  عقد: [
    "عقد خدمات الصيانة",
    "عقد توريد أنظمة",
    "عقد تأجير - مكتب إداري",
    "عقد استشارات",
  ],
  منتج: [
    "سماعة لاسلكية",
    "ماوس لاسلكي",
    "حامل هاتف للسيارة",
    "شاحن سريع 65W",
    "لوحة مفاتيح ميكانيكية",
  ],
  "عميل محتمل": [
    "كريم الشامي",
    "رنا فؤاد",
    "عمر فاروق",
    "سلمى حسن",
    "ياسر عبد الله",
  ],
  فاتورة: ["فاتورة #INV-2038", "فاتورة #INV-2035", "فاتورة #INV-2029"],
  "عرض سعر": ["عرض أسعار #0039", "عرض أسعار #0037"],
};
const ORDER = [
  "عميل",
  "منتج",
  "عميل محتمل",
  "صفقة",
  "عقد",
  "عميل",
  "منتج",
  "فاتورة",
  "عميل محتمل",
  "عرض سعر",
];

// 40 more rows spread so the statistics come out as: 12 deleted this week (days 1–6),
// 8 the week before (7–13), 23 in the middle (14–22) and 5 close to expiry (>= 23 days)
const DAYS_AFTER = [
  3,
  3,
  5,
  5,
  6,
  6,
  1,
  2,
  4, // 9 more this week
  7,
  9,
  10,
  12,
  13,
  7, // 6 more last week
  14,
  15,
  15,
  17,
  17,
  19,
  19,
  20,
  20,
  21,
  21,
  22,
  22,
  14,
  16,
  18,
  20,
  21,
  22,
  15,
  17, // 21 mid
  23,
  24,
  26,
  28, // 4 more close to expiry
].slice(0, 40);

function seed() {
  const today = todayIso();
  const rows = FIRST.map(([name, type, by, ago, time]) => ({
    name,
    type,
    by,
    ago,
    time,
  }));
  const used = {};
  DAYS_AFTER.forEach((ago, i) => {
    const type = ORDER[i % ORDER.length];
    const list = NAMES[type];
    used[type] = (used[type] || 0) + 1;
    rows.push({
      name: list[(used[type] - 1) % list.length],
      type,
      by: STAFF[i % 4],
      ago,
      time: `${String(9 + (i % 9)).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")}`,
    });
  });
  return rows.map((r, i) => ({
    id: `a${i + 1}`,
    name: r.name,
    type: r.type,
    by: r.by,
    deletedAt: addDays(today, -r.ago),
    time: r.time,
  }));
}

export function loadArchive() {
  let items;
  try {
    const raw = localStorage.getItem(KEY);
    items = raw ? JSON.parse(raw) : seed();
  } catch {
    items = seed();
  }
  // items older than the retention period are gone for good
  return items.filter((i) => daysLeft(i) > 0);
}

export function saveArchive(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
  return items;
}
