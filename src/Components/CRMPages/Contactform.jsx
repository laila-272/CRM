import { useEffect, useState } from "react";
import { Modal, Field, inputCls } from "../AccountingPages/Accountingui.jsx";
import { PROJECTS, STATUSES } from "../../data/contacts.js";
import { getTeamMembers } from "../../Services/contactService.js";

const EMPTY = {
  name: "",
  kind: "فرد",
  phone: "",
  email: "",
  address: "",
  job: "",
  project: PROJECTS[0],
  owner: "",
  status: "نشط",
  source: "",
  sourceId: null,
  value: "",
  notes: "",
  whatsapp: "",
};

const STATUS_LABELS = {
  active: "نشط",
  inactive: "غير نشط",
  declined: "مرفوض",
};

const getInitialValues = (contact, sources) => {
  if (!contact) return { ...EMPTY };

  const raw = contact.raw || {};

  const sourceId =
    raw.source?.id ??
    raw.source_id ??
    contact.sourceId ??
    contact.source_id ??
    null;

  const sourceName =
    sources.find((item) => String(item.id) === String(sourceId))?.name ||
    raw.source?.name ||
    contact.source ||
    "";

  return {
    ...EMPTY,
    ...contact,
    name: contact.name || "",
    phone: contact.phone || "",
    whatsapp: contact.whatsapp || raw.whatsapp || "",
    email: contact.email || "",
    address: contact.address || "",
    notes: contact.notes || "",
    owner: String(raw.assigned_to?.id ?? contact.ownerId ?? ""),
    source: sourceName,
    sourceId: sourceId ? Number(sourceId) : null,
    status:
      STATUS_LABELS[raw.status] ||
      STATUS_LABELS[contact.apiStatus] ||
      contact.status ||
      "نشط",
  };
};

export default function ContactForm({
  contact,
  sources = [],
  sourcesLoading = false,
  onClose,
  onSave,
  saving = false,
}) {
  const [f, setF] = useState(() => getInitialValues(contact, sources));
  const [err, setErr] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);

  // Update form values when contact or sources change
  useEffect(() => {
    setF(getInitialValues(contact, sources));
  }, [contact, sources]);

  // Load team members
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const members = await getTeamMembers();

        setTeamMembers(members.filter((member) => member.status === "active"));
      } catch (error) {
        console.error("Team members error:", error.response?.data || error);
        setErr("تعذر تحميل أعضاء الفريق");
      } finally {
        setTeamLoading(false);
      }
    };

    fetchTeam();
  }, []);

  const set = (key) => (e) => {
    setF((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  // Handle source selection using API ID
  const handleSourceChange = (e) => {
    const selectedId = e.target.value;

    const selectedSource = sources.find(
      (item) => String(item.id) === selectedId,
    );

    setF((prev) => ({
      ...prev,
      sourceId: selectedSource ? Number(selectedSource.id) : null,
      source: selectedSource?.name || "",
    }));
  };

  const submit = () => {
    if (!f.name.trim()) {
      setErr("أدخل اسم جهة الاتصال");
      return;
    }

    if (!/^[+\d\s-]{8,}$/.test(f.phone)) {
      setErr("أدخل رقم هاتف صحيحاً");
      return;
    }

    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) {
      setErr("البريد الإلكتروني غير صحيح");
      return;
    }

    setErr("");

    onSave({
      ...f,
      name: f.name.trim(),
      sourceId: f.sourceId ? Number(f.sourceId) : null,
      value: Number(f.value) || 0,
    });
  };

  const sel = (key, list) => (
    <select className={inputCls} value={f[key]} onChange={set(key)}>
      {list.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  );

  // Keep the existing source visible when editing
  const currentSourceExists = sources.some(
    (item) => String(item.id) === String(f.sourceId),
  );

  return (
    <Modal
      title={contact ? "تعديل بيانات العميل" : "إضافة جهة اتصال"}
      onClose={onClose}
      onSubmit={submit}
      submitLabel={
        saving ? "جاري الحفظ..." : contact ? "حفظ التعديلات" : "إضافة"
      }
    >
      <Field label="الاسم" full>
        <input
          className={inputCls}
          value={f.name}
          onChange={set("name")}
          autoFocus
        />
      </Field>

      <Field label="النوع">{sel("kind", ["فرد", "شركة"])}</Field>

      <Field label="الهاتف">
        <input
          dir="ltr"
          className={inputCls}
          value={f.phone}
          onChange={set("phone")}
        />
      </Field>

      <Field label="البريد الإلكتروني">
        <input
          dir="ltr"
          className={inputCls}
          value={f.email}
          onChange={set("email")}
        />
      </Field>

      <Field label="العنوان">
        <input
          className={inputCls}
          value={f.address}
          onChange={set("address")}
        />
      </Field>

      <Field label="المشروع">{sel("project", PROJECTS)}</Field>

      <Field label="المسؤول (اختياري)">
        <select
          className={inputCls}
          value={f.owner}
          onChange={set("owner")}
          disabled={teamLoading}
        >
          <option value="">
            {teamLoading ? "جاري تحميل الفريق..." : "بدون مسؤول"}
          </option>

          {teamMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="الحالة">{sel("status", STATUSES)}</Field>

      <Field label="المصدر">
        <select
          className={inputCls}
          value={f.sourceId ? String(f.sourceId) : ""}
          onChange={handleSourceChange}
          disabled={sourcesLoading}
        >
          <option value="">
            {sourcesLoading ? "جاري تحميل المصادر..." : "اختر مصدر العميل"}
          </option>

          {f.sourceId && !currentSourceExists && (
            <option value={String(f.sourceId)}>
              {f.source || "المصدر الحالي"}
            </option>
          )}

          {sources.map((item) => (
            <option key={item.id} value={String(item.id)}>
              {item.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="قيمة التعاملات (ج.م)">
        <input
          type="number"
          min="0"
          className={inputCls}
          value={f.value}
          onChange={set("value")}
        />
      </Field>

      <Field label="ملاحظات" full>
        <textarea
          rows={2}
          className={`${inputCls} h-auto py-2`}
          value={f.notes}
          onChange={set("notes")}
        />
      </Field>

      {err && (
        <p role="alert" className="col-span-2 text-[11px] text-red-600">
          {err}
        </p>
      )}
    </Modal>
  );
}
