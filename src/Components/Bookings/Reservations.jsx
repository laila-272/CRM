import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
} from "lucide-react";
import {  useNavigate} from "react-router-dom";

import { useMemo, useState } from "react";
import {
  DAYS,
  dayOfWeek,
  freeSlots,
  initialOf,
  loadSettings,
  toMin,
  toTime,
  useScheduling,
  weekStart,
} from "../../data/scheduling.js";
import { MONTHS, addDays, fmtDate, toIso, todayIso } from "../../data/Tasks.js";
import { Toast, useToast } from "../CRMPages/TaskModal.jsx";
import AppointmentModal from "./Appointmentmodal.jsx";
import {
  btnDark,
  btnLight,
  card,
  Chip,
  downloadCsv,
  PageHeader,
  Select,
  td,
  th,
} from "../Shared/ui.jsx";
const PAGE_SIZE = 7;

const RANGES = [
  ["day", "اليوم"],
  ["week", "أسبوع"],
  ["month", "شهر"],
];
const PERIOD_NAME = { day: "اليوم", week: "الأسبوع", month: "الشهر" };
const PREV_NAME = { day: "أمس", week: "الأسبوع الماضي", month: "الشهر الماضي" };

// Status filter chips (the "confirmed" chip also includes attended bookings).
const STATUS_CHIPS = [
  ["confirmed", "مؤكدة", ["مؤكد", "مكتمل"]],
  ["pending", "بانتظار التأكيد", ["بانتظار التأكيد"]],
  ["cancelled", "ملغاة", ["ملغي"]],
];

const STATUS_PILL = {
  مؤكد: "bg-neutral-100 text-ink",
  "بانتظار التأكيد": "bg-neutral-100 text-neutral-600",
  مكتمل: "bg-green-50 text-green-600",
  ملغي: "bg-red-50 text-red-500",
};

/* ---------- helpers ---------- */
const hm12 = (t) => {
  const [h, m] = t.split(":").map(Number);
  return `${String(h % 12 || 12).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};
const period = (t) => (Number(t.split(":")[0]) >= 12 ? "م" : "ص");
const time12 = (t) => `${hm12(t)} ${period(t)}`;
const money = (n) => `${Number(n).toLocaleString("en-US")} ج.م`;

const utc = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
// اليوم / غدًا / أمس / اسم اليوم خلال أسبوع / أو التاريخ
function relDay(iso) {
  const diff = Math.round((utc(iso) - utc(todayIso())) / 864e5);
  if (diff === 0) return "اليوم";
  if (diff === 1) return "غدًا";
  if (diff === -1) return "أمس";
  if (Math.abs(diff) <= 6) return DAYS[dayOfWeek(iso)];
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

// inclusive [from, to] of the selected period, optionally shifted by whole periods
function bounds(date, range, shift = 0) {
  if (range === "day") {
    const d = addDays(date, shift);
    return [d, d];
  }
  if (range === "week") {
    const s = addDays(weekStart(date), 7 * shift);
    return [s, addDays(s, 6)];
  }
  const [y, m] = date.split("-").map(Number);
  return [
    toIso(new Date(y, m - 1 + shift, 1)),
    toIso(new Date(y, m + shift, 0)),
  ];
}

function payInfo(a, refundOnCancel) {
  if (!a.amount) return { top: "—", sub: "بدون دفع" };
  const top = money(a.amount);
  if (a.status === "ملغي")
    return { top, sub: refundOnCancel ? "مسترد" : "غير مسترد" };
  if (a.status === "بانتظار التأكيد") return { top, sub: "بانتظار الدفع" };
  if (a.status === "مكتمل") return { top, sub: "مدفوع بالكامل" };
  return { top, sub: "عربون مدفوع" };
}

/* ---------- local UI ---------- */
function ReservationStat({ label, value, badge, tone = "gray" }) {
  const tones = {
    gray: "bg-neutral-100 text-neutral-500",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <div className={`${card} p-4`}>
      <div className="text-[11px] text-neutral-500">{label}</div>
      <div className="mt-2 text-[28px] font-semibold leading-none text-ink">
        {value}
      </div>
      <span
        className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-[10px] ${tones[tone]}`}
      >
        {badge}
      </span>
    </div>
  );
}

function RangeChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`h-9 rounded-lg border px-4 text-[11.5px] font-semibold transition-colors ${
        active
          ? "border-ink bg-ink text-white"
          : "border-line bg-white text-ink hover:bg-neutral-50"
      }`}
    >
      {children}
    </button>
  );
}

export default function Reservations() {
  const { resources, appointments, saveAppointment, removeAppointment } =
    useScheduling();
  const [date, setDate] = useState(todayIso());
  const [range, setRange] = useState("day"); // day | week | month
  const [resourceId, setResourceId] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [toast, notify] = useToast();
  const navigate = useNavigate();

  const refundOnCancel = loadSettings().payment.refundOnCancel;
  const resName = (id) => resources.find((r) => r.id === id)?.name || "—";
  const byResource = (a) => resourceId === "all" || a.resourceId === resourceId;

  /* ---- statistics for the selected period (+ comparison with the previous one) ---- */
  const [from0, to0] = bounds(date, range);
  const [fromP, toP] = bounds(date, range, -1);
  const inRange = useMemo(
    () =>
      appointments.filter(
        (a) => byResource(a) && a.date >= from0 && a.date <= to0,
      ),
    [appointments, from0, to0, resourceId], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const prevRange = useMemo(
    () =>
      appointments.filter(
        (a) => byResource(a) && a.date >= fromP && a.date <= toP,
      ),
    [appointments, fromP, toP, resourceId], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const total = inRange.length;
  const confirmed = inRange.filter(
    (a) => a.status === "مؤكد" || a.status === "مكتمل",
  ).length;
  const pending = inRange.filter((a) => a.status === "بانتظار التأكيد").length;
  const cancelled = inRange.filter((a) => a.status === "ملغي").length;
  const prevCancelled = prevRange.filter((a) => a.status === "ملغي").length;
  const delta = total - prevRange.length;

  const cancelBadge =
    cancelled === 0 && prevCancelled === 0
      ? "لا توجد ملغاة"
      : cancelled < prevCancelled
        ? "أقل من المعتاد"
        : cancelled > prevCancelled
          ? "أعلى من المعتاد"
          : "مثل المعتاد";

  /* ---- the list: bookings from the start of the selected period onward ---- */
  const base = useMemo(
    () =>
      appointments
        .filter((a) => byResource(a) && a.date >= from0)
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [appointments, from0, resourceId], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const list = useMemo(() => {
    const chip = STATUS_CHIPS.find(([k]) => k === status);
    return chip ? base.filter((a) => chip[2].includes(a.status)) : base;
  }, [base, status]);

  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const rows = list.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const from = list.length ? (cur - 1) * PAGE_SIZE + 1 : 0;
  const to = from ? from + rows.length - 1 : 0;

  /* ---- navigation ---- */
  const dateLabel =
    range === "day"
      ? fmtDate(date)
      : range === "week"
        ? `${fmtDate(from0)} – ${fmtDate(to0)}`
        : `${MONTHS[Number(date.split("-")[1]) - 1]} ${date.split("-")[0]}`;
  const pick = (d, r) => {
    setDate(d);
    setRange(r);
    setPage(1);
  };
  const shift = (dir) =>
    pick(
      range === "month"
        ? bounds(date, "month", dir)[0]
        : addDays(date, dir * (range === "week" ? 7 : 1)),
      range,
    );

  /* ---- actions ---- */
  const onSave = (a) => {
    const isNew = !appointments.some((x) => x.id === a.id);
    saveAppointment(a);
    setModal(null);
    notify(isNew ? "تمت إضافة الحجز" : "تم حفظ التعديلات");
  };
  const del = (a) => {
    if (window.confirm(`حذف الحجز «${a.title}»؟`)) {
      removeAppointment(a.id);
      setModal(null);
      notify("تم حذف الحجز");
    }
  };

  /* ---- available slots card ---- */
  const slotDate = range === "day" ? date : todayIso();
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const slots = resources
    .filter((r) => resourceId === "all" || r.id === resourceId)
    .flatMap((r) => {
      const free = freeSlots(r, slotDate, appointments).filter(
        (t) => slotDate !== todayIso() || toMin(t) > nowMin,
      );
      return free.map((t, i) => ({ r, t, last: i === free.length - 1 }));
    })
    .sort((a, b) => a.t.localeCompare(b.t))
    .slice(0, 4);

  return (
    <div dir="rtl" className="max-w-full">
      <PageHeader
        title="الحجوزات"
        subtitle="نظّم حجوزات العملاء على الخدمات والموارد، وتابع حالتها لحظة بلحظة."
      >
        <button
          onClick={() =>
            setModal({ defaults: { date, status: "بانتظار التأكيد" } })
          }
          className={btnDark}
        >
          <Plus size={13} /> حجز جديد
        </button>
        <button
          onClick={() =>
            downloadCsv(
              "reservations.csv",
              [
                "رقم الحجز",
                "العميل",
                "الخدمة",
                "المورد",
                "التاريخ",
                "الوقت",
                "المبلغ",
                "الحالة",
              ],
              list.map((a) => [
                `RSV-${String(a.id).slice(-4).padStart(4, "0")}`,
                a.customer,
                a.title,
                resName(a.resourceId),
                a.date,
                a.time,
                a.amount,
                a.status,
              ]),
            )
          }
          className={`${btnLight} !rounded-md`}
        >
          <Download size={12} /> تصدير
        </button>
      </PageHeader>

      {/* date navigation + range + resource filter */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            aria-label="السابق"
            onClick={() => shift(-1)}
            className="grid h-7 w-7 place-items-center rounded-md text-neutral-500 hover:bg-neutral-100"
          >
            <ChevronRight size={15} />
          </button>
          <span className="min-w-[120px] text-center text-[14px] font-bold text-ink">
            {dateLabel}
          </span>
          <button
            aria-label="التالي"
            onClick={() => shift(1)}
            className="grid h-7 w-7 place-items-center rounded-md text-neutral-500 hover:bg-neutral-100"
          >
            <ChevronLeft size={15} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {RANGES.map(([k, label]) => (
            <RangeChip
              key={k}
              active={range === k && (k !== "day" || date === todayIso())}
              onClick={() => pick(k === "day" ? todayIso() : date, k)}
            >
              {label}
            </RangeChip>
          ))}
          <div className="w-[150px]">
            <Select
              value={resourceId}
              onChange={(v) => {
                setResourceId(v);
                setPage(1);
              }}
            >
              <option value="all">كل الموارد</option>
              {resources.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* statistics */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <ReservationStat
          label={`حجوزات ${PERIOD_NAME[range]}`}
          value={total}
          tone={delta > 0 ? "green" : "gray"}
          badge={
            delta === 0
              ? `مثل ${PREV_NAME[range]}`
              : `${delta > 0 ? "+" : "−"}${Math.abs(delta)} عن ${PREV_NAME[range]}`
          }
        />
        <ReservationStat
          label="مؤكدة"
          value={confirmed}
          badge={`${total ? Math.round((confirmed / total) * 100) : 0}% من الإجمالي`}
        />
        <ReservationStat
          label="بانتظار التأكيد"
          value={pending}
          tone={pending ? "orange" : "gray"}
          badge={pending ? "تحتاج متابعة" : "لا شيء معلّق"}
        />
        <ReservationStat label="ملغاة" value={cancelled} badge={cancelBadge} />
      </div>

      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_270px]">
        {/* bookings list */}
        <section className={`${card} min-w-0 overflow-hidden`}>
          <div className="flex flex-wrap items-center justify-between gap-2 p-4">
            <h2 className="text-[17px] font-semibold text-ink">
              قائمة الحجوزات
            </h2>
            <div className="flex flex-wrap gap-1.5">
              <Chip
                active={status === "all"}
                onClick={() => {
                  setStatus("all");
                  setPage(1);
                }}
              >
                الكل ({base.length})
              </Chip>
              {STATUS_CHIPS.map(([k, label]) => (
                <Chip
                  key={k}
                  active={status === k}
                  onClick={() => {
                    setStatus(k);
                    setPage(1);
                  }}
                >
                  {label}
                </Chip>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead className="border-y border-line bg-neutral-50/70">
                <tr>
                  {[
                    "العميل",
                    "الخدمة والمورد",
                    "الموعد",
                    "الحالة",
                    "الدفع",
                  ].map((h) => (
                    <th key={h} className={th}>
                      {h}
                    </th>
                  ))}
                  <th className={th} aria-label="إجراء" />
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => {
                  const pay = payInfo(a, refundOnCancel);
                  return (
                    <tr
                      key={a.id}
                      className="border-b border-line last:border-0 hover:bg-neutral-50/60"
                    >
                      <td className={`${td} !py-3.5`}>
                        <div className="flex items-center gap-3">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-neutral-100 text-[11px] font-bold text-ink">
                            {initialOf(a.customer)}
                          </span>
                          <div className="leading-tight">
                            <div className="text-[12px] font-bold">
                              {a.customer}
                            </div>
                            <div
                              dir="ltr"
                              className="mt-0.5 text-right text-[10px] text-neutral-400"
                            >
                              RSV-{String(a.id).slice(-4).padStart(4, "0")}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={td}>
                        <div className="text-[12px] font-semibold">
                          {a.title}
                        </div>
                        <div className="mt-0.5 text-[10px] text-neutral-400">
                          {resName(a.resourceId)}
                        </div>
                      </td>
                      <td className={td}>
                        <div className="text-[12px] font-semibold">
                          {relDay(a.date)}
                        </div>
                        <div className="mt-0.5 text-[10px] text-neutral-400">
                          {time12(a.time)}
                        </div>
                      </td>
                      <td className={td}>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${STATUS_PILL[a.status]}`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className={td}>
                        <div className="text-[12px] font-semibold">
                          {pay.top}
                        </div>
                        <div className="mt-0.5 text-[10px] text-neutral-400">
                          {pay.sub}
                        </div>
                      </td>
                      <td className={td}>
                        <button
                          onClick={() => navigate("/resDetails")}
                          className="inline-flex items-center gap-1 text-[10.5px] text-neutral-500 hover:text-ink"
                        >
                          عرض التفاصيل <ArrowLeft size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {!rows.length && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-[11px] text-neutral-400"
                    >
                      لا توجد حجوزات مطابقة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* pager */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3">
            <span className="text-[11px] text-neutral-500">
              عرض {from}–{to} من {list.length} حجزًا
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(cur - 1, 1))}
                disabled={cur === 1}
                className="h-9 rounded-lg border border-line bg-white px-4 text-[11.5px] font-semibold text-ink hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                السابق
              </button>
              <button
                onClick={() => setPage(Math.min(cur + 1, pages))}
                disabled={cur === pages}
                className="h-9 rounded-lg bg-ink px-4 text-[11.5px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                التالي
              </button>
            </div>
          </div>
        </section>

        {/* available slots */}
        <aside className={`${card} p-4`}>
          <h2 className="text-[17px] font-semibold text-ink">
            الخانات المتاحة
          </h2>
          <p className="mb-2 mt-0.5 text-[10px] text-neutral-400">
            {relDay(slotDate)} ·{" "}
            {resourceId === "all" ? "كل الموارد" : resName(resourceId)}
          </p>
          <ul>
            {slots.map(({ r, t, last }) => (
              <li
                key={`${r.id}-${t}`}
                className="border-b border-line last:border-0"
              >
                <button
                  onClick={() =>
                    setModal({
                      defaults: {
                        resourceId: r.id,
                        date: slotDate,
                        time: t,
                        duration: r.slot,
                        status: "بانتظار التأكيد",
                      },
                    })
                  }
                  className="block w-full py-3 text-right hover:bg-neutral-50/60"
                >
                  <div className="text-[11.5px] font-semibold text-ink">
                    {hm12(t)} – {hm12(toTime(toMin(t) + r.slot))} {period(t)}
                  </div>
                  <div className="mt-0.5 text-[10px] text-neutral-400">
                    {r.name}
                  </div>
                  <span
                    className={`mt-1.5 inline-block rounded-md px-2 py-0.5 text-[9.5px] font-semibold ${
                      last
                        ? "bg-orange-50 text-orange-600"
                        : "bg-green-50 text-green-600"
                    }`}
                  >
                    {last ? "آخر خانة" : "متاح"}
                  </span>
                </button>
              </li>
            ))}
            {!slots.length && (
              <li className="py-4 text-[11px] text-neutral-400">
                لا توجد خانات متاحة.
              </li>
            )}
          </ul>
        </aside>
      </div>

      {modal && (
        <AppointmentModal
          appt={modal.appt}
          defaults={modal.defaults}
          resources={resources}
          appointments={appointments}
          onSave={onSave}
          onDelete={del}
          onClose={() => setModal(null)}
        />
      )}
      <Toast message={toast} />
    </div>
  );
}
