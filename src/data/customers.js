export const STATUSES = ["جديد", "مهتم", "لا رد", "متابعة", "معاينة"];
export const SOURCES = ["فيسبوك", "سمسار", "الموقع", "ترشيح", "إنستغرام"];
export const PROJECTS = [
  "مشروع النور",
  "كمبوند الأندلس",
  "فيلات الساحل",
  "برج الموقع",
];
export const OWNERS = [
  "سارة طارق",
  "أحمد علي",
  "مريم محمد",
  "عمر خالد",
  "نادين سامي",
];

const names = [
  "خالد منصور",
  "منى عبدالرحمن",
  "شريف فوزي",
  "إيمان عادل",
  "هدى يوسف",
  "محمود حسن",
  "داليا مصطفى",
  "ياسر إبراهيم",
  "نهى سمير",
  "كريم عادل",
  "رانيا فؤاد",
  "أحمد جلال",
  "سلمى حسام",
  "طارق نبيل",
  "لمياء رضا",
  "وليد صالح",
  "دينا أشرف",
  "حسام الدين",
  "ريم ماجد",
  "باسم عزت",
  "هالة فتحي",
  "مروان سعيد",
  "شيماء عوض",
  "عمرو زكريا",
];
const budgets = [
  "1.5 – 2 EGP M",
  "2 – 3 EGP M",
  "3 – 4 EGP M",
  "700 – 1 EGP M",
  "2.5 – 3.5 EGP M",
  "1 – 1.5 EGP M",
  "500 – 800 EGP K",
];
const follow = ["غدًا", "اليوم", "15/7", "16/7", "18/7", "20/7", "21/7"];

export const initialCustomers = names.map((name, i) => ({
  id: i + 1,
  name,
  owner: OWNERS[i % OWNERS.length],
  phone:
    `01${["11", "00", "22", "50", "06", "17", "28"][i % 7]}${String(1234567 + i * 1111).slice(0, 7)}`.slice(
      0,
      11,
    ),
  altPhone: `0111234${String(567 + i).slice(-3)}`,
  email: `customer${i + 1}@example.com`,
  city: "القاهرة الجديدة",
  job: "مهندس",
  project: PROJECTS[i % PROJECTS.length],
  unitType: i % 2 ? "فيلا" : "شقة – 3 غرف",
  budget: budgets[i % budgets.length],
  source: SOURCES[i % SOURCES.length],
  status: STATUSES[(i * 2 + 1) % STATUSES.length],
  payment: "تقسيط 7 سنوات",
  nextFollowUp: follow[i % follow.length],
  score: 40 + ((i * 17) % 55),
  createdAt: "2/7",
  note: "العميل مهتم بوحدة بإطلالة على الحدائق ويفضل المعاينة نهاية الأسبوع. طلب تفاصيل خطة التقسيط والمقدم المطلوب.",
}));
