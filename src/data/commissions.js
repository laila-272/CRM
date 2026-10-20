// Mock commissions. Replace getCommissions with an API call later.
export const COMMISSION_STATUSES = ["مدفوعة", "قيد الانتظار", "معلقة", "ملغاة"];

const CUSTOMERS = [
  "أحمد علي",
  "منى السيد",
  "عمر فاروق",
  "هبة الجندي",
  "ياسر عبد الله",
  "نهى حسين",
  "طارق منصور",
  "ليلى إبراهيم",
];
const BENEFICIARIES = [
  "محمد أحمد",
  "سارة الحربي",
  "فهد القحطاني",
  "ريم السالم",
  "عمر الزهراني",
  "أحمد سمير",
  "منى حسن",
  "كريم الشامي",
];
const ST_CYCLE = [
  "مدفوعة",
  "قيد الانتظار",
  "معلقة",
  "مدفوعة",
  "ملغاة",
  "قيد الانتظار",
];
const PCTS = [1.5, 2, 2.5, 3];
const DAYS = (i) =>
  `${((i * 3) % 28) + 1} ${["أكتوبر", "نوفمبر", "ديسمبر"][i % 3]} 2026`;

const first = [
  ["DL-1024", "محمد أحمد", 2, "15 أكتوبر 2026", "مدفوعة"],
  ["DL-1025", "سارة الحربي", 1.5, "20 أكتوبر 2026", "قيد الانتظار"],
  ["DL-1026", "فهد القحطاني", 3, "12 أكتوبر 2026", "معلقة"],
  ["DL-1027", "ريم السالم", 2, "5 أكتوبر 2026", "ملغاة"],
  ["DL-1028", "عمر الزهراني", 3, "1 أكتوبر 2026", "مدفوعة"],
];

const all = Array.from({ length: 48 }, (_, i) => {
  const f = first[i];
  const value = f ? 2500000 : 1200000 + ((i * 137000) % 2800000);
  const pct = f ? f[2] : PCTS[i % 4];
  const status = f ? f[4] : ST_CYCLE[i % 6];
  return {
    id: f ? f[0] : `DL-${1024 + i}`,
    customer: f ? "أحمد علي" : CUSTOMERS[i % 8],
    beneficiary: f ? f[1] : BENEFICIARIES[i % 8],
    role: i % 3 ? "مندوب" : "وسيط",
    dealValue: value,
    pct,
    amount: (value * pct) / 100,
    due: f ? f[3] : DAYS(i),
    paidAt: status === "مدفوعة" ? (f ? f[3] : DAYS(i)) : null,
    status,
  };
});

export const getCommissions = () => all;

// Chart series (thousand EGP) – replace with an aggregate endpoint later.
export const MONTHLY = [
  { m: "مايو", v: 35 },
  { m: "يونيو", v: 45 },
  { m: "يوليو", v: 52 },
  { m: "أغسطس", v: 38 },
  { m: "سبتمبر", v: 60 },
  { m: "أكتوبر", v: 75 },
];
