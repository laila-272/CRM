import React, { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ArrowLeftRight,
  Activity,
  Plus,
  Download,
} from "lucide-react";
import {
  PageHeader,
  SearchBox,
  Chip,
  PagerBar,
  btnDark,
  btnLight,
  downloadCsv,
  th,
  td,
  InvStat,
  TableCard,
  StatusBadge,
  EmptyRow,
  Modal,
  Field,
  input,
  useToast,
} from "./Inventoryui.jsx";
import { MOVEMENTS, MOVE_TYPES, PRODUCTS, qtyOf } from "../../data/inventory.js";

const PER = 8;
const FILTERS = [
  ["all", "كل الحركات"],
  ["add", "إضافة"],
  ["sale", "مبيعات / بيع"],
  ["return", "مرتجع"],
  ["adjust", "تسوية"],
];
const blank = { type: "add", pid: "", qty: "", note: "" };

export default function StockMove() {
  const [rows, setRows] = useState(MOVEMENTS);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(null);
  const [err, setErr] = useState({});
  const [toast, show] = useToast();

  const list = useMemo(
    () =>
      rows.filter(
        (r) =>
          (filter === "all" || r.type === filter) &&
          (!q || r.product.includes(q)),
      ),
    [rows, q, filter],
  );
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const cur = Math.min(page, pages);
  const view = list.slice((cur - 1) * PER, cur * PER);
  const inn = rows.filter((r) => r.qty > 0).reduce((a, r) => a + r.qty, 0);
  const out = rows.filter((r) => r.qty < 0).reduce((a, r) => a - r.qty, 0);

  const save = () => {
    const e = {};
    const p = PRODUCTS.find((x) => String(x.id) === form.pid);
    const n = Number(form.qty);
    if (!p) e.pid = "اختر المنتج";
    if (!n || (form.type !== "adjust" && n < 0)) e.qty = "أدخل كمية صحيحة";
    setErr(e);
    if (Object.keys(e).length) return;
    const delta =
      form.type === "sale"
        ? -Math.abs(n)
        : form.type === "adjust"
          ? n
          : Math.abs(n);
    const d = new Date();
    const pad = (x) => String(x).padStart(2, "0");
    setRows((s) => [
      {
        id: Date.now(),
        type: form.type,
        product: p.name,
        qty: delta,
        balance: Math.max(0, qtyOf(p) + delta),
        by: "محمد العمري",
        date: `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} - ${pad(d.getHours())}:${pad(d.getMinutes())}`,
      },
      ...s,
    ]);
    setForm(null);
    show("تم تسجيل الحركة");
  };

  return (
    <div dir="rtl" className="space-y-5">
      <PageHeader
        title="حركة المخزون"
        subtitle="متابعة جميع حركات الإضافة والبيع والمرتجعات والتسويات"
      >
        <button
          className={btnDark}
          onClick={() => {
            setErr({});
            setForm({ ...blank });
          }}
        >
          <Plus size={13} /> حركة جديدة
        </button>
        <button
          className={btnLight}
          onClick={() =>
            downloadCsv(
              "stock-moves.csv",
              ["التاريخ", "النوع", "المنتج", "الكمية", "الرصيد", "المسؤول"],
              list.map((r) => [
                r.date,
                MOVE_TYPES[r.type].label,
                r.product,
                r.qty,
                r.balance,
                r.by,
              ]),
            )
          }
        >
          <Download size={13} /> تصدير السجل
        </button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <InvStat
          icon={Activity}
          value={rows.length}
          note="حركات اليوم والسابقة"
        />
        <InvStat
          icon={ArrowDownToLine}
          value={inn.toLocaleString("en-US")}
          note="إجمالي الوارد (وحدة)"
          tone="green"
        />
        <InvStat
          icon={ArrowUpFromLine}
          value={out.toLocaleString("en-US")}
          note="إجمالي الصادر (وحدة)"
          tone="red"
        />
        <InvStat
          icon={ArrowLeftRight}
          value={
            rows.filter((r) => r.type === "adjust" || r.type === "return")
              .length
          }
          note="تسويات ومرتجعات"
          tone="orange"
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
          placeholder="ابحث باسم المنتج..."
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
        title="سجل الحركات"
        subtitle="آخر العمليات على المخزون"
        info={`عرض ${view.length} من ${list.length}`}
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
                "التاريخ",
                "النوع",
                "المنتج",
                "الكمية",
                "الرصيد بعد الحركة",
                "المسؤول",
              ].map((h) => (
                <th key={h} className={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.length === 0 && <EmptyRow cols={6} />}
            {view.map((r) => (
              <tr
                key={r.id}
                className="border-b border-line last:border-0 hover:bg-[#FAFAFB]"
              >
                <td className={td}>{r.date}</td>
                <td className={td}>
                  <StatusBadge>{MOVE_TYPES[r.type].label}</StatusBadge>
                </td>
                <td className={td}>{r.product}</td>
                <td
                  className={`${td} font-semibold ${r.qty > 0 ? "text-[#15803D]" : "text-[#DC2626]"}`}
                  dir="ltr"
                  style={{ textAlign: "right" }}
                >
                  {r.qty > 0 ? `+${r.qty}` : r.qty}
                </td>
                <td className={td}>{r.balance}</td>
                <td className={td}>{r.by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableCard>

      <Modal
        open={!!form}
        onClose={() => setForm(null)}
        title="حركة مخزون جديدة"
      >
        {form && (
          <div className="space-y-3">
            <Field label="نوع الحركة">
              <select
                className={input}
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {Object.entries(MOVE_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="المنتج" error={err.pid}>
              <select
                className={input}
                value={form.pid}
                onChange={(e) => setForm({ ...form, pid: e.target.value })}
              >
                <option value="">اختر المنتج</option>
                {PRODUCTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              label={
                form.type === "adjust" ? "الكمية (موجب أو سالب)" : "الكمية"
              }
              error={err.qty}
            >
              <input
                type="number"
                className={input}
                value={form.qty}
                onChange={(e) => setForm({ ...form, qty: e.target.value })}
              />
            </Field>
            <Field label="ملاحظات">
              <input
                className={input}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </Field>
            <div className="flex gap-2 pt-1">
              <button
                onClick={save}
                className="h-9 flex-1 rounded-lg bg-ink text-[12px] font-semibold text-white"
              >
                تسجيل الحركة
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
      {toast}
    </div>
  );
}
