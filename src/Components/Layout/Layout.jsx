
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar.jsx";
import Navbar from "../Navbar/Navbar.jsx";

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div dir="rtl" className="min-h-screen bg-page">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="lg:mr-[232px] min-w-0">
        <Navbar onMenu={() => setOpen(true)} />

        <main className="w-full min-w-0 px-4 sm:px-6 lg:px-8 2xl:px-10 pb-10 pt-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
;
