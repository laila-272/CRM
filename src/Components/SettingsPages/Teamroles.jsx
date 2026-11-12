import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Plus, Shield, Trash2, Users } from "lucide-react";

import api from "../../Services/api-temp.js";
import { PageHeader, card, btnDark, btnLight } from "../Shared/ui.jsx";
import { Toast, useToast } from "../CRMPages/TaskModal.jsx";
import { memberCountLabel } from "../../data/Team.js";
import { Crumbs, Field, ModalShell, inputCls } from "./Teamparts.jsx";

function RoleModal({ onClose, onDone }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("اسم الدور مطلوب");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await api.post("/api/team/roles", {
        name: name.trim(),
        description: description.trim(),
      });

      if (!response.data?.success) {
        throw new Error(response.data?.message || "فشل إنشاء الدور");
      }

      onDone("تمت إضافة الدور بنجاح", response.data.data);
    } catch (err) {
      console.error("Create role error:", err);

      setError(
        err.response?.data?.errors?.name?.[0] ||
          err.response?.data?.message ||
          err.message ||
          "حدث خطأ أثناء إنشاء الدور",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      icon={Shield}
      title="إضافة دور جديد"
      subtitle="أنشئي الدور أولاً، ثم حددي صلاحياته"
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
            placeholder="مثال: أخصائي مبيعات"
            className={`${inputCls} !pr-3 ${
              error ? "border-red-400" : "border-line focus:border-[#FF7E52]"
            }`}
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
          <button
            type="submit"
            disabled={saving}
            className={`${btnDark} !h-9 !rounded-full disabled:opacity-50`}
          >
            <Plus size={13} />
            {saving ? "جاري الإضافة..." : "إضافة الدور"}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
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
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [modal, setModal] = useState(false);

  const [toast, notify] = useToast();

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setPageError("");

      const response = await api.get("/api/team/roles");

console.log("FULL ROLES RESPONSE:", response.data);
console.log("ROLES DATA:", response.data?.data);
      if (!response.data?.success || !Array.isArray(response.data?.data)) {
        throw new Error(response.data?.message || "تعذر تحميل الأدوار");
      }

      setRoles(response.data.data);
    } catch (err) {
      console.error("Fetch roles error:", err);

      setPageError(
        err.response?.data?.message ||
          err.message ||
          "حدث خطأ أثناء تحميل الأدوار",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDelete = async (role) => {
    const isOwner = role.name?.trim().toLowerCase() === "owner";

    if (isOwner) return;

    const membersCount = Number(role.users_count ?? role.users?.length ?? 0);

    if (membersCount > 0) {
      notify("لا يمكن حذف دور مرتبط بأعضاء");
      return;
    }

    if (!window.confirm(`هل تريدين حذف الدور "${role.name}"؟`)) return;

    try {
      const response = await api.delete(`/api/team/roles/${role.id}`);

      if (response.data?.success === false) {
        throw new Error(response.data?.message || "فشل حذف الدور");
      }

      setRoles((current) => current.filter((item) => item.id !== role.id));

      notify(response.data?.message || "تم حذف الدور بنجاح");
    } catch (err) {
      console.error("Delete role error:", err);

      notify(
        err.response?.data?.message || err.message || "حدث خطأ أثناء حذف الدور",
      );
    }
  };

  return (
    <div dir="rtl" className="max-w-full">
      <Crumbs
        items={[{ label: "الرئيسية", to: "/dashboard" }, { label: "الفريق" }]}
      />

      <div className="mt-2">
        <PageHeader
          title="الأدوار والصلاحيات"
          subtitle="إدارة أدوار الفريق وتحديد صلاحيات كل دور"
        >
          <button onClick={() => setModal(true)} className={btnDark}>
            <Plus size={13} />
            إضافة دور
          </button>
        </PageHeader>
      </div>

      {loading ? (
        <div className={`${card} mt-4 p-10 text-center text-neutral-500`}>
          جاري تحميل الأدوار...
        </div>
      ) : pageError ? (
        <div className={`${card} mt-4 p-8 text-center`}>
          <p className="text-sm font-semibold text-red-500">{pageError}</p>

          <button onClick={fetchRoles} className={`${btnLight} mt-4`}>
            إعادة المحاولة
          </button>
        </div>
      ) : roles.length === 0 ? (
        <div className={`${card} mt-4 p-10 text-center text-neutral-500`}>
          لا توجد أدوار حتى الآن
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => {
            const isOwner = role.name?.trim().toLowerCase() === "owner";

            const membersCount = Number(
              role.users_count ?? role.users?.length ?? 0,
            );

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
                      {memberCountLabel(membersCount)}
                    </p>
                  </div>

                  {!isOwner && (
                    <button
                      onClick={() => handleDelete(role)}
                      aria-label="حذف الدور"
                      className={`${iconBtn} hover:!bg-red-50 hover:!text-red-500`}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>

                <p className="mt-3 flex-1 text-[11px] leading-5 text-neutral-500">
                  {role.description || "لا يوجد وصف لهذا الدور"}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link to={`/roles/${role.id}/members`} className={btnLight}>
                    <Eye size={12} />
                    عرض الأعضاء
                  </Link>

                  <Link
                    to={`/roles/${role.id}/permissions`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full bg-green-700 px-3.5 text-[11px] font-semibold text-white hover:bg-green-800"
                  >
                    <Shield size={12} />
                    See Permissions
                  </Link>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {modal && (
        <RoleModal
          onClose={() => setModal(false)}
          onDone={(message, newRole) => {
            setRoles((current) => [...current, newRole]);
            setModal(false);
            notify(message);
          }}
        />
      )}

      <Toast message={toast} />
    </div>
  );
}
