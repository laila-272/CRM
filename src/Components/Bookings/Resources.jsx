import { CalendarCheck, Gauge, Plus, UserCheck, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  RES_STATUSES,
  RES_STATUS_CLS,
  RES_TYPES,
  freeSlots,
  initialOf,
  isActive,
  occupancy,
  useScheduling,
} from "../../data/scheduling.js";
import { todayIso } from "../../data/Tasks.js";
import { Toast, useToast } from "../CRMPages/TaskModal.jsx";
import AppointmentModal from "./Appointmentmodal.jsx";
import ResourceModal from "./Resourcemodal.jsx";
import {
  Chip,
  PageHeader,
  SearchBox,
  Select,
  StatCard,
  btnDark,
  card,
} from "../Shared/ui.jsx";

export default function Resources() {
  const { resources, appointments, saveResource, saveAppointment } =
    useScheduling();
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [modal, setModal] = useState(null); // { kind: "resource" | "appt", defaults? }
  const [toast, notify] = useToast();
  const today = todayIso();

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return resources.filter(
      (r) =>
        (type === "all" || r.type === type) &&
        (status === "all" || r.status === status) &&
        (!s || [r.name, r.role].some((v) => v.toLowerCase().includes(s))),
    );
  }, [resources, q, type, status]);

  const withStats = (r) => ({
    ...r,
    occ: occupancy(r, today, appointments),
    todayCount: appointments.filter(
      (a) => a.resourceId === r.id && a.date === today && isActive(a),
    ).length,
    next: freeSlots(r, today, appointments)[0],
  });
  const all = resources.map(withStats);
  const avgOcc = all.length
    ? Math.round(all.reduce((s, r) => s + r.occ, 0) / all.length)
    : 0;
  const todayTotal = appointments.filter(
    (a) => a.date === today && isActive(a),
  ).length;

  return (
    <div dir="rtl" className="max-w-full">
      <PageHeader
        title="الموارد"
        subtitle="كل ما يمكن حجزه: أشخاص وأماكن ومعدات، مع جدولها وإشغالها."
      >
        <button
          onClick={() => setModal({ kind: "resource" })}
          className={btnDark}
        >
          <Plus size={13} /> مورد جديد
        </button>
      </PageHeader>

      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Users}
          value={resources.length}
          label="إجمالي الموارد"
        />
        <StatCard
          icon={UserCheck}
          value={resources.filter((r) => r.status === "متاح").length}
          label="متاحة الآن"
        />
        <StatCard
          icon={Gauge}
          tag="اليوم"
          value={`${avgOcc}%`}
          label="متوسط نسبة الإشغال"
        />
        <StatCard
          icon={CalendarCheck}
          value={todayTotal}
          label="مواعيد اليوم"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          <Chip active={type === "all"} onClick={() => setType("all")}>
            الكل {resources.length}
          </Chip>
          {RES_TYPES.map((t) => (
            <Chip key={t} active={type === t} onClick={() => setType(t)}>
              {t} {resources.filter((r) => r.type === t).length}
            </Chip>
          ))}
        </div>
        <SearchBox
          value={q}
          onChange={setQ}
          placeholder="ابحث باسم المورد أو التخصص"
          className="min-w-[200px] flex-1"
        />
        <div className="w-[140px]">
          <Select value={status} onChange={setStatus}>
            <option value="all">كل الحالات</option>
            {RES_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {list.map((r) => {
          const s = withStats(r);
          return (
            <article key={r.id} className={`${card} p-4`}>
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-[13px] font-bold text-white">
                  {initialOf(r.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-[13px] font-bold text-ink">
                    {r.name}
                  </h3>
                  <p className="truncate text-[10.5px] text-neutral-500">
                    {r.role}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-1 flex items-center justify-between text-[10.5px]">
                  <span className="text-neutral-500">نسبة الإشغال اليوم</span>
                  <b className="text-ink">{s.occ}%</b>
                </div>
                <div className="h-1.5 rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-ink"
                    style={{ width: `${s.occ}%` }}
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {r.job?.map((item, index) => (
                  <span
                    key={index}
                    className="rounded-xl bg-[#F1F2F4] px-2 py-1 text-[10px] text-[#454545]"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex justify-between items-center gap-2 border-t border-line  ">
                <div className="mt-3 flex  items-center justify-between text-[10.5px] text-neutral-500 gap-2">
                  <span>{s.todayCount} مواعيد اليوم</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9.5px] font-semibold ${RES_STATUS_CLS[r.status]}`}
                  >
                    {r.status}
                  </span>
                </div>
                <Link
                  to={`/resources/${r.id}`}
                  className="mt-3 flex items-center justify-between text-[10.5px] text-ink"
                >
                  عرض الملف
                </Link>
              </div>
            </article>
          );
        })}
        {!list.length && (
          <div
            className={`${card} col-span-full p-8 text-center text-[11px] text-neutral-400`}
          >
            لا توجد موارد مطابقة
          </div>
        )}
      </div>

      {modal?.kind === "resource" && (
        <ResourceModal
          onSave={(r) => {
            saveResource(r);
            setModal(null);
            notify("تمت إضافة المورد");
          }}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.kind === "appt" && (
        <AppointmentModal
          defaults={modal.defaults}
          resources={resources}
          appointments={appointments}
          onSave={(a) => {
            saveAppointment(a);
            setModal(null);
            notify("تمت إضافة الموعد");
          }}
          onClose={() => setModal(null)}
        />
      )}
      <Toast message={toast} />
    </div>
  );
}
