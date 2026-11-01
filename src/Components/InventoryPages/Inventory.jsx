import React, { useMemo, useState } from "react";
import {
  ClipboardCheck,
  ListChecks,
  TrendingDown,
  TrendingUp,
  Plus,
  History,
  Package,
} from "lucide-react";
import {
  PageHeader,
  btnDark,
  btnLight,
  th,
  td,
  InvStat,
  TableCard,
  ProductCell,
  StatusBadge,
  ConfirmDialog,
  Modal,
  Field,
  input,
  useToast,
} from "./Inventoryui.jsx";
import { COUNT_SHEET, COUNT_LOG, COUNT_STATUS } from "../../data/inventory.js";

const stat = (d) =>
  d === 0
    ? { l: "مطابق", t: "neutral" }
    : d < 0
      ? { l: "عجز", t: "out" }
      : { l: "زيادة", t: "green" };

export default function Inventory() {
  const [sheet, setSheet] = useState(COUNT_SHEET);
  const [log, setLog] = useState(COUNT_LOG);
  const [finished, setFinished] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [showLog, setShowLog] = useState(true);
  const [newOpen, setNewOpen] = useState(false);
  const [wh, setWh] = useState("المخزن الرئيسي");
  const [toast, show] = useToast();

  const { deficit, surplus, counted } = useMemo(() => {
    let d = 0,
      s = 0;
    sheet.forEach((r) => {
      const x = r.actual - r.expected;
      x < 0 ? (d += x) : (s += x);
    });
    return {
      deficit: d,
      surplus: s,
      counted: sheet.filter((r) => r.actual !== "").length,
    };
  }, [sheet]);
  const mism = sheet.filter((r) => r.actual !== r.expected).length;

  const setActual = (sku, v) =>
    setSheet((s) =>
      s.map((r) =>
        r.sku === sku
          ? { ...r, actual: v === "" ? "" : Math.max(0, Number(v)) }
          : r,
      ),
    );
  const finish = () => {
    setLog((l) => [
      {
        no: "INV-0012",
        wh,
        by: "محمد العمري",
        date: new Date().toISOString().slice(0, 10).replaceAll("-", "/"),
        items: sheet.length,
        diff: deficit + surplus,
        status: "closed",
      },
      ...l,
    ]);
    setFinished(true);
    setConfirm(false);
    show("تم إنهاء الجرد");
  };

  return (
    <div dir="rtl" className="space-y-5">
      <PageHeader
        title="الجرد"
        subtitle="مطابقة الكميات المسجلة بالنظام مع الكميات الفعلية ومعالجة الفروقات"
      >
        <button className={btnDark} onClick={() => setNewOpen(true)}>
          <Plus size={13} /> جرد جديد
        </button>
        <button className={btnLight} onClick={() => setShowLog((v) => !v)}>
          <History size={13} /> سجل الجرد
        </button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <InvStat
          icon={ClipboardCheck}
          value={finished ? 0 : 1}
          note={finished ? "لا توجد عمليات جارية" : `المخزن: ${wh}`}
          tone="orange"
        />
        <InvStat
          icon={ListChecks}
          value={`${counted} / ${sheet.length}`}
          note="منتجات تم عدّها"
        />
        <InvStat
          icon={TrendingDown}
          value={`${deficit} وحدة`}
          note={`${sheet.filter((r) => r.actual < r.expected).length} منتجات`}
          tone="red"
        />
        <InvStat
          icon={TrendingUp}
          value={`+${surplus} وحدات`}
          note={`${sheet.filter((r) => r.actual > r.expected).length} منتجات`}
          tone="green"
        />
      </div>

      <TableCard
        title={`جرد INV-0012 · ${wh}`}
        subtitle={
          finished ? "تم إغلاق هذا الجرد" : "أدخل الكمية الفعلية لكل منتج"
        }
        info={finished ? "مغلق" : "قيد العد"}
        footer={
          <div className="flex items-center justify-between border-t border-line px-4 py-3">
            <button
              disabled={finished}
              onClick={() => setConfirm(true)}
              className="h-8 rounded-full border border-line px-4 text-[11px] font-semibold disabled:opacity-40"
            >
              إنهاء الجرد
            </button>
            <span className="text-[10.5px] text-neutral-500">
              تم عدّ {counted} من {sheet.length} منتج · فروقات: {mism} منتجات
            </span>
          </div>
        }
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-line">
              {[
                "المنتج / الكود",
                "الكمية المتوقعة (النظام)",
                "الكمية الفعلية",
                "الفرق",
                "الحالة",
              ].map((h) => (
                <th key={h} className={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheet.map((r) => {
              const d = (r.actual === "" ? r.expected : r.actual) - r.expected;
              const s = stat(d);
              return (
                <tr key={r.sku} className="border-b border-line last:border-0">
                  <td className={td}>
                    <ProductCell name={r.name} sku={r.sku} icon={Package} />
                  </td>
                  <td className={td}>{r.expected}</td>
                  <td className={td}>
                    <input
                      type="number"
                      min="0"
                      disabled={finished}
                      value={r.actual}
                      onChange={(e) => setActual(r.sku, e.target.value)}
                      className="h-7 w-16 rounded-md border border-line bg-white text-center text-[11px] outline-none focus:border-neutral-400 disabled:bg-neutral-50"
                    />
                  </td>
                  <td
                    className={`${td} font-semibold ${d < 0 ? "text-[#DC2626]" : d > 0 ? "text-[#15803D]" : ""}`}
                    dir="ltr"
                    style={{ textAlign: "right" }}
                  >
                    {d > 0 ? `+${d}` : d}
                  </td>
                  <td className={td}>
                    <StatusBadge tone={s.t}>{s.l}</StatusBadge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </TableCard>

      {showLog && (
        <TableCard
          title="سجل الجرد"
          subtitle="عمليات الجرد السابقة والحالية"
          info={`${log.length} عمليات`}
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-line">
                {[
                  "رقم الجرد",
                  "المخزن",
                  "المسؤول",
                  "التاريخ",
                  "المنتجات",
                  "صافي الفرق",
                  "الحالة",
                ].map((h) => (
                  <th key={h} className={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {log.map((r) => (
                <tr key={r.no} className="border-b border-line last:border-0">
                  <td className={`${td} font-semibold`}>{r.no}</td>
                  <td className={td}>{r.wh}</td>
                  <td className={td}>{r.by}</td>
                  <td className={td}>{r.date}</td>
                  <td className={td}>{r.items}</td>
                  <td
                    className={`${td} font-semibold ${r.diff < 0 ? "text-[#DC2626]" : "text-[#15803D]"}`}
                    dir="ltr"
                    style={{ textAlign: "right" }}
                  >
                    {r.diff > 0 ? `+${r.diff}` : r.diff}
                  </td>
                  <td className={td}>
                    <StatusBadge>{COUNT_STATUS[r.status].label}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableCard>
      )}

      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="إنهاء الجرد"
        message={`سيتم إغلاق الجرد وتسجيل ${mism} منتجات بها فروقات. هل تريد المتابعة؟`}
        onConfirm={finish}
      />
      <Modal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title="جرد جديد"
        width="max-w-sm"
      >
        <Field label="المخزن">
          <select
            className={input}
            value={wh}
            onChange={(e) => setWh(e.target.value)}
          >
            <option>المخزن الرئيسي</option>
            <option>مخزن القاهرة</option>
            <option>مخزن الإسكندرية</option>
          </select>
        </Field>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              setSheet(COUNT_SHEET.map((r) => ({ ...r, actual: r.expected })));
              setFinished(false);
              setNewOpen(false);
              show("تم بدء جرد جديد");
            }}
            className="h-9 flex-1 rounded-lg bg-ink text-[12px] font-semibold text-white"
          >
            بدء الجرد
          </button>
          <button
            onClick={() => setNewOpen(false)}
            className="h-9 w-24 rounded-lg border border-line text-[12px] font-semibold"
          >
            إلغاء
          </button>
        </div>
      </Modal>
      {toast}
    </div>
  );
}
