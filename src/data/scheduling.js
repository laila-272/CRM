import { useState } from "react";
import { todayIso, addDays, MONTHS } from "./tasks.js";

// Scheduling (appointments / reservations / resources). One source of truth shared by all scheduling pages.
// Persisted in dedicated, versioned localStorage keys. Replace load/persist with API calls later.
const KEY = "crm.scheduling.v1";
const SETTINGS_KEY = "crm.scheduling.settings.v1";

export const DAYS = [
  "السبت",
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
];
export const APPT_TYPES = ["معاينة", "اجتماع", "استشارة", "مكالمة"];
export const APPT_STATUSES = ["مؤكد", "بانتظار التأكيد", "مكتمل", "ملغي"];
export const STATUS_CLS = {
  مؤكد: "bg-green-50 text-green-600",
  "بانتظار التأكيد": "bg-orange-50 text-orange-600",
  مكتمل: "bg-neutral-100 text-neutral-600",
  ملغي: "bg-red-50 text-red-500",
};
export const BLOCK_CLS = {
  مؤكد: "bg-green-50 border-green-600 text-green-900",
  "بانتظار التأكيد": "bg-orange-50 border-orange-500 text-orange-900",
  مكتمل: "bg-neutral-100 border-neutral-400 text-neutral-700",
  ملغي: "bg-red-50 border-red-500 text-red-800 opacity-70",
};
export const RES_STATUSES = ["متاح", "مشغول", "غير متاح"];
export const RES_STATUS_CLS = {
  متاح: "bg-green-50 text-green-600",
  مشغول: "bg-orange-50 text-orange-600",
  "غير متاح": "bg-neutral-100 text-neutral-500",
};
export const RES_TYPES = ["فرد", "مكان"];
export const DURATIONS = [15, 30, 45, 60, 90, 120];
export const REMINDERS = [
  "بدون تذكير",
  "قبل الموعد بـ 30 دقيقة",
  "قبل الموعد بساعة",
  "قبل الموعد بيوم",
];
export const OWNERS = [
  "محمد العمري",
  "سارة طارق",
  "فهد القحطاني",
  "ريم السالم",
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
  "كريم الشامي",
];

