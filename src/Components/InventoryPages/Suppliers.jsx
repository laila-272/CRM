import { useState } from "react";
import { Plus } from "lucide-react";
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
import { FileText, ShoppingCart, Van, Clock4 } from "lucide-react";
const initialSuppliers = [
  {
    id: 1,
    name: "النيل للإلكترونيات",
    phone: "5678 234 0100",
    category: "الكهرباء",
    amount: "158,400",
  },
  {
    id: 2,
    name: "الأمل للكابلات",
    phone: "5432 876 0111",
    category: "الإكسسوارات",
    amount: "31,500",
  },
  {
    id: 3,
    name: "أطلس للموردات",
    phone: "7788 456 0122",
    category: "الأدوات",
    amount: "112,000",
  },
  {
    id: 4,
    name: "المتحدة للتجهيزات",
    phone: "9021 210 0155",
    category: "معدات",
    amount: "27,900",
  },
  {
    id: 5,
    name: "الشرق للاستيراد",
    phone: "4321 765 0109",
    category: "استيراد",
    amount: "64,800",
  },
];

const initialOrders = [
  {
    id: "PO-2041",
    supplier: "النيل للإلكترونيات",
    items: 240,
    total: "86,400",
    date: "10/20",
    status: "قيد الفحص",
  },
  {
    id: "PO-2040",
    supplier: "الأمل للكابلات",
    items: 180,
    total: "31,500",
    date: "10/18",
    status: "تم الاستلام",
  },
  {
    id: "PO-2039",
    supplier: "أطلس للموردات",
    items: 320,
    total: "112,000",
    date: "10/15",
    status: "استلام جزئي",
  },
  {
    id: "PO-2038",
    supplier: "المتحدة للتجهيزات",
    items: 90,
    total: "27,900",
    date: "10/12",
    status: "تم الاستلام",
  },
  {
    id: "PO-2037",
    supplier: "الشرق للاستيراد",
    items: 150,
    total: "64,800",
    date: "10/09",
    status: "متأخر",
  },
  {
    id: "PO-2036",
    supplier: "النيل للإلكترونيات",
    items: 200,
    total: "72,000",
    date: "10/05",
    status: "تم الاستلام",
  },
];

function OrderStatus({ status }) {
  const styles = {
    "تم الاستلام": "bg-[#F0F1F3] text-[#555B65]",
    "قيد الفحص": "bg-[#F0F1F3] text-[#555B65]",
    "استلام جزئي": "bg-[#F0F1F3] text-[#555B65]",
    متأخر: "bg-[#FFF0F0] text-[#E65C5C]",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[9px] ${
        styles[status] || styles["قيد الفحص"]
      }`}
    >
      {status}
    </span>
  );
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [orders] = useState(initialOrders);

  const addSupplier = () => {
    const name = window.prompt("اكتبي اسم المورد:");

    if (!name?.trim()) return;

    const phone = window.prompt("اكتبي رقم الهاتف:") || "";
    const newSupplier = {
      id: Date.now(),
      name: name.trim(),
      phone,
      category: "مورد جديد",
      amount: "0",
    };

    setSuppliers((prev) => [...prev, newSupplier]);
  };

  return (
    <div
      dir="rtl"
      className="min-h-full w-full min-w-0 bg-[#F5F6F8] p-3 sm:p-4"
    >
      <PageHeader
        title="الموردون والمشتريات"
        subtitle="إدارة الموردين وأوامر الشراء وحالة استلام البضاعة"
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
        <StatCard icon={Clock4} value={2} label="إجمالي العمولات" />
        <StatCard icon={Van} value={2} label="العمولات المدفوعة" />
        <StatCard icon={FileText} value={2} label="العمولات المعروضة" />
        <StatCard icon={ShoppingCart} value={2} label="العمولات المعروضة" />
      </div>
      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[1fr_2fr] mt-4">
        {/* الموردون - اليمين */}
        <section className="min-w-0 rounded-xl border border-[#E9EBEF] bg-white p-3">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div>
              <h2 className="text-[11px] font-semibold text-[#202124]">
                الموردون
              </h2>
              <p className="mt-1 text-[8px] text-[#9699A1]">
                بيانات التواصل وحسابات التعامل
              </p>
            </div>

            <button
              type="button"
              onClick={addSupplier}
              className="flex shrink-0 items-center gap-1 text-[9px] text-[#292929] hover:text-black"
            >
              <Plus size={11} />
              إضافة مورد
            </button>
          </div>

          <div className="divide-y divide-[#F0F1F3]">
            {suppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="flex min-h-[47px] items-center justify-between gap-2 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-semibold text-[#292929]">
                    {supplier.name}
                  </p>
                  <p className="mt-1 truncate text-[8px] text-[#A0A2A8]">
                    {supplier.category} · {supplier.phone}
                  </p>
                </div>

                <p dir="ltr" className="shrink-0 text-[8px] text-[#656873]">
                  {supplier.amount} EGP
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* أوامر الشراء - الشمال */}
        <section className="min-w-0 rounded-xl border border-[#E9EBEF] bg-white p-3">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <h2 className="text-[11px] font-semibold text-[#202124]">
                أوامر الشراء
              </h2>
              <p className="mt-1 text-[8px] text-[#9699A1]">
                إدارة أوامر الشراء وحالة الاستلام
              </p>
            </div>

            <span className="pt-1 text-[8px] text-[#777B84]">عرض الكل</span>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[470px] table-fixed border-collapse">
              <thead>
                <tr className="border-b border-[#ECEEF1]">
                  <th className="w-[14%] px-1 py-2 text-right text-[8px] font-medium text-[#92959D]">
                    رقم الطلب
                  </th>
                  <th className="w-[26%] px-1 py-2 text-right text-[8px] font-medium text-[#92959D]">
                    المورد
                  </th>
                  <th className="w-[12%] px-1 py-2 text-center text-[8px] font-medium text-[#92959D]">
                    المنتجات
                  </th>
                  <th className="w-[18%] px-1 py-2 text-center text-[8px] font-medium text-[#92959D]">
                    تكلفة الشراء
                  </th>
                  <th className="w-[12%] px-1 py-2 text-center text-[8px] font-medium text-[#92959D]">
                    التاريخ
                  </th>
                  <th className="w-[18%] px-1 py-2 text-center text-[8px] font-medium text-[#92959D]">
                    حالة الاستلام
                  </th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#F0F1F3] last:border-0"
                  >
                    <td
                      dir="ltr"
                      className="truncate px-1 py-[9px] text-right text-[8px] text-[#454956]"
                    >
                      {order.id}
                    </td>

                    <td className="truncate px-1 py-[9px] text-right text-[8px] text-[#454956]">
                      {order.supplier}
                    </td>

                    <td className="px-1 py-[9px] text-center text-[8px] text-[#454956]">
                      {order.items}
                    </td>

                    <td
                      dir="ltr"
                      className="whitespace-nowrap px-1 py-[9px] text-center text-[8px] text-[#454956]"
                    >
                      {order.total} EGP
                    </td>

                    <td
                      dir="ltr"
                      className="px-1 py-[9px] text-center text-[8px] text-[#454956]"
                    >
                      {order.date}
                    </td>

                    <td className="px-1 py-[9px] text-center">
                      <OrderStatus status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
