import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Bell, Mail, Moon, Globe, Plus, Zap, Menu, ChevronDown } from 'lucide-react'

export default function Navbar({ onMenu }) {
  const [lang, setLang] = useState('AR')
  const [dark, setDark] = useState(false)
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-line">
      <div className="h-[54px] px-4 sm:px-6 flex items-center gap-3">
        <button className="lg:hidden p-1" onClick={onMenu} aria-label="القائمة"><Menu size={20} /></button>

        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-ink text-white grid place-items-center text-xs font-bold">م</span>
          <div className="leading-tight hidden sm:block">
            <div className="text-[12.5px] font-bold">محمد العمري</div>
            <div className="text-[10px] text-neutral-500">المدير العام</div>
          </div>
          <ChevronDown size={12} className="text-neutral-400 hidden sm:block" />
        </div>

        <Link to="/potential-clients?add=1" className="btn btn-dark hidden sm:inline-flex mr-2">
          <Plus size={13} className="text-orange-400" /> إضافة عميل محتمل
        </Link>

        <div className="flex items-center gap-3 text-neutral-600">
          <span className="relative"><Bell size={16} /><i className="absolute -top-2 -left-2 bg-orange-500 text-white text-[8px] w-3.5 h-3.5 rounded-full grid place-items-center not-italic">7</i></span>
          <span className="relative"><Mail size={16} /><i className="absolute -top-2 -left-2 bg-red-500 text-white text-[8px] w-3.5 h-3.5 rounded-full grid place-items-center not-italic">4</i></span>
          <button onClick={() => setDark(!dark)} aria-label="الوضع الليلي"><Moon size={16} className={dark ? 'fill-neutral-700' : ''} /></button>
          <button onClick={() => setLang(lang === 'AR' ? 'EN' : 'AR')} className="flex items-center gap-1 text-[11px] font-semibold">
            <Globe size={15} /> {lang}
          </button>
        </div>

        <div className="relative flex-1 max-w-md mx-auto hidden md:block">
          <Search size={14} className="absolute top-1/2 -translate-y-1/2 left-3 text-neutral-400" />
          <input className="input !rounded-full !bg-neutral-50 !border-transparent" placeholder="بحث في النظام..." />
        </div>

        <Link to="/potential-clients?add=1" className="btn btn-dark mr-auto"><Zap size={13} /> الاجراءات السريعه</Link>
      </div>
    </header>
  )
}
