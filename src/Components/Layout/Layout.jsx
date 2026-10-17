import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../Sidebar/Sidebar.jsx'
import Navbar from '../Navbar/Navbar.jsx'

export default function Layout() {
  const [open, setOpen] = useState(false)
  return (
    <div dir="rtl" className="min-h-screen bg-page">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="lg:mr-[232px] min-w-0">
        <Navbar onMenu={() => setOpen(true)} />
        <main className="px-4 sm:px-6 pb-10 pt-5 max-w-[1280px]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
