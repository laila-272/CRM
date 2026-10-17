import { NavLink } from 'react-router-dom'
import {
  Users, LayoutDashboard, Handshake, CalendarCheck, FileText, BarChart3, Settings,
  UserCog, Megaphone, Wallet, LifeBuoy, ChevronDown, Plus, X, Building2,
} from 'lucide-react'

const groups = [
  { title: 'لوحة التحكم', icon: LayoutDashboard, items: [{ label: 'نظرة عامة', to: '#' }, { label: 'المهام', to: '#' }] },
  {
    title: 'إدارة علاقات العملاء (CRM)', icon: Users, open: true,
    items: [
      { label: 'العملاء المحتملون', to: '/potential-clients', icon: Users },
      { label: 'الصفقات', to: '#', icon: Handshake },
      { label: 'المتابعات', to: '#', icon: CalendarCheck },
      { label: 'العروض والعقود', to: '#', icon: FileText },
    ],
  },
  { title: 'التسويق والحملات', icon: Megaphone, items: [{ label: 'الحملات', to: '#' }] },
  { title: 'المحاسبة', icon: Wallet, items: [{ label: 'الفواتير', to: '#' }] },
  { title: 'التقارير', icon: BarChart3, items: [{ label: 'تقارير المبيعات', to: '#' }] },
  { title: 'الموارد البشرية', icon: UserCog, items: [{ label: 'الموظفون', to: '#' }] },
  { title: 'الدعم', icon: LifeBuoy, items: [{ label: 'التذاكر', to: '#' }] },
  { title: 'الإدارة والإعدادات', icon: Settings, items: [{ label: 'الإعدادات', to: '#' }] },
]

function Group({ g }) {
  const Icon = g.icon
  return (
    <details open={g.open} className="group">
      <summary className="list-none flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-[12px] font-semibold text-neutral-200 hover:bg-white/5">
        <Icon size={14} className="text-orange-500" />
        <span className="flex-1">{g.title}</span>
        <ChevronDown size={12} className="text-neutral-500 group-open:rotate-180 transition" />
      </summary>
      <div className="mr-5 mt-0.5 mb-1 border-r border-white/10 pr-2 space-y-0.5">
        {g.items.map((it) =>
          it.to === '#' ? (
            <span key={it.label} className="block px-2 py-1.5 text-[11.5px] text-neutral-500 cursor-default">{it.label}</span>
          ) : (
            <NavLink key={it.label} to={it.to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-2 py-1.5 rounded-md text-[11.5px] transition ${
                  isActive ? 'bg-orange-500/15 text-orange-400 font-bold' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}>
              {it.icon && <it.icon size={12} />} {it.label}
            </NavLink>
          ))}
      </div>
    </details>
  )
}

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 bottom-0 right-0 z-40 w-[232px] bg-side text-white flex flex-col transition-transform
        ${open ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}>
        <div className="h-[54px] px-4 flex items-center gap-2 border-b border-white/10">
          <span className="w-7 h-7 rounded-lg bg-orange-500 grid place-items-center"><Building2 size={15} /></span>
          <div className="leading-tight flex-1">
            <div className="text-[13px] font-bold">اسم الشركة</div>
            <div className="text-[9.5px] text-neutral-500">نظام إدارة العقارات</div>
          </div>
          <button className="lg:hidden" onClick={onClose} aria-label="إغلاق"><X size={16} /></button>
        </div>
        <div className="p-3">
          <NavLink to="/potential-clients?add=1" onClick={onClose}
            className="flex items-center justify-center gap-1.5 h-8 rounded-lg border border-white/80 text-[11.5px] font-semibold hover:bg-white/10">
            <Plus size={12} /> إجراء سريع
          </NavLink>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 space-y-0.5 pb-3" onClick={(e) => e.target.closest('a') && onClose()}>
          {groups.map((g) => <Group key={g.title} g={g} />)}
        </nav>
        <div className="p-3 border-t border-white/10 flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-neutral-700 grid place-items-center text-[11px] font-bold">م</span>
          <div className="leading-tight">
            <div className="text-[11.5px] font-semibold">محمد العمري</div>
            <div className="text-[9.5px] text-neutral-500">المدير العام</div>
          </div>
        </div>
      </aside>
    </>
  )
}
