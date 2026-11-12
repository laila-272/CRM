import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronDown,
  LayoutDashboard,
  Save,
  Shield,
  Users,
} from "lucide-react";

import api from "../../Services/api-temp.js";
import { PageHeader, card, btnDark, btnLight } from "../Shared/ui.jsx";
import { Toast, useToast } from "../CRMPages/TaskModal.jsx";

const GROUP_TITLES = {
  dashboard: "لوحة التحكم",
  deals: "الصفقات",
  customers: "العملاء",
  leads: "العملاء المحتملون",
  invoices: "الفواتير",
  expenses: "المصروفات",
  contracts: "العقود",
  vendors: "الموردون",
  tasks: "المهام",
  appointments: "المواعيد",
  team_management: "إدارة الفريق",
  member_management: "إدارة الأعضاء",
  company_settings: "إعدادات الشركة",
  other: "صلاحيات أخرى",
};

const GROUP_ICONS = {
  dashboard: LayoutDashboard,
  customers: Users,
};

function Switch({ on, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
        on ? "bg-[#FF7E52]" : "bg-neutral-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
          on ? "right-[18px]" : "right-0.5"
        }`}
      />
    </button>
  );
}

function PermissionRow({ permission, checked, onToggle }) {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-[11px] leading-5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#FF7E52] ${
        checked
          ? "border-[#FF7E52] bg-[#FF7E52]/10 font-bold text-ink"
          : "border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50"
      }`}
    >
      <span>{permission.description || permission.name}</span>

      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={() => onToggle(Number(permission.id))}
      />

      <span
        aria-hidden
        className={`grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border ${
          checked
            ? "border-[#FF7E52] bg-[#FF7E52] text-white"
            : "border-neutral-300 bg-white"
        }`}
      >
        {checked && <Check size={11} strokeWidth={3} />}
      </span>
    </label>
  );
}

