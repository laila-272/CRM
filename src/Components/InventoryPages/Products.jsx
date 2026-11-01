import React, { useMemo, useState } from "react";
import {
  Package,
  Boxes,
  TrendingDown,
  AlertCircle,
  Plus,
  Download,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  PageHeader,
  SearchBox,
  Chip,
  PagerBar,
  btnDark,
  btnLight,
  egp,
  downloadCsv,
  th,
  td,
  InvStat,
  TableCard,
  ProductCell,
  StatusBadge,
  EmptyRow,
  Modal,
  ConfirmDialog,
  Field,
  input,
  useToast,
} from "./Inventoryui.jsx";
import { PRODUCTS, qtyOf, statusOf, STATUS } from "../../data/inventory.js";

const PER = 8;
const FILTERS = [
  ["all", "الكل"],
  ["ok", "متوفر"],
  ["low", "منخفض"],
  ["out", "نفد المخزون"],
];
const blank = {
  name: "",
  sku: "",
  cat: "إلكترونيات",
  price: "",
  cost: "",
  qty: "",
  min: "20",
};

export default function Products() {
  const [items, setItems] = useState(PRODUCTS);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null); // null | {id?, ...fields}
  const [err, setErr] = useState({});
  const [del, setDel] = useState(null);
  const [toast, show] = useToast();

  const list = useMemo(
    () =>
      items.filter(
        (p) =>
          (filter === "all" || statusOf(p) === filter) &&
          (!q ||
            p.name.includes(q) ||
            p.sku.toLowerCase().includes(q.toLowerCase())),
      ),
    [items, q, filter],
  );
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const cur = Math.min(page, pages);
  const rows = list.slice((cur - 1) * PER, cur * PER);
  const count = (s) => items.filter((p) => statusOf(p) === s).length;
  const value = items.reduce((a, p) => a + qtyOf(p) * p.cost, 0);

  const openAdd = () => {
    setErr({});
    setForm({ ...blank });
  };
  const openEdit = (p) => {
    setErr({});
    setForm({
      id: p.id,
      name: p.name,
      sku: p.sku,
      cat: p.cat,
      price: String(p.price),
      cost: String(p.cost),
      qty: String(qtyOf(p)),
      min: String(p.min),
    });
  };

  const save = () => {
    const e = {};
    if (!form.name.trim()) e.name = "اسم المنتج مطلوب";
    if (!form.sku.trim()) e.sku = "الكود مطلوب";
    else if (items.some((p) => p.sku === form.sku.trim() && p.id !== form.id))
      e.sku = "الكود مستخدم بالفعل";
    if (!(Number(form.price) > 0)) e.price = "سعر البيع غير صحيح";
    if (!(Number(form.cost) >= 0) || form.cost === "")
      e.cost = "سعر التكلفة غير صحيح";
    if (!(Number(form.qty) >= 0) || form.qty === "") e.qty = "الكمية غير صحيحة";
    setErr(e);
    if (Object.keys(e).length) return;
    const base = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      cat: form.cat,
      price: Number(form.price),
      cost: Number(form.cost),
      min: Number(form.min) || 0,
    };
    if (form.id) {
      setItems((s) =>
        s.map((p) =>
          p.id === form.id
            ? {
                ...p,
                ...base,
                wh: {
                  ...p.wh,
                  main: p.wh.main + (Number(form.qty) - qtyOf(p)),
                },
              }
            : p,
        ),
      );
      show("تم تحديث المنتج");
    } else {
      setItems((s) => [
        {
          id: Date.now(),
          sup: "s1",
          wh: { main: Number(form.qty), cairo: 0, alex: 0 },
          ...base,
        },
        ...s,
      ]);
      show("تمت إضافة المنتج");
    }
    setForm(null);
  };

  const exportCsv = () =>
    downloadCsv(
      "products.csv",
      [
        "المنتج",
        "الكود",
        "التصنيف",
        "سعر البيع",
        "سعر التكلفة",
        "الكمية",
        "الحالة",
      ],
      list.map((p) => [
        p.name,
        p.sku,
        p.cat,
        p.price,
        p.cost,
        qtyOf(p),
        STATUS[statusOf(p)].label,
      ]),
    );

  return (
    <div dir="rtl" className="space-y-5">
      <PageHeader
        title="المنتجات"
        subtitle="إدارة كتالوج المنتجات ومتابعة مستويات المخزون"
      >
        <button className={btnDark} onClick={openAdd}>
          <Plus size={13} /> منتج جديد
        </button>
        <button className={btnLight} onClick={exportCsv}>
          <Download size={13} /> تصدير بيانات
        </button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <InvStat
          icon={Package}
          tag="الكل"
          value={items.length}
          note="+12 منتج هذا الشهر"
          tone="green"
        />
        <InvStat icon={Boxes} value={egp(value)} note="محسوبة بسعر التكلفة" />
        <InvStat
          icon={TrendingDown}
          value={count("low")}
          note="تحتاج إعادة تموين"
          tone="orange"
        />
        <InvStat
          icon={AlertCircle}
          value={count("out")}
          note="تحتاج معالجة فورية"
          tone="red"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBox
          className="min-w-[240px] flex-1"
          value={q}
          onChange={(v) => {
            setQ(v);
            setPage(1);
          }}
          placeholder="ابحث باسم المنتج أو كود SKU..."
        />
        {FILTERS.map(([k, l]) => (
          <Chip
            key={k}
            active={filter === k}
            onClick={() => {
              setFilter(k);
              setPage(1);
            }}
          >
            {l}
          </Chip>
        ))}
      </div>

      <TableCard
        title="قائمة المنتجات"
        subtitle={`${list.length} منتج في الكتالوج`}
        info={`عرض ${rows.length} من ${list.length} منتج`}
        footer={
          <PagerBar
            page={cur}
            pages={pages}
            onPage={setPage}
            info={`صفحة ${cur} من ${pages}`}
          />
        }
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-line">
              {[
                "المنتج / الكود",
                "التصنيف",
                "سعر البيع",
                "سعر التكلفة",
                "الكمية",
                "الحالة",
                "",
              ].map((h, i) => (
                <th key={i} className={th}>
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
                  <td className={td}>{egp(p.price)}</td>
                  <td className={td}>{egp(p.cost)}</td>
                  <td className={td}>{qtyOf(p)}</td>
                  <td className={td}>
                    <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                  </td>
                  <td className={td}>
                    <div className="flex gap-2 text-neutral-400">
                      <button
                        aria-label="تعديل"
                        onClick={() => openEdit(p)}
                        className="hover:text-ink"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        aria-label="حذف"
                        onClick={() => setDel(p)}
                        className="hover:text-[#DC2626]"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableCard>

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title={form?.id ? "تعديل منتج" : "منتج جديد"}
      >
        {form && (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Field label="اسم المنتج" error={err.name}>
                <input
                  className={input}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
            </div>
            <Field label="كود SKU" error={err.sku}>
              <input
                className={input}
                dir="ltr"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />
            </Field>
            <Field label="التصنيف">
              <select
                className={input}
                value={form.cat}
                onChange={(e) => setForm({ ...form, cat: e.target.value })}
              >
                <option>إلكترونيات</option>
                <option>إكسسوارات</option>
              </select>
            </Field>
            <Field label="سعر البيع" error={err.price}>
              <input
                type="number"
                className={input}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </Field>
            <Field label="سعر التكلفة" error={err.cost}>
              <input
                type="number"
                className={input}
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
              />
            </Field>
            <Field label="الكمية" error={err.qty}>
              <input
                type="number"
                className={input}
                value={form.qty}
                onChange={(e) => setForm({ ...form, qty: e.target.value })}
              />
            </Field>
            <Field label="الحد الأدنى">
              <input
                type="number"
                className={input}
                value={form.min}
                onChange={(e) => setForm({ ...form, min: e.target.value })}
              />
            </Field>
            <div className="col-span-2 flex gap-2 pt-1">
              <button
                onClick={save}
                className="h-9 flex-1 rounded-lg bg-ink text-[12px] font-semibold text-white"
              >
                حفظ
              </button>
              <button
                onClick={() => setForm(null)}
                className="h-9 w-24 rounded-lg border border-line text-[12px] font-semibold"
              >
                إلغاء
              </button>
            </div>
          </div>
        )}
      </Modal>
      <ConfirmDialog
        open={!!del}
        onClose={() => setDel(null)}
        message={`هل تريد حذف "${del?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        onConfirm={() => {
          setItems((s) => s.filter((p) => p.id !== del.id));
          setDel(null);
          show("تم حذف المنتج");
        }}
      />
      {toast}
    </div>
  );
}
