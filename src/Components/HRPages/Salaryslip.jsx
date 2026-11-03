// src/Components/HRPages/SalarySlip.jsx
import { useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useEmployees } from "../../data/Employeesstore.js";
import {
  CURRENT,
  periodLabel,
  money,
  dmy,
  totals,
  recordOf,
  usePayroll,
} from "../../data/Payrollstore.js";
import { btnDark, btnLight, card } from "../Shared/ui.jsx";
import { Badge, useToast } from "./Hrextras.jsx";

const PRINT_CSS = `
@media print {
  @page { size: A4; margin: 12mm; }
  body * { visibility: hidden !important; }
  #salary-slip, #salary-slip * { visibility: visible !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  #salary-slip { position: absolute; top: 0; left: 0; right: 0; margin: 0 !important; max-width: none !important; border: 0 !important; box-shadow: none !important; }
}`;

function Info({ label, value }) {
  return (
    <div>
      <div className="text-[9.5px] text-neutral-400">{label}</div>
      <div className="mt-1 text-[11.5px] font-semibold text-ink">
        {value || "—"}
      </div>
    </div>
  );
}

function Table({ title, rows, totalLabel, total, tone }) {
  const color = tone === "red" ? "text-red-500" : "text-ink";
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <div className="border-b border-line px-4 py-3 text-[11.5px] font-semibold text-ink">
        {title}
      </div>
      {rows.length ? (
        rows.map((r) => (
          <div
            key={r.id}
            className="flex items-center justify-between border-b border-line px-4 py-2.5 text-[10.5px]"
          >
            <span className="text-neutral-500">{r.label}</span>
            <span dir="rtl" className={`font-semibold ${color}`}>
              {money(r.amount)}
            </span>
          </div>
        ))
      ) : (
        <div className="border-b border-line px-4 py-2.5 text-center text-[10.5px] text-neutral-400">
          لا توجد بنود
        </div>
      )}
      <div className="flex items-center justify-between bg-neutral-100 px-4 py-2.5 text-[11px] font-bold">
        <span className="text-ink">{totalLabel}</span>
        <span className={color}>{money(total)}</span>
      </div>
    </div>
  );
}

