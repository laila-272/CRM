// Mock employee data kept in module state + localStorage, shared by the list and profile pages.
// Requires React 18 (useSyncExternalStore).
import { useSyncExternalStore } from "react";

const KEY = "crm-employees-v1";
const pad = (n) => String(n).padStart(2, "0");
export const DEPTS = [
  "المبيعات",
  "خدمة العملاء",
  "المالية",
  "التسويق",
  "الموارد البشرية",
];
export const STATUS = {
  active: "نشط",
  leave: "في إجازة",
  new: "جديد",
  ended: "منتهي الخدمة",
};
export const TYPES = ["دوام كامل", "دوام جزئي", "عقد محدد المدة"];
const TITLES = {
  المبيعات: ["مدير مبيعات", "مسؤول مبيعات", "مستشار مبيعات"],
  "خدمة العملاء": ["أخصائي دعم", "مشرف خدمة عملاء"],
  المالية: ["محاسب", "محاسب أول"],
  التسويق: ["أخصائي تسويق", "مدير حملات"],
  "الموارد البشرية": ["أخصائي موارد بشرية", "مسؤول توظيف"],
};
const MANAGERS = {
  المبيعات: "سارة محمود",
  "خدمة العملاء": "منى فتحي",
  المالية: "عادل سالم",
  التسويق: "ليلى شاكر",
  "الموارد البشرية": "ياسر صالح",
};
const FN = [
  ["عمر", "omar"],
  ["ليلى", "laila"],
  ["يوسف", "youssef"],
  ["منى", "mona"],
  ["طارق", "tarek"],
  ["دينا", "dina"],
  ["حسن", "hassan"],
  ["رنا", "rana"],
  ["كريم", "karim"],
  ["آية", "aya"],
  ["إسلام", "islam"],
  ["مريم", "mariam"],
  ["ياسر", "yasser"],
  ["سلمى", "salma"],
];
const LN = [
  ["سالم", "salem"],
  ["فتحي", "fathy"],
  ["عبدالله", "abdallah"],
  ["نصر", "nasr"],
  ["شاكر", "shaker"],
  ["رضوان", "radwan"],
  ["صالح", "saleh"],
];

function build(b, i) {
  const base = 12000 + (i % 9) * 1500;
  const dept = b.dept || DEPTS[0];
  return {
    nationalId: String(29000000000000 + i * 7919 + 1011234),
    phone: `+20 100 123 ${4567 + i}`,
    gender: i % 2 ? "أنثى" : "ذكر",
    birth: `${1985 + (i % 12)}-${pad(1 + (i % 12))}-${pad(1 + ((i * 3) % 28))}`,
    marital: i % 2 ? "أعزب" : "متزوج",
    nationality: "مصري",
    address: "القاهرة، مصر",
    emergency: "محمود علي - 8899 555 0101",
    manager: MANAGERS[dept],
    type: TYPES[0],
    location: "المقر الرئيسي — القاهرة",
    baseSalary: base,
    allowances: Math.round((base * 0.14) / 100) * 100,
    deductions: Math.round((base * 0.07) / 100) * 100,
    leave: { annual: 14 - (i % 6), sick: 8, casual: 4 },
    att: {
      present: 21 - (i % 3),
      absent: i % 3 === 2 ? 1 : 0,
      late: i % 4,
      overtime: (i % 5) * 2,
    },
    ...b,
  };
}

function seed() {
  const first = [
    {
      id: "EMP-0142",
      name: "أحمد علي",
      email: "ahmed.ali@company.com",
      dept: "المبيعات",
      title: "مدير مبيعات",
      hired: "2022-01-03",
      status: "active",
      nationalId: "29001011234567",
      birth: "1990-01-01",
      marital: "متزوج",
      phone: "+20 100 123 4567",
      baseSalary: 18000,
      allowances: 2500,
      deductions: 1200,
      leave: { annual: 14, sick: 8, casual: 4 },
      att: { present: 21, absent: 1, late: 2, overtime: 6 },
    },
    {
      id: "EMP-0141",
      name: "سارة محمود",
      email: "sara.m@company.com",
      dept: "المبيعات",
      title: "مسؤول مبيعات",
      hired: "2023-06-15",
      status: "active",
      gender: "أنثى",
    },
    {
      id: "EMP-0140",
      name: "محمد حسين",
      email: "m.hassan@company.com",
      dept: "خدمة العملاء",
      title: "أخصائي دعم",
      hired: "2023-09-22",
      status: "leave",
    },
    {
      id: "EMP-0139",
      name: "نور الدين",
      email: "nour@company.com",
      dept: "المالية",
      title: "محاسب",
      hired: "2021-02-01",
      status: "active",
    },
    {
      id: "EMP-0138",
      name: "هبة إبراهيم",
      email: "heba@company.com",
      dept: "التسويق",
      title: "أخصائي تسويق",
      hired: "2026-10-05",
      status: "new",
      gender: "أنثى",
    },
    {
      id: "EMP-0137",
      name: "خالد منصور",
      email: "khaled@company.com",
      dept: "الموارد البشرية",
      title: "أخصائي موارد بشرية",
      hired: "2020-03-12",
      status: "ended",
    },
  ].map((b, i) => build(b, i));
  const leave = [4, 13, 22],
    ended = [38],
    fresh = [1, 9, 19, 27, 35];
  const rest = Array.from({ length: 42 }, (_, i) => {
    const [fa, fe] = FN[i % 14],
      [la, le] = LN[(i * 3) % 7],
      dept = DEPTS[i % 5];
    const status = leave.includes(i)
      ? "leave"
      : ended.includes(i)
        ? "ended"
        : fresh.includes(i)
          ? "new"
          : "active";
    const hired =
      status === "new"
        ? `2026-10-${pad(1 + (i % 28))}`
        : `${2019 + (i % 6)}-${pad(1 + (i % 12))}-${pad(1 + ((i * 7) % 28))}`;
    return build(
      {
        id: `EMP-${String(90 + i).padStart(4, "0")}`,
        name: `${fa} ${la}`,
        email: `${fe}.${le}@company.com`,
        dept,
        title: TITLES[dept][i % TITLES[dept].length],
        hired,
        status,
      },
      i + 6,
    );
  });
  return [...first, ...rest];
}

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (Array.isArray(s) && s.length) return s;
  } catch {
    /* ignore */
  }
  return seed();
}
let state = load();
const subs = new Set();
const commit = (next) => {
  state = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
  subs.forEach((f) => f());
};

export const employeesApi = {
  add(e) {
    const n = Math.max(0, ...state.map((x) => parseInt(x.id.slice(4), 10))) + 1;
    const id = `EMP-${String(n).padStart(4, "0")}`;
    commit([build({ ...e, id }, state.length), ...state]);
    return id;
  },
  update(id, patch) {
    commit(state.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  },
  remove(id) {
    commit(state.filter((e) => e.id !== id));
  },
};
export const useEmployees = () =>
  useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => state,
  );