function PermissionGroup({ group, selected, onToggle, onSetMany }) {
  const [open, setOpen] = useState(true);

  const Icon = GROUP_ICONS[group.group] || Shield;

  const ids = group.permissions.map((permission) => Number(permission.id));

  const count = ids.filter((id) => selected.has(id)).length;
  const allOn = ids.length > 0 && count === ids.length;

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex items-center justify-between gap-2 bg-[#111] px-4 py-3 text-white">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[#FF7E52]/60 text-[#FF7E52]">
            <Icon size={13} />
          </span>

          <h2 className="truncate text-[12.5px] font-bold">
            {GROUP_TITLES[group.group] || group.group}
          </h2>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onSetMany(ids, !allOn)}
            className="text-[10px] text-white/70 underline-offset-2 hover:text-white hover:underline"
          >
            {allOn ? "إلغاء التحديد" : "تحديد الكل"}
          </button>

          <span
            className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-ink"
            dir="ltr"
          >
            {count}/{ids.length}
          </span>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? "طي القسم" : "فتح القسم"}
            className="text-white/80 hover:text-white"
          >
            <ChevronDown
              size={14}
              className={`transition-transform ${open ? "" : "-rotate-90"}`}
            />
          </button>
        </div>
      </div>

      {open && (
        <div className="space-y-2 p-3">
          {group.permissions.map((permission) => (
            <PermissionRow
              key={permission.id}
              permission={permission}
              checked={selected.has(Number(permission.id))}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function UsersPermissions() {
  const { roleId } = useParams();

  const [role, setRole] = useState(null);
  const [groups, setGroups] = useState([]);
  const [saved, setSaved] = useState([]);
  const [selected, setSelected] = useState(new Set());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [toast, notify] = useToast();

  // Load full permissions catalog + selected role assignments
  useEffect(() => {
    let active = true;

    async function fetchRolePermissions() {
      setLoading(true);
      setError("");

      try {
        // 1. Get selected role and its assigned permissions
        const roleResponse = await api.get(
          `/api/team/roles/${roleId}/permissions`,
        );

        const roleData = roleResponse.data?.data;

        if (!roleResponse.data?.success || !roleData) {
          throw new Error(roleResponse.data?.message || "تعذر تحميل الصلاحيات");
        }

        // 2. Find Owner role
        const rolesResponse = await api.get("/api/team/roles");

        const owner = rolesResponse.data?.data?.find(
          (item) => item.name?.trim().toLowerCase() === "owner",
        );

        if (!owner) {
          throw new Error("تعذر العثور على دور Owner");
        }

        // 3. Always get the full catalog from Owner
        const ownerResponse = await api.get(
          `/api/team/roles/${owner.id}/permissions`,
        );

        const availableGroups =
          ownerResponse.data?.data?.grouped_permissions || [];

        if (availableGroups.length === 0) {
          throw new Error("قائمة الصلاحيات المتاحة فارغة");
        }

        // 4. Get assigned permissions ONLY from selected role
        const assignedPermissions = roleData.permissions || [];

        const assignedIds = assignedPermissions.map((permission) =>
          Number(permission.id),
        );

        if (!active) return;

        setRole(roleData.role);
        setGroups(availableGroups);
        setSaved(assignedIds);
        setSelected(new Set(assignedIds));
      } catch (err) {
        console.error("Fetch permissions error:", err);

        if (active) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "حدث خطأ أثناء تحميل الصلاحيات",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    if (roleId) {
      fetchRolePermissions();
    }

    return () => {
      active = false;
    };
  }, [roleId]);

  // All available permissions
  const allPermissions = useMemo(
    () => groups.flatMap((group) => group.permissions || []),
    [groups],
  );

  const allIds = useMemo(
    () => allPermissions.map((permission) => Number(permission.id)),
    [allPermissions],
  );

  const count = selected.size;

  const allOn = allIds.length > 0 && allIds.every((id) => selected.has(id));

  const dirty = count !== saved.length || saved.some((id) => !selected.has(id));

  // Toggle one permission
  const toggle = (id) => {
    const permissionId = Number(id);

    setSelected((current) => {
      const next = new Set(current);

      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }

      return next;
    });
  };

  // Select or deselect a group / all permissions
  const setMany = (ids, on) => {
    setSelected((current) => {
      const next = new Set(current);

      ids.forEach((id) => {
        const permissionId = Number(id);

        if (on) {
          next.add(permissionId);
        } else {
          next.delete(permissionId);
        }
      });

      return next;
    });
  };

  // Save permissions
  const save = async () => {
    try {
      setSaving(true);

      const permissionIds = allIds.filter((id) => selected.has(id));

      console.log("GROUPS:", groups);
      console.log("ALL IDS:", allIds);
      console.log("SELECTED:", [...selected]);
      console.log("PERMISSION IDS:", permissionIds);

      const response = await api.post(`/api/team/roles/${roleId}/permissions`, {
        permissions: permissionIds,
      });

      console.log("PERMISSIONS RESPONSE:", response.data);
      console.log("GROUPED:", response.data?.data?.grouped_permissions);
      console.log("ASSIGNED:", response.data?.data?.permissions);

      if (response.data?.success === false) {
        throw new Error(response.data?.message || "فشل حفظ الصلاحيات");
      }

      setSaved(permissionIds);
      setSelected(new Set(permissionIds));

      notify(response.data?.message || "تم حفظ الصلاحيات بنجاح");
    } catch (err) {
      console.error("SAVE STATUS:", err.response?.status);
      console.error("SAVE RESPONSE:", err.response?.data);

      console.error("SENT DATA:", {
        permissions: allIds.filter((id) => selected.has(id)),
      });

      const message =
        err.response?.data?.message ||
        err.response?.data?.errors?.permissions?.[0] ||
        err.message ||
        "حدث خطأ أثناء حفظ الصلاحيات";

      notify(message);
    } finally {
      setSaving(false);
    }
  };

  // Revert unsaved changes
  const cancel = () => {
    setSelected(new Set(saved));
    notify("تم التراجع عن التغييرات");
  };

  if (loading) {
    return (
      <div dir="rtl" className={`${card} p-10 text-center text-neutral-500`}>
        جاري تحميل الصلاحيات...
      </div>
    );
  }

  if (error || !role) {
    return (
      <div dir="rtl" className={`${card} p-8 text-center`}>
        <p className="text-[13px] font-bold text-red-500">
          {error || "الدور غير موجود"}
        </p>

        <Link to="/roles" className={`${btnLight} mt-4`}>
          العودة إلى الأدوار <ArrowRight size={13} />
        </Link>
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-full">
      <nav
        aria-label="مسار التنقل"
        className="flex items-center gap-1.5 text-[10.5px] text-neutral-500"
      >
        <Link to="/" className="hover:text-ink">
          الرئيسية
        </Link>

        <span>›</span>

        <Link to="/roles" className="hover:text-ink">
          الفريق
        </Link>

        <span>›</span>

        <Link to={`/roles/${role.id}/members`} className="hover:text-ink">
          {role.name}
        </Link>

        <span>›</span>

        <span className="font-semibold text-[#FF7E52]">الصلاحيات</span>
      </nav>

      <div className="mt-2">
        <PageHeader
          title="الصلاحيات"
          subtitle="تحكّم في ما يمكن لهذا الدور عرضه وتنفيذه داخل النظام"
        >
          <Link to="/roles" className={btnLight}>
            العودة إلى الأدوار <ArrowRight size={13} />
          </Link>
        </PageHeader>
      </div>

      {/* Role information */}
      <section
        className={`${card} mt-4 flex flex-wrap items-center justify-between gap-3 p-5`}
      >
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#FF7E52] text-white">
            <Shield size={20} />
          </span>

          <div>
            <h2 className="text-[14px] font-bold text-ink">{role.name}</h2>

            <p className="mt-0.5 text-[10.5px] text-neutral-500">
              {role.description}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-[#FF7E52]/10 px-3 py-1 text-[11px] font-semibold text-[#FF7E52]">
          {count} صلاحية مفعّلة
        </span>
      </section>

      {/* Select all */}
      <section
        className={`${card} mt-4 flex items-center justify-between gap-3 p-5`}
      >
        <div>
          <h2 className="text-[12.5px] font-bold text-ink">
            تحديد كل الصلاحيات
          </h2>

          <p className="mt-0.5 text-[10.5px] text-neutral-500">
            تفعيل جميع الصلاحيات في كل الأقسام دفعة واحدة
          </p>
        </div>

        <Switch
          on={allOn}
          label="تحديد كل الصلاحيات"
          onChange={(on) => setMany(allIds, on)}
        />
      </section>

      {/* Permission groups */}
      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        {groups.map((group) => (
          <PermissionGroup
            key={group.group}
            group={group}
            selected={selected}
            onToggle={toggle}
            onSetMany={setMany}
          />
        ))}
      </div>

      {/* Save / Cancel */}
      <section
        className={`${card} mt-4 flex flex-wrap items-center justify-between gap-3 px-5 py-3`}
      >
        <p className="flex items-center gap-2 text-[11px] text-neutral-500">
          <span>{count} صلاحية محددة</span>

          <span aria-hidden>•</span>

          <span
            className={
              dirty
                ? "flex items-center gap-1.5 text-neutral-500"
                : "text-neutral-400"
            }
          >
            {dirty && <i className="h-1.5 w-1.5 rounded-full bg-[#FF7E52]" />}

            {dirty ? "توجد تغييرات غير محفوظة" : "كل التغييرات محفوظة"}
          </span>
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={cancel}
            disabled={!dirty || saving}
            className={`${btnLight} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving}
            className={`${btnDark} !rounded-full disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <Save size={13} />
            {saving ? "جاري الحفظ..." : "حفظ الصلاحيات"}
          </button>
        </div>
      </section>

      <Toast message={toast} />
    </div>
  );
}
