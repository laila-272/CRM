import { useEffect, useState } from "react";
import { Modal, Field, inputCls } from "../AccountingPages/Accountingui.jsx";
import { PROJECTS, SOURCES, STATUSES } from "../../data/contacts.js";
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
  source: SOURCES[0],
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

const SOURCE_ID_TO_LABEL = {
  1: "فيسبوك",
  6: "إحالة",
  9: "موقع إلكتروني",
  11: "معرض",
  10: "واتساب",
};

const getInitialValues = (contact) => {
  if (!contact) return { ...EMPTY };

  const raw = contact.raw || {};
  const sourceId = raw.source?.id ?? contact.sourceId ?? null;
  const sourceName =
    SOURCE_ID_TO_LABEL[sourceId] ||
    raw.source?.name ||
    contact.source ||
    SOURCES[0];

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
    sourceId,
    status:
      STATUS_LABELS[raw.status] ||
      STATUS_LABELS[contact.apiStatus] ||
      contact.status ||
      "نشط",
  };
};

export default function ContactForm({
  contact,
  onClose,
  onSave,
  saving = false,
}) {
  const [f, setF] = useState(() => getInitialValues(contact));
  const [err, setErr] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);

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

  const set = (key) => (e) =>
    setF((prev) => ({ ...prev, [key]: e.target.value }));

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
      value: Number(f.value) || 0,
    });
  };

  const sel = (key, list) => {
    const options =
      key === "source" && f.source && !list.includes(f.source)
        ? [...list, f.source]
        : list;

    return (
      <select className={inputCls} value={f[key]} onChange={set(key)}>
        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    );
  };

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

      <Field label="المصدر">{sel("source", SOURCES)}</Field>

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
