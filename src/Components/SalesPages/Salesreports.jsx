import { useMemo, useState } from "react";
import { Wallet, FileCheck, ShoppingCart, Target, Plus } from "lucide-react";
import {
  PageHeader,
  StatCard,
  Select,
  card,
  btnDark,
  th,
  td,
  downloadCsv,
} from "../Shared/ui.jsx";
import { Toolbar, AdvancedPanel, MiniField, useToast } from "./Shared.jsx";
import CreateSalesReportModal from "./CreateSalesReportModal.jsx";
import {
  MONTHS6,
  TEAM_PERF,
  ANNUAL_TARGET,
  TEAM,
  jm,
  jmM,
  reportData,
} from "../../data/salesData.js";

const pct = (p) => Math.round((p.value / p.target) * 100);

function printReport(name, head, rows) {
  const esc = (s) =>
    String(s).replace(
      /[&<>]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c],
    );
  const w = window.open("", "_blank");
  if (!w) return false;
  w.document.write(
    `<html dir="rtl"><head><meta charset="utf-8"><title>${esc(name)}</title><style>body{font-family:sans-serif;padding:24px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px;text-align:right}</style></head><body><h2>${esc(name)}</h2><table><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</table></body></html>`,
  );
  w.document.close();
  w.focus();
  w.print();
  return true;
}

