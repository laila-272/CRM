import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  Pencil,
  Power,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { PageHeader, card, btnDark, btnLight, th, td } from "../Shared/ui.jsx";
import { Toast, useToast } from "../CRMPages/TaskModal.jsx";
import {
  STATUS,
  formatLastLogin,
  memberCountLabel,
  removeUser,
  toggleUserActive,
  useTeam,
} from "../../data/Team.js";
import { Crumbs } from "./Teamparts.jsx";
import UserModal from "./Usermodal.jsx";

export default function RoleMembers() {
  const { roleId } = useParams();
  const { users, roles } = useTeam();
  const [modal, setModal] = useState(null); // { user? }
  const [toast, notify] = useToast();

  const role = roles.find((r) => r.id === roleId);

  if (!role) {
    return (
      <div dir="rtl" className={`${card} p-8 text-center`}>
        <p className="text-[13px] font-bold text-ink">الدور غير موجود</p>
        <Link to="/roles" className={`${btnLight} mt-4`}>
          العودة إلى الأدوار <ArrowRight size={13} />
        </Link>
        <Toast message={toast} />
      </div>
    );
  }

  const members = users.filter((u) => u.roleId === role.id);

  const onDelete = (u) => {
    if (!window.confirm(`حذف العضو "${u.name}"؟`)) return;
    removeUser(u.id);
    notify("تم حذف العضو");
  };
  const onToggle = (u) => {
    toggleUserActive(u.id);
    notify(u.status === "suspended" ? "تم تفعيل الحساب" : "تم تعليق الحساب");
  };
  const roleName = (id) => roles.find((r) => r.id === id)?.name;

  const actionBtn =
    "grid h-7 w-7 place-items-center rounded-md hover:bg-neutral-100 hover:text-ink";

  return (
    <div dir="rtl" className="max-w-full">
      <Crumbs
        items={[
          { label: "الرئيسية", to: "/" },
          { label: "الفريق", to: "/roles" },
          { label: role.name },
        ]}
      />

      <div className="mt-2">
        <PageHeader
          title="الأعضاء"
          subtitle="إدارة المستخدمين المرتبطين بهذا الدور"
        >
          <Link to="/roles" className={btnLight}>
            العودة إلى الأدوار <ArrowRight size={13} />
          </Link>
          <Link to={`/roles/${role.id}/permissions`} className={btnLight}>
            <Shield size={13} /> إدارة الصلاحيات
          </Link>
          <button onClick={() => setModal({})} className={btnDark}>
            <UserPlus size={13} /> إضافة عضو
          </button>
        </PageHeader>
      </div>

      <section
        className={`${card} mt-4 flex flex-wrap items-center justify-between gap-3 p-5`}
      >
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#FF7E52] text-white">
            <Users size={20} />
          </span>
          <div>
            <h2 className="text-[14px] font-bold text-ink">{role.name}</h2>
            <p className="mt-0.5 text-[10.5px] text-neutral-500">
              {role.description}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-[#FF7E52]/10 px-3 py-1 text-[11px] font-semibold text-[#FF7E52]">
          {memberCountLabel(members.length)}
        </span>
      </section>

      <section className={`${card} mt-4 overflow-hidden`}>
        <div className="px-5 pt-5">
          <h2 className="text-[13px] font-bold text-ink">أعضاء الدور</h2>
          <p className="mt-0.5 text-[10.5px] text-neutral-500">
            حسابات الفريق المعيّنة لدور {role.name}
          </p>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr>
                <th className={th}>الاسم</th>
                <th className={th}>البريد الإلكتروني</th>
                <th className={th}>آخر دخول</th>
                <th className={th}>الحالة</th>
                <th className={`${th} w-24`}>
                  <span className="sr-only">إجراءات</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {members.map((u) => {
                const st = STATUS[u.status] ?? STATUS.active;
                return (
                  <tr key={u.id} className="border-t border-line">
                    <td className={`${td} font-semibold`}>{u.name}</td>
                    <td
                      className={`${td} text-neutral-500`}
                      dir="ltr"
                      style={{ textAlign: "right" }}
                    >
                      {u.email}
                    </td>
                    <td className={`${td} text-neutral-500`}>
                      {formatLastLogin(u.lastLogin)}
                    </td>
                    <td className={td}>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${st.cls}`}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className={td}>
                      <div className="flex items-center gap-1 text-neutral-500">
                        <button
                          onClick={() => setModal({ user: u })}
                          aria-label="تعديل"
                          title="تعديل"
                          className={actionBtn}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => onToggle(u)}
                          aria-label={
                            u.status === "suspended" ? "تفعيل" : "تعليق"
                          }
                          title={
                            u.status === "suspended"
                              ? "تفعيل الحساب"
                              : "تعليق الحساب"
                          }
                          className={actionBtn}
                        >
                          <Power size={13} />
                        </button>
                        <button
                          onClick={() => onDelete(u)}
                          aria-label="حذف"
                          title="حذف"
                          className={`${actionBtn} hover:!bg-red-50 hover:!text-red-500`}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {members.length === 0 && (
                <tr className="border-t border-line">
                  <td
                    colSpan={5}
                    className="px-3 py-10 text-center text-[11px] text-neutral-400"
                  >
                    لا يوجد أعضاء في هذا الدور بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {modal && (
        <UserModal
          user={modal.user}
          defaultRoleId={role.id}
          roles={roles}
          onClose={() => setModal(null)}
          onDone={(msg, saved) => {
            setModal(null);
            const moved = saved && saved.roleId !== role.id;
            notify(
              moved ? `${msg} — نُقل إلى دور ${roleName(saved.roleId)}` : msg,
            );
          }}
        />
      )}
      <Toast message={toast} />
    </div>
  );
}
