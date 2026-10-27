import {
  CalendarCheck,
  Gauge,
  Pencil,
  Plus,
  Timer,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  DAYS,
  RES_STATUS_CLS,
  STATUS_CLS,
  dayLabel,
  dayOfWeek,
  endTime,
  isActive,
  occupancy,
  useScheduling,
  weekStart,
} from "../../data/scheduling.js";
import { addDays, todayIso } from "../../data/Tasks.js";
import { Toast, useToast } from "../CRMPages/TaskModal.jsx";
import AppointmentModal from "./Appointmentmodal.jsx";
import ResourceModal from "./Resourcemodal.jsx";
import {
  PageHeader,
  StatCard,
  btnDark,
  btnLight,
  card,
} from "../Shared/ui.jsx";

function Row({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line py-2.5 last:border-0">
      <dt className="text-[10.5px] text-neutral-500">{label}</dt>
      <dd className="text-left text-[11.5px] font-semibold text-ink">
        {children}
      </dd>
    </div>
  );
}

export default function ResourceProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    resources,
    appointments,
    saveResource,
    removeResource,
    saveAppointment,
    removeAppointment,
  } = useScheduling();
  const [selected, setSelected] = useState(todayIso());
  const [modal, setModal] = useState(null); // { kind: "resource" | "appt", appt?, defaults? }
  const [toast, notify] = useToast();

  const r = resources.find((x) => x.id === id);
  if (!r) {
    return (
      <div dir="rtl" className="p-10 text-center">
        <p className="text-[13px] font-bold text-ink">
          لم يتم العثور على المورد
        </p>
        <p className="mt-1 text-[11px] text-neutral-500">
          قد يكون محذوفًا أو أن الرابط غير صحيح.
        </p>
        <Link to="/resources" className={`${btnDark} mt-4`}>
          العودة إلى الموارد
        </Link>
      </div>
    );
  }

  const today = todayIso();
  const start = weekStart(today);
  const week = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(start, i);
    return {
      date,
      occ: occupancy(r, date, appointments),
      works: r.workDays.includes(i),
    };
  });
  const mine = appointments.filter((a) => a.resourceId === r.id);
  const weekAppts = mine.filter(
    (a) => a.date >= start && a.date <= addDays(start, 6) && isActive(a),
  );
  const workDaysOcc = week.filter((d) => d.works);
  const avgOcc = workDaysOcc.length
    ? Math.round(
        workDaysOcc.reduce((s, d) => s + d.occ, 0) / workDaysOcc.length,
      )
    : 0;
  const cancelRate = mine.length
    ? Math.round(
        (mine.filter((a) => a.status === "ملغي").length / mine.length) * 100,
      )
    : 0;
  const active = mine.filter(isActive);
  const avgDuration = active.length
    ? Math.round(active.reduce((s, a) => s + a.duration, 0) / active.length)
    : 0;
  const dayList = mine
    .filter((a) => a.date === selected)
    .sort((a, b) => a.time.localeCompare(b.time));

  const del = (res) => {
    if (window.confirm(`حذف المورد «${res.name}» وكل مواعيده؟`)) {
      removeResource(res.id);
      navigate("/resources");
    }
  };
  const delAppt = (a) => {
    if (window.confirm(`حذف الموعد «${a.title}»؟`)) {
      removeAppointment(a.id);
      setModal(null);
      notify("تم حذف الموعد");
    }
  };

  return (
    <div dir="rtl" className="max-w-full">
      <Link
        to="/resources"
        className="text-[10.5px] text-neutral-500 hover:text-ink"
      >
        → الموارد
      </Link>
      <div className="mt-1">
        <PageHeader title={r.name} subtitle={r.role}>
          <button
            onClick={() => setModal({ kind: "resource" })}
            className={btnLight}
          >
            <Pencil size={12} /> تعديل المورد
          </button>
          <button
            onClick={() =>
              setModal({
                kind: "appt",
                defaults: { resourceId: r.id, date: selected },
              })
            }
            className={btnDark}
          >
            <Plus size={13} /> موعد جديد
          </button>
        </PageHeader>
      </div>

      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Gauge}
          value={`${avgOcc}%`}
          label="نسبة الإشغال هذا الأسبوع"
        />
        <StatCard
          icon={CalendarCheck}
          value={weekAppts.length}
          label="مواعيد هذا الأسبوع"
        />
        <StatCard
          icon={XCircle}
          value={`${cancelRate}%`}
          label="نسبة الإلغاء"
        />
        <StatCard
          icon={Timer}
          value={`${avgDuration}`}
          label="متوسط مدة الموعد (دقيقة)"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[270px_1fr] gap-4 items-start">
        <section className={`${card} p-4`}>
          <h2 className="mb-1 text-[14px] font-extrabold text-ink">
            معلومات المورد
          </h2>
          <dl>
            <Row label="النوع">{r.type}</Row>
            <Row label="الحالة">
              <span
                className={`rounded-full px-2 py-0.5 text-[9.5px] ${RES_STATUS_CLS[r.status]}`}
              >
                {r.status}
              </span>
            </Row>
            <Row label="الهاتف">
              <span dir="ltr">{r.phone || "—"}</span>
            </Row>
            <Row label="البريد">
              <span dir="ltr">{r.email || "—"}</span>
            </Row>
            <Row label="ساعات العمل">
              <span dir="ltr">
                {r.from} – {r.to}
              </span>
            </Row>
            <Row label="أيام العمل">
              {r.workDays.map((d) => DAYS[d]).join("، ")}
            </Row>
            <Row label="مدة الفترة">{r.slot} دقيقة</Row>
            {r.notes && <Row label="ملاحظات">{r.notes}</Row>}
          </dl>
        </section>

        <div className="space-y-4 min-w-0">
          <section className={`${card} p-4`}>
            <h2 className="text-[14px] font-extrabold text-ink">
              الإشغال خلال الأسبوع
            </h2>
            <p className="mb-3 text-[10px] text-neutral-400">
              اضغط على يوم لعرض حجوزاته
            </p>
            <div
              className="flex h-[150px] items-end justify-around gap-2"
              dir="rtl"
            >
              {week.map((d, i) => {
                const on = d.date === selected;
                return (
                  <button
                    key={d.date}
                    onClick={() => setSelected(d.date)}
                    aria-pressed={on}
                    className="flex h-full max-w-[56px] flex-1 flex-col items-center justify-end"
                  >
                    <span
                      className={`mb-1 text-[10px] ${on ? "font-bold text-ink" : "text-neutral-500"}`}
                    >
                      {d.works ? `${d.occ}%` : "—"}
                    </span>
                    <span
                      className={`w-full rounded-t-sm ${on ? "bg-ink" : d.works ? "bg-neutral-300" : "bg-neutral-100"}`}
                      style={{ height: `${Math.max(d.occ, 3)}px` }}
                    />
                    <span
                      className={`mt-1.5 text-[10px] ${on ? "font-bold text-ink" : "text-neutral-500"}`}
                    >
                      {DAYS[i]}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className={`${card} p-4`}>
            <h2 className="text-[14px] font-extrabold text-ink">
              {selected === today ? "حجوزات اليوم" : "حجوزات اليوم المحدد"}
            </h2>
            <p className="mb-3 text-[10px] text-neutral-400">
              {dayLabel(selected)} · {dayList.length} موعد{" "}
              {!r.workDays.includes(dayOfWeek(selected)) ? "· يوم إجازة" : ""}
            </p>
            <ul className="divide-y divide-line">
              {dayList.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => setModal({ kind: "appt", appt: a })}
                    className="flex w-full items-center gap-3 py-2.5 text-right"
                  >
                    <span
                      dir="ltr"
                      className="w-[88px] shrink-0 text-[10.5px] text-neutral-500"
                    >
                      {a.time} – {endTime(a)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11.5px] font-bold text-ink">
                        {a.customer}
                      </span>
                      <span className="block truncate text-[10px] text-neutral-400">
                        {a.title}
                      </span>
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9.5px] font-semibold ${STATUS_CLS[a.status]}`}
                    >
                      {a.status}
                    </span>
                  </button>
                </li>
              ))}
              {!dayList.length && (
                <li className="py-6 text-center text-[11px] text-neutral-400">
                  لا توجد حجوزات في هذا اليوم.
                </li>
              )}
            </ul>
          </section>
        </div>
      </div>

      {modal?.kind === "resource" && (
        <ResourceModal
          resource={r}
          onSave={(x) => {
            saveResource(x);
            setModal(null);
            notify("تم حفظ بيانات المورد");
          }}
          onDelete={del}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === "appt" && (
        <AppointmentModal
          appt={modal.appt}
          defaults={modal.defaults}
          resources={resources}
          appointments={appointments}
          onSave={(a) => {
            saveAppointment(a);
            setModal(null);
            notify("تم حفظ الموعد");
          }}
          onDelete={delAppt}
          onClose={() => setModal(null)}
        />
      )}
      <Toast message={toast} />
    </div>
  );
}
