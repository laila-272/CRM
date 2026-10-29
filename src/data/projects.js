import { useState } from "react";
import { todayIso, addDays } from "./Tasks.js";

// Projects + execution tasks + settings. One source of truth for all project pages.
// Persisted in dedicated, versioned localStorage keys. Replace load/persist with API calls later.
// NOTE: kept separate from data/tasks.js on purpose: that module is CRM follow-ups (calls / visits),
// while these are project execution tasks (project, stage, assignee, kanban status, timeline dates).
const KEY = "crm.projects.v1";
const SETTINGS_KEY = "crm.projects.settings.v1";

export const PRIORITIES = ["عاجلة", "عالية", "متوسطة", "منخفضة"];
export const PRIORITY_CLS = {
  عاجلة: "bg-red-50 text-red-500",
  عالية: "bg-orange-50 text-orange-600",
  متوسطة: "bg-blue-50 text-blue-600",
  منخفضة: "bg-neutral-100 text-neutral-500",
};
// export const STAGE = ["التنفيذ", "التخطيط", "الاختبار", "مكتمل"];
export const TASK_STATUSES = ["جديدة", "قيد التنفيذ", "مراجعة", "مكتملة"];
export const TASK_TYPES = ["تطوير", "تصميم", "مراجعة", "اجتماع"];
export const PROJECT_STATUSES = ["جاري", "مكتمل", "متوقف"];
export const PSTATUS_CLS = {
  جاري: "bg-blue-50 text-blue-600",
  متأخر: "bg-red-50 text-red-500",
  مكتمل: "bg-green-50 text-green-600",
  متوقف: "bg-neutral-100 text-neutral-500",
};
export const OWNERS = ["سارة طارق", "فهد القحطاني", "ريم السالم", "أحمد سمير"];
export const CLIENTS = [
  "شركة آفاق التقنية",
  "مجموعة النخبة",
  "منصور للاستثمار",
  "شركة نماء للبرمجيات",
  "رضوان للأغذية",
  "العطار للتصميم",
  "الشامي العقارية",
  "مجموعة الجندي",
  "إبراهيم وشركاه",
];

/* ---------- helpers ---------- */
export const projectStatusOf = (p) =>
  p.status === "جاري" && p.due < todayIso() ? "متأخر" : p.status;
export const taskOverdue = (t) => t.status !== "مكتملة" && t.due < todayIso();
export const progressOf = (p, tasks) => {
  const mine = tasks.filter((t) => t.projectId === p.id);
  if (!mine.length) return p.status === "مكتمل" ? 100 : 0;
  return Math.round(
    (mine.filter((t) => t.status === "مكتملة").length / mine.length) * 100,
  );
};
export const daysBetween = (a, b) => {
  const u = (s) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((u(b) - u(a)) / 864e5);
};
export const money = (n) => `${Number(n).toLocaleString("en-US")} ج.م`;

/* ---------- seed ---------- */
const DEFAULT_STAGES = ["التحليل", "التصميم", "التنفيذ", "الاختبار", "التسليم"];
const NAMES = [
  "تطوير موقع الشركة",
  "تطبيق خدمة العملاء",
  "لوحة متابعة المبيعات",
  "ترخيص نظام إدارة العملاء",
  "منصة الحجز الإلكتروني",
  "نظام الفواتير",
  "بوابة الموظفين",
  "حملة إطلاق مشروع النور",
  "تحديث الهوية البصرية",
  "نظام المخزون",
  "تكامل واتساب للأعمال",
  "تقارير الأداء الشهرية",
  "مركز المساعدة",
  "لوحة تحكم الوسطاء",
  "ربط بوابة الدفع",
  "أرشفة العقود",
  "نظام الحضور والانصراف",
  "منصة التدريب الداخلي",
  "تطبيق المعاينات الميدانية",
  "نظام تقييم الأداء",
  "بوابة العملاء",
  "إعادة تصميم النماذج",
  "نظام الصيانة",
  "خريطة المشاريع التفاعلية",
];
const TITLES = [
  "جمع المتطلبات",
  "تصميم الشاشات",
  "تطوير الواجهة",
  "تطوير الخادم",
  "ربط قاعدة البيانات",
  "اختبار القبول",
  "مراجعة الأمان",
  "تدريب الفريق",
  "إعداد البيانات",
  "تجهيز الإطلاق",
  "كتابة التوثيق",
  "اجتماع التسليم",
];

