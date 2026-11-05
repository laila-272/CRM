// Shared source of truth for the Team module (users + roles).
// Permissions per role live separately in data/Permissions.js.
// Everything goes through the functions below, so swapping localStorage for an API later
// only means changing this file (components never touch localStorage directly).
import { useSyncExternalStore } from "react";
import { ROLE as SALES_ROLE, deletePermissions } from "./Permissions.js";

const USERS_KEY = "crm.team.users.v1";
const ROLES_KEY = "crm.team.roles.v1";
const HOUR = 36e5;
const DAY = 24 * HOUR;
const ago = (ms) => new Date(Date.now() - ms).toISOString();

const seedRoles = () => [
  {
    id: SALES_ROLE.id,
    name: SALES_ROLE.name,
    description: SALES_ROLE.description,
  },
  {
    id: "accountant",
    name: "محاسب",
    description: "يدير الفواتير والقيود ومصروفات الشركة",
  },
  {
    id: "owner",
    name: "المالك",
    description: "مالك الشركة — صلاحيات كاملة",
    locked: true,
  },
];

const seedUsers = () => [
  {
    id: "u1",
    name: "نورة العتيبي",
    email: "noura@company.com",
    phone: "01012345678",
    roleId: "owner",
    status: "active",
    lastLogin: ago(HOUR),
    createdAt: ago(200 * DAY),
  },
  {
    id: "u2",
    name: "سارة أحمد",
    email: "sara@company.com",
    phone: "01023456789",
    roleId: "sales",
    status: "active",
    lastLogin: ago(4 * HOUR),
    createdAt: ago(3 * DAY),
  },
  {
    id: "u3",
    name: "خالد المنصوري",
    email: "khaled@company.com",
    phone: "01034567890",
    roleId: "sales",
    status: "active",
    lastLogin: ago(DAY + HOUR),
    createdAt: ago(90 * DAY),
  },
  {
    id: "u4",
    name: "فهد الدوسري",
    email: "fahad@company.com",
    phone: "01045678901",
    roleId: "accountant",
    status: "active",
    lastLogin: ago(26 * DAY),
    createdAt: ago(120 * DAY),
  },
  {
    id: "u5",
    name: "هبة إبراهيم",
    email: "heba@company.com",
    phone: "01056789012",
    roleId: "sales",
    status: "suspended",
    lastLogin: null,
    createdAt: ago(60 * DAY),
  },
  {
    id: "u6",
    name: "محمد حسن",
    email: "m.hassan@company.com",
    phone: "01067890123",
    roleId: "accountant",
    status: "invited",
    lastLogin: ago(34 * DAY),
    createdAt: ago(45 * DAY),
  },
];

function read(key, seed) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    if (Array.isArray(v) && v.length) return v;
  } catch {
    /* use seed */
  }
  const s = seed();
  try {
    localStorage.setItem(key, JSON.stringify(s));
  } catch {
    /* ignore */
  }
  return s;
}

let state = {
  users: read(USERS_KEY, seedUsers),
  roles: read(ROLES_KEY, seedRoles),
};
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

function commit(patch) {
  state = { ...state, ...patch };
  try {
    if (patch.users)
      localStorage.setItem(USERS_KEY, JSON.stringify(state.users));
    if (patch.roles)
      localStorage.setItem(ROLES_KEY, JSON.stringify(state.roles));
  } catch {
    /* ignore */
  }
  emit();
}

// Keep several tabs in sync.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== USERS_KEY && e.key !== ROLES_KEY) return;
    state = {
      users: read(USERS_KEY, seedUsers),
      roles: read(ROLES_KEY, seedRoles),
    };
    emit();
  });
}

const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const snapshot = () => state;

/** React hook: { users, roles } — re-renders on every change. */
export const useTeam = () => useSyncExternalStore(subscribe, snapshot);

const uid = (p) =>
  `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/* ---------- users ---------- */
export const STATUS = {
  active: { label: "نشط", cls: "bg-neutral-100 text-ink" },
  invited: { label: "مدعو", cls: "bg-red-50 text-red-500" },
  suspended: { label: "معلّق", cls: "bg-neutral-100 text-neutral-500" },
};

export function addUser(data) {
  const user = {
    ...data,
    id: uid("u"),
    lastLogin: null,
    createdAt: new Date().toISOString(),
  };
  commit({ users: [user, ...state.users] });
  return user;
}
export const updateUser = (id, data) =>
  commit({
    users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
  });
export const removeUser = (id) =>
  commit({ users: state.users.filter((u) => u.id !== id) });
export const toggleUserActive = (id) =>
  commit({
    users: state.users.map((u) =>
      u.id === id
        ? { ...u, status: u.status === "suspended" ? "active" : "suspended" }
        : u,
    ),
  });
export const emailTaken = (email, exceptId) =>
  state.users.some(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.id !== exceptId,
  );

/* ---------- roles ---------- */
export const addRole = ({ name, description }) => {
  const role = { id: uid("role"), name, description };
  commit({ roles: [...state.roles, role] });
  return role;
};
export const updateRole = (id, data) =>
  commit({
    roles: state.roles.map((r) => (r.id === id ? { ...r, ...data } : r)),
  });

/** Returns false (and does nothing) while users are still assigned to the role. */
export function removeRole(id) {
  if (state.users.some((u) => u.roleId === id)) return false;
  commit({ roles: state.roles.filter((r) => r.id !== id) });
  deletePermissions(id);
  return true;
}

/* ---------- derived helpers ---------- */
/** Every account assigned to the role (any status) — same rule on every page. */
export const countByRole = (users, roleId) =>
  users.filter((u) => u.roleId === roleId).length;

export function memberCountLabel(n) {
  if (n === 0) return "لا يوجد أعضاء";
  if (n === 1) return "عضو واحد";
  if (n === 2) return "عضوان";
  return n <= 10 ? `${n} أعضاء` : `${n} عضو`;
}

const MONTHS = [
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
export function formatLastLogin(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const day = (x) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((day(now) - day(d)) / DAY);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  if (diff === 0) return `اليوم ${hh}:${mm}`;
  if (diff === 1) return "أمس";
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
