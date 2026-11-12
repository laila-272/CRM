import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Users,
  LayoutDashboard,
  Handshake,
  CalendarCheck,
  FileText,
  BarChart3,
  Settings,
  UserCog,
  Megaphone,
  Wallet,
  LifeBuoy,
  ChevronDown,
  Plus,
  X,
  Building2,
  Search,
  Circle,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const groups = [
  {
    title: "إدارة علاقات العملاء (CRM)",
    icon: Users,
    items: [
      {
        label: "العملاء المحتملون",
        to: "/potential-clients",
        icon: Users,
        permission: "leads.view",
      },
      {
        label: "جهات الاتصال و العملاء",
        to: "/contacts",
        icon: Users,
        permission: "customers.view",
      },
      {
        label: "الصفقات",
        to: "/deals",
        icon: Handshake,
        permission: "deals.view",
      },
      {
        label: "العقود و عروض الاسعار",
        to: "/contracts",
        icon: Handshake,
        permission: "contracts.view",
      },
      {
        label: "العمولات",
        to: "/commissions",
        icon: FileText,
        permission: "commissions.view",
      },
      {
        label: "الوسطاء والشركاء",
        to: "/brokers",
        icon: Handshake,
        permission: "partners.view",
      },
      {
        label: "المتابعات و المهام",
        to: "/tasks",
        icon: CalendarCheck,
        permission: "tasks.view",
      },
      {
        label: "الاجتماعات والتقويم",
        to: "/calender",
        icon: FileText,
        permission: "appointments.view",
      },
      { label: "منشئ النماذج", to: "/forms", icon: FileText },
      { label: "التقارير", to: "/reports", icon: FileText },
      { label: "اعدادات ال CRM", to: "/settings", icon: FileText },
    ],
  },

  {
    title: "المواعيد والحجوزات",
    icon: BarChart3,
    items: [
      { label: "الحجوزات", to: "/reservations" },
      {
        label: "المواعيد",
        to: "/appointments",
        permission: "appointments.view",
      },
      { label: "الموارد", to: "/resources" },
      { label: "الاعدادات", to: "/scheduling-settings" },
    ],
  },

  {
    title: "المشاريع والتنفيذ",
    icon: Megaphone,
    items: [
      { label: "المشاريع", to: "/projects" },
      { label: "المهام والتنفيذ", to: "/execution" },
      { label: "الاعدادات", to: "/projects-settings" },
    ],
  },

  {
    title: "صندوق الوارد",
    icon: LifeBuoy,
    items: [
      { label: "الدعم وخدمة العملاء", to: "/support" },
      { label: "التسويق", to: "/marketing" },
    ],
  },

  {
    title: "المخزون",
    icon: Users,
    items: [
      { label: "المنتجات", to: "/products", icon: Handshake },
      { label: "حركة المخزون", to: "/stockmovements", icon: Handshake },
      { label: "تنبيهات المخزون", to: "/stock-alerts", icon: Handshake },
      {
        label: "الموردون والمشتريات",
        to: "/suppliers",
        icon: Handshake,
        permission: "vendors.view",
      },
      { label: "الجرد", to: "/inventory", icon: Handshake },
      { label: "المخازن", to: "/warehouses", icon: Handshake },
    ],
  },

  {
    title: "الإعدادات",
    icon: Settings,
    items: [
      {
        label: "الإعدادات العامة",
        to: "/general-settings",
        permission: "company.settings.view",
      },
      {
        label: "الفرق والصلاحيات",
        to: "/roles",
        permission: "team.view",
      },
      { label: "قوالب الإشعارات", to: "/subscriptions-templates" },
      { label: "خطة الاشتراك", to: "/subscription-plans" },
    ],
  },

  {
    title: "المبيعات",
    icon: Wallet,
    items: [
      { label: "الطلبات", to: "/orders" },
      { label: "أوامر البيع", to: "/sales-orders" },
      { label: "تقارير", to: "/sales-reports" },
      { label: "إعدادات المبيعات", to: "/sales-settings" },
    ],
  },

  {
    title: "المحاسبة",
    icon: Wallet,
    items: [
      { label: "الحسابات", to: "/accounting/accounts", icon: Wallet },
      {
        label: "الفواتير والتحصيل",
        to: "/accounting/invoices",
        permission: "invoices.view",
      },
      {
        label: "المشتريات والمصروفات",
        to: "/accounting/expenses",
        permission: "expenses.view",
      },
      { label: "البنوك والحسابات", to: "/accounting/banks" },
      { label: "القيود المحاسبية", to: "/accounting/journal-entries" },
      { label: "التقارير المالية", to: "/accounting/reports" },
      { label: "إعدادات المحاسبة", to: "/accounting/settings" },
    ],
  },

  {
    title: "الموارد البشرية",
    icon: UserCog,
    items: [
      { label: "الموظفون", to: "/employees" },
      { label: "الحضور والإجازات", to: "/attendance" },
      { label: "التوظيف", to: "/recruitment" },
      { label: "الرواتب", to: "/payroll" },
      { label: "الأداء والتطوير", to: "/performance" },
      { label: "شؤون الموظفين", to: "/employee-affairs" },
      { label: "الإعلانات والمستندات", to: "/announcements" },
      { label: "التقارير", to: "/employee-reports" },
      { label: "الإعدادات", to: "/hr-settings" },
    ],
  },
];

