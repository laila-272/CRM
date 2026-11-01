import React, { useMemo, useState } from "react";
import { Package, ArrowLeftRight, Plus } from "lucide-react";
import {
  PageHeader,
  SearchBox,
  Chip,
  btnDark,
  btnLight,
  card,
  th,
  td,
  TableCard,
  ProductCell,
  StatusBadge,
  EmptyRow,
  Modal,
  Field,
  input,
  useToast,
} from "./Inventoryui.jsx";
import {
  WAREHOUSES,
  PRODUCTS,
  qtyOf,
  statusOf,
  STATUS,
} from "../../data/inventory.js";

export default function Warehouses() {
  const [products, setProducts] = useState(PRODUCTS);
  const [whs, setWhs] = useState(WAREHOUSES);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState("all");
  const [move, setMove] = useState(null);
  const [newWh, setNewWh] = useState(null);
  const [err, setErr] = useState({});
  const [toast, show] = useToast();

  const rows = useMemo(
    () =>
      products.filter(
        (p) =>
          (!q ||
            p.name.includes(q) ||
            p.sku.toLowerCase().includes(q.toLowerCase())) &&
          (sel === "all" || p.wh[sel] > 0),
      ),
    [products, q, sel],
  );
  const cols = whs.slice(0, 3);

  const doMove = () => {
    const e = {};
    const n = Number(move.qty);
    const p = products.find((x) => String(x.id) === move.pid);
    if (!p) e.pid = "اختر المنتج";
    if (move.from === move.to) e.to = "اختر مخزناً مختلفاً";
    if (p && !(n > 0 && n <= p.wh[move.from]))
      e.qty = p ? `الكمية المتاحة ${p.wh[move.from]}` : "أدخل كمية صحيحة";
    setErr(e);
    if (Object.keys(e).length) return;
    setProducts((s) =>
      s.map((x) =>
        x.id === p.id
          ? {
              ...x,
              wh: {
                ...x.wh,
                [move.from]: x.wh[move.from] - n,
                [move.to]: x.wh[move.to] + n,
              },
            }
          : x,
      ),
    );
    setMove(null);
    show("تم نقل المخزون");
  };
  const addWh = () => {
    if (!newWh.name.trim()) return setErr({ name: "اسم المخزن مطلوب" });
    setWhs((s) => [
      ...s,
      {
        id: `w${Date.now()}`,
        name: newWh.name.trim(),
        sub: newWh.sub,
        units: 0,
        items: 0,
        capacity: 0,
        manager: "",
      },
    ]);
    setNewWh(null);
    show("تمت إضافة المخزن");
  };

  return (
    <div dir="rtl" className="space-y-5">
      <PageHeader
        title="المخازن"
        subtitle="إدارة المخازن وتوزيع الكميات ومتابعة السعة التخزينية"
      >
        <button
          className={btnDark}
          onClick={() => {
            setErr({});
            setNewWh({ name: "", sub: "" });
          }}
        >
          <Plus size={13} /> مخزن جديد
        </button>
        <button
          className={btnLight}
          onClick={() => {
            setErr({});
            setMove({ pid: "", from: "main", to: "cairo", qty: "" });
          }}
        >
          <ArrowLeftRight size={13} /> نقل مخزون بين المخازن
        </button>
      </PageHeader>

      <div className="grid gap-3 md:grid-cols-3">
        {[...whs].reverse().map((w) => (
          <div key={w.id} className={`${card} p-4`}>
            <div className="text-[13px] font-semibold text-ink">{w.name}</div>
            <div className="text-[10px] text-neutral-500">{w.sub}</div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <div className="text-[22px] font-semibold leading-none text-ink">
                  {w.items}
                </div>
                <div className="mt-1 text-[9.5px] text-neutral-500">صنف</div>
              </div>
              <div className="text-left">
                <div className="text-[22px] font-semibold leading-none text-ink">
                  {w.units.toLocaleString("en-US")}
                </div>
                <div className="mt-1 text-[9.5px] text-neutral-500">وحدة</div>
              </div>
            </div>
            <div className="mt-4 flex justify-between text-[9.5px] text-neutral-500">
              <span>السعة المستخدمة</span>
              <span>{w.capacity}%</span>
            </div>
            <div className="mt-1 h-1 w-full rounded-full bg-neutral-200">
              <div
                className="h-1 rounded-full bg-neutral-500"
                style={{ width: `${w.capacity}%` }}
              />
            </div>
            <div className="mt-3 text-[9.5px] text-neutral-500">
              {w.manager}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBox
          className="min-w-[240px] flex-1"
          value={q}
          onChange={setQ}
          placeholder="ابحث باسم المنتج أو كود SKU..."
        />
        <Chip active={sel === "all"} onClick={() => setSel("all")}>
          كل المخازن
        </Chip>
        {whs.slice(0, 3).map((w) => (
          <Chip key={w.id} active={sel === w.id} onClick={() => setSel(w.id)}>
            {w.name}
          </Chip>
        ))}
      </div>

      <TableCard
        title="الكميات حسب المخزن"
        subtitle="توزيع كل منتج على المخازن"
        info="تصدير"
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-line">
              {[
                "المنتج / الكود",
                "التصنيف",
                ...cols.map((c) => c.name),
                "الإجمالي",
                "الحالة",
              ].map((h) => (
                <th key={h} className={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <EmptyRow cols={7} />}
            {rows.map((p) => {
              const s = STATUS[statusOf(p)];
              return (
                <tr
                  key={p.id}
                  className="border-b border-line last:border-0 hover:bg-[#FAFAFB]"
                >
                  <td className={td}>
                    <ProductCell name={p.name} sku={p.sku} icon={Package} />
                  </td>
                  <td className={td}>{p.cat}</td>
                  {cols.map((c) => (
                    <td key={c.id} className={td}>
                      {p.wh[c.id] ?? 0}
                    </td>
                  ))}
                  <td className={`${td} font-semibold`}>{qtyOf(p)}</td>
                  <td className={td}>
                    <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableCard>

      <Modal
        open={!!move}
        onClose={() => setMove(null)}
        title="نقل مخزون بين المخازن"
      >
        {move && (
          <div className="space-y-3">
            <Field label="المنتج" error={err.pid}>
              <select
                className={input}
                value={move.pid}
                onChange={(e) => setMove({ ...move, pid: e.target.value })}
              >
                <option value="">اختر المنتج</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="من مخزن">
                <select
                  className={input}
                  value={move.from}
                  onChange={(e) => setMove({ ...move, from: e.target.value })}
                >
                  {cols.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="إلى مخزن" error={err.to}>
                <select
                  className={input}
                  value={move.to}
                  onChange={(e) => setMove({ ...move, to: e.target.value })}
                >
                  {cols.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="الكمية" error={err.qty}>
              <input
                type="number"
                min="1"
                className={input}
                value={move.qty}
                onChange={(e) => setMove({ ...move, qty: e.target.value })}
              />
            </Field>
            <div className="flex gap-2 pt-1">
              <button
                onClick={doMove}
                className="h-9 flex-1 rounded-lg bg-ink text-[12px] font-semibold text-white"
              >
                نقل
              </button>
              <button
                onClick={() => setMove(null)}
                className="h-9 w-24 rounded-lg border border-line text-[12px] font-semibold"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </Modal>
      <Modal
        open={!!newWh}
        onClose={() => setNewWh(null)}
        title="مخزن جديد"
        width="max-w-sm"
      >
        {newWh && (
          <div className="space-y-3">
            <Field label="اسم المخزن" error={err.name}>
              <input
                className={input}
                value={newWh.name}
                onChange={(e) => setNewWh({ ...newWh, name: e.target.value })}
              />
            </Field>
            <Field label="الموقع">
              <input
                className={input}
                value={newWh.sub}
                onChange={(e) => setNewWh({ ...newWh, sub: e.target.value })}
              />
            </Field>
            <div className="flex gap-2 pt-1">
              <button
                onClick={addWh}
                className="h-9 flex-1 rounded-lg bg-ink text-[12px] font-semibold text-white"
              >
                حفظ
              </button>
              <button
                onClick={() => setNewWh(null)}
                className="h-9 w-24 rounded-lg border border-line text-[12px] font-semibold"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </Modal>
      {toast}
    </div>
  );
}
