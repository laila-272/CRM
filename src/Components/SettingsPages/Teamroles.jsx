import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Plus, Shield, Trash2, Users } from "lucide-react";
import { PageHeader, card, btnDark, btnLight } from "../Shared/ui.jsx";
import { Toast, useToast } from "../CRMPages/TaskModal.jsx";
import {
  addRole,
  countByRole,
  memberCountLabel,
  removeRole,
  updateRole,
  useTeam,
} from "../../data/Team.js";
import { Crumbs, Field, ModalShell, inputCls } from "./Teamparts.jsx";

function RoleModal({ role, onClose, onDone }) {
  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) return setError("اسم الدور مطلوب");
    const data = { name: name.trim(), description: description.trim() };
    if (role) {
      updateRole(role.id, data);
      onDone("تم تحديث الدور");
    } else {
      addRole(data);
      onDone("تمت إضافة الدور");
    }
  };

  return (
    <ModalShell
      icon={Shield}
      title={role ? "تعديل الدور" : "إضافة دور جديد"}
      subtitle="حدّد اسم الدور ووصفه، ثم اضبط صلاحياته من صفحة الصلاحيات"
      onClose={onClose}
    >
      <form onSubmit={submit} noValidate className="mt-5 space-y-3.5">
        <Field label="اسم الدور" error={error}>
          <input
            autoFocus
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="مثال: مسؤول دعم"
            className={`${inputCls} !pr-3 ${error ? "border-red-400" : "border-line focus:border-[#FF7E52]"}`}
          />
        </Field>
        <Field label="الوصف">
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وصف مختصر لمسؤوليات هذا الدور"
            className="w-full resize-none rounded-lg border border-line bg-white px-3 py-2 text-[12px] outline-none placeholder:text-neutral-400 focus:border-[#FF7E52]"
          />
        </Field>
        <div className="flex items-center gap-2 pt-2">
          <button type="submit" className={`${btnDark} !h-9 !rounded-full`}>
            {role ? "حفظ" : "إضافة الدور"}
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

const iconBtn =
  "grid h-7 w-7 place-items-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-ink";

export default function TeamRoles() {
  const { users, roles } = useTeam();
  const [modal, setModal] = useState(null); // { role? }
  const [toast, notify] = useToast();

  const onDelete = (role) => {
    if (users.some((u) => u.roleId === role.id)) {
      notify("لا يمكن حذف دور مرتبط بأعضاء");
      return;
    }
    if (!window.confirm(`حذف الدور "${role.name}"؟`)) return;
    if (removeRole(role.id)) notify("تم حذف الدور");
  };

  return (
    <div dir="rtl" className="max-w-full">
      <Crumbs items={[{ label: "الرئيسية", to: "/dashboard" }, { label: "الفريق" }]} />

      <div className="mt-2">
        <PageHeader
          title="الصلاحيات"
          subtitle="إدارة أدوار الفريق وأعضائه وصلاحيات كل دور"
        >
          <button onClick={() => setModal({})} className={btnDark}>
            <Plus size={13} /> إضافة دور
          </button>
        </PageHeader>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roles.map((role) => {
          const n = countByRole(users, role.id);
          return (
            <section key={role.id} className={`${card} flex flex-col p-5`}>
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FF7E52] text-white">
                  <Users size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[14px] font-bold text-ink">
                    {role.name}
                  </h2>
                  <p className="mt-0.5 text-[10px] text-neutral-500">
                    {memberCountLabel(n)}
                  </p>
                </div>
                {!role.locked && (
                  <div className="flex shrink-0 items-center">
                    <button
                      onClick={() => setModal({ role })}
                      aria-label="تعديل الدور"
                      className={iconBtn}
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => onDelete(role)}
                      aria-label="حذف الدور"
                      className={`${iconBtn} hover:!bg-red-50 hover:!text-red-500`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
              <p className="mt-3 flex-1 text-[11px] leading-5 text-neutral-500">
                {role.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link
                  to={`/roles/${role.id}/members`}
                  className={btnLight}
                >
                  <Eye size={12} /> عرض الأعضاء
                </Link>
                {role.id.trim().toLowerCase() !== "owner" && (
                  <Link
                    to={`/roles/${role.id}/permissions`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full bg-green-700 px-3.5 text-[11px] font-semibold text-white hover:bg-green-800"
                  >
                    <Shield size={12} /> الصلاحيات
                  </Link>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {modal && (
        <RoleModal
          role={modal.role}
          onClose={() => setModal(null)}
          onDone={(msg) => {
            setModal(null);
            notify(msg);
          }}
        />
      )}
      <Toast message={toast} />
    </div>
  );
}
