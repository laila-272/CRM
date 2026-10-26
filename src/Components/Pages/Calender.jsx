import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PageHeader, btnDark, btnLight, card } from "./ui.jsx";
import TaskModal, { Toast, useToast } from "./TaskModal.jsx";
import {
  useTasks,
  statusOf,
  fmtDate,
  toIso,
  todayIso,
  MONTHS,
  TYPES,
  TYPE_CLS,
  TYPE_DOT,
} from "../../data/Tasks.js";

// Week starts on Sunday. Change WEEK order here to start on Saturday instead.
const WEEK = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
];
const MAX_VISIBLE = 3;

function Switch({ on, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={`relative h-4 w-7 rounded-full transition-colors ${on ? "bg-ink" : "bg-neutral-300"}`}
    >
      <span
        className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${on ? "right-3.5" : "right-0.5"}`}
      />
    </button>
  );
}

export default function Calendar() {
  const { tasks, save, remove } = useTasks();
  const now = new Date();
  const [cursor, setCursor] = useState({
    y: now.getFullYear(),
    m: now.getMonth(),
  });
  const [selected, setSelected] = useState(todayIso());
  const [visible, setVisible] = useState(() =>
    Object.fromEntries(TYPES.map((t) => [t, true])),
  );
  const [modal, setModal] = useState(null);
  const [toast, notify] = useToast();
  const today = todayIso();

  const cells = useMemo(() => {
    const { y, m } = cursor;
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    const total = Math.ceil((first + days) / 7) * 7;
    return Array.from({ length: total }, (_, i) => {
      const d = new Date(y, m, 1 - first + i);
      return { iso: toIso(d), day: d.getDate(), inMonth: d.getMonth() === m };
    });
  }, [cursor]);

  const byDate = useMemo(() => {
    const map = {};
    tasks
      .filter((t) => visible[t.type])
      .sort((a, b) => a.time.localeCompare(b.time))
      .forEach((t) => (map[t.due] = [...(map[t.due] || []), t]));
    return map;
  }, [tasks, visible]);

  const go = (delta) =>
    setCursor(({ y, m }) => {
      const d = new Date(y, m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  const goToday = () => {
    setCursor({ y: now.getFullYear(), m: now.getMonth() });
    setSelected(today);
  };

  const dayTasks = byDate[selected] || [];
  const nextOpen = tasks
    .filter((t) => !t.done && t.due >= today && visible[t.type])
    .sort((a, b) => (a.due + a.time).localeCompare(b.due + b.time))[0];
  const monthCount = tasks.filter(
    (t) =>
      t.due.startsWith(
        `${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}`,
      ) && visible[t.type],
  ).length;

  const onSave = (t) => {
    const isNew = !tasks.some((x) => x.id === t.id);
    save(t);
    setModal(null);
    setSelected(t.due);
    notify(isNew ? "تمت إضافة المهمة" : "تم حفظ التعديلات");
  };
  const del = (t) => {
    if (window.confirm(`هل تريد حذف المهمة «${t.title}»؟`)) {
      remove(t.id);
      setModal(null);
      notify("تم حذف المهمة");
    }
  };

  return (
    <div dir="rtl" className=" max-w-full">
      <PageHeader
        title="الاجتماعات والتقويم"
        subtitle="تابع مواعيد المكالمات والمعاينات والاجتماعات على التقويم الشهري."
      >
        <button onClick={goToday} className={btnLight}>
          اليوم
        </button>
        <button
          onClick={() =>
            setModal({ defaults: { due: selected, type: "اجتماع" } })
          }
          className={btnDark}
        >
          <Plus size={13} /> إضافة مهمة
        </button>
      </PageHeader>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4 items-start">
        {/* Month grid */}
        <section className={`${card} p-3 min-w-0`}>
          <div className="flex items-center justify-between px-1 pb-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => go(-1)}
                aria-label="الشهر السابق"
                className="w-7 h-7 grid place-items-center rounded-full border border-line hover:bg-neutral-100"
              >
                <ChevronRight size={14} />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="الشهر التالي"
                className="w-7 h-7 grid place-items-center rounded-full border border-line hover:bg-neutral-100"
              >
                <ChevronLeft size={14} />
              </button>
            </div>
            <h2 className="text-[15px] font-semibold text-ink">
              {MONTHS[cursor.m]} <span dir="ltr">{cursor.y}</span>
            </h2>
            <span className="text-[10.5px] text-neutral-500">
              {monthCount} مهمة هذا الشهر
            </span>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[640px]">
              <div className="grid grid-cols-7 border border-line rounded-t-lg bg-neutral-50">
                {WEEK.map((d) => (
                  <div
                    key={d}
                    className="py-2 text-center text-[10.5px] font-semibold text-neutral-500"
                  >
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 border-x border-b border-line rounded-b-lg overflow-hidden">
                {cells.map((c) => {
                  const list = byDate[c.iso] || [];
                  const isSel = c.iso === selected;
                  return (
                    <div
                      key={c.iso}
                      onClick={() => setSelected(c.iso)}
                      className={`min-h-[92px] border-t border-l border-line p-1.5 cursor-pointer transition-colors ${
                        c.inMonth ? "bg-white" : "bg-neutral-50/70"
                      } ${isSel ? "ring-1 ring-inset ring-ink" : "hover:bg-neutral-50"}`}
                    >
                      <span
                        className={`inline-grid place-items-center h-5 min-w-5 rounded-full px-1 text-[10.5px] ${
                          c.iso === today
                            ? "bg-ink text-white font-bold"
                            : c.inMonth
                              ? "text-ink"
                              : "text-neutral-300"
                        }`}
                      >
                        {c.day}
                      </span>
                      <div className="mt-1 space-y-0.5">
                        {list.slice(0, MAX_VISIBLE).map((t) => (
                          <button
                            key={t.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setModal({ task: t });
                            }}
                            className={`block w-full truncate rounded px-1 py-0.5 text-right text-[9.5px] ${TYPE_CLS[t.type]} ${t.done ? "line-through opacity-60" : ""}`}
                            title={t.title}
                          >
                            <span dir="ltr">{t.time}</span> {t.title}
                          </button>
                        ))}
                        {list.length > MAX_VISIBLE && (
                          <div className="text-[9.5px] text-neutral-500 px-1">
                            +{list.length - MAX_VISIBLE} أخرى
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1 text-[10.5px] text-neutral-500">
            <span>
              {nextOpen ? (
                <>
                  الموعد القادم: <b className="text-ink">{nextOpen.title}</b> ·{" "}
                  {fmtDate(nextOpen.due)} {nextOpen.time}
                </>
              ) : (
                "لا توجد مواعيد قادمة"
              )}
            </span>
            <span className="flex items-center gap-3">
              {TYPES.map((t) => (
                <span key={t} className="flex items-center gap-1">
                  <i className={`w-2 h-2 rounded-full ${TYPE_DOT[t]}`} /> {t}
                </span>
              ))}
            </span>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-4">
          <section className={`${card} p-4`}>
            <h2 className="text-[13px] font-extrabold text-ink">
              {selected === today ? "جدول اليوم" : "جدول اليوم المحدد"}
            </h2>
            <p className="text-[10px] text-neutral-400 mb-3">
              {fmtDate(selected)}
            </p>
            <ul className="space-y-2.5">
              {dayTasks.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setModal({ task: t })}
                    className="w-full rounded-lg border border-line p-2.5 text-right hover:bg-neutral-50"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[9.5px] font-semibold rounded-full px-2 py-0.5 ${TYPE_CLS[t.type]}`}
                      >
                        {t.type}
                      </span>
                      <span className="text-[10px] text-neutral-500" dir="ltr">
                        {t.time}
                      </span>
                    </div>
                    <div
                      className={`mt-1.5 text-[11.5px] font-bold text-ink ${t.done ? "line-through" : ""}`}
                    >
                      {t.title}
                    </div>
                    <div className="text-[10px] text-neutral-400">
                      {t.customer} · {statusOf(t)}
                    </div>
                  </button>
                </li>
              ))}
              {!dayTasks.length && (
                <li className="text-[11px] text-neutral-400">
                  لا توجد مهام في هذا اليوم.
                </li>
              )}
            </ul>
            <button
              onClick={() => setModal({ defaults: { due: selected } })}
              className="mt-3 w-full h-8 rounded-lg border border-dashed border-neutral-300 text-[10.5px] text-neutral-500 hover:bg-neutral-50"
            >
              + إضافة مهمة في هذا اليوم
            </button>
          </section>

          <section className={`${card} p-4`}>
            <h2 className="text-[13px] font-extrabold text-ink mb-3">
              التقاويم الظاهرة
            </h2>
            <ul className="space-y-2.5">
              {TYPES.map((t) => (
                <li
                  key={t}
                  className="flex items-center justify-between text-[11px] text-ink"
                >
                  <span className="flex items-center gap-2">
                    <i className={`w-2 h-2 rounded-full ${TYPE_DOT[t]}`} /> {t}
                  </span>
                  <Switch
                    on={visible[t]}
                    label={t}
                    onChange={() =>
                      setVisible({ ...visible, [t]: !visible[t] })
                    }
                  />
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      {modal && (
        <TaskModal
          task={modal.task}
          defaults={modal.defaults}
          onSave={onSave}
          onDelete={del}
          onClose={() => setModal(null)}
        />
      )}
      <Toast message={toast} />
    </div>
  );
}
