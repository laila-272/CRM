// src/Components/HRPages/SalaryModal.jsx
import { useEffect, useState } from "react";
import { X, Plus } from "lucide-react";
import { Select, btnDark, btnLight } from "../Shared/ui.jsx";
import { Avatar } from "./Hrshared.jsx";
import {
  METHODS,
  COMM_TYPES,
  COMM_APPLIES,
  newItem,
  totals,
  money,
} from "../../data/Payrollstore.js";

const inp =
  "h-9 w-full rounded-lg border border-line bg-white px-3 text-[11px] text-ink outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-400 disabled:bg-neutral-50 disabled:text-neutral-400";
const num = (v) => Number(String(v).replace(/[^\d.]/g, "")) || 0;
const fmt = (n) => Number(n || 0).toLocaleString("en-US");

function Section({ title, sub, action, children }) {
  return (
    <section className="rounded-xl border border-line bg-white p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[13px] font-semibold text-ink">{title}</h3>
          <p className="mt-0.5 text-[10px] text-neutral-500">{sub}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Money({ value, onChange, suffix = "ج.م", className = "" }) {
  return (
    <div className={`relative ${className}`}>
      <input
        dir="ltr"
        inputMode="decimal"
        value={fmt(value)}
        onChange={(e) => onChange(num(e.target.value))}
        onFocus={(e) => e.target.select()}
        className={`${inp} pl-10 pr-3 text-right`}
      />
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-neutral-400">
        {suffix}
      </span>
    </div>
  );
}

function ItemRows({ items, onChange, onRemove, empty }) {
  if (!items.length)
    return (
      <p className="py-2 text-center text-[10.5px] text-neutral-400">{empty}</p>
    );
  return (
    <ul className="divide-y divide-line">
      {items.map((it) => (
        <li
          key={it.id}
          className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
        >
          <div className="min-w-0 flex-1">
            <input
              value={it.label}
              onChange={(e) => onChange(it.id, { label: e.target.value })}
              placeholder="اسم البند"
              aria-label="اسم البند"
              className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-[11.5px] font-semibold text-ink outline-none transition-colors hover:border-line focus:border-neutral-400"
            />
            <input
              value={it.note}
              onChange={(e) => onChange(it.id, { note: e.target.value })}
              placeholder="ملاحظة"
              aria-label="ملاحظة"
              className="w-full rounded border border-transparent bg-transparent px-1 text-[9.5px] text-neutral-400 outline-none transition-colors hover:border-line focus:border-neutral-400"
            />
          </div>
          <Money
            value={it.amount}
            onChange={(v) => onChange(it.id, { amount: v })}
            className="w-[120px] shrink-0"
          />
          <button
            onClick={() => onRemove(it.id)}
            aria-label="حذف البند"
            className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-red-500 transition-colors hover:bg-red-50"
          >
            <X size={12} />
          </button>
        </li>
      ))}
    </ul>
  );
}

const addBtn =
  "inline-flex h-6 shrink-0 items-center gap-1 rounded-full bg-ink px-3 text-[10px] font-semibold text-white transition-opacity hover:opacity-90";

export default function SalaryModal({ employee, record, onClose, onSave }) {
  const [d, setD] = useState(() => JSON.parse(JSON.stringify(record)));
  const [shown, setShown] = useState(false);
  const [err, setErr] = useState("");
  const t = totals(d);

  // enter animation, Esc, scroll lock
  useEffect(() => {
    const r = requestAnimationFrame(() => setShown(true));
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(r);
      document.body.style.overflow = prev;
    };
  }, []);
  const close = () => {
    setShown(false);
    setTimeout(onClose, 220);
  };
  useEffect(() => {
    const k = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  const set = (patch) => setD((x) => ({ ...x, ...patch }));
  const list = (key) => ({
    items: d[key],
    onChange: (id, patch) =>
      set({ [key]: d[key].map((i) => (i.id === id ? { ...i, ...patch } : i)) }),
    onRemove: (id) => set({ [key]: d[key].filter((i) => i.id !== id) }),
  });
  const add = (key, label) =>
    set({ [key]: [...d[key], newItem(label, 0, "")] });
  const setComm = (patch) => set({ commission: { ...d.commission, ...patch } });

  const save = () => {
    if (!(Number(d.base) > 0)) return setErr("أدخل الراتب الأساسي");
    onSave({
      ...d,
      allowances: d.allowances.filter((i) => i.label.trim()),
      deductions: d.deductions.filter((i) => i.label.trim()),
    });
    close();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-hidden p-3 sm:p-4"
      dir="rtl"
      role="dialog"
      aria-modal="true"
      aria-label="تحديد راتب الموظف"
    >
      <div
        onClick={close}
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${shown ? "opacity-100" : "opacity-0"}`}
      />
      <div
        className={`relative flex max-h-[calc(100dvh-24px)] w-full max-w-[640px] flex-col rounded-2xl bg-white shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] sm:max-h-[calc(100dvh-32px)] ${
          shown ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
        }`}
      >
        {/* header */}
        <div className="flex shrink-0 items-start justify-between gap-3 px-6 pb-3 pt-6">
          <div>
            <h2 className="text-[22px] font-semibold leading-tight text-ink">
              تحديد راتب الموظف
            </h2>
            <p className="mt-1 text-[10.5px] text-neutral-500">
              الراتب الأساسي والبدلات والعمولات والاستقطاعات
            </p>
          </div>
          <button
            onClick={close}
            aria-label="إغلاق"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-ink"
          >
            <X size={13} />
          </button>
        </div>

        {/* scrolling body */}
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 pb-4">
          <div className="flex items-center justify-between rounded-xl bg-neutral-100 px-4 py-3">
            <div className="leading-tight">
              <div className="text-[12px] font-semibold text-ink">
                {employee.name}
              </div>
              <div className="mt-0.5 text-[10px] text-neutral-500">
                {employee.dept} — {employee.title}
              </div>
            </div>
            <Avatar name={employee.name} size={26} />
          </div>

          <Section
            title="الراتب الأساسي وطريقة الدفع"
            sub="الراتب الشهري وكيفية صرفه"
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1.5 block text-[10px] text-neutral-500">
                  الراتب الأساسي <b className="text-red-500">*</b>
                </span>
                <Money
                  value={d.base}
                  onChange={(v) => {
                    set({ base: v });
                    setErr("");
                  }}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] text-neutral-500">
                  طريقة الدفع <b className="text-red-500">*</b>
                </span>
                <Select value={d.method} onChange={(v) => set({ method: v })}>
                  {METHODS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </Select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] text-neutral-500">
                  الحساب البنكي
                </span>
                <input
                  dir="ltr"
                  disabled={d.method !== METHODS[0]}
                  value={d.iban}
                  onChange={(e) => set({ iban: e.target.value })}
                  placeholder="أدخل رقم الحساب / IBAN"
                  className={`${inp} text-right`}
                />
              </label>
            </div>
            {err && (
              <p role="alert" className="mt-2 text-[10.5px] text-red-600">
                {err}
              </p>
            )}
          </Section>

          <Section
            title="البدلات والمكافآت"
            sub="مواصلات، سكن، ساعات إضافية وأي مجموعات أخرى"
            action={
              <button
                onClick={() => add("allowances", "بدل جديد")}
                className={addBtn}
              >
                <Plus size={10} /> إضافة بدل
              </button>
            }
          >
            <ItemRows {...list("allowances")} empty="لا توجد بدلات" />
          </Section>

          <Section title="العمولات" sub="مرتبطة بمبيعات الموظف في الـ CRM">
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="block">
                <span className="mb-1.5 block text-[10px] text-neutral-500">
                  نوع العمولة <b className="text-red-500">*</b>
                </span>
                <Select
                  value={d.commission.type}
                  onChange={(v) => setComm({ type: v })}
                >
                  {Object.entries(COMM_TYPES).map(([k, l]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] text-neutral-500">
                  القيمة <b className="text-red-500">*</b>
                </span>
                <Money
                  value={d.commission.value}
                  onChange={(v) => setComm({ value: v })}
                  suffix={d.commission.type === "percent" ? "%" : "ج.م"}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[10px] text-neutral-500">
                  تنطبق على
                </span>
                <Select
                  value={d.commission.applies}
                  onChange={(v) => setComm({ applies: v })}
                >
                  {Object.entries(COMM_APPLIES).map(([k, l]) => (
                    <option key={k} value={k}>
                      {l}
                    </option>
                  ))}
                </Select>
              </label>
            </div>
          </Section>

          <Section
            title="الاستقطاعات"
            sub="التأمينات، الضرائب، وأي قسط/ سلفة"
            action={
              <button
                onClick={() => add("deductions", "استقطاع جديد")}
                className={addBtn}
              >
                <Plus size={10} /> إضافة استقطاع
              </button>
            }
          >
            <ItemRows {...list("deductions")} empty="لا توجد استقطاعات" />
          </Section>
        </div>

        {/* fixed footer */}
        <div className="shrink-0 space-y-3 px-6 pb-5 pt-1">
          <div className="grid grid-cols-3 gap-3 rounded-xl bg-neutral-100 px-5 py-3">
            <div>
              <div className="text-[9.5px] text-neutral-500">
                الأساسي + البدلات
              </div>
              <div className="mt-1 text-[14px] font-bold text-ink" dir="rtl">
                {money(t.gross)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-[9.5px] text-neutral-500">
                إجمالي الاستقطاعات
              </div>
              <div className="mt-1 text-[14px] font-bold text-ink">
                {money(t.ded)}
              </div>
            </div>
            <div className="text-left">
              <div className="text-[9.5px] text-neutral-500">
                صافي الراتب الشهري
              </div>
              <div
                className={`mt-1 text-[17px] font-bold ${t.net >= 0 ? "text-emerald-600" : "text-red-500"}`}
              >
                {money(t.net)}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={save}
              className={`${btnDark} h-9 rounded-full px-5 transition-opacity hover:opacity-90`}
            >
              حفظ الراتب
            </button>
            <button
              onClick={close}
              className={`${btnLight} h-9 px-5 transition-colors hover:bg-neutral-50`}
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
