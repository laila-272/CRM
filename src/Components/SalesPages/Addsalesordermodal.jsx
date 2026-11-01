import { useState } from "react";
import {
  jm,
  calcTotals,
  nextNumber,
  today,
  APPROVERS,
  PAY_METHODS,
  PAY_STATUS,
  TEAM,
} from "../../data/salesData.js";
import {
  Modal,
  Field,
  SelectField,
  DateField,
  PillGroup,
  SummaryBox,
  UnitInput,
  inputCls,
  pBtn,
  sBtn,
} from "./Shared.jsx";

const orderTotal = (o) => calcTotals(o.items, o.taxRate).total;

export default function AddSalesOrderModal({
  initial,
  salesOrders,
  linkable,
  onSave,
  onDelete,
  onClose,
}) {
  const edit = !!initial;
  const [f, setF] = useState(() =>
    initial
      ? { ...initial }
      : {
          number: nextNumber("أ-", salesOrders),
          orderNumber: "",
          customer: "",
          company: "",
          date: today(),
          deliveryDate: "",
          approver: APPROVERS[0],
          status: "draft",
          payStatus: "unpaid",
          firstPayment: 0,
          payMethod: "تحويل بنكي",
          value: 0,
          owner: TEAM[0],
          notes: "",
        },
  );
  const [err, setErr] = useState({});
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));

  const link = (num) => {
    const o = linkable.find((x) => x.number === num);
    if (!o)
      return setF((p) => ({
        ...p,
        orderNumber: "",
        customer: "",
        company: "",
        value: 0,
        firstPayment: 0,
      }));
    const value = orderTotal(o);
    setF((p) => ({
      ...p,
      orderNumber: o.number,
      customer: o.customer,
      company: o.company,
      owner: o.owner,
      value,
      payMethod: o.payMethod,
      firstPayment:
        p.payStatus === "paid" ? value : Math.min(p.firstPayment, value),
    }));
  };
  const pickPay = (k) =>
    setF((p) => ({
      ...p,
      payStatus: k,
      firstPayment:
        k === "paid" ? p.value : k === "unpaid" ? 0 : p.firstPayment,
    }));
  const remaining = Math.max(f.value - f.firstPayment, 0);

  const submit = (forced) => {
    const e = {};
    if (!f.orderNumber) e.orderNumber = "اختر الطلب المرتبط";
    if (!f.date) e.date = "حدد تاريخ الأمر";
    if (!f.deliveryDate) e.deliveryDate = "حدد تاريخ التسليم المتوقع";
    else if (f.date && f.deliveryDate < f.date)
      e.deliveryDate = "يجب أن يكون بعد تاريخ الأمر";
    if (!f.approver) e.approver = "اختر المعتمِد";
    if (f.firstPayment > f.value)
      e.firstPayment = "الدفعة الأولى أكبر من قيمة الأمر";
    setErr(e);
    if (Object.keys(e).length) return;
    const status =
      forced || (f.status === "draft" && !edit ? "pending" : f.status);
    onSave({ ...f, status });
  };

  return (
    <Modal
      title={edit ? "تعديل أمر البيع" : "أمر بيع جديد"}
      onClose={onClose}
      footer={
        <>
          <button className={pBtn} onClick={() => submit()}>
            {edit ? "حفظ التعديلات" : "إرسال للاعتماد"}
          </button>
          {!edit && (
            <button className={sBtn} onClick={() => submit("draft")}>
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
              حذف الأمر
            </button>
          )}
        </>
      }
    >
      <Field
        label="الطلب المرتبط"
        required
        error={err.orderNumber}
        hint="تُملأ بيانات العميل والبنود تلقائياً من الطلب المرتبط."
      >
        <SelectField value={f.orderNumber} onChange={link}>
          <option value="">اختر الطلب المرتبط</option>
          {linkable.map((o) => (
            <option key={o.number} value={o.number}>
              {o.number} — {o.items[0].name}
            </option>
          ))}
        </SelectField>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="العميل">
          <div
            className={`${inputCls} flex items-center bg-[#F3F4F6] ${f.customer ? "" : "text-neutral-400"}`}
          >
            {f.customer ? `${f.customer} — ${f.company}` : "يُملأ تلقائياً"}
          </div>
        </Field>
        <Field label="تاريخ الأمر" required error={err.date}>
          <DateField value={f.date} onChange={(v) => set("date", v)} />
        </Field>
        <Field label="المعتمِد" required error={err.approver}>
          <SelectField value={f.approver} onChange={(v) => set("approver", v)}>
            {APPROVERS.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </SelectField>
        </Field>
        <Field label="تاريخ التسليم المتوقع" required error={err.deliveryDate}>
          <DateField
            value={f.deliveryDate}
            onChange={(v) => set("deliveryDate", v)}
          />
        </Field>
      </div>

      <Field label="حالة الاعتماد">
        <PillGroup
          options={[
            ["draft", "مسودة"],
            ["pending", "بانتظار الاعتماد"],
            ["approved", "معتمد"],
          ]}
          active={(k) => f.status === k}
          onPick={(k) => set("status", k)}
        />
      </Field>
      <Field label="حالة الدفع">
        <PillGroup
          options={[
            ["unpaid", PAY_STATUS.unpaid],
            ["partial", PAY_STATUS.partial],
            ["paid", PAY_STATUS.paid],
          ]}
          active={(k) => f.payStatus === k}
          onPick={pickPay}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="الدفعة الأولى" error={err.firstPayment}>
          <UnitInput
            commas
            unit="ج.م"
            value={f.firstPayment}
            onChange={(v) => set("firstPayment", v)}
          />
        </Field>
        <Field label="طريقة الدفع">
          <SelectField
            value={f.payMethod}
            onChange={(v) => set("payMethod", v)}
          >
            {PAY_METHODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </SelectField>
        </Field>
      </div>

      <SummaryBox
        rows={[
          ["قيمة الأمر", jm(f.value)],
          ["المدفوع", jm(f.firstPayment)],
        ]}
        total={["المتبقي", jm(remaining)]}
      />

      <Field label="ملاحظات">
        <textarea
          rows={3}
          value={f.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="أضف أي تفاصيل أو شروط خاصة بالأمر"
          className={`${inputCls} h-24 resize-none py-3`}
        />
      </Field>
    </Modal>
  );
}