/* ---------- helpers ---------- */
export const toMin = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
export const toTime = (m) =>
  `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
export const dayOfWeek = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
};
export const dayLabel = (iso) => {
  const [, m, d] = iso.split("-").map(Number);
  return `${DAYS[dayOfWeek(iso)]} ${d} ${MONTHS[m - 1]}`;
};
export const weekStart = (iso) => addDays(iso, -dayOfWeek(iso)); // weeks start on Sunday
export const endTime = (a) => toTime(toMin(a.time) + a.duration);
export const isActive = (a) => a.status !== "ملغي";
export const overlaps = (a, b) =>
  a.date === b.date &&
  a.resourceId === b.resourceId &&
  toMin(a.time) < toMin(b.time) + b.duration &&
  toMin(b.time) < toMin(a.time) + a.duration;
export const initialOf = (name) => name.replace(/^(د\.|م\.)\s*/, "")[0] || "؟";

export function occupancy(r, date, appts) {
  if (!r.workDays.includes(dayOfWeek(date))) return 0;
  const total = toMin(r.to) - toMin(r.from);
  const used = appts
    .filter((a) => a.resourceId === r.id && a.date === date && isActive(a))
    .reduce((s, a) => s + a.duration, 0);
  return Math.min(100, Math.round((used / total) * 100));
}

export function freeSlots(r, date, appts) {
  if (!r.workDays.includes(dayOfWeek(date)) || r.status === "غير متاح")
    return [];
  const out = [];
  for (let m = toMin(r.from); m + r.slot <= toMin(r.to); m += r.slot) {
    const probe = { date, resourceId: r.id, time: toTime(m), duration: r.slot };
    if (!appts.some((a) => isActive(a) && overlaps(a, probe)))
      out.push(toTime(m));
  }
  return out;
}

/* ---------- seed ---------- */
const RESOURCES = [
  [
    "r1",
    "د. منى سعيد",
    "طبيبة",
    "شخص",
    "متاح الآن",
    "01012345601",
    [0, 1, 2, 3, 4],
    "09:00",
    "17:00",
    30,
    "75%",
    ["كشف أولى", "متابعة"], // الخدمات أو التصنيفات الخاصة به
  ],
  [
    "r2",
    "ريم أحمد",
    "أخصائية تجميل",
    "شخص",
    "مشغولة",
    "01012345602",
    [0, 1, 2, 3, 4],
    "09:00",
    "17:00",
    60,
    "90%",
    ["قص وتصفيف", "صبغة"], // الخدمات الخاصة بها
  ],
  [
    "r3",
    "محمد العمري",
    "مستشار",
    "شخص",
    "إجازة",
    "01012345603",
    [0, 1, 2, 3, 4],
    "10:00",
    "18:00",
    30,
    "-",
    ["جلسة استشارة"], // الخدمات الخاصة به
  ],
  [
    "r4",
    "قاعة الاجتماعات A",
    "سعة 12 فرداً",
    "مكان",
    "متاحة الآن",
    "",
    [0, 1, 2, 3, 4],
    "09:00",
    "17:00",
    60,
    "40%",
    ["اجتماع", "تدريب"], // الخدمات أو الأغراض للقاعة
  ],
  [
    "r5",
    "مشروع النور - A",
    "وحدة للمعاينة",
    "مكان",
    "متاحة",
    "01012345605",
    [0, 1, 2, 3, 4, 5, 6],
    "10:00",
    "18:00",
    60,
    "55%",
    ["معاينة"], // الخدمات أو الغرض
  ],
  [
    "r6",
    "جهاز عرض متنقل",
    "2 قطعة",
    "ممكة",
    "متاح",
    "",
    [0, 1, 2, 3, 4, 6],
    "10:00",
    "16:00",
    60,
    "20%",
    ["إعارة"], // الغرض أو الخدمة
  ],

].map(([id, name, role, type, status, phone, workDays, from, to, slot,percentage,job]) => ({
  id,
  name,
  role,
  type,
  status,
  phone,
  email: "",
  workDays,
  from,
  to,
  slot,
  notes: "",
  percentage,
  job
}));

// time, duration, resource index, customer index, type, status, amount
const TODAY = [
  ["09:00", 60, 0, 0, "اجتماع", "مؤكد", 500],
  ["10:30", 30, 0, 1, "استشارة", "مؤكد", 0],
  ["13:00", 60, 0, 2, "اجتماع", "بانتظار التأكيد", 500],
  ["15:00", 30, 0, 3, "مكالمة", "مؤكد", 0],
  ["09:30", 60, 1, 4, "معاينة", "مؤكد", 1000],
  ["11:30", 60, 1, 5, "معاينة", "مؤكد", 1000],
  ["14:00", 60, 1, 6, "معاينة", "بانتظار التأكيد", 1000],
  ["10:00", 30, 2, 7, "استشارة", "مؤكد", 0],
  ["12:00", 60, 2, 8, "اجتماع", "مؤكد", 500],
  ["16:00", 30, 2, 0, "مكالمة", "بانتظار التأكيد", 0],
  ["11:00", 90, 3, 1, "اجتماع", "مؤكد", 0],
  ["14:00", 60, 3, 2, "اجتماع", "مؤكد", 0],
  ["10:00", 60, 4, 3, "معاينة", "بانتظار التأكيد", 750],
  ["13:00", 60, 4, 4, "معاينة", "ملغي", 750],
];
// day offset, time, duration, resource index, customer index, type
const OTHER = [
  [-3, "10:00", 60, 0, 5, "اجتماع"],
  [-2, "11:00", 60, 1, 6, "معاينة"],
  [-1, "12:00", 30, 2, 7, "استشارة"],
  [-1, "13:00", 60, 3, 8, "اجتماع"],
  [1, "09:30", 60, 4, 0, "معاينة"],
  [1, "10:00", 30, 0, 1, "استشارة"],
  [2, "11:00", 60, 1, 2, "معاينة"],
  [2, "14:00", 30, 2, 3, "مكالمة"],
  [3, "10:30", 60, 3, 4, "اجتماع"],
  [3, "12:00", 60, 4, 5, "معاينة"],
  [4, "09:00", 30, 0, 6, "استشارة"],
  [5, "15:00", 60, 1, 7, "معاينة"],
];

function seed() {
  const today = todayIso();
  const mk = (id, date, time, duration, ri, ci, type, status, amount) => ({
    id,
    title: `${type} مع ${CUSTOMERS[ci]}`,
    customer: CUSTOMERS[ci],
    type,
    resourceId: RESOURCES[ri].id,
    date,
    time,
    duration,
    owner: OWNERS[(id + ri) % OWNERS.length],
    status,
    reminder: REMINDERS[1],
    amount,
    notes: "",
  });
  const appointments = [
    ...TODAY.map((r, i) =>
      mk(i + 1, today, r[0], r[1], r[2], r[3], r[4], r[5], r[6]),
    ),
    ...OTHER.map((r, i) =>
      mk(
        100 + i,
        addDays(today, r[0]),
        r[1],
        r[2],
        r[3],
        r[4],
        r[5],
        r[0] < 0
          ? i % 4 === 1
            ? "ملغي"
            : "مكتمل"
          : i % 3
            ? "مؤكد"
            : "بانتظار التأكيد",
        r[5] === "معاينة" ? 1000 : 0,
      ),
    ),
  ];
  return { resources: RESOURCES, appointments };
}


function load() {
  try {
    const raw = localStorage.getItem(KEY);

    if (raw) {
      const data = JSON.parse(raw);

      // Add job to old resources without deleting saved data
      const updatedResources = data.resources.map((resource) => {
        const original = RESOURCES.find((r) => r.id === resource.id);

        return {
          ...resource,
          job: resource.job ?? original?.job ?? [],
        };
      });

      const updatedData = {
        ...data,
        resources: updatedResources,
      };

      localStorage.setItem(KEY, JSON.stringify(updatedData));

      return updatedData;
    }
  } catch {
    // Fall back to seed
  }

  return seed();
}

function persist(next) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

export function useScheduling() {
  const [data, setData] = useState(load);
  const upsert = (key) => (item) =>
    setData((cur) =>
      persist({
        ...cur,
        [key]: cur[key].some((x) => x.id === item.id)
          ? cur[key].map((x) => (x.id === item.id ? item : x))
          : [item, ...cur[key]],
      }),
    );
  return {
    resources: data.resources,
    appointments: data.appointments,
    saveResource: upsert("resources"),
    saveAppointment: upsert("appointments"),
    removeAppointment: (id) =>
      setData((cur) =>
        persist({
          ...cur,
          appointments: cur.appointments.filter((a) => a.id !== id),
        }),
      ),
    // removing a resource also removes its appointments
    removeResource: (id) =>
      setData((cur) =>
        persist({
          resources: cur.resources.filter((r) => r.id !== id),
          appointments: cur.appointments.filter((a) => a.resourceId !== id),
        }),
      ),
  };
}

/* ---------- settings ---------- */
const defaultSettings = () => ({
  duration: 30,
  buffer: 0,
  maxAdvanceDays: 60,
  minNoticeHours: 2,
  hours: Object.fromEntries(
    DAYS.map((_, i) => [i, { on: i <= 4, from: "09:00", to: "17:00" }]),
  ),
  rules: {
    autoConfirm: false,
    allowCancel: true,
    preventOverlap: true,
    waitlist: false,
  },
  notifications: {
    remindCustomer: true,
    notifyOwner: true,
    dailySummary: false,
  },
  payment: { requireDeposit: true, depositPercent: 20, refundOnCancel: false },
});

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaultSettings(), ...JSON.parse(raw) };
  } catch {
    /* defaults */
  }
  return defaultSettings();
}
export function saveSettings(s) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
  return s;
}
