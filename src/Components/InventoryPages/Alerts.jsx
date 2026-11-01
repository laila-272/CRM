import React, { useMemo, useState } from "react";
import {
  Bell,
  Package,
  ShoppingCart,
  AlertTriangle,
  ArrowDown,
  Eye,
} from "lucide-react";
import {
  PageHeader,
  btnDark,
  btnLight,
  th,
  td,
  InvStat,
  TableCard,
  ProductCell,
  StatusBadge,
  EmptyRow,
  Modal,
  Field,
  input,
  useToast,
} from "./Inventoryui.jsx";
import PurchaseOrderModal from "./Purchaseordermodal.jsx";
import {
  PRODUCTS,
  SUPPLIERS,
  qtyOf,
  statusOf,
  STATUS,
} from "../../data/inventory.js";

export default function StockAlerts() {
  const [items, setItems] = useState(PRODUCTS);
  const [dismissed, setDismissed] = useState(false);
  const [onlyBad, setOnlyBad] = useState(true);
  const [po, setPo] = useState(null); // {product, qty}
  const [minModal, setMinModal] = useState(false);
  const [minVal, setMinVal] = useState("");
  const [toast, show] = useToast();

  const alerts = useMemo(
    () =>
      items
        .filter((p) => statusOf(p) !== "ok")
        .map((p) => ({ p, need: Math.max(p.min * 3 - qtyOf(p), 0) })),
    [items],
  );
  const out = alerts.filter((a) => statusOf(a.p) === "out").length;
  const low = alerts.length - out;
  const need = alerts.reduce((a, x) => a + x.need, 0);
  const supName = (id) => SUPPLIERS.find((s) => s.id === id)?.name;

  return (
    <div dir="rtl" className="space-y-5">
      <PageHeader
        title="تنبيهات المخزون"
        subtitle="تابع المنتجات التي وصلت للحد الأدنى أو نفدت من المخزون"
      >
        <button className={btnDark} onClick={() => setPo({ product: null })}>
          <ShoppingCart size={13} /> إنشاء أوامر شراء
        </button>
        <button
          className={btnLight}
          onClick={() => {
            setMinVal("");
            setMinModal(true);
          }}
        >
          تعديل الحد الأدنى
        </button>
      </PageHeader>

      {!dismissed && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-[#F8C9C9] bg-[#FDECEC] px-4 py-2.5 text-[11.5px] text-[#DC2626]">
          <span>
            {out} منتجات نفدت من المخزون و{low} منتجاً وصل إلى الحد الأدنى
          </span>
          <button
            onClick={() => setDismissed(true)}
            className="rounded-md bg-white/70 px-2.5 py-1 text-[10.5px] font-semibold text-ink"
          >
            تجاهل التنبيه
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <InvStat
          icon={Bell}
          value={alerts.length}
          note="تنبيهات نشطة اليوم"
          tone="green"
        />
        <InvStat
          icon={ShoppingCart}
          value={`${need.toLocaleString("en-US")} وحدة`}
          note="إجمالي الكمية المقترحة للتوريد"
        />
        <InvStat
          icon={AlertTriangle}
          value={out}
          note="نفد المخزون بالكامل"
          tone="red"
        />
        <InvStat
          icon={Package}
          value={low}
          note="أقل من الحد الأدنى"
          tone="orange"
        />
      </div>

      <TableCard
        title="المنتجات المحتاجة لإعادة توريد"
        subtitle="مرتبة حسب الأولوية"
        info={
          <button
            className="inline-flex items-center gap-1 text-neutral-500 hover:text-ink"
            onClick={() => setOnlyBad((v) => !v)}
          >
            <Eye size={12} /> {onlyBad ? "عرض الكل" : "عرض المنخفض فقط"}
          </button>
        }
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-line">
              {[
                "المنتج",
                "الحالة",
                "الكمية الحالية",
                "الحد الأدنى",
                "الكمية المقترحة",
                "المورد المقترح",
                "إجراء",
              ].map((h) => (
                <th key={h} className={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(onlyBad
              ? alerts
              : items.map((p) => ({
                  p,
                  need: Math.max(p.min * 3 - qtyOf(p), 0),
                }))
            ).length === 0 && (
              <EmptyRow cols={7} text="لا توجد تنبيهات حالياً" />
            )}
            {(onlyBad
              ? alerts
              : items.map((p) => ({
                  p,
                  need: Math.max(p.min * 3 - qtyOf(p), 0),
                }))
            ).map(({ p, need }) => {
              const s = STATUS[statusOf(p)];
              return (
                <tr
                  key={p.id}
                  className="border-b border-line last:border-0 hover:bg-[#FAFAFB]"
                >
                  <td className={td}>
                    <ProductCell name={p.name} sku={p.sku} icon={Package} />
                  </td>
                  <td className={td}>
                    <StatusBadge tone={s.tone}>{s.label}</StatusBadge>
                  </td>
                  <td className={td}>{qtyOf(p)}</td>
                  <td className={td}>{p.min}</td>
                  <td className={td}>{need}</td>
                  <td className={td}>{supName(p.sup)}</td>
                  <td className={td}>
                    <button
                      onClick={() => setPo({ product: p, qty: need })}
                      className="h-6 rounded-full border border-line px-3 text-[10px] font-semibold hover:bg-neutral-100"
                    >
                      طلب شراء
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableCard>

      <PurchaseOrderModal
        open={!!po}
        product={po?.product}
        qty={po?.qty}
        onClose={() => setPo(null)}
        onSubmit={(o) =>
          show(`تم إرسال طلب شراء بقيمة ${o.total.toLocaleString("en-US")} ج.م`)
        }
      />

      <Modal
        open={minModal}
        onClose={() => setMinModal(false)}
        title="تعديل الحد الأدنى"
        width="max-w-sm"
      >
        <Field label="الحد الأدنى الجديد لكل المنتجات">
          <input
            type="number"
            min="0"
            className={input}
            value={minVal}
            onChange={(e) => setMinVal(e.target.value)}
          />
        </Field>
        <div className="mt-4 flex gap-2">
          <button
            disabled={!(Number(minVal) >= 0) || minVal === ""}
            onClick={() => {
              setItems((s) => s.map((p) => ({ ...p, min: Number(minVal) })));
              setMinModal(false);
              show("تم تحديث الحد الأدنى");
            }}
            className="h-9 flex-1 rounded-lg bg-ink text-[12px] font-semibold text-white disabled:opacity-40"
          >
            حفظ
          </button>
          <button
            onClick={() => setMinModal(false)}
            className="h-9 w-24 rounded-lg border border-line text-[12px] font-semibold"
          >
            إلغاء
          </button>
        </div>
      </Modal>
      {toast}
    </div>
  );
}
