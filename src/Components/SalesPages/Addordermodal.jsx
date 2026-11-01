import { useState } from "react";
import {
  jm,
  calcTotals,
  nextNumber,
  today,
  emptyItem,
  CUSTOMERS,
  CATALOG,
  TEAM,
  PAY_METHODS,
  PAY_TERMS,
  VAT,
} from "../../data/salesData.js";
import {
  Modal,
  Field,
  SelectField,
  DateField,
  PillGroup,
  SummaryBox,
  NumCell,
  CustomerPicker,
  inputCls,
  pBtn,
  sBtn,
  Plus,
  Trash2,
} from "./Shared.jsx";

export default function AddOrderModal({
  initial,
  orders,
  onSave,
  onDelete,
  onClose,
}) {
  const edit = !!initial;
  const [f, setF] = useState(() =>
    initial
      ? { ...initial, items: initial.items.map((i) => ({ ...i })) }
      : {
          number: nextNumber("ط-", orders),
          customer: "",
          company: "",
          date: today(),
          owner: TEAM[0],
          items: [emptyItem()],
          payMethod: "تحويل بنكي",
          payTerms: "خلال 30 يوماً",
          deliveryDate: "",
          notes: "",
          taxRate: VAT,
          status: "new",
          payStatus: "unpaid",
        },
  );
  const [err, setErr] = useState({});
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const setItem = (i, patch) =>
    setF((p) => ({
      ...p,
      items: p.items.map((it, k) => (k === i ? { ...it, ...patch } : it)),
    }));
  const t = calcTotals(f.items, f.taxRate);

  const submit = (draft) => {
    const e = {};
    if (!f.customer) e.customer = "اختر العميل من القائمة";
    if (!f.date) e.date = "حدد تاريخ الطلب";
    if (f.items.some((i) => !i.name.trim() || i.qty < 1 || i.price <= 0))
      e.items = "أدخل اسم البند وكمية وسعراً أكبر من صفر لكل بند";
    if (f.deliveryDate && f.date && f.deliveryDate < f.date)
      e.deliveryDate = "يجب أن يكون بعد تاريخ الطلب";
    setErr(e);
    if (Object.keys(e).length) return;
    onSave({
      ...f,
      items: f.items.map((i) => ({ ...i, name: i.name.trim() })),
      payStatus: draft
        ? "draft"
        : f.payStatus === "draft"
          ? "unpaid"
          : f.payStatus,
    });
  };

  return (
    <Modal
      title={edit ? "تعديل الطلب" : "إضافة طلب جديد"}
      onClose={onClose}
      footer={
        <>
          <button className={pBtn} onClick={() => submit(false)}>
            {edit ? "حفظ التعديلات" : "إضافة الطلب"}
          </button>
          {!edit && (
            <button className={sBtn} onClick={() => submit(true)}>
              حفظ كمسودة
            </button>
          )}
          <button className={sBtn} onClick={onClose}>
            إلغاء
          </button>
          {edit && (
            <button
              className="ml-auto text-[11.5px] font-semibold text-red-600"
              onClick={onDelete}
            >
              حذف الطلب
            </button>
          )}
        </>
      }
    >
      <CustomerPicker
        list={CUSTOMERS}
        error={err.customer}
        initialText={f.customer ? `${f.customer} — ${f.company}` : ""}
        onPick={(c) =>
          setF((p) => ({
            ...p,
            customer: c?.name || "",
            company: c?.company || "",
            payTerms: c ? c.terms : p.payTerms,
          }))
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="تاريخ الطلب" required error={err.date}>
          <DateField value={f.date} onChange={(v) => set("date", v)} />
        </Field>
        <Field label="المسؤول" required>
          <SelectField value={f.owner} onChange={(v) => set("owner", v)}>
            {TEAM.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </SelectField>
        </Field>
      </div>

      <div>
        <div className="mb-1.5 text-[12px] font-medium text-ink">
          بنود الطلب
        </div>
        <div className="overflow-x-auto rounded-xl border border-line">
          <div className="min-w-[480px]">
            <div className="grid grid-cols-[1fr_56px_104px_104px_32px] gap-2 bg-[#F3F4F6] px-3 py-2.5 text-[11px] font-semibold text-neutral-500">
              <span>المنتج أو الخدمة</span>
              <span>الكمية</span>
              <span>سعر الوحدة</span>
              <span>الإجمالي</span>
              <span />
            </div>
            <datalist id="catalog">
              {CATALOG.map((c) => (
                <option key={c.name} value={c.name} />
              ))}
            </datalist>
            {f.items.map((it, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_56px_104px_104px_32px] items-center gap-2 border-t border-line/70 px-3 py-2.5"
              >
                <input
                  list="catalog"
                  value={it.name}
                  placeholder="اسم المنتج أو الخدمة"
                  className="w-full bg-transparent text-[12px] outline-none"
                  onChange={(e) => {
                    const c = CATALOG.find((x) => x.name === e.target.value);
                    setItem(
                      i,
                      c
                        ? { name: c.name, price: c.price }
                        : { name: e.target.value },
                    );
                  }}
                />
                <NumCell
                  value={it.qty}
                  onChange={(v) => setItem(i, { qty: v })}
                />
                <div className="flex items-center gap-1">
                  <NumCell
                    commas
                    value={it.price}
                    onChange={(v) => setItem(i, { price: v })}
                  />
                  <span className="text-[10.5px] text-neutral-500">ج.م</span>
                </div>
                <span className="whitespace-nowrap text-[12px]">
                  {jm(it.qty * it.price)}
                </span>
                <button
                  type="button"
                  aria-label="حذف البند"
                  disabled={f.items.length === 1}
                  className="text-neutral-400 hover:text-red-600 disabled:opacity-30"
                  onClick={() =>
                    set(
                      "items",
                      f.items.filter((_, k) => k !== i),
                    )
                  }
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <div className="border-t border-line/70 px-3 py-2.5">
              <button
                type="button"
                onClick={() => set("items", [...f.items, emptyItem()])}
                className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-white px-3.5 text-[11px] font-semibold text-ink"
              >
                إضافة بند <Plus size={12} />
              </button>
            </div>
          </div>
        </div>
        {err.items && (
          <p className="mt-1.5 text-[10.5px] text-red-600">{err.items}</p>
        )}
      </div>

      <Field label="طريقة الدفع">
        <PillGroup
          options={PAY_METHODS.map((m) => [m, m])}
          active={(k) => f.payMethod === k}
          onPick={(k) => set("payMethod", k)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="شروط الدفع">
          <SelectField value={f.payTerms} onChange={(v) => set("payTerms", v)}>
            {PAY_TERMS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </SelectField>
        </Field>
        <Field label="تاريخ التسليم المتوقع" error={err.deliveryDate}>
          <DateField
            value={f.deliveryDate}
            onChange={(v) => set("deliveryDate", v)}
          />
        </Field>
      </div>

      <SummaryBox
        rows={[
          ["الإجمالي قبل الضريبة", jm(t.subtotal)],
          [`ضريبة القيمة المضافة (${f.taxRate}%)`, jm(t.tax)],
        ]}
        total={["إجمالي الطلب", jm(t.total)]}
      />

      <Field label="ملاحظات">
        <textarea
          rows={3}
          value={f.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="أضف أي تفاصيل أو شروط خاصة بالطلب"
          className={`${inputCls} h-24 resize-none py-3`}
        />
      </Field>
    </Modal>
  );
}