const TABS = [
  { key: "recent", label: "الأخيرة" },
  { key: "favorites", label: "المفضلة" },
];

const ARCHIVE_PERMISSIONS = [
  "customer.trash",
  "leads.trash",
  "deal.trash",
  "contracts.trash",
  "tasks.trash",
  "appointments.trash",
  "invoices.trash",
  "expenses.trash",
  "vendors.trash",
];

function ItemIcon({ icon: Icon }) {
  return Icon ? (
    <Icon size={12} className="shrink-0 text-neutral-500" />
  ) : (
    <Circle
      size={5}
      className="shrink-0 mx-[3.5px] fill-neutral-600 text-neutral-600"
    />
  );
}

function DirectLink({ icon: Icon, label, to, permission, onClose }) {
  const { hasPermission } = useAuth();

  if (permission && !hasPermission(permission)) {
    return null;
  }

  return (
    <NavLink
      to={to}
      onClick={onClose}
      end
      className={({ isActive }) =>
        `flex items-center gap-2 px-2 h-8 rounded-lg text-[11.5px]
        font-semibold transition-colors ${
          isActive
            ? "bg-[#D9D9D918] text-[#FF7E52]"
            : "text-neutral-200 hover:bg-white/[0.08]"
        }`
      }
    >
      <span className="w-5 h-5 shrink-0 rounded-md grid place-items-center">
        {Icon && <Icon size={12} className="text-[#FF7E52]" />}
      </span>

      <span className="flex-1 truncate text-right">{label}</span>
    </NavLink>
  );
}