export default function SalesReports() {
  const [q, setQ] = useState("");
  const [owner, setOwner] = useState("all");
  const [adv, setAdv] = useState(false);
  const [band, setBand] = useState("all");
  const [open, setOpen] = useState(false);
  const [toast, show] = useToast();

  const total = TEAM_PERF.reduce((s, t) => s + t.value, 0);
  const orders = TEAM_PERF.reduce((s, t) => s + t.orders, 0);
  const avg = Math.round(total / orders / 50) * 50;
  const rows = useMemo(
    () =>
      TEAM_PERF.filter(
        (t) =>
          (owner === "all" || t.name === owner) &&
          (!q.trim() || t.name.includes(q.trim())),
      ).filter(
        (t) => band === "all" || (band === "high" ? pct(t) >= 90 : pct(t) < 90),
      ),
    [q, owner, band],
  );
  const maxV = Math.max(...MONTHS6.map(([, v]) => v));

  const exportCsv = () =>
    downloadCsv(
      "sales-team.csv",
      ["المسؤول", "عدد الأوامر", "قيمة المبيعات", "الهدف", "نسبة تحقيق الهدف"],
      rows.map((t) => [t.name, t.orders, t.value, t.target, `${pct(t)}%`]),
    );
  const create = (c) => {
    const { head, rows: data } = reportData(c);
    if (c.format === "PDF") {
      if (!printReport(c.name, head, data)) {
        show("اسمح بالنوافذ المنبثقة لعرض ملف PDF");
        setOpen(false);
        return;
      }
    } else downloadCsv(`${c.name}.csv`, head, data);
    setOpen(false);
    show(
      c.mails.length
        ? `تم إنشاء التقرير وإرسال نسخة إلى ${c.mails.length} مستلم`
        : "تم إنشاء التقرير",
    );
  };

  return (
    <div dir="rtl" className="space-y-4">
      {toast}
      <PageHeader
        title="تقارير المبيعات"
        subtitle="حلّل أداء المبيعات حسب الفترة والفئة والمسؤول، وتابع مدى تحقيق الهدف."
      >
        <button className={btnDark} onClick={() => setOpen(true)}>
          <Plus size={13} /> إنشاء تقرير
        </button>
      </PageHeader>
      <Toolbar
        q={q}
        onQ={setQ}
        placeholder="ابحث عن تقرير"
        owner={owner}
        onOwner={setOwner}
        owners={TEAM}
        onExport={exportCsv}
        onAdv={() => setAdv((v) => !v)}
      />
      {adv && (
        <AdvancedPanel>
          <MiniField label="نسبة تحقيق الهدف">
            <Select value={band} onChange={setBand}>
              <option value="all">الكل</option>
              <option value="high">90% فأكثر</option>
              <option value="low">أقل من 90%</option>
            </Select>
          </MiniField>
          <button
            className="h-9 text-[11px] font-semibold text-[#FF7E52]"
            onClick={() => setBand("all")}
          >
            مسح الفلاتر
          </button>
        </AdvancedPanel>
      )}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Wallet}
          tag="هذا العام"
          value={<span dir="rtl">{jmM(total)}</span>}
          label="إجمالي المبيعات"
        />
        <StatCard
          icon={FileCheck}
          tag="هذا العام"
          value={orders}
          label="عدد أوامر البيع"
        />
        <StatCard
          icon={ShoppingCart}
          tag="المتوسط"
          value={<span dir="rtl">{jm(avg)}</span>}
          label="متوسط قيمة الأمر"
        />
        <StatCard
          icon={Target}
          tag="الهدف السنوي"
          value={`${Math.round((total / ANNUAL_TARGET) * 100)}%`}
          label="نسبة تحقيق الهدف"
        />
      </div>

      <div className={`${card} p-5 shadow-sm`}>
        <h2 className="text-[16px] font-medium text-ink">المبيعات الشهرية</h2>
        <p className="mt-1 text-[10px] text-neutral-500">
          إجمالي المبيعات لآخر 6 أشهر (بالمليون ج.م)
        </p>
        <div className="mt-6 flex h-[230px] items-end justify-around gap-2">
          {MONTHS6.map(([m, v], i) => (
            <div
              key={m}
              className="flex flex-col items-center justify-end gap-1.5"
              title={`${m}: ${v} مليون ج.م`}
            >
              <span className="text-[10px] text-ink">{v}</span>
              <div
                className={`w-9 rounded-[10px] sm:w-12 lg:w-14 ${i === MONTHS6.length - 1 ? "bg-[#FF7048]" : "bg-[#111]"}`}
                style={{ height: `${(v / maxV) * 165}px` }}
              />
              <span className="text-[10px] text-neutral-500">{m}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={`${card} overflow-hidden shadow-sm`}>
        <div className="p-5 pb-4">
          <h2 className="text-[16px] font-medium text-ink">
            أداء فريق المبيعات
          </h2>
          <p className="mt-1 text-[10px] text-neutral-500">
            مقارنة قيمة المبيعات الفعلية بالهدف لكل مسؤول مبيعات
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="bg-[#F3F4F6]">
                {[
                  "المسؤول",
                  "عدد الأوامر",
                  "قيمة المبيعات",
                  "الهدف",
                  "نسبة تحقيق الهدف",
                ].map((h, i) => (
                  <th key={h} className={`${th} ${i === 4 ? "w-[34%]" : ""}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const p = pct(t);
                return (
                  <tr
                    key={t.name}
                    className="border-t border-line/60 even:bg-neutral-50/70"
                  >
                    <td className={`${td} py-3.5 text-[12px]`}>{t.name}</td>
                    <td className={`${td} py-3.5`}>{t.orders}</td>
                    <td className={`${td} py-3.5`}>{jm(t.value)}</td>
                    <td className={`${td} py-3.5 text-neutral-400`}>
                      {jm(t.target)}
                    </td>
                    <td className={`${td} py-3.5`}>
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                          <div
                            className={`h-full rounded-full ${p >= 95 ? "bg-emerald-700" : "bg-[#111]"}`}
                            style={{ width: `${Math.min(p, 100)}%` }}
                          />
                        </div>
                        <span
                          className="w-9 text-[10.5px] text-neutral-500"
                          dir="ltr"
                        >
                          {p}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-[12px] text-neutral-400"
                  >
                    لا توجد نتائج مطابقة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {open && (
        <CreateSalesReportModal
          onCreate={create}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
