import React, { useEffect, useState } from "react";
import { Modal, Field, input, StatusBadge } from "./Inventoryui.jsx";
import {
  SUPPLIERS,
  PRODUCTS,
  WAREHOUSES,
  statusOf,
  STATUS,
} from "../../data/inventory.js";

const PAY = ["نقدي", "آجل", "تحويل بنكي"];
const empty = {
  sup: "",
  pid: "",
  qty: "",
  price: "",
  date: "",
  wh: "main",
  pay: "آجل",
  notes: "",
};

export default function PurchaseOrderModal({
  open,
  onClose,
  product,
  qty,
  onSubmit,
}) {
  const [f, setF] = useState(empty);
  const [err, setErr] = useState({});
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  useEffect(() => {
    if (!open) return;
    setErr({});
    setF(
      product
        ? {
            ...empty,
            sup: product.sup,
            pid: String(product.id),
            qty: String(qty || ""),
            price: String(product.cost),
          }
        : empty,
    );
  }, [open, product, qty]);

  const prod = PRODUCTS.find((p) => String(p.id) === f.pid);
  const total = (Number(f.qty) || 0) * (Number(f.price) || 0);

  const submit = () => {
    const e = {};
    if (!f.sup) e.sup = "اختر المورد";
    if (!f.pid) e.pid = "اختر المنتج";
    if (!(Number(f.qty) > 0)) e.qty = "أدخل كمية صحيحة";
    if (!(Number(f.price) > 0)) e.price = "أدخل سعر الوحدة";
    if (!f.date) e.date = "حدد تاريخ التوريد";
    setErr(e);
    if (Object.keys(e).length) return;
    onSubmit?.({
      ...f,
      qty: Number(f.qty),
      price: Number(f.price),
      total,
      supName: SUPPLIERS.find((s) => s.id === f.sup)?.name,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="طلب شراء" width="max-w-lg">
      <div className="space-y-3">
        {prod && (
          <div className="flex items-center justify-between rounded-lg border border-line bg-[#F7F7F8] px-3 py-2">
            <div className="leading-tight">
              <div className="text-[11.5px] font-semibold text-ink">
                {prod.name}
              </div>
              <div className="text-[9.5px] text-neutral-400">{prod.sku}</div>
            </div>
            <StatusBadge tone={STATUS[statusOf(prod)].tone}>
              {STATUS[statusOf(prod)].label}
            </StatusBadge>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="المورد" error={err.sup}>
            <select
              className={input}
              value={f.sup}
              onChange={(e) => set("sup", e.target.value)}
            >
              <option value="">اختر المورد</option>
              {SUPPLIERS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="المنتج" error={err.pid}>
            <select
              className={input}
              value={f.pid}
              onChange={(e) => {
                const p = PRODUCTS.find((x) => String(x.id) === e.target.value);
                setF((s) => ({
                  ...s,
                  pid: e.target.value,
                  price: p ? String(p.cost) : s.price,
                  sup: s.sup || p?.sup || "",
                }));
              }}
            >
              <option value="">اختر المنتج</option>
              {PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="الكمية المطلوبة" error={err.qty}>
            <input
              className={input}
              type="number"
              min="1"
              value={f.qty}
              onChange={(e) => set("qty", e.target.value)}
            />
          </Field>
          <Field label="سعر الوحدة (ج.م)" error={err.price}>
            <input
              className={input}
              type="number"
              min="0"
              value={f.price}
              onChange={(e) => set("price", e.target.value)}
            />
          </Field>
          <Field label="تاريخ التوريد المتوقع" error={err.date}>
            <input
              className={input}
              type="date"
              value={f.date}
              onChange={(e) => set("date", e.target.value)}
            />
          </Field>
          <Field label="المخزن المستلم">
            <select
              className={input}
              value={f.wh}
              onChange={(e) => set("wh", e.target.value)}
            >
              {WAREHOUSES.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div>
          <span className="mb-1 block text-[10.5px] font-semibold text-neutral-500">
            طريقة الدفع
          </span>
          <div className="flex gap-1.5">
            {PAY.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => set("pay", p)}
                className={`h-7 rounded-full border px-3 text-[10.5px] font-semibold ${f.pay === p ? "border-ink bg-ink text-white" : "border-line bg-[#F1F2F4] text-neutral-500"}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <Field label="ملاحظات">
          <textarea
            rows={2}
            className={`${input} h-auto py-2`}
            value={f.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </Field>
        <div className="flex items-center justify-between rounded-lg bg-ink px-4 py-3 text-white">
          <span className="text-[11px]">إجمالي الطلب</span>
          <span className="text-[16px] font-semibold" dir="ltr">
            {total.toLocaleString("en-US")} ج.م
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={submit}
            className="h-9 flex-1 rounded-lg bg-ink text-[12px] font-semibold text-white"
          >
            إرسال الطلب
          </button>
          <button
            onClick={onClose}
            className="h-9 w-24 rounded-lg border border-line text-[12px] font-semibold text-ink"
          >
            إلغاء
          </button>
        </div>
      </div>
    </Modal>
  );
}
