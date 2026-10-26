// CRM settings. Persisted in a dedicated, versioned localStorage key.
// Replace loadSettings/saveSettings with API calls later; the page only uses these two functions.
const KEY = "crm.settings.v1";

export const STAGE_KINDS = ["نشطة", "إغلاق ناجح", "إغلاق خاسر"];
export const OWNERS = [
  "محمد العمري",
  "سارة طارق",
  "فهد القحطاني",
  "ريم السالم",
];
export const FIELD_TYPES = ["نص", "رقم", "تاريخ", "قائمة", "نعم / لا"];

const defaults = () => ({
  stages: {
    name: "مبيعات العقارات",
    alertOverdue: true,
    list: [
      { id: "s1", name: "عميل جديد", probability: 10, days: 2, kind: "نشطة" },
      { id: "s2", name: "تواصل أولي", probability: 25, days: 3, kind: "نشطة" },
      {
        id: "s3",
        name: "اجتماع / عرض",
        probability: 50,
        days: 5,
        kind: "نشطة",
      },
      { id: "s4", name: "تفاوض", probability: 75, days: 5, kind: "نشطة" },
      {
        id: "s5",
        name: "تعاقد",
        probability: 100,
        days: 0,
        kind: "إغلاق ناجح",
      },
    ],
  },
  sources: {
    required: false,
    defaultSource: "اتصال مباشر",
    list: [
      { id: "src1", name: "فيسبوك", active: true },
      { id: "src2", name: "الموقع الإلكتروني", active: true },
      { id: "src3", name: "إحالات الوسطاء", active: true },
      { id: "src4", name: "اتصال مباشر", active: true },
      { id: "src5", name: "زيارة الفرع", active: true },
    ],
  },
  assignment: {
    mode: "equal",
    fallback: "محمد العمري",
    skipUnavailable: true,
    reassign: true,
    team: [
      { name: "سارة طارق", active: true, load: 8 },
      { name: "أحمد علي", active: true, load: 6 },
      { name: "ريم عادل", active: true, load: 7 },
    ],
  },
  customFields: [
    { id: "cf1", name: "الميزانية المتوقعة", type: "رقم", required: true },
    {
      id: "cf2",
      name: "موعد الاستلام المطلوب",
      type: "تاريخ",
      required: false,
    },
    { id: "cf3", name: "نوع الوحدة المفضلة", type: "قائمة", required: false },
  ],
  ratings: {
    levels: [
      { id: "r1", name: "حار" },
      { id: "r2", name: "دافئ" },
      { id: "r3", name: "بارد" },
    ],
    tags: [
      { id: "t1", name: "مستثمر" },
      { id: "t2", name: "مشتري لأول مرة" },
      { id: "t3", name: "VIP" },
    ],
  },
  permissions: {
    roles: ["مدير", "مسؤول مبيعات", "مشاهد"],
    items: [
      ["view", "عرض العملاء"],
      ["edit", "تعديل العملاء"],
      ["delete", "حذف العملاء"],
      ["export", "تصدير البيانات"],
      ["settings", "تعديل الإعدادات"],
    ],
    grid: {
      مدير: {
        view: true,
        edit: true,
        delete: true,
        export: true,
        settings: true,
      },
      "مسؤول مبيعات": {
        view: true,
        edit: true,
        delete: false,
        export: true,
        settings: false,
      },
      مشاهد: {
        view: true,
        edit: false,
        delete: false,
        export: false,
        settings: false,
      },
    },
  },
  integrations: [
    {
      id: "i1",
      name: "واتساب للأعمال",
      desc: "إرسال واستقبال الرسائل من داخل النظام",
      on: true,
    },
    {
      id: "i2",
      name: "نماذج فيسبوك",
      desc: "استيراد العملاء المحتملين من الحملات",
      on: false,
    },
    {
      id: "i3",
      name: "البريد الإلكتروني",
      desc: "مزامنة الرسائل مع ملف العميل",
      on: false,
    },
    {
      id: "i4",
      name: "تقويم جوجل",
      desc: "مزامنة الاجتماعات والمتابعات",
      on: false,
    },
  ],
});

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...defaults(), ...JSON.parse(raw) };
  } catch {
    /* fall back to defaults */
  }
  return defaults();
}

export function saveSettings(settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
  return settings;
}
