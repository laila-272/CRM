// Form builder data. Persisted in a dedicated, versioned localStorage key.
// Replace load/save with API calls later; the page only uses these functions.
const KEY = "crm.formBuilder.v1";

export const FIELD_DEFAULTS = {
  text: { label: "نص قصير", placeholder: "اكتب هنا" },
  phone: { label: "رقم الهاتف", placeholder: "01XXXXXXXXX" },
  email: { label: "البريد الإلكتروني", placeholder: "name@example.com" },
  select: {
    label: "قائمة منسدلة",
    placeholder: "اختر",
    options: ["الخيار الأول", "الخيار الثاني"],
  },
  multi: {
    label: "اختيار متعدد",
    options: ["الخيار الأول", "الخيار الثاني", "الخيار الثالث"],
  },
  radio: { label: "اختيار واحد", options: ["نعم", "لا"] },
  date: { label: "تاريخ" },
  textarea: { label: "نص طويل", placeholder: "" },
  file: { label: "رفع ملف" },
  consent: { label: "أوافق على الشروط والأحكام" },
};

export const THEME_COLORS = ["#111111", "#f97316", "#2563eb", "#16a34a"];

const defaultForm = () => ({
  name: "طلب اهتمام - مشروع النور",
  status: "مسودة",
  savedAt: null,
  info: {
    company: "اسم الشركة",
    badge: "مشروع النور",
    heading: "خطوتك الأولى لبيتك الجديد",
    description:
      "سيب بياناتك وهنّل مستشارنا يساعدك تختار الوحدة المناسبة في مشروع النور.",
    privacy: "بياناتك آمنة ولن نشاركها مع أي طرف آخر",
  },
  appearance: { buttonLabel: "سجّل اهتمامك", color: "#111111", lang: "ar" },
  after: {
    source: "نموذج الموقع",
    stage: "عميل جديد",
    owner: "سارة طارق",
    notify: true,
    successMessage: "شكرًا لاهتمامك! فريقنا هيتواصل معاك في أقرب وقت.",
  },
  fields: [
    {
      id: "f1",
      type: "text",
      label: "الاسم الكامل",
      placeholder: "اكتب اسمك بالكامل",
      required: true,
    },
    {
      id: "f2",
      type: "phone",
      label: "رقم الهاتف",
      placeholder: "01XXXXXXXXX",
      required: true,
    },
    {
      id: "f3",
      type: "email",
      label: "البريد الإلكتروني",
      placeholder: "name@example.com",
      required: false,
    },
    {
      id: "f4",
      type: "select",
      label: "نوع الوحدة",
      placeholder: "اختر نوع الوحدة",
      required: true,
      options: ["شقة", "دوبلكس", "فيلا", "تاون هاوس", "محل تجاري"],
    },
    {
      id: "f5",
      type: "select",
      label: "الميزانية المتوقعة",
      placeholder: "اختر الميزانية",
      required: true,
      options: [
        "أقل من 1.5 مليون EGP",
        "1.5 – 2 مليون EGP",
        "2 – 4 مليون EGP",
        "أكثر من 4 مليون EGP",
      ],
    },
    {
      id: "f6",
      type: "textarea",
      label: "ملاحظات إضافية",
      placeholder: "قول لنا أكتر عن احتياجاتك...",
      required: false,
    },
    {
      id: "f7",
      type: "consent",
      label: "أوافق على التواصل معي بخصوص الوحدات والعروض المتاحة.",
      required: true,
    },
  ],
});

export const OPTIONS = {
  sources: ["نموذج الموقع", "إعلان ممول", "حملة واتساب", "معرض عقاري"],
  stages: ["عميل جديد", "تواصل أولي", "اجتماع / عرض"],
  owners: ["سارة طارق", "فهد القحطاني", "ريم السالم", "أحمد سمير"],
};

export function loadForm() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* fall back to default */
  }
  return defaultForm();
}

export function saveForm(form) {
  const saved = { ...form, savedAt: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify(saved));
  } catch {
    /* ignore */
  }
  return saved;
}

// 36 sample responses (the tab badge shows this count).
const NAMES = [
  "محمود صلاح",
  "منى السيد",
  "عمر فاروق",
  "هبة الجندي",
  "ياسر عبد الله",
  "نهى حسين",
  "طارق منصور",
  "ليلى إبراهيم",
  "سامي رضوان",
];
const UNITS = ["شقة", "دوبلكس", "فيلا", "تاون هاوس", "محل تجاري"];
const BUDGETS = [
  "أقل من 1.5 مليون EGP",
  "1.5 – 2 مليون EGP",
  "2 – 4 مليون EGP",
  "أكثر من 4 مليون EGP",
];

export const getResponses = () =>
  Array.from({ length: 36 }, (_, i) => {
    const d = new Date(2026, 9, 25 - Math.floor(i / 2));
    return {
      id: i + 1,
      name: `${NAMES[i % NAMES.length]}`,
      phone: `01${["0", "1", "2", "5"][i % 4]}${String(10000000 + i * 3137911).slice(0, 8)}`,
      email: i % 3 ? `lead${i + 1}@example.com` : "—",
      unit: UNITS[i % UNITS.length],
      budget: BUDGETS[(i * 7) % BUDGETS.length],
      date: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`,
    };
  });
