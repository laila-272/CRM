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

const groups = [
  {
    title: "لوحة التحكم",
    icon: LayoutDashboard,
    items: [
      { label: "نظرة عامة", to: "#" },
      { label: "المهام", to: "#" },
    ],
  },
  {
    title: "إدارة علاقات العملاء (CRM)",
    icon: Users,
    open: false,
    items: [
      { label: "العملاء المحتملون", to: "/potential-clients", icon: Users },
      // {
      //   label: "جهات الاتصال و العملاء",
      //   to: "#",
      //   icon: Users,
      // },
      { label: "الصفقات", to: "/deals", icon: Handshake },
      {
        label: "العقود و عروض الاسعار ",
        to: "/contracts",
        icon: Handshake,
      },
      { label: "العمولات", to: "/commissions", icon: FileText },

      {
        label: " الوسطاء والشركاء",
        to: "/brokers",
        icon: Handshake,
      },
      { label: "المتابعات و المهام", to: "/tasks", icon: CalendarCheck },
      { label: "الاجتماعات والتقويم", to: "/calender", icon: FileText },
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
      { label: "المواعيد", to: "/appointments" },
      { label: "الموارد", to: "/resources" },
      // { label: "التقارير", to: "#" },
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
    title: "المخزون",
    icon: Users,
    open: false,
    items: [
      { label: "المنتجات", to: "/products", icon: Handshake },
      { label: "حركة المخزون", to: "#", icon: Handshake },
      { label: "تنبيهات المخزون", to: "#", icon: Handshake },
      { label: "الموردون والمشتريات", to: "/suppliers", icon: Handshake },
      { label: "الجرد", to: "/inventory", icon: Handshake },
      { label: "المخازن", to: "#", icon: Handshake },
    ],
  },
  {
    title: "المحاسبة",
    icon: Wallet,
    items: [
      { label: "الحسابات", to: "#" },
      { label: "الفواتير والتحصيل", to: "#" },
      { label: "المشتريات و المصروفات", to: "#" },
      { label: "البنوك و الحسابات", to: "#" },
      { label: "القيود المحاسبيه", to: "#" },
      { label: " التقارير المالية", to: "#" },
      { label: "اعدادات المحاسبه", to: "#" },
    ],
  },
  {
    title: "المبيعات",
    icon: Wallet,
    items: [
      { label: "الطلبات", to: "#" },
      { label: "أوامر البيع", to: "#" },
      { label: "تقارير المبيعات", to: "#" },
      { label: "إعدادات المبيعات", to: "#" },
    ],
  },

  {
    title: "الموارد البشرية",
    icon: UserCog,
    items: [{ label: "الموظفون", to: "#" }],
  },
  {
    title: "صندوق الوارد",
    icon: LifeBuoy,
    items: [{ label: "التذاكر", to: "#" }],
  },
  {
    title: "الإعدادات",
    icon: Settings,
    items: [{ label: "الإعدادات", to: "#" }],
  },
];

const TABS = [
  { key: "recent", label: "الأخيرة" },
  { key: "favorites", label: "المفضلة" },
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

function Group({ g }) {
  const Icon = g.icon;
  return (
    <details open={g.open} className="group">
      <summary className="list-none [&::-webkit-details-marker]:hidden flex items-center gap-2 px-2 h-8 rounded-lg cursor-pointer bg-white/[0.05] hover:bg-white/[0.08] text-[11.5px] font-semibold text-neutral-200 transition-colors">
        <span className="w-5 h-5 shrink-0 rounded-md  grid place-items-center">
          <Icon size={12} className="text-[#FF7E52]" />
        </span>
        <span className="flex-1 truncate">{g.title}</span>
        <ChevronDown
          size={12}
          className="text-neutral-500 transition-transform group-open:rotate-180"
        />
      </summary>

      <div className="mr-4 mt-1 mb-1.5 border-r border-white/10 pr-2 space-y-px">
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
              className={({ isActive }) =>
                `flex items-center gap-2 px-2 py-1 rounded-md text-[11px] transition ${
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
    </details>
  );
}

/**
 * Props
 * - open / onClose: unchanged mobile drawer behavior
 * - logoSrc: optional path to your existing logo asset. If omitted, the
 *   original Building2 badge + company name block is kept.
 * - onTabChange: optional callback for the segmented control
 */
export default function Sidebar({ open, onClose, logoSrc, onTabChange }) {
  const [tab, setTab] = useState("favorites");

  const changeTab = (key) => {
    setTab(key);
    onTabChange?.(key);
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
        {/* Header: logo + company */}
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

          <NavLink
            to="/potential-clients?add=1"
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 h-8 rounded-full border border-white/80 text-[11.5px] font-bold hover:bg-white/10 transition-colors"
          >
            إجراء سريع <Plus size={12} />
          </NavLink>

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

        {/* Navigation (scrolls independently) */}
        <nav
          className="flex-1 overflow-y-auto px-3 pt-1 space-y-1.5 pb-3"
          onClick={(e) => e.target.closest("a") && onClose()}
        >
          {groups.map((g) => (
            <Group key={g.title} g={g} />
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-2.5 border-t border-white/10 flex items-center gap-2 shrink-0">
          <span className="w-7 h-7 rounded-full bg-neutral-700 grid place-items-center text-[11px] font-bold">
            م
          </span>
          <div className="leading-tight">
            <div className="text-[11.5px] font-semibold">محمد العمري</div>
            <div className="text-[9.5px] text-neutral-500">المدير العام</div>
          </div>
        </div>
      </aside>
    </>
  );
}
