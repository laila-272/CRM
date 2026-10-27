import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";

import {
  CONTRACT_STATUSES,
  getContract,
  QUOTE_STATUSES,
  setContractStatus,
} from "../../data/contracts.js";
import { btnDark, card, egp, td, th } from "../Shared/ui.jsx";

const PAY_CLS = {
  مدفوعة: "bg-green-50 text-green-600",
  مستحقة: "bg-orange-50 text-orange-600",
  مجدولة: "bg-neutral-100 text-neutral-500",
};
const SIGN_CLS = {
  وقّع: "bg-green-50 text-green-600",
  بانتظار: "bg-orange-50 text-orange-600",
};

function Field({ label, value, className = "" }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="text-[9.5px] text-neutral-400">{label}</div>
      <div className="mt-1 text-[13px] font-semibold text-ink break-words">
        {value}
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className={`${card} p-4`}>
      <h2 className="text-[13px] font-extrabold text-ink mb-3">{title}</h2>
      {children}
    </section>
  );
}

export default function ContractDetails() {
  const { id } = useParams();
  const [c, setC] = useState(() => getContract(id));

  if (!c) {
    return (
      <div dir="rtl" className="p-10 text-center">
        <p className="text-[13px] font-bold text-ink">
          لم يتم العثور على المستند
        </p>
        <p className="mt-1 text-[11px] text-neutral-500">
          قد يكون الرابط غير صحيح.
        </p>
        <Link to="/contracts" className={`${btnDark} mt-4`}>
          العودة إلى العقود
        </Link>
      </div>
    );
  }

  const statuses = c.kind === "عقد" ? CONTRACT_STATUSES : QUOTE_STATUSES;
  const changeStatus = (status) => {
    setContractStatus(c.id, status);
    setC(getContract(c.id));
  };

  return (
    <div dir="rtl" className=" max-w-full">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold text-ink leading-tight">
            {c.kind} {c.id}
          </h1>
          <p className="mt-1 text-[11px] text-neutral-500">
            {c.customer} - {c.company} — المسؤول {c.owner}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center mt-2">
          <a
            // href={wa}
            target="_blank"
            rel="noreferrer"
            aria-label="واتساب"
            className="w-9 h-9 rounded-lg bg-green-500 text-white grid place-items-center hover:bg-green-600"
          >
            <FaWhatsapp size={20} />{" "}
          </a>
          <div className="relative">
            <button className="btn" onClick={() => setMenu(!menu)}>
              تصدير <ChevronDown size={12} />
            </button>
            {/* {menu && (
              <div className="absolute z-10 mt-1 card shadow-md min-w-[130px] text-[12px]">
                <button
                  className="w-full text-right px-3 py-2 hover:bg-neutral-50"
                  onClick={exportOne}
                >
                  ملف CSV
                </button>
              </div>
            )} */}
          </div>
          <button className="btn !font-bold" onClick={() => setEditing(true)}>
            تعديل
          </button>
          {/* <button
            className="btn text-red-600"
            onClick={() => setConfirmDel(true)}
          >
            <Trash2 size={12} /> حذف
          </button> */}
          <button
            className="btn btn-dark !rounded-4xl"
            onClick={() => {
              updateCustomer(c.id, { status: "لا رد" });
            }}
          >
            +العودة للعقود
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
        {/* Main column */}
        <div className="space-y-4 min-w-0">
          <Panel title="بيانات العقد">
            <div className="grid grid-cols-2 gap-x-4">
              {[
                ["رقم العقد ", c.id],
                ["نوع العقد", c.kind],
                ["العميل", c.customer],
                ["الصفقة المرتبطة", c.deal],
                // ["الحالة", c.status],
                // ["قيمة العقد", egp(c.value)],
                ["تاريخ البداية", c.startDate],
                ["تاريخ الانتهاء", c.endDate],
                [" آخر موعد للتوقيع", c.signDate],
                ["التجديد التلقائي", c.renewal],
                ["المسؤول", c.owner],
                ["المراجعة القانونية", c.legal],
              ]
                .reduce((rows, item, i, arr) => {
                  if (i % 2 === 0) {
                    rows.push(arr.slice(i, i + 2));
                  }
                  return rows;
                }, [])
                .map((row, i) => (
                  <div
                    key={i}
                    className="col-span-2 grid grid-cols-2 gap-x-4 border-b border-line py-3 last:border-b-0"
                  >
                    {row.map(([label, value]) => (
                      <Field key={label} label={label} value={value} />
                    ))}
                  </div>
                ))}
            </div>
          </Panel>

          <section className={`${card} p-4`}>
            <h2 className="text-[13px] font-extrabold text-ink mb-3">
              جدول الدفعات
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px]">
                <thead className="bg-neutral-50/70">
                  <tr>
                    {["الدفعة", "تاريخ الاستحقاق", "المبلغ", "الحالة"].map(
                      (h) => (
                        <th key={h} className={th}>
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {c.payments.map((p) => (
                    <tr key={p.name} className="border-t border-line">
                      <td className={`${td} py-3.5 font-bold`}>{p.name}</td>
                      <td className={`${td} py-3.5 text-neutral-500`}>
                        {p.due}
                      </td>
                      <td
                        className={`${td} py-3.5`}
                        dir="ltr"
                        style={{ textAlign: "right" }}
                      >
                        {egp(p.amount)}
                      </td>
                      <td className={`${td} py-3.5`}>
                        <span
                          className={`text-[9.5px] font-semibold rounded-full px-2 py-0.5 ${PAY_CLS[p.status]}`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Side column */}
        <div className="space-y-4 min-w-0">
          <Panel title="التوقيعات">
            <ul className="space-y-5">
              {c.signers.map((s) => (
                <li key={s.name} className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-blue-50 text-black-600 grid place-items-center text-[10.5px] font-bold">
                    {s.name[0]}
                  </span>
                  <div className="flex-1 min-w-0 leading-tight">
                    <div className="text-[11px] font-bold text-ink truncate">
                      {s.name}
                    </div>
                    <div className="text-[9.5px] text-neutral-400 truncate">
                      {s.role}
                    </div>
                  </div>
                  <span
                    className={`text-[9.5px] font-semibold rounded-full px-2 py-0.5 ${SIGN_CLS[s.state]}`}
                  >
                    {s.state}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="مرفقات العقد">
            <ul className="space-y-3">
              {c.attachments.map((a) => (
                <li
                  key={a.name}
                  className="flex items-center justify-between border-b border-line
"
                >
                  <div className="flex items-center gap-2.5  pb-3.5 last:border-b-0">
                    {" "}
                    <span className="w-7 h-7 rounded-lg bg-[#F1F2F4] text-black-500 grid place-items-center text-xs">
                      PDF
                    </span>
                    <div className="min-w-0 leading-tight">
                      <div
                        className="text-[10.5px] font-semibold text-ink truncate"
                        dir="auto"
                      >
                        {a.name}
                      </div>
                      <div className="text-[9.5px] text-neutral-400">
                        {a.size} · {a.date}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("الملف غير متاح للتحميل حاليًا")}
                    className="shrink-0 inline-flex items-center gap-1 rounded-md border border-line px-2 py-1.5 text-[10px] font-semibold text-ink hover:bg-neutral-50 transition"
                  >
                    تحميل
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="mt-3 w-full rounded-lg border border-dashed border-[#E4E7DE] bg-white py-2.5 text-[11px] font-semibold text-ink hover:bg-neutral-50 transition"
            >
              + رفع ملف
            </button>
          </Panel>

          <Panel title="سجل النشاط">
            <ul className="space-y-5">
              {c.activity.map((a, i) => (
                <li key={i} className="flex gap-2">
                  <span
                    className={`mt-1 w-1.5 h-1.5 shrink-0 rounded-full ${a.open ? "bg-orange-500" : "bg-neutral-300"}`}
                  />
                  <div className="text-[10.5px]">
                    <div className="font-semibold text-ink">{a.text}</div>
                    <div className="text-[9.5px] text-neutral-400">
                      {a.when}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