function Group({ g, isOpen, onToggle, onClose }) {
  const Icon = g.icon;

  return (
    <div className="group">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center gap-2 px-2 h-8 rounded-lg
        cursor-pointer bg-white/[0.05] hover:bg-white/[0.08]
        text-[11.5px] font-semibold text-neutral-200 transition-colors"
      >
        <span className="w-5 h-5 shrink-0 rounded-md grid place-items-center">
          <Icon size={12} className="text-[#FF7E52]" />
        </span>

        <span className="flex-1 truncate text-right">{g.title}</span>

        <ChevronDown
          size={12}
          className={`text-neutral-500 transition-transform duration-300 ease-in-out ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div
            className={`mr-4 mt-1 mb-1.5 border-r border-white/10 pr-2 space-y-px
            transition-opacity duration-200 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            {g.items.map((it) =>
              it.to === "#" ? (
                <span
                  key={it.label}
                  className="flex items-center gap-2 px-2 py-1 text-[11px] text-neutral-500 cursor-default"
                >
                  <ItemIcon icon={it.icon} />
                  {it.label}
                </span>
              ) : (
                <NavLink
                  key={it.label}
                  to={it.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2 py-1 rounded-md text-[11px] transition-colors ${
                      isActive
                        ? "bg-[#D9D9D918] text-[#FF7E52] font-bold"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`
                  }
                >
                  <ItemIcon icon={it.icon} />
                  {it.label}
                </NavLink>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ open, onClose, logoSrc, onTabChange }) {
  const { hasPermission, user } = useAuth();

  const [tab, setTab] = useState("favorites");
  const [openGroup, setOpenGroup] = useState(null);

  const visibleGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.permission || hasPermission(item.permission),
      ),
    }))
    .filter((group) => group.items.length > 0);

  const canViewArchive = ARCHIVE_PERMISSIONS.some((permission) =>
    hasPermission(permission),
  );

  const changeTab = (key) => {
    setTab(key);
    onTabChange?.(key);
  };

  const toggleGroup = (title) => {
    setOpenGroup((prev) => (prev === title ? null : title));
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        dir="rtl"
        className={`fixed top-0 bottom-0 right-0 z-40 w-[232px] bg-side text-white flex flex-col border-l border-white/10 transition-transform
        ${open ? "translate-x-0" : "translate-x-full"} lg:translate-x-0`}
      >
        {/* Header */}
        <div className="h-[54px] px-3 flex items-center gap-2 shrink-0">
          {logoSrc ? (
            <img src={logoSrc} alt="" className="h-7 w-auto" />
          ) : (
            <span className="w-7 h-7 rounded-lg bg-[#FF7E52] grid place-items-center">
              <Building2 size={15} />
            </span>
          )}

          <div className="leading-tight flex-1 min-w-0">
            <div className="text-[13px] font-extrabold truncate">
              اسم الشركة
            </div>
            <div className="text-[9px] text-neutral-500 truncate">
              نظام إدارة العقارات
            </div>
          </div>

          <button
            className="lg:hidden text-neutral-400"
            onClick={onClose}
            aria-label="إغلاق"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search + quick action + tabs */}
        <div className="px-3 pb-2 space-y-2 shrink-0">
          <div className="relative">
            <Search
              size={13}
              className="absolute top-1/2 -translate-y-1/2 left-3 text-neutral-500"
            />

            <input
              className="w-full h-8 rounded-full bg-transparent border border-white/15 pr-3 pl-8 text-[11px] text-white placeholder:text-neutral-500 outline-none focus:border-white/40 transition-colors"
              placeholder="بحث..."
            />
          </div>

          {hasPermission("leads.create") && (
            <NavLink
              to="/potential-clients?add=1"
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 h-8 rounded-full border border-white/80 text-[11.5px] font-bold hover:bg-white/10 transition-colors"
            >
              إجراء سريع <Plus size={12} />
            </NavLink>
          )}

          <div className="pt-1 text-[9.5px] text-neutral-500 px-1">
            المفضلة والأخيرة
          </div>

          <div
            role="tablist"
            className="grid grid-cols-2 gap-0.5 rounded-full border border-white/10 p-0.5"
          >
            {TABS.map(({ key, label }) => {
              const active = tab === key;

              return (
                <button
                  key={key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => changeTab(key)}
                  className={`h-6 rounded-full text-[10.5px] font-semibold transition-colors ${
                    active
                      ? "bg-white/15 text-white"
                      : "text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pt-1 space-y-1.5 pb-3">
          <DirectLink
            icon={LayoutDashboard}
            label="لوحة التحكم"
            to="/dashboard"
            permission="dashboard.view"
            onClose={onClose}
          />

          {canViewArchive && (
            <DirectLink
              icon={UserCog}
              label="الأرشيف"
              to="/archive"
              onClose={onClose}
            />
          )}

          {visibleGroups.map((g) => (
            <Group
              key={g.title}
              g={g}
              isOpen={openGroup === g.title}
              onToggle={() => toggleGroup(g.title)}
              onClose={onClose}
            />
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-2.5 border-t border-white/10 flex items-center gap-2 shrink-0">
          <span className="w-7 h-7 rounded-full bg-neutral-700 grid place-items-center text-[11px] font-bold">
            {user?.name?.charAt(0) || "م"}
          </span>

          <div className="leading-tight min-w-0">
            <div className="text-[11.5px] font-semibold truncate">
              {user?.name || "المستخدم"}
            </div>
            <div className="text-[9.5px] text-neutral-500 truncate">
              {user?.roles?.[0]?.name || "عضو الفريق"}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
