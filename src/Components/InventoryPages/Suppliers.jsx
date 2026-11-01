import React, { useState } from "react";
import {
  Truck,
  FileText,
  ShoppingCart,
  Clock,
  Plus,
  Building2,
} from "lucide-react";
import {
  PageHeader,
  btnDark,
  btnLight,
  egp,
  th,
  td,
  card,
  InvStat,
  TableCard,
  StatusBadge,
  EmptyRow,
  Modal,
  Field,
  input,
  useToast,
} from "./Inventoryui.jsx";
import PurchaseOrderModal from "./Purchaseordermodal.jsx";
import { SUPPLIERS, PURCHASE_ORDERS, PO_STATUS } from "../../data/inventory.js";

export default function Suppliers() {
  const [sups, setSups] = useState(SUPPLIERS);
  const [orders, setOrders] = useState(PURCHASE_ORDERS);
  const [poOpen, setPoOpen] = useState(false);
  const [supForm, setSupForm] = useState(null);
  const [err, setErr] = useState("");
  const [toast, show] = useToast();

  const open = orders.filter(
    (o) => o.status === "pending" || o.status === "shipping",
  );
  const month = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((a, o) => a + o.total, 0);
  const waiting = orders.filter((o) => o.status === "pending").length;

  const addOrder = (o) => {
    const n = 2042 + orders.length - PURCHASE_ORDERS.length;
    const d = new Date(o.date);
    setOrders((s) => [
      {
        no: `PO-${n}`,
        sup: o.supName,
        qty: o.qty,
        total: o.total,
        date: `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`,
        status: "pending",
      },
      ...s,
    ]);
    show("تم إنشاء أمر الشراء");
  };
  const receive = (no) => {
    setOrders((s) =>
      s.map((o) => (o.no === no ? { ...o, status: "received" } : o)),
    );
    show("تم تأكيد الاستلام");
  };
  const saveSup = () => {
    if (!supForm.name.trim()) return setErr("اسم المورد مطلوب");
    setSups((s) => [
      ...s,
      {
        id: `s${Date.now()}`,
        name: supForm.name.trim(),
        phone: supForm.phone,
        city: supForm.city,
        total: 0,
      },
    ]);
    setSupForm(null);
    show("تمت إضافة المورد");
  };

  return (
    <div dir="rtl" className="space-y-5">
      <PageHeader
        title="الموردون والمشتريات"
        subtitle="إدارة الموردين وأوامر الشراء وحالة استلام البضاعة"
      >
        <button className={btnDark} onClick={() => setPoOpen(true)}>
          <Plus size={13} /> أمر شراء جديد
        </button>
        <button
          className={btnLight}
          onClick={() => {
            setErr("");
            setSupForm({ name: "", phone: "", city: "" });
          }}
        >
          <Plus size={13} /> مورد جديد
        </button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <InvStat
          icon={Clock}
          value={`${waiting} أوامر`}
          note="بانتظار الاستلام"
          tone="orange"
        />
        <InvStat
          icon={ShoppingCart}
          value={egp(month)}
          note="مشتريات الشهر"
          tone="green"
        />
        <InvStat
          icon={FileText}
          value={open.length}
          note="أوامر شراء مفتوحة"
          tone="orange"
        />
        <InvStat
          icon={Truck}
          value={sups.length}
          note="الموردون النشطون"
          tone="green"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className={`${card} p-4`}>
          <h2 className="text-[14px] font-semibold text-ink">الموردون</h2>
          <p className="mt-0.5 mb-2 text-[10.5px] text-neutral-500">
            إجمالي {sups.length} مورد
          </p>
          <ul className="divide-y divide-line">
            {sups.map((s) => (
              <li
                key={s.id}
                className="flex items-start justify-between gap-2 py-2.5"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-md bg-[#F1F2F4] text-neutral-500">
                    <Building2 size={12} />
                  </span>
                  <div className="leading-tight">
                    <div className="text-[11.5px] font-semibold text-ink">
                      {s.name}
                    </div>
                    <div className="mt-0.5 text-[9.5px] text-neutral-400">
                      {s.phone} · {s.city}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-neutral-500" dir="ltr">
                  {egp(s.total)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <TableCard
          title="أوامر الشراء"
          subtitle="آخر أوامر الشراء المسجلة"
          info={`${orders.length} أمر`}
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-line">
                {[
                  "رقم الأمر",
                  "المورد",
                  "الكمية",
                  "الإجمالي",
                  "التاريخ",
                  "حالة الاستلام",
                  "",
                ].map((h, i) => (
                  <th key={i} className={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && <EmptyRow cols={7} />}
              {orders.map((o) => (
                <tr
                  key={o.no}
                  className="border-b border-line last:border-0 hover:bg-[#FAFAFB]"
                >
                  <td className={`${td} font-semibold`}>{o.no}</td>
                  <td className={td}>{o.sup}</td>
                  <td className={td}>{o.qty}</td>
                  <td className={td}>{egp(o.total)}</td>
                  <td className={td}>{o.date}</td>
                  <td className={td}>
                    <StatusBadge tone={PO_STATUS[o.status].tone}>
                      {PO_STATUS[o.status].label}
                    </StatusBadge>
                  </td>
                  <td className={td}>
                    {(o.status === "pending" || o.status === "shipping") && (
                      <button
                        onClick={() => receive(o.no)}
                        className="text-[10px] font-semibold text-neutral-500 underline hover:text-ink"
                      >
                        تأكيد الاستلام
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      </div>

      <PurchaseOrderModal
        open={poOpen}
        onClose={() => setPoOpen(false)}
        onSubmit={addOrder}
      />
      <Modal
        open={!!supForm}
        onClose={() => setSupForm(null)}
        title="مورد جديد"
        width="max-w-sm"
      >
        {supForm && (
          <div className="space-y-3">
            <Field label="اسم المورد" error={err}>
              <input
                className={input}
                value={supForm.name}
                onChange={(e) =>
                  setSupForm({ ...supForm, name: e.target.value })
                }
              />
            </Field>
            <Field label="رقم الهاتف">
              <input
                className={input}
                dir="ltr"
                value={supForm.phone}
                onChange={(e) =>
                  setSupForm({ ...supForm, phone: e.target.value })
                }
              />
            </Field>
            <Field label="المدينة">
              <input
                className={input}
                value={supForm.city}
                onChange={(e) =>
                  setSupForm({ ...supForm, city: e.target.value })
                }
              />
            </Field>
            <div className="flex gap-2 pt-1">
              <button
                onClick={saveSup}
                className="h-9 flex-1 rounded-lg bg-ink text-[12px] font-semibold text-white"
              >
                حفظ
              </button>
              <button
                onClick={() => setSupForm(null)}
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
