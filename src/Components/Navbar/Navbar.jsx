import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Bell,
  Mail,
  Moon,
  Globe,
  Plus,
  Zap,
  Menu,
  ChevronDown,
} from "lucide-react";

export default function Navbar({ onMenu }) {
  const [lang, setLang] = useState("AR");
  const [dark, setDark] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-line w-full">
      <div className="min-h-[54px] px-3 sm:px-4 lg:px-6 py-2 flex items-center gap-2 sm:gap-3">
        {/* Menu */}
        <button
          className="lg:hidden shrink-0 p-1"
          onClick={onMenu}
          aria-label="القائمة"
        >
          <Menu size={20} />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-8 h-8 rounded-full bg-ink text-white grid place-items-center text-xs font-bold">
            م
          </span>

          <div className="leading-tight hidden sm:block">
            <div className="text-[12.5px] font-bold whitespace-nowrap">
              محمد العمري
            </div>
            <div className="text-[10px] text-neutral-500">المدير العام</div>
          </div>

          <ChevronDown size={12} className="text-neutral-400 hidden sm:block" />
        </div>

        {/* Add Customer */}
        <Link
          to="/potential-clients?add=1"
          className="btn !rounded-4xl btn-dark hidden sm:inline-flex mr-1 shrink-0 !px-3"
        >
          <span className="whitespace-nowrap">إضافة عميل محتمل</span>
          <Plus size={13} />
        </Link>

        {/* Notifications and Settings */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 text-neutral-600 shrink-0">
          <button className="relative" aria-label="الإشعارات">
            <Bell size={16} />
            <i className="absolute -top-2 -left-2 bg-orange-500 text-white text-[8px] w-3.5 h-3.5 rounded-full grid place-items-center not-italic">
              7
            </i>
          </button>

          <button className="relative hidden sm:block" aria-label="الرسائل">
            <Mail size={16} />
            <i className="absolute -top-2 -left-2 bg-red-500 text-white text-[8px] w-3.5 h-3.5 rounded-full grid place-items-center not-italic">
              4
            </i>
          </button>

          <button
            onClick={() => setDark(!dark)}
            aria-label="الوضع الليلي"
            className="hidden sm:block"
          >
            <Moon size={16} className={dark ? "fill-neutral-700" : ""} />
          </button>

          <button
            onClick={() => setLang(lang === "AR" ? "EN" : "AR")}
            className="flex items-center gap-1 text-[11px] font-semibold"
          >
            <Globe size={15} />
            {lang}
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-0 max-w-md mx-auto hidden md:block">
          <Search
            size={14}
            className="absolute top-1/2 -translate-y-1/2 left-3 text-neutral-400"
          />
          <input
            className="input !rounded-full !bg-neutral-50 !border-transparent"
            placeholder="بحث في النظام"
          />
        </div>

        {/* Quick Actions */}
        <Link
          to="/potential-clients?add=1"
          className="btn !rounded-4xl btn-dark mr-auto shrink-0 !px-2 sm:!px-3"
        >
          <span className="hidden sm:inline whitespace-nowrap">
            الإجراءات السريعة
          </span>
          <Zap size={13} />
        </Link>
      </div>
    </header>
  );
}
