// Role permissions. The selection is stored per role in a dedicated, versioned localStorage key.
// Replace load/save with API calls later; the page only uses these functions.
const KEY = "crm.permissions.v1";

// Default (seed) role. Role records themselves now live in data/team.js.
export const ROLE = {
  id: "sales",
  name: "مسؤول مبيعات",
  description: "يدير العملاء المحتملين وعلاقات العملاء ومواعيد المبيعات",
};

// [id, label, enabled by default]
const p = (group, rows) =>
  rows.map(([key, label, on = false]) => ({
    id: `${group}.${key}`,
    label,
    on,
  }));

export const GROUPS = [
  {
    id: "dashboard",
    title: "لوحة التحكم",
    permissions: p("dashboard", [["view", "عرض لوحة التحكم", true]]),
  },
  {
    id: "deals",
    title: "الصفقات",
    permissions: p("deals", [
      ["all", "عرض جميع الصفقات"],
      ["mine", "عرض الصفقات المعيّنة لي فقط", true],
      ["details", "عرض تفاصيل الصفقة", true],
      ["create", "إنشاء صفقة", true],
      ["edit", "تعديل الصفقة", true],
      ["delete", "حذف الصفقة"],
      ["trash", "نقل الصفقة إلى سلة المحذوفات"],
      ["restore", "استعادة الصفقة"],
      ["purge", "الحذف النهائي للصفقة"],
      ["download", "تنزيل الصفقات"],
      ["commissions", "عرض العمولات", true],
    ]),
  },
  {
    id: "customers",
    title: "العملاء",
    permissions: p("customers", [
      ["all", "عرض جميع العملاء"],
      ["restrict", "حصر ظهور العملاء على المعيّنين لي أو الذين أنشأتهم", true],
      ["details", "عرض تفاصيل العميل", true],
      ["add", "إضافة عملاء", true],
      ["editAll", "تعديل بيانات جميع العملاء"],
      ["editStatus", "تعديل حالة العميل والملاحظات وسجل التواصل", true],
      ["assign", "تعيين العميل لعضو في الفريق"],
      ["trash", "نقل العملاء إلى سلة المحذوفات"],
      ["restore", "استعادة العملاء المحذوفين"],
      ["purge", "الحذف النهائي للعملاء"],
      ["export", "تصدير بيانات العملاء"],
      ["import", "استيراد العملاء"],
    ]),
  },
  {
    id: "leads",
    title: "العملاء المحتملون",
    permissions: p("leads", [
      ["all", "عرض جميع العملاء المحتملين"],
      [
        "restrict",
        "حصر ظهور العملاء المحتملين على المعيّنين لي أو الذين أنشأتهم",
        true,
      ],
      ["details", "عرض تفاصيل العميل المحتمل", true],
      ["add", "إضافة عملاء محتملين", true],
      ["edit", "تعديل العملاء المحتملين", true],
      ["assign", "تعيين عميل محتمل لعضو في الفريق", true],
      ["convert", "تحويل العملاء المحتملين إلى عملاء", true],
      ["trash", "نقل العملاء المحتملين إلى سلة المحذوفات"],
      ["restore", "استعادة العملاء المحتملين"],
      ["purge", "الحذف النهائي للعملاء المحتملين"],
      ["export", "تصدير العملاء المحتملين"],
      ["import", "استيراد العملاء المحتملين"],
    ]),
  },
];

export const ALL_IDS = GROUPS.flatMap((g) => g.permissions.map((x) => x.id));
export const DEFAULT_SELECTION = GROUPS.flatMap((g) =>
  g.permissions.filter((x) => x.on).map((x) => x.id),
);

// Starting selection for a role that has never been saved.
const DEFAULTS_BY_ROLE = {
  [ROLE.id]: DEFAULT_SELECTION,
  accountant: [
    "dashboard.view",
    "deals.all",
    "deals.details",
    "deals.commissions",
    "customers.details",
  ],
  owner: ALL_IDS,
};
export const defaultsFor = (roleId) =>
  DEFAULTS_BY_ROLE[roleId] ?? ["dashboard.view"];

export function loadPermissions(roleId = ROLE.id) {
  try {
    const all = JSON.parse(localStorage.getItem(KEY)) || {};
    if (Array.isArray(all[roleId]))
      return all[roleId].filter((id) => ALL_IDS.includes(id));
  } catch {
    /* fall back to defaults */
  }
  return defaultsFor(roleId);
}

// Only touches the given role's entry; other roles are never overwritten.
export function savePermissions(ids, roleId = ROLE.id) {
  try {
    const all = JSON.parse(localStorage.getItem(KEY)) || {};
    localStorage.setItem(KEY, JSON.stringify({ ...all, [roleId]: ids }));
  } catch {
    /* ignore */
  }
  return ids;
}

export function deletePermissions(roleId) {
  try {
    const all = JSON.parse(localStorage.getItem(KEY)) || {};
    delete all[roleId];
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}