export default function SalarySlip() {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const period = /^\d{4}-\d{2}$/.test(sp.get("period") || "")
    ? sp.get("period")
    : CURRENT;
  const employees = useEmployees();
  const overrides = usePayroll();
  const [toast, show] = useToast();
  const emp = employees.find((e) => e.id === id);

  // restore the tab title after printing / saving as PDF
  useEffect(() => {
    const prev = document.title;
    const restore = () => (document.title = prev);
    window.addEventListener("afterprint", restore);
    return () => {
      window.removeEventListener("afterprint", restore);
      document.title = prev;
    };
  }, []);

  if (!emp) {
    return (
      <div className="py-20 text-center text-[13px] text-neutral-500" dir="rtl">
        لم يتم العثور على الموظف.{" "}
        <Link to="/payroll" className="font-semibold text-ink underline">
          العودة إلى الرواتب
        </Link>
      </div>
    );
  }

  const rec = recordOf(overrides, emp, period);
  const t = totals(rec);
  const earnings = [
    { id: "base", label: "الراتب الأساسي", amount: rec.base },
    ...rec.allowances.filter((a) => Number(a.amount) > 0),
  ];
  const deductions = rec.deductions.filter((d) => Number(d.amount) > 0);
  const [y, m] = period.split("-");
  const slipNo = `PS-${y}-${m}-${emp.id.slice(4)}`;
  const paid = rec.status === "paid";

  const print = () => window.print();
  const pdf = () => {
    document.title = `قسيمة-راتب-${emp.name}-${periodLabel(period)}`;
    show("اختر «حفظ كـ PDF» كوجهة الطباعة");
    setTimeout(() => window.print(), 350);
  };
  const send = () => show(`تم إرسال القسيمة إلى ${emp.email}`);

  return (
    <div dir="rtl" className="mx-auto max-w-[780px] space-y-4">
      <style>{PRINT_CSS}</style>

      {/* header (not printed) */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <nav
            className="flex items-center gap-1.5 text-[10px] text-neutral-400"
            aria-label="مسار التنقل"
          >
            <Link to="/employees" className="transition-colors hover:text-ink">
              الموظفون
            </Link>
            <span>/</span>
            <Link
              to={`/employees/${emp.id}`}
              className="transition-colors hover:text-ink"
            >
              {emp.name}
            </Link>
            <span>/</span>
            <span className="text-neutral-500">قسيمة الراتب</span>
          </nav>
          <h1 className="mt-1 text-[26px] font-semibold leading-tight text-ink">
            قسيمة الراتب
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={pdf}
            className={`${btnDark} transition-opacity hover:opacity-90`}
          >
            تحميل PDF
          </button>
          <button
            onClick={print}
            className={`${btnLight} transition-colors hover:bg-neutral-50`}
          >
            طباعة
          </button>
          <button
            onClick={send}
            className={`${btnLight} transition-colors hover:bg-neutral-50`}
          >
            إرسال للموظف
          </button>
        </div>
      </div>

      {/* slip */}
      <article id="salary-slip" className={`${card} p-5 sm:p-8`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div
              className="text-[15px] font-extrabold tracking-wide text-ink"
              dir="ltr"
            >
              PANDA CRM / ERP
            </div>
            <div className="mt-1 text-[10px] text-neutral-500">
              قسيمة راتب شهرية · رقم {slipNo}
            </div>
          </div>
          <div className="text-left">
            <div className="text-[13px] font-bold text-ink">
              شهر {periodLabel(period)}
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <Badge
                cls={
                  paid
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-amber-50 text-amber-600"
                }
              >
                {paid ? "مصروف" : "بانتظار الصرف"}
              </Badge>
              <span className="text-[9.5px] text-neutral-400">
                تاريخ الدفع: {paid ? dmy(rec.paidAt) : "—"}
              </span>
            </div>
          </div>
        </div>

        <div className="my-6 grid grid-cols-2 gap-x-6 gap-y-4 border-y border-line py-5 sm:grid-cols-3">
          <Info label="اسم الموظف" value={emp.name} />
          <Info label="الرقم الوظيفي" value={emp.id} />
          <Info label="المسمى الوظيفي" value={emp.title} />
          <Info label="القسم" value={emp.dept} />
          <Info label="تاريخ التعيين" value={dmy(emp.hired)} />
          <Info label="طريقة الدفع" value={rec.method} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Table
            title="الاستحقاقات"
            rows={earnings}
            totalLabel="إجمالي الاستحقاقات"
            total={t.gross}
          />
          <Table
            title="الخصومات"
            rows={deductions}
            totalLabel="إجمالي الخصومات"
            total={t.ded}
            tone="red"
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ink px-6 py-5 text-white">
          <div>
            <div className="text-[13px] font-bold">صافي الراتب المستحق</div>
            <div className="mt-1 text-[9.5px] text-neutral-400">
              الاستحقاقات مطروحاً منها الخصومات
            </div>
          </div>
          <div className="text-[28px] font-bold leading-none">
            {money(t.net)}
          </div>
        </div>

        <div className="mt-10 flex items-end justify-between gap-6 text-[10px] text-neutral-500">
          <div className="w-[170px] border-t border-neutral-300 pt-1.5">
            اعتماد: المدير / المشرف
          </div>
          <div className="w-[170px] border-t border-neutral-300 pt-1.5 text-left">
            توقيع الموظف
          </div>
        </div>
        <p className="mt-6 text-center text-[8.5px] text-neutral-400">
          هذه القسيمة مستخرجة من النظام وتُحتسب تلقائياً بناءً على بيانات الراتب
          المسجلة.
        </p>
      </article>
      {toast}
    </div>
  );
}
