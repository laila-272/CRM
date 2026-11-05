import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Repeat,
  Trash2,
  Undo2,
} from "lucide-react";
import {
  PageHeader,
  SearchBox,
  PagerBar,
  card,
  btnLight,
  downloadCsv,
  th,
  td,
} from "../Shared/ui.jsx";
import { Toast, useToast } from "../CRMPages/TaskModal.jsx";
import {
  RETENTION_DAYS,
  SOON_DAYS,
  TYPES,
  daysLeft,
  daysSince,
  loadArchive,
  saveArchive,
} from "../../data/Archive.js";

const PREVIEW = 8;
const PAGE_SIZE = 10;
const CHIPS = [
  ["all", "كل العناصر"],
  ["clients", "العملاء"],
  ["deals", "الصفقات"],
  ["contracts", "العقود"],
  ["products", "المنتجات"],
  ["leads", "العملاء المحتملون"],
];

/* ---------- helpers ---------- */
const fmtStamp = (iso, time) => `${iso.replaceAll("-", "/")} · ${time}`;
const daysText = (n) =>
  n === 1
    ? "يوم واحد"
    : n === 2
      ? "يومان"
      : n <= 10
        ? `${n} أيام`
        : `${n} يومًا`;

/* ---------- local pieces ---------- */
function ArchiveStat({ icon: Icon, label, value, note, tone = "gray" }) {
  const tones = {
    gray: "text-neutral-500",
    green: "text-green-600",
    orange: "text-orange-600",
  };
  return (
    <div className={`${card} p-5`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[12px] font-semibold text-ink">{label}</span>
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-line text-neutral-500">
          <Icon size={14} />
        </span>
      </div>
      <div
        className="mt-4 text-[26px] font-bold leading-none text-ink"
        dir="ltr"
        style={{ textAlign: "right" }}
      >
        {value}
      </div>
      <div className={`mt-3 text-[10.5px] ${tones[tone]}`}>{note}</div>
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-8 rounded-full border px-3.5 text-[11px] font-semibold transition-colors ${
        active
          ? "border-neutral-200 bg-neutral-200 text-ink"
          : "border-line bg-white text-neutral-600 hover:bg-neutral-50"
      }`}
    >
      {children}
    </button>
  );
}

function ConfirmDialog({ item, onConfirm, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
      onClick={onClose}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="del-title"
    >
      <div
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[380px] rounded-2xl bg-white p-5 shadow-xl"
      >
        <h2 id="del-title" className="text-[16px] font-semibold text-ink">
          حذف نهائي
        </h2>
        <p className="mt-2 text-[12px] leading-6 text-neutral-600">
          سيتم حذف «<b className="text-ink">{item.name}</b>» نهائيًا من النظام
          ولا يمكن استرجاعه بعد ذلك.
        </p>
        <div className="mt-5 flex items-center gap-2">
          <button
            onClick={() => onConfirm(item)}
            className="h-9 rounded-full bg-red-600 px-5 text-[11.5px] font-semibold text-white hover:bg-red-700"
          >
            حذف نهائيًا
          </button>
          <button
            onClick={onClose}
            className="h-9 rounded-full border border-line bg-white px-5 text-[11.5px] font-semibold text-ink hover:bg-neutral-50"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Archive() {
  const [items, setItems] = useState(loadArchive);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [all, setAll] = useState(false);
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState(null);
  const [toast, notify] = useToast();

  const update = (next) => setItems(saveArchive(next));

  /* statistics (all derived from the items) */
  const thisWeek = items.filter((i) => daysSince(i.deletedAt) <= 6).length;
  const lastWeek = items.filter(
    (i) => daysSince(i.deletedAt) >= 7 && daysSince(i.deletedAt) <= 13,
  ).length;
  const soon = items.filter((i) => daysLeft(i) <= SOON_DAYS).length;
  const restorable = items.length - soon;
  const diff = thisWeek - lastWeek;

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const type = TYPES[cat];
    return items.filter(
      (i) =>
        (!type || i.type === type) &&
        (!s || [i.name, i.type, i.by].some((v) => v.toLowerCase().includes(s))),
    );
  }, [items, q, cat]);

  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const rows = all
    ? list.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE)
    : list.slice(0, PREVIEW);
  const from = list.length ? (cur - 1) * PAGE_SIZE + 1 : 0;
  const reset = (fn) => (v) => {
    fn(v);
    setPage(1);
  };

  const restore = (item) => {
    update(items.filter((i) => i.id !== item.id));
    notify(`تم استرجاع «${item.name}»`);
  };
  const destroy = (item) => {
    update(items.filter((i) => i.id !== item.id));
    setConfirm(null);
    notify("تم الحذف نهائيًا");
  };

  return (
    <div dir="rtl" className="max-w-full">
      <PageHeader
        title="الأرشيف"
        subtitle={`كل ما يتم حذفه من النظام يُحفظ هنا لمدة ${RETENTION_DAYS} يومًا — يمكنك استرجاعه أو حذفه نهائيًا.`}
      >
        <button
          onClick={() =>
            downloadCsv(
              "archive.csv",
              ["العنصر", "النوع", "حذف بواسطة", "تاريخ الحذف", "المتبقي (يوم)"],
              list.map((i) => [
                i.name,
                i.type,
                i.by,
                fmtStamp(i.deletedAt, i.time),
                daysLeft(i),
              ]),
            )
          }
          className={btnLight}
        >
          <Download size={12} /> تصدير البيانات
        </button>
      </PageHeader>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <ArchiveStat
          icon={Undo2}
          label="إجمالي العناصر المؤرشفة"
          value={items.length}
          note={`منذ آخر ${RETENTION_DAYS} يومًا`}
          tone="orange"
        />
        <ArchiveStat
          icon={ArrowUp}
          label="محذوفة هذا الأسبوع"
          value={thisWeek}
          note={
            diff === 0
              ? "مثل الأسبوع الماضي"
              : `${diff > 0 ? "+" : "−"}${Math.abs(diff)} عن الأسبوع الماضي`
          }
        />
        <ArchiveStat
          icon={ArrowDown}
          label="قابلة للاسترجاع"
          value={restorable}
          note={`خلال ${RETENTION_DAYS} يومًا من الحذف`}
          tone="green"
        />
        <ArchiveStat
          icon={Repeat}
          label="تحذف نهائيًا قريبًا"
          value={soon}
          note={`خلال ${SOON_DAYS} أيام`}
          tone="green"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SearchBox
          value={q}
          onChange={reset(setQ)}
          placeholder="ابحث في الأرشيف..."
          className="w-full sm:w-[280px]"
        />
        <div className="flex flex-wrap gap-1.5">
          {CHIPS.map(([k, label]) => (
            <FilterChip
              key={k}
              active={cat === k}
              onClick={() => reset(setCat)(k)}
            >
              {label}
            </FilterChip>
          ))}
        </div>
      </div>

      <section className={`${card} mt-4 overflow-hidden`}>
        <div className="flex flex-wrap items-start justify-between gap-2 p-5 pb-3">
          <div>
            <h2 className="text-[16px] font-semibold text-ink">
              العناصر المحذوفة
            </h2>
            <p className="mt-0.5 text-[10.5px] text-neutral-500">
              آخر العناصر التي تم حذفها من النظام.
            </p>
          </div>
          {list.length > PREVIEW && (
            <button
              type="button"
              onClick={() => {
                setAll(!all);
                setPage(1);
              }}
              className="text-[11px] font-semibold text-ink hover:underline"
            >
              {all ? "عرض أقل" : "عرض الكل"}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead className="border-b border-line">
              <tr>
                {[
                  "العنصر المحذوف",
                  "النوع",
                  "حذف بواسطة",
                  "تاريخ الحذف",
                  "يُحذف نهائيًا خلال",
                  "الإجراءات",
                ].map((h) => (
                  <th key={h} className={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((i) => {
                const left = daysLeft(i);
                return (
                  <tr
                    key={i.id}
                    className="border-b border-line last:border-0 hover:bg-neutral-50/60"
                  >
                    <td className={`${td} !py-3 text-[12px]`}>{i.name}</td>
                    <td className={td}>
                      <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-[10px] text-neutral-600">
                        {i.type}
                      </span>
                    </td>
                    <td className={td}>{i.by}</td>
                    <td
                      className={`${td} text-neutral-600`}
                      dir="ltr"
                      style={{ textAlign: "right" }}
                    >
                      {fmtStamp(i.deletedAt, i.time)}
                    </td>
                    <td
                      className={`${td} ${left <= SOON_DAYS ? "font-semibold text-red-500" : "text-neutral-600"}`}
                    >
                      {daysText(left)}
                    </td>
                    <td className={td}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => restore(i)}
                          className="h-7 rounded-md border border-line bg-white px-3 text-[10.5px] font-semibold text-ink hover:bg-neutral-50"
                        >
                          استرجاع
                        </button>
                        <button
                          onClick={() => setConfirm(i)}
                          aria-label={`حذف ${i.name} نهائيًا`}
                          className="grid h-6 w-6 place-items-center rounded-md border border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!rows.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-[11px] text-neutral-400"
                  >
                    لا توجد عناصر مطابقة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {all && (
          <PagerBar
            page={cur}
            pages={pages}
            onPage={setPage}
            info={`عرض ${from}–${from ? from + rows.length - 1 : 0} من ${list.length} عنصرًا`}
          />
        )}
      </section>

      {confirm && (
        <ConfirmDialog
          item={confirm}
          onConfirm={destroy}
          onClose={() => setConfirm(null)}
        />
      )}
      <Toast message={toast} />
    </div>
  );
}
