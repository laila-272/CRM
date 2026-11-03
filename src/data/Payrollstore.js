// src/data/Payrollstore.js
// Payroll records per (period, employee). Defaults are derived from the employees store;
// only edited / paid records are stored as overrides (module state + localStorage).
import { useSyncExternalStore } from "react";

const KEY = "crm-payroll-v1";
export const CURRENT = "2026-10";
export const YEARS = [2026, 2025];
export const METHODS = ["تحويل بنكي", "نقداً", "شيك"];
export const COMM_TYPES = {
  percent: "نسبة من قيمة الصفقة",
  fixed: "مبلغ ثابت لكل صفقة",
};
export const COMM_APPLIES = {
  closed: "الصفقات المغلقة فقط",
  all: "جميع الصفقات",
};

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
export const periodLabel = (p) => {
  const [y, m] = p.split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
};
/** The 4 latest months of a year, newest first. */
export const periodsFor = (year) => {
  const last = year === 2026 ? 10 : 12;
  return Array.from(
    { length: 4 },
    (_, i) => `${year}-${String(last - i).padStart(2, "0")}`,
  );
};
export const money = (n) => `${Number(n || 0).toLocaleString("en-US")} ج.م`;
export const dmy = (iso) => (iso ? iso.split("-").reverse().join("/") : "—");
export const uid = () => Math.random().toString(36).slice(2, 9);
export const newItem = (label = "", amount = 0, note = "") => ({
  id: uid(),
  label,
  amount,
  note,
});

export function defaultRecord(emp, period) {
  const n = parseInt(emp.id.slice(4), 10);
  const a = emp.allowances || 0;
  const d = emp.deductions || 0;
  const transport = Math.round((a * 0.6) / 100) * 100;
  const insurance = Math.round((d * 0.6) / 10) * 10;
  let status = "paid";
  if (period === CURRENT) {
    if (n === 140) status = "pending";
    else if (n === 138 || n % 7 === 0) status = "awaiting";
  }
  const it = (k, label, amount, note) => ({
    id: `${emp.id}-${k}`,
    label,
    amount,
    note,
  });
  return {
    base: emp.baseSalary || 0,
    method: METHODS[0],
    iban: "",
    allowances: [
      it("a1", "بدل مواصلات", transport, "شهري ثابت"),
      it("a2", "بدل سكن", a - transport, "شهري ثابت"),
      it("a3", "ساعات إضافية", 0, "تحسب من الحضور"),
    ],
    deductions: d
      ? [
          it("d1", "التأمينات", insurance, "اشتراك التأمينات الاجتماعية"),
          ...(d - insurance > 0
            ? [it("d2", "الضرائب", d - insurance, "ضريبة كسب العمل")]
            : []),
        ]
      : [],
    commission: { type: "percent", value: 2, applies: "closed" },
    status,
    paidAt: status === "paid" ? `${period}-28` : "",
  };
}

export function totals(rec) {
  const sum = (l) => l.reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const allow = sum(rec.allowances);
  const ded = sum(rec.deductions);
  const gross = (Number(rec.base) || 0) + allow;
  return { allow, ded, gross, net: gross - ded };
}

/* ───────── store ───────── */
let state = (() => {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && typeof s === "object") return s;
  } catch {
    /* ignore */
  }
  return {};
})();
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
const keyOf = (period, id) => `${period}|${id}`;

export const recordOf = (overrides, emp, period) =>
  overrides[keyOf(period, emp.id)] || defaultRecord(emp, period);

export const payrollApi = {
  save(period, id, rec) {
    commit({ ...state, [keyOf(period, id)]: rec });
  },
  /** Mark every unpaid record of a period as paid. Returns how many were paid. */
  payAll(period, employees) {
    const next = { ...state };
    let n = 0;
    employees.forEach((e) => {
      const r = recordOf(state, e, period);
      if (r.status !== "paid") {
        next[keyOf(period, e.id)] = {
          ...r,
          status: "paid",
          paidAt: `${period}-28`,
        };
        n++;
      }
    });
    if (n) commit(next);
    return n;
  },
};

export const usePayroll = () =>
  useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    () => state,
  );