function seed() {
  const today = todayIso();
  const projects = NAMES.map((name, i) => {
    const late = i < 3;
    const done = i >= 14;
    const due =
      name === "ترخيص نظام إدارة العملاء"
        ? "2026-12-15"
        : late
          ? addDays(today, -(5 + i * 3))
          : done
            ? addDays(today, -(10 + i))
            : addDays(today, 12 + i * 4);
    const status = done ? "مكتمل" : "جاري";
    const stageIndex = done
      ? DEFAULT_STAGES.length - 1
      : late
        ? 2 + (i % 2)
        : 1 + (i % 3);
    const value =
      name === "ترخيص نظام إدارة العملاء"
        ? 450000
        : 80000 + ((i * 37) % 11) * 45000;
    return {
      id: `p${i + 1}`,
      code: `PRJ-${1001 + i}`,
      name,
      client: CLIENTS[i % CLIENTS.length],
      owner: OWNERS[i % OWNERS.length],
      status,
      priority: PRIORITIES[i % 4],
      start: addDays(due, -90),
      due,
      value,
      description: `مشروع «${name}» لصالح ${CLIENTS[i % CLIENTS.length]} يشمل التحليل والتصميم والتنفيذ والتسليم.`,
      stages: DEFAULT_STAGES,
      stageIndex,
      payments: [
        { label: "الدفعة الأولى — عند التعاقد", percent: 30, paid: true },
        {
          label: "الدفعة الثانية — منتصف التنفيذ",
          percent: 40,
          paid: done || stageIndex >= 2,
        },
        { label: "الدفعة الأخيرة — عند التسليم", percent: 30, paid: done },
      ],
    };
  });

  const tasks = [];
  projects.forEach((p, i) => {
    const n = 3 + (i % 4);
    const doneCount =
      p.status === "مكتمل"
        ? n
        : Math.floor((n * (p.stageIndex + 1)) / (DEFAULT_STAGES.length + 1));
    for (let k = 0; k < n; k++) {
      const status =
        k < doneCount
          ? "مكتملة"
          : ["قيد التنفيذ", "قيد التنفيذ", "مراجعة", "جديدة"][(k + i) % 4];
      const due = addDays(p.due, -(n - 1 - k) * 4);
      tasks.push({
        id: `t${i + 1}-${k + 1}`,
        projectId: p.id,
        title: TITLES[(i + k * 5) % TITLES.length],
        type: TASK_TYPES[(i + k) % 4],
        status,
        priority: PRIORITIES[(i + k) % 4],
        owner: OWNERS[(i + k) % OWNERS.length],
        stage: DEFAULT_STAGES[Math.min(k, DEFAULT_STAGES.length - 1)],
        start: addDays(due, -5),
        due,
        notes: "",
      });
    }
  });
  return { projects, tasks };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* fall back to seed */
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

export function useProjects() {
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
    projects: data.projects,
    tasks: data.tasks,
    saveProject: upsert("projects"),
    // when "auto-complete" is enabled in settings, finishing the last open task completes the project
    saveTask: (task) =>
      setData((cur) => {
        const tasks = cur.tasks.some((x) => x.id === task.id)
          ? cur.tasks.map((x) => (x.id === task.id ? task : x))
          : [task, ...cur.tasks];
        let projects = cur.projects;
        if (
          loadProjectSettings().autoCompleteWhenAllDone &&
          tasks
            .filter((t) => t.projectId === task.projectId)
            .every((t) => t.status === "مكتملة")
        ) {
          projects = projects.map((p) =>
            p.id === task.projectId && p.status === "جاري"
              ? { ...p, status: "مكتمل", stageIndex: p.stages.length - 1 }
              : p,
          );
        }
        return persist({ projects, tasks });
      }),
    removeTask: (id) =>
      setData((cur) =>
        persist({ ...cur, tasks: cur.tasks.filter((t) => t.id !== id) }),
      ),
    // removing a project also removes its tasks
    removeProject: (id) =>
      setData((cur) =>
        persist({
          projects: cur.projects.filter((p) => p.id !== id),
          tasks: cur.tasks.filter((t) => t.projectId !== id),
        }),
      ),
  };
}

export const nextProjectCode = (projects) =>
  `PRJ-${Math.max(1000, ...projects.map((p) => Number(p.code.split("-")[1]) || 0)) + 1}`;

/* ---------- settings ---------- */
const defaultSettings = () => ({
  defaultPriority: "متوسطة",
  reminderDays: 3,
  notifyDue: true,
  notifyLate: true,
  blockCloseWithOpenTasks: true,
  autoCompleteWhenAllDone: false,
  stages: DEFAULT_STAGES.map((name, i) => ({ id: `st${i + 1}`, name })),
});

export function loadProjectSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaultSettings(), ...JSON.parse(raw) };
  } catch {
    /* defaults */
  }
  return defaultSettings();
}
export function saveProjectSettings(s) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
  return s;
}
