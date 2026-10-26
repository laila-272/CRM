// Sample analytics data. All totals shown on the Reports page are DERIVED from these arrays, so they stay consistent.
// Replace with an API call / derive from real CRM data later.

export const MONTHLY = [
  // month, sales (EGP), closed deals
  { m: "مايو", sales: 1600000, deals: 22 },
  { m: "يونيو", sales: 1900000, deals: 25 },
  { m: "يوليو", sales: 2000000, deals: 28 },
  { m: "أغسطس", sales: 2200000, deals: 30 },
  { m: "سبتمبر", sales: 2300000, deals: 29 },
  { m: "أكتوبر", sales: 2650000, deals: 34 },
];

export const TEAM = [
  // sales sum = 12,650,000 · deals sum = 168 · leads sum = 912 (matches MONTHLY totals)
  { name: "سارة طارق", deals: 46, sales: 3400000, leads: 190 },
  { name: "فهد القحطاني", deals: 40, sales: 2900000, leads: 175 },
  { name: "ريم السالم", deals: 34, sales: 2550000, leads: 160 },
  { name: "أحمد سمير", deals: 28, sales: 2100000, leads: 215 },
  { name: "منى حسن", deals: 20, sales: 1700000, leads: 172 },
];

export const LEAD_SOURCES = [
  // new leads this month = 124
  { name: "الموقع الإلكتروني", value: 42, color: "#111111" },
  { name: "الإحالات", value: 31, color: "#525252" },
  { name: "وسائل التواصل", value: 27, color: "#a3a3a3" },
  { name: "المعارض والحملات", value: 24, color: "#e5e5e5" },
];

export const OPEN_PIPELINE = [
  // open pipeline value = 9,320,000
  { stage: "تواصل أولي", value: 2100000 },
  { stage: "اجتماع / عرض", value: 2600000 },
  { stage: "تفاوض", value: 2700000 },
  { stage: "تعاقد", value: 1920000 },
];
