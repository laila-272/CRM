import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Handshake,
  LayoutDashboard,
  Save,
  Shield,
  Target,
  Users,
} from "lucide-react";
import { PageHeader, card, btnDark, btnLight } from "../Shared/ui.jsx";
import { Toast, useToast } from "../CRMPages/TaskModal.jsx";
import {
  ALL_IDS,
  GROUPS,
  ROLE,
  loadPermissions,
  savePermissions,
} from "../../data/Permissions.js";
import { useTeam } from "../../data/Team.js";

const GROUP_ICONS = {
  dashboard: LayoutDashboard,
  deals: Handshake,
  customers: Users,
  leads: Target,
};

function Switch({ on, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${on ? "bg-[#FF7E52]" : "bg-neutral-300"}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${on ? "right-[18px]" : "right-0.5"}`}
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
      <span>{permission.label}</span>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={() => onToggle(permission.id)}
      />
      <span
        aria-hidden
        className={`grid h-4 w-4 shrink-0 place-items-center rounded-[4px] border ${checked ? "border-[#FF7E52] bg-[#FF7E52] text-white" : "border-neutral-300 bg-white"}`}
      >
        {checked && <Check size={11} strokeWidth={3} />}
      </span>
    </label>
  );
}

function PermissionGroup({ group, selected, onToggle, onSetMany }) {
  const [open, setOpen] = useState(true);
  const Icon = GROUP_ICONS[group.id];
  const ids = group.permissions.map((x) => x.id);
  const count = ids.filter((id) => selected.has(id)).length;
  const allOn = count === ids.length;

  return (
    <section className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex items-center justify-between gap-2 bg-[#111] px-4 py-3 text-white">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md border border-[#FF7E52]/60 text-[#FF7E52]">
            <Icon size={13} />
          </span>
          <h2 className="truncate text-[12.5px] font-bold">{group.title}</h2>
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
          {group.permissions.map((perm) => (
            <PermissionRow
              key={perm.id}
              permission={perm}
              checked={selected.has(perm.id)}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// Resolves the role from the URL (/team/roles/:roleId/permissions) and mounts the editor
// keyed by role id, so switching roles always starts from that role's saved permissions.
export default function UsersPermissions() {
  const { roleId = ROLE.id } = useParams();
  const { roles } = useTeam();
  const role = roles.find((r) => r.id === roleId);

  if (!role) {
    return (
      <div dir="rtl" className={`${card} p-8 text-center`}>
        <p className="text-[13px] font-bold text-ink">الدور غير موجود</p>
        <Link to="/team/roles" className={`${btnLight} mt-4`}>
          العودة إلى الأدوار <ArrowRight size={13} />
        </Link>
      </div>
    );
  }
  return <PermissionsEditor key={role.id} role={role} />;
}

function PermissionsEditor({ role }) {
  const [saved, setSaved] = useState(() => loadPermissions(role.id));
  const [selected, setSelected] = useState(() => new Set(saved));
  const [toast, notify] = useToast();

  const count = selected.size;
  const allOn = count === ALL_IDS.length;
  const dirty = count !== saved.length || saved.some((id) => !selected.has(id));

  const toggle = (id) =>
    setSelected((cur) => {
      const next = new Set(cur);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const setMany = (ids, on) =>
    setSelected((cur) => {
      const next = new Set(cur);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    });

  const save = () => {
    const ids = ALL_IDS.filter((id) => selected.has(id));
    setSaved(savePermissions(ids, role.id));
    notify("تم حفظ الصلاحيات بنجاح");
  };
  const cancel = () => {
    setSelected(new Set(saved));
    notify("تم التراجع عن التغييرات");
  };

  const byId = Object.fromEntries(GROUPS.map((g) => [g.id, g]));
  const groupProps = (id) => ({
    group: byId[id],
    selected,
    onToggle: toggle,
    onSetMany: setMany,
  });

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
        <Link to="/team/roles" className="hover:text-ink">
          الفريق
        </Link>
        <span>›</span>
        <Link to={`/team/roles/${role.id}/members`} className="hover:text-ink">
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
          <Link to="/team/roles" className={btnLight}>
            العودة إلى الأدوار <ArrowRight size={13} />
          </Link>
        </PageHeader>
      </div>

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
          onChange={(on) => setMany(ALL_IDS, on)}
        />
      </section>

      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        <div className="space-y-4">
          <PermissionGroup {...groupProps("dashboard")} />
          <PermissionGroup {...groupProps("deals")} />
        </div>
        <PermissionGroup {...groupProps("customers")} />
        <PermissionGroup {...groupProps("leads")} />
      </div>

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
            onClick={cancel}
            disabled={!dirty}
            className={`${btnLight} disabled:cursor-not-allowed disabled:opacity-40`}
          >
            إلغاء
          </button>
          <button
            onClick={save}
            disabled={!dirty}
            className={`${btnDark} !rounded-full disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <Save size={13} /> حفظ الصلاحيات
          </button>
        </div>
      </section>

      <Toast message={toast} />
    </div>
  );
}
