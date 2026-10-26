import { useState } from "react";

// Tasks & follow-ups: shared by Tasks and Calendar pages. Persisted in a dedicated, versioned localStorage key.
// Replace getTasks/persist with API calls later; the pages only use useTasks().
const KEY = "crm.tasks.v1";

export const TYPES = ["مكالمة", "معاينة", "اجتماع", "مهمة"];
export const TYPE_CLS = {
  مكالمة: "bg-blue-50 text-blue-600",
  معاينة: "bg-green-50 text-green-700",
  اجتماع: "bg-orange-50 text-orange-600",
  مهمة: "bg-neutral-100 text-neutral-600",
};
export const TYPE_DOT = {
  مكالمة: "bg-blue-500",
  معاينة: "bg-green-600",
  اجتماع: "bg-orange-500",
  مهمة: "bg-neutral-500",
};
export const PRIORITIES = ["عالية", "متوسطة", "منخفضة"];
export const PRIORITY_CLS = {
  عالية: "text-red-500",
  متوسطة: "text-orange-500",
  منخفضة: "text-neutral-400",
};
export const STATUSES = ["متأخرة", "اليوم", "قادمة", "مكتملة"];
export const STATUS_CLS = {
  متأخرة: "bg-red-50 text-red-500",
  اليوم: "bg-orange-50 text-orange-600",
  قادمة: "bg-blue-50 text-blue-600",
  مكتملة: "bg-green-50 text-green-600",
};
export const REMINDERS = [
  "بدون تذكير",
  "قبل الموعد بـ 30 دقيقة",
  "قبل الموعد بساعة",
  "قبل الموعد بيوم",
];
export const EMPLOYEES = [
  "سارة طارق",
  "فهد القحطاني",
  "ريم السالم",
  "أحمد سمير",
];
export const CUSTOMERS = [
  "خالد منصور",
  "ليان العتيبي",
  "تركي العتيبي",
  "هبة الجندي",
  "طارق منصور",
  "نهى حسين",
  "سامي رضوان",
  "دينا العطار",
];
export const MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

const pad = (n) => String(n).padStart(2, "0");

export const toIso = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayIso = () => toIso(new Date());
export const addDays = (iso, n) => {
  const [y, m, d] = iso.split("-").map(Number);
  return toIso(new Date(y, m - 1, d + n));
};
export const fmtDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
};

export function statusOf(t) {
  if (t.done) return "مكتملة";
  const today = todayIso();
  if (t.due < today) return "متأخرة";
  if (t.due === today) return "اليوم";
  return "قادمة";
}

// Moving a task to a status column adjusts its done flag / due date so the status stays derived and consistent.
export function moveToStatus(t, status) {
  const today = todayIso();
  if (status === "مكتملة") return { ...t, done: true };
  const base = { ...t, done: false };
  if (status === "اليوم") return { ...base, due: today };
  if (status === "متأخرة")
    return { ...base, due: t.due < today ? t.due : addDays(today, -1) };
  return { ...base, due: t.due > today ? t.due : addDays(today, 1) };
}

// title, type, customer, priority, dayOffset, time, owner, notes, done
const SEED = [
  [
    "مكالمة تعريفية مع خالد منصور",
    "مكالمة",
    "خالد منصور",
    "عالية",
    -2,
    "10:30",
    "سارة طارق",
    "طلب عرض أسعار للباقة السنوية.",
    false,
  ],
  [
    "الاتصال بصاحب القرار",
    "مكالمة",
    "ليان العتيبي",
    "عالية",
    -1,
    "12:00",
    "فهد القحطاني",
    "",
    false,
  ],
  [
    "معاينة العرض الفني",
    "معاينة",
    "تركي العتيبي",
    "متوسطة",
    0,
    "15:30",
    "ريم السالم",
    "تأكيد موقع المعاينة مع العميل.",
    false,
  ],
  [
    "إرسال مسودة العقد",
    "مهمة",
    "خالد منصور",
    "عالية",
    0,
    "11:00",
    "سارة طارق",
    "",
    false,
  ],
  [
    "إرسال العرض المالي المحدث",
    "مهمة",
    "هبة الجندي",
    "متوسطة",
    0,
    "09:30",
    "أحمد سمير",
    "",
    true,
  ],
  [
    "اجتماع تفاوض على الشروط",
    "اجتماع",
    "طارق منصور",
    "عالية",
    1,
    "13:00",
    "فهد القحطاني",
    "مراجعة خطة السداد.",
    false,
  ],
  [
    "تأكيد موعد المعاينة",
    "معاينة",
    "نهى حسين",
    "منخفضة",
    1,
    "16:00",
    "ريم السالم",
    "",
    false,
  ],
  [
    "متابعة شروط التقسيط",
    "مكالمة",
    "سامي رضوان",
    "متوسطة",
    3,
    "10:00",
    "أحمد سمير",
    "",
    false,
  ],
  [
    "مراجعة مستندات التعاقد",
    "مهمة",
    "دينا العطار",
    "متوسطة",
    4,
    "14:00",
    "سارة طارق",
    "",
    false,
  ],
  [
    "اجتماع عرض المشروع",
    "اجتماع",
    "ليان العتيبي",
    "عالية",
    7,
    "11:30",
    "فهد القحطاني",
    "",
    false,
  ],
  [
    "تحديث بيانات الشركة",
    "مهمة",
    "تركي العتيبي",
    "منخفضة",
    -4,
    "09:00",
    "ريم السالم",
    "",
    true,
  ],
  [
    "معاينة الوحدة النموذجية",
    "معاينة",
    "هبة الجندي",
    "متوسطة",
    9,
    "12:30",
    "أحمد سمير",
    "",
    false,
  ],
];

function seed() {
  const today = todayIso();
  return SEED.map(
    ([title, type, customer, priority, off, time, owner, notes, done], i) => ({
      id: i + 1,
      title,
      type,
      customer,
      priority,
      due: addDays(today, off),
      time,
      owner,
      reminder: REMINDERS[1],
      notes,
      done,
    }),
  );
}

export function getTasks() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* fall back to seed */
  }
  return seed();
}

function persist(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  return list;
}

export function useTasks() {
  const [tasks, setTasks] = useState(getTasks);
  const save = (t) =>
    setTasks((cur) =>
      persist(
        cur.some((x) => x.id === t.id)
          ? cur.map((x) => (x.id === t.id ? t : x))
          : [t, ...cur],
      ),
    );
  const remove = (id) =>
    setTasks((cur) => persist(cur.filter((x) => x.id !== id)));
  return { tasks, save, remove };
}
