import React from 'react'
import {
  card,
  Chip,
  egp,
  PageHeader,
  PagerBar,
  SearchBox,
  StatCard,
  td,
  th,
} from "../Shared/ui.jsx";
import { Briefcase, CircleDollarSign, Wallet, X } from "lucide-react";

export default function Products() {
  return (
    <div dir="rtl" className=" max-w-full">
      <PageHeader
        title="المنتجات"
        subtitle="إدارة منتجات المخزون وأسعارها وكمياتها المتاحة"
      >
        <button
          className="btn !bg-black text-white !rounded-lg h-9"
          onClick={() => document.getElementById("broker-name")?.focus()}
        >
          + تسجيل صرف عمولة
        </button>
        <button className="btn">قواعد العمولات</button>
      </PageHeader>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <StatCard icon={CircleDollarSign} value={2} label="إجمالي العمولات" />
        <StatCard icon={Wallet} value={2} label="العمولات المدفوعة" />
        <StatCard icon={Briefcase} value={2} label="العمولات المعروضة" />
        <StatCard icon={Briefcase} value={2} label="العمولات المعروضة" />
      </div>
    </div>
  );
}
