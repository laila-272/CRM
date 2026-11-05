import { useState } from "react";
import { Mail, Phone, User, UserPlus, Send } from "lucide-react";
import { btnDark, btnLight, Select } from "../Shared/ui.jsx";
import { loadPermissions } from "../../data/Permissions.js";
import { addUser, updateUser, emailTaken } from "../../data/Team.js";
import { Field, ModalShell, Switch, inputCls } from "./Teamparts.jsx";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[\d\s-]{7,15}$/;

/**
 * user: existing user to edit, or undefined to create.
 * defaultRoleId: role preselected when creating. onDone(message, savedFields): called after a successful save. onClose(): close without saving.
 */
export default function UserModal({
  user,
  roles,
  defaultRoleId = "",
  onClose,
  onDone,
}) {
  const editing = !!user;
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    roleId: user?.roleId ?? defaultRoleId,
    active: user ? user.status !== "suspended" : true,
    invite: !editing,
  });
  const [errors, setErrors] = useState({});
  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "الاسم الكامل مطلوب";
    if (!form.email.trim()) e.email = "البريد الإلكتروني مطلوب";
    else if (!EMAIL_RE.test(form.email.trim()))
      e.email = "صيغة البريد الإلكتروني غير صحيحة";
    else if (emailTaken(form.email.trim(), user?.id))
      e.email = "هذا البريد مستخدم بالفعل";
    if (form.phone.trim() && !PHONE_RE.test(form.phone.trim()))
      e.phone = "رقم الهاتف غير صحيح";
    if (!form.roleId) e.roleId = "اختر الدور";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const base = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      roleId: form.roleId,
    };
    if (editing) {
      const status = !form.active
        ? "suspended"
        : user.status === "suspended"
          ? "active"
          : user.status;
      updateUser(user.id, { ...base, status });
      onDone("تم حفظ بيانات العضو", base);
    } else {
      addUser({
        ...base,
        status: !form.active ? "suspended" : form.invite ? "invited" : "active",
      });
      onDone("تمت إضافة العضو بنجاح", base);
    }
  };

  const border = (k) =>
    errors[k] ? "border-red-400" : "border-line focus:border-[#FF7E52]";
  const permCount = form.roleId ? loadPermissions(form.roleId).length : null;

  return (
    <ModalShell
      icon={UserPlus}
      title={editing ? "تعديل بيانات العضو" : "إضافة عضو جديد"}
      subtitle={
        editing
          ? "عدّل بيانات المستخدم ودوره في النظام"
          : "أدخل بيانات المستخدم وحدّد دوره، وسيتم إرسال دعوة له"
      }
      onClose={onClose}
    >
      <form onSubmit={submit} noValidate className="mt-5 space-y-3.5">
        <Field label="الاسم الكامل" error={errors.name}>
          <div className="relative">
            <User
              size={14}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              autoFocus
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="مثال: أحمد محمد"
              className={`${inputCls} ${border("name")}`}
            />
          </div>
        </Field>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="البريد الإلكتروني" error={errors.email}>
            <div className="relative">
              <Mail
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                dir="ltr"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="name@company.com"
                className={`${inputCls} text-right ${border("email")}`}
              />
            </div>
          </Field>
          <Field label="رقم الهاتف" error={errors.phone}>
            <div className="relative">
              <Phone
                size={14}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
              />
              <input
                dir="ltr"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="01xxxxxxxxx"
                className={`${inputCls} text-right ${border("phone")}`}
              />
            </div>
          </Field>
        </div>

        <Field label="الدور" error={errors.roleId}>
          <Select
            value={form.roleId}
            onChange={(v) => set("roleId", v)}
            className="!h-10 !text-[12px] !font-normal"
          >
            <option value="">اختر الدور</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </Field>

        {permCount !== null && (
          <div className="flex items-center justify-between gap-2 rounded-lg border border-green-100 bg-green-50 px-3 py-2 text-[10.5px]">
            <span className="text-neutral-500">
              يرث المستخدم صلاحيات هذا الدور
            </span>
            <span className="font-semibold text-green-700">
              {permCount} صلاحية مفعّلة
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-1">
          <div>
            <p className="text-[11.5px] font-bold text-ink">حساب نشط</p>
            <p className="mt-0.5 text-[10px] text-neutral-500">
              عند الإيقاف لن يتمكن المستخدم من تسجيل الدخول
            </p>
          </div>
          <Switch
            on={form.active}
            onChange={(v) => set("active", v)}
            label="حساب نشط"
          />
        </div>

        {!editing && (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11.5px] font-bold text-ink">
                إرسال دعوة بالبريد الإلكتروني
              </p>
              <p className="mt-0.5 text-[10px] text-neutral-500">
                سيصله رابط لتعيين كلمة المرور
              </p>
            </div>
            <Switch
              on={form.invite}
              onChange={(v) => set("invite", v)}
              label="إرسال دعوة"
            />
          </div>
        )}

        <div className="flex items-center justify-start gap-2 pt-2">
          <button type="submit" className={`${btnDark} !h-9 !rounded-full`}>
            <Send size={12} /> {editing ? "حفظ التغييرات" : "إضافة العضو"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`${btnLight} !h-9`}
          >
            إلغاء
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
