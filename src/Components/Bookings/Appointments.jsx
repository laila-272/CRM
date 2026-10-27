import { ChevronLeft, ChevronRight, Copy, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import {
  APPT_TYPES,
  BLOCK_CLS,
  STATUS_CLS,
  dayLabel,
  dayOfWeek,
  endTime,
  initialOf,
  isActive,
  toMin,
  toTime,
  useScheduling,
} from "../../data/scheduling.js";
import { addDays, todayIso } from "../../data/Tasks.js";
import { Toast, useToast } from "../CRMPages/TaskModal.jsx";
import AppointmentModal from "./Appointmentmodal.jsx";
import { Chip, PageHeader, Select, btnDark, card } from "../Shared/ui.jsx";

const PX_PER_MIN = 1.1;
const COL_MIN_W = 170;

export default function Appointments() {
  const { resources, appointments, saveAppointment, removeAppointment } =
    useScheduling();
  const [date, setDate] = useState(todayIso());
  const [type, setType] = useState("all");
  const [modal, setModal] = useState(null);
  const [toast, notify] = useToast();

  const cols = resources.filter((r) => r.status !== "غير متاح");
  const startMin =
    Math.floor(Math.min(...cols.map((r) => toMin(r.from)), 540) / 60) * 60;
  const endMin =
    Math.ceil(Math.max(...cols.map((r) => toMin(r.to)), 1020) / 60) * 60;
  const hours = Array.from(
    { length: (endMin - startMin) / 60 },
    (_, i) => startMin + i * 60,
  );
  const height = (endMin - startMin) * PX_PER_MIN;

  const day = useMemo(
    () =>
      appointments
        .filter((a) => a.date === date && (type === "all" || a.type === type))
        .sort((a, b) => a.time.localeCompare(b.time)),
    [appointments, date, type],
  );
  const count = (s) => day.filter((a) => a.status === s).length;

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const isToday = date === todayIso();
  const upcoming = day
    .filter(
      (a) =>
        isActive(a) &&
        a.status !== "مكتمل" &&
        (!isToday || toMin(a.time) >= nowMin),
    )
    .slice(0, 3);
  const resName = (id) => resources.find((r) => r.id === id)?.name || "—";

  const onSave = (a) => {
    const isNew = !appointments.some((x) => x.id === a.id);
    saveAppointment(a);
    setModal(null);
    notify(isNew ? "تمت إضافة الموعد" : "تم حفظ التعديلات");
  };
  const del = (a) => {
    if (window.confirm(`حذف الموعد «${a.title}»؟`)) {
      removeAppointment(a.id);
      setModal(null);
      notify("تم حذف الموعد");
    }
  };
  const clickColumn = (e, r) => {
    if (e.target !== e.currentTarget) return;
    const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
    const snapped = Math.floor((startMin + y / PX_PER_MIN) / r.slot) * r.slot;
    setModal({
      defaults: {
        resourceId: r.id,
        date,
        time: toTime(snapped),
        duration: r.slot,
      },
    });
  };
  const copyReminders = async () => {
    const text = upcoming
      .map(
        (a) =>
          `تذكير: ${a.customer}، موعدك (${a.type}) يوم ${dayLabel(a.date)} الساعة ${a.time} مع ${resName(a.resourceId)}.`,
      )
      .join("\n");
    if (!text) return notify("لا توجد مواعيد قادمة");
    try {
      await navigator.clipboard.writeText(text);
      notify("تم نسخ رسائل التذكير");
    } catch {
      notify("تعذر النسخ");
    }
  };

  return (
    <div dir="rtl" className="max-w-full">
      <PageHeader
        title="المواعيد"
        subtitle="جدول المواعيد اليومي لكل الموارد، مع إمكانية الإضافة بالنقر على الوقت المطلوب."
      >
        <button
          onClick={() => setModal({ defaults: { date } })}
          className={btnDark}
        >
          <Plus size={13} /> موعد جديد
        </button>
      </PageHeader>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            aria-label="اليوم السابق"
            onClick={() => setDate(addDays(date, -1))}
            className="grid h-8 w-8 place-items-center rounded-full border border-line bg-white hover:bg-neutral-50"
          >
            <ChevronRight size={14} />
          </button>
          <span className="min-w-[150px] text-center text-[12.5px] font-bold text-ink">
            {dayLabel(date)}
          </span>
          <button
            aria-label="اليوم التالي"
            onClick={() => setDate(addDays(date, 1))}
            className="grid h-8 w-8 place-items-center rounded-full border border-line bg-white hover:bg-neutral-50"
          >
            <ChevronLeft size={14} />
          </button>
        </div>
        <div className="flex items-center gap-1.5">
          <Chip active={isToday} onClick={() => setDate(todayIso())}>
            اليوم
          </Chip>
          <div className="w-[140px]">
            <Select value={type} onChange={setType}>
              <option value="all">كل الأنواع</option>
              {APPT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4 items-start">
        <section className={`${card} min-w-0 p-4`}>
          <h2 className="text-[14px] font-extrabold text-ink">جدول اليوم</h2>
          <p className="mb-3 text-[10px] text-neutral-400">
            {dayLabel(date)} · {day.length} موعد
          </p>

          <div className="overflow-x-auto">
            <div
              className="flex"
              style={{ minWidth: 44 + cols.length * COL_MIN_W }}
            >
              {/* time gutter */}
              <div className="w-11 shrink-0">
                <div className="h-[46px]" />
                <div className="relative" style={{ height }}>
                  {hours.map((h) => (
                    <span
                      key={h}
                      dir="ltr"
                      className="absolute right-1 text-[9.5px] text-neutral-400"
                      style={{ top: (h - startMin) * PX_PER_MIN - 6 }}
                    >
                      {toTime(h)}
                    </span>
                  ))}
                </div>
              </div>

              {cols.map((r) => {
                const works = r.workDays.includes(dayOfWeek(date));
                const items = day.filter((a) => a.resourceId === r.id);
                return (
                  <div
                    key={r.id}
                    className="min-w-0 flex-1 border-r border-line"
                    style={{ minWidth: COL_MIN_W }}
                  >
                    <div className="flex h-[46px] items-center gap-2 border-b border-line px-2">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-[10.5px] font-bold text-white">
                        {initialOf(r.name)}
                      </span>
                      <div className="min-w-0 leading-tight">
                        <div className="truncate text-[11px] font-bold text-ink">
                          {r.name}
                        </div>
                        <div className="text-[9.5px] text-neutral-400">
                          {items.length} مواعيد
                        </div>
                      </div>
                    </div>

                    <div
                      className="relative cursor-pointer"
                      style={{ height }}
                      onClick={(e) => clickColumn(e, r)}
                    >
                      {hours.map((h) => (
                        <div
                          key={h}
                          className="pointer-events-none absolute inset-x-0 border-t border-line"
                          style={{ top: (h - startMin) * PX_PER_MIN }}
                        />
                      ))}
                      {/* non-working hours */}
                      {!works ? (
                        <div className="pointer-events-none absolute inset-0 bg-neutral-100/80" />
                      ) : (
                        <>
                          <div
                            className="pointer-events-none absolute inset-x-0 top-0 bg-neutral-100/80"
                            style={{
                              height: (toMin(r.from) - startMin) * PX_PER_MIN,
                            }}
                          />
                          <div
                            className="pointer-events-none absolute inset-x-0 bottom-0 bg-neutral-100/80"
                            style={{
                              height: (endMin - toMin(r.to)) * PX_PER_MIN,
                            }}
                          />
                        </>
                      )}
                      {isToday && nowMin >= startMin && nowMin <= endMin && (
                        <div
                          className="pointer-events-none absolute inset-x-0 z-10 border-t border-orange-500"
                          style={{ top: (nowMin - startMin) * PX_PER_MIN }}
                        />
                      )}

                      {items.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => setModal({ appt: a })}
                          title={`${a.title} · ${a.time} – ${endTime(a)}`}
                          className={`absolute inset-x-1 overflow-hidden rounded-md border-r-4 px-2 py-1 text-right ${BLOCK_CLS[a.status]}`}
                          style={{
                            top: (toMin(a.time) - startMin) * PX_PER_MIN + 1,
                            height: Math.max(a.duration * PX_PER_MIN - 2, 22),
                          }}
                        >
                          <div className="truncate text-[10.5px] font-bold">
                            {a.customer}
                          </div>
                          {a.duration >= 45 && (
                            <div className="truncate text-[9.5px] opacity-80">
                              {a.type} ·{" "}
                              <span dir="ltr">
                                {a.time}–{endTime(a)}
                              </span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className={`${card} p-4`}>
            <h2 className="mb-3 text-[14px] font-extrabold text-ink">
              ملخص اليوم
            </h2>
            <dl className="space-y-2 text-[11.5px]">
              {[
                ["إجمالي المواعيد", day.length, ""],
                ["مؤكدة", count("مؤكد"), STATUS_CLS["مؤكد"]],
                [
                  "بانتظار التأكيد",
                  count("بانتظار التأكيد"),
                  STATUS_CLS["بانتظار التأكيد"],
                ],
                ["ملغية", count("ملغي"), STATUS_CLS["ملغي"]],
              ].map(([l, v, c]) => (
                <div key={l} className="flex items-center justify-between">
                  <dt className="text-neutral-500">{l}</dt>
                  <dd
                    className={`min-w-6 rounded-full px-2 text-center font-bold ${c || "text-ink"}`}
                  >
                    {v}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section className={`${card} p-4`}>
            <h2 className="mb-3 text-[14px] font-extrabold text-ink">
              المواعيد القادمة
            </h2>
            <ul className="space-y-2.5">
              {upcoming.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => setModal({ appt: a })}
                    className="block w-full text-right"
                  >
                    <div className="flex items-center justify-between text-[10px] text-neutral-500">
                      <span dir="ltr">{a.time}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] ${STATUS_CLS[a.status]}`}
                      >
                        {a.status}
                      </span>
                    </div>
                    <div className="text-[11.5px] font-bold text-ink">
                      {a.customer}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      {a.type} · {resName(a.resourceId)}
                    </div>
                  </button>
                </li>
              ))}
              {!upcoming.length && (
                <li className="text-[11px] text-neutral-400">
                  لا توجد مواعيد قادمة.
                </li>
              )}
            </ul>
            <button
              onClick={copyReminders}
              className={`${btnDark} mt-4 w-full justify-center`}
            >
              <Copy size={12} /> نسخ رسائل التذكير
            </button>
            <p className="mt-1.5 text-center text-[9.5px] text-neutral-400">
              الإرسال الفعلي يحتاج ربطًا بخدمة رسائل.
            </p>
          </section>
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
