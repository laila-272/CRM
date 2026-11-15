import { useState } from "react";
import { X } from "lucide-react";

const STATUSES = [
  { value: "new", label: "جديد" },
  { value: "contacted", label: "تم التواصل" },
  { value: "qualified", label: "مؤهَّل" },
  { value: "proposal", label: "عرض سعر" },
  { value: "negotiation", label: "تفاوض" },
  { value: "declined", label: "مرفوض" },
  { value: "converted", label: "تم التحويل" },
];

const empty = {
  name: "",
  phone: "",
  altPhone: "",
  email: "",
  budget: "",
  source: "",
  status: "new",
  owner: "",
  nextFollowUp: "",
  note: "",
};

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] text-neutral-500 mb-1">{label}</span>
      {children}
    </label>
  );
}

export default function CustomerFormModal({
  initial,
  onSave,
  onClose,
  sources = [],
  members = [],
}) {
  const [f, setF] = useState(() => ({
    ...empty,
    ...(initial || {}),
    source: initial?.source_id ?? initial?.source?.id ?? "",
    owner: initial?.assigned_to?.id ?? initial?.assigned_to ?? "",
    status: initial?.status || "new",
    altPhone: initial?.whatsapp || "",
    note: initial?.notes || "",
    nextFollowUp: initial?.next_follow_up_at
      ? initial.next_follow_up_at.slice(0, 16)
      : "",
  }));

  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (k) => (e) => setF((prev) => ({ ...prev, [k]: e.target.value }));

  const select = (k, list) => (
    <select className="input" value={f[k]} onChange={set(k)}>
      <option value="">اختر</option>

      {list.map((item) => {
        const value = typeof item === "object" ? (item.id ?? item.value) : item;

        const label =
          typeof item === "object" ? (item.name ?? item.label) : item;

        return (
          <option key={value} value={value}>
            {label}
          </option>
        );
      })}
    </select>
  );

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!f.name.trim() || !/^\+?[\d\s()-]{8,20}$/.test(f.phone.trim())) {
      setErr("الاسم مطلوب ورقم الهاتف يجب أن يكون صحيحًا.");
      return;
    }

    if (!f.source || !f.owner) {
      setErr("من فضلك اختار المصدر والشخص المسؤول.");
      return;
    }

    const budget = Number(f.budget);

    if (f.budget.trim() !== "" && (!Number.isFinite(budget) || budget < 0)) {
      setErr("من فضلك أدخل ميزانية صحيحة.");
      return;
    }

    const payload = {
      name: f.name.trim(),
      email: f.email.trim() || null,
      phone: f.phone.trim(),
      whatsapp: f.altPhone.trim() || null,
      source_id: Number(f.source),
      assigned_to: Number(f.owner),
      status: f.status,
      budget: f.budget.trim() === "" ? null : budget,
      next_follow_up_at: f.nextFollowUp
        ? f.nextFollowUp.replace("T", " ") + ":00"
        : null,
      notes: f.note.trim() || null,
    };

    try {
      setSaving(true);
      await onSave(payload);
    } catch (error) {
      setErr(
        error.response?.data?.message ||
          error.message ||
          "حدث خطأ أثناء حفظ البيانات.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 grid place-items-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        onSubmit={submit}
        className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 shadow-xl"
        dir="rtl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold">
            {initial ? "تعديل بيانات العميل" : "إضافة عميل"}
          </h2>

          <button type="button" onClick={onClose} aria-label="إغلاق">
            <X size={18} />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="اسم العميل">
            <input className="input" value={f.name} onChange={set("name")} />
          </Field>

          <Field label="رقم الهاتف">
            <input
              className="input"
              dir="ltr"
              inputMode="numeric"
              value={f.phone}
              onChange={set("phone")}
            />
          </Field>

          <Field label="رقم بديل">
            <input
              className="input"
              dir="ltr"
              value={f.altPhone}
              onChange={set("altPhone")}
            />
          </Field>

          <Field label="البريد الإلكتروني">
            <input
              className="input"
              dir="ltr"
              type="email"
              value={f.email}
              onChange={set("email")}
            />
          </Field>

          <Field label="الميزانية">
            <input
              className="input"
              dir="ltr"
              placeholder="1.5 – 2 EGP M"
              value={f.budget}
              onChange={set("budget")}
            />
          </Field>

          <Field label="المصدر">{select("source", sources)}</Field>

          <Field label="الحالة">{select("status", STATUSES)}</Field>

          <Field label="الشخص المسؤول">{select("owner", members)}</Field>

          <Field label="المتابعة القادمة">
            <input
              className="input"
              type="datetime-local"
              value={f.nextFollowUp}
              onChange={set("nextFollowUp")}
            />
          </Field>
        </div>

        <Field label="ملاحظات">
          <textarea
            className="input !h-20 py-2 mt-0"
            value={f.note}
            onChange={set("note")}
          />
        </Field>

        {err && <p className="text-red-600 text-xs mt-2">{err}</p>}

        <div className="flex gap-2 mt-4">
          <button className="btn btn-dark" type="submit" disabled={saving}>
            {saving
              ? "جاري الحفظ..."
              : initial
                ? "حفظ التعديلات"
                : "إضافة العميل"}
          </button>

          <button className="btn" type="button" onClick={onClose}>
            إلغاء
          </button>
        </div>
      </form>
    </div>
  );
}
