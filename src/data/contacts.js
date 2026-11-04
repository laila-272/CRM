// Mock contacts for the Contacts list + details pages (persisted in localStorage).
// To use your existing CustomersContext instead, replace `useContacts` with a hook returning [contacts, setContacts].
import { createStore } from "./Hrstores.js";

export const REF = new Date("2026-11-03");
export const PROJECTS = ["مشروع النور", "حدائق العاصمة", "وهاج ريزيدنس"];
export const OWNERS = ["سارة طارق", "أحمد علي", "ريم عادل", "زياد كمال"];
export const SOURCES = ["فيسبوك", "إحالة", "موقع إلكتروني", "معرض", "واتساب"];
export const STATUSES = ["نشط", "جديد", "يحتاج متابعة", "غير نشط"];
const pad = (n) => String(n).padStart(2, "0");
const daysAgo = (n) => {
  const d = new Date(REF.getTime() - n * 864e5);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const NAMES = [
  "مازن حسن",
  "منى كمال",
  "عمرو فاروق",
  "هالة صلاح",
  "ياسر نبيل",
  "رنا سمير",
  "وليد عاطف",
  "دينا جمال",
  "طارق سعيد",
  "إيمان رشدي",
  "شادي لطفي",
  "نهى مراد",
  "كريم عزت",
  "لمياء فؤاد",
  "هشام بدر",
  "سوزان ماهر",
  "باسم وجدي",
  "آلاء حمدي",
];
const COMPANIES = [
  "شركة آفاق للتقنية",
  "مجموعة الصفا",
  "شركة الأفق للتجارة",
  "مؤسسة النخبة",
  "شركة بنيان للمقاولات",
  "مجموعة المدار",
  "شركة سمار",
  "مؤسسة الندى",
];
const CITIES = [
  "القاهرة الجديدة",
  "الشيخ زايد",
  "الإسكندرية",
  "6 أكتوبر",
  "المعادي",
  "العاصمة الإدارية",
];
const JOBS = ["مهندس", "طبيب", "محاسب", "مدير مبيعات", "رجل أعمال", "معلم"];

const timelineFor = (c, owner) => [
  {
    date: c.last,
    text: "متابعة هاتفية لمعرفة قرار العميل",
    tone: "green",
    by: owner,
  },
  {
    date: daysAgo((REF - new Date(c.last)) / 864e5 + 6),
    text: "رسالة واتساب — إرسال عرض السعر",
    tone: "gray",
    by: owner,
  },
  { date: c.created, text: "إضافة العميل إلى النظام", tone: "gray", by: owner },
];

function seed() {
  const khaled = {
    id: "c-001",
    name: "خالد منصور",
    kind: "فرد",
    city: "القاهرة الجديدة",
    phone: "01112345678",
    email: "khaled.mansour@example.com",
    job: "مهندس",
    project: "مشروع النور",
    owner: "سارة طارق",
    status: "نشط",
    source: "فيسبوك",
    created: "2026-07-02",
    last: "2026-10-24",
    value: 1800000,
    deals: 3,
    klass: "عميل مميز",
    unit: "شقة - 3 غرف",
    payment: "تقسيط 7 سنوات",
    closed: true,
    notes:
      "تم الاتفاق مع العميل على جميع بنود العقد وتوقيعه، وتم استلام الدفعة الأولى. الوحدة جاهزة للتسليم حسب الجدول المتفق عليه، ولا توجد ملاحظات معلقة.",
    timeline: [
      {
        date: "2026-10-24",
        text: "إغلاق الصفقة — توقيع العقد",
        tone: "green",
        by: "سارة طارق",
      },
      {
        date: "2026-10-22",
        text: "موافقة العميل على شروط الدفع",
        tone: "orange",
        by: "سارة طارق",
      },
      {
        date: "2026-10-20",
        text: "إرسال مسودة العقد بعد التعديل",
        tone: "gray",
        by: "سارة طارق",
      },
      {
        date: "2026-10-15",
        text: "رسالة واتساب — تم إرسال عرض السعر",
        tone: "gray",
        by: "سارة طارق",
      },
      {
        date: "2026-10-08",
        text: "اجتماع — عرض المشروع للعميل",
        tone: "gray",
        by: "أحمد علي",
      },
      {
        date: "2026-07-02",
        text: "إضافة العميل عبر فيسبوك",
        tone: "gray",
        by: "النظام",
      },
    ],
  };
  const named = [
    ["مازن حسن", "فرد", "حدائق العاصمة", "أحمد علي", "نشط", "إحالة", 2],
    ["شركة آفاق للتقنية", "شركة", "مشروع النور", "ريم عادل", "نشط", "معرض", 5],
    ["عمر علي", "فرد", "وهاج ريزيدنس", "زياد كمال", "جديد", "موقع إلكتروني", 9],
    ["نور سالم", "فرد", "حدائق العاصمة", "سارة طارق", "نشط", "واتساب", 12],
    [
      "مجموعة الصفا",
      "شركة",
      "مشروع النور",
      "أحمد علي",
      "يحتاج متابعة",
      "إحالة",
      21,
    ],
    ["أحمد فتحي", "فرد", "وهاج ريزيدنس", "ريم عادل", "نشط", "فيسبوك", 14],
    ["سلمى عادل", "فرد", "مشروع النور", "زياد كمال", "جديد", "فيسبوك", 4],
  ].map(([name, kind, project, owner, status, source, ago], i) => {
    const c = {
      id: `c-${pad(i + 2)}0`,
      name,
      kind,
      city: CITIES[i % 6],
      phone: `01${[0, 1, 2, 5][i % 4]}${String(23456789 + i * 7919).slice(0, 8)}`,
      email: `contact${i + 2}@example.com`,
      job: JOBS[i % 6],
      project,
      owner,
      status,
      source,
      created: daysAgo(ago + 40),
      last: daysAgo(ago),
      value: (i + 1) * 350000,
      deals: 1 + (i % 4),
      klass: kind === "شركة" ? "حساب مؤسسي" : "عميل عادي",
      unit: "شقة - 2 غرف",
      payment: "تقسيط 5 سنوات",
      closed: false,
      notes: "لا توجد ملاحظات حالياً.",
    };
    return { ...c, timeline: timelineFor(c, owner) };
  });
  const rest = Array.from({ length: 22 }, (_, i) => {
    const company = i % 4 === 0;
    const name = company
      ? COMPANIES[((i / 4) % 8) | 0] + (i > 15 ? " 2" : "")
      : NAMES[i % 18];
    const owner = OWNERS[i % 4],
      status = STATUSES[(i * 3) % 4],
      ago = ((i * 5) % 45) + 1;
    const c = {
      id: `c-${100 + i}`,
      name,
      kind: company ? "شركة" : "فرد",
      city: CITIES[i % 6],
      phone: `01${[0, 1, 2, 5][i % 4]}${String(34567890 + i * 811).slice(0, 8)}`,
      email: `user${i + 10}@example.com`,
      job: JOBS[i % 6],
      project: PROJECTS[i % 3],
      owner,
      status,
      source: SOURCES[i % 5],
      created: daysAgo(ago + 60),
      last: daysAgo(ago),
      value: ((i % 7) + 1) * 250000,
      deals: 1 + (i % 3),
      klass: company ? "حساب مؤسسي" : "عميل عادي",
      unit: "شقة - 3 غرف",
      payment: "كاش",
      closed: false,
      notes: "لا توجد ملاحظات حالياً.",
    };
    return { ...c, timeline: timelineFor(c, owner) };
  });
  return [khaled, ...named, ...rest];
}
export const useContacts = createStore("crm-contacts-v1", seed());

export const dmy = (iso) => (iso ? iso.split("-").reverse().join("/") : "—");
export const daysSince = (iso) => Math.floor((REF - new Date(iso)) / 864e5);
export const needsAttention = (c) =>
  c.status === "يحتاج متابعة" ||
  (c.status !== "غير نشط" && daysSince(c.last) > 14);
export const money = (n) =>
  n >= 1e6
    ? `${(n / 1e6).toFixed(1)} مليون ج.م`
    : `${Number(n).toLocaleString("en-US")} ج.م`;
export const waLink = (phone) => {
  const d = String(phone).replace(/\D/g, "");
  return `https://wa.me/${d.startsWith("0") ? "20" + d.slice(1) : d}`;
};

// Single access point for pages. To switch to CustomersContext, reimplement only this hook
// (map your customer shape <-> the contact shape above).
export function useContactsApi() {
  const [contacts, set] = useContacts();
  const todayIso = REF.toISOString().slice(0, 10);
  return {
    contacts,
    add(c) {
      const id = `c-${Date.now().toString(36)}`;
      set((p) => [
        {
          klass: "عميل عادي",
          unit: "—",
          payment: "—",
          closed: false,
          ...c,
          id,
          created: todayIso,
          last: todayIso,
          deals: 0,
          timeline: [
            {
              date: todayIso,
              text: "إضافة العميل إلى النظام",
              tone: "gray",
              by: c.owner,
            },
          ],
        },
        ...p,
      ]);
      return id;
    },
    update: (id, patch) =>
      set((p) => p.map((c) => (c.id === id ? { ...c, ...patch } : c))),
    remove: (id) => set((p) => p.filter((c) => c.id !== id)),
  };
}
