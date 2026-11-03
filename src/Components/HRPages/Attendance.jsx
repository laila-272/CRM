// src/Components/HRPages/Attendance.jsx
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Modal, Field, inputCls } from "../AccountingPages/Accountingui.jsx";
import { useEmployees } from "../../data/Employeesstore.js";
import { PageHeader, PagerBar, btnDark, card, th, td } from "../Shared/ui.jsx";
import { Avatar } from "./Hrshared.jsx";
import { KpiCard } from "./Hrwidgets.jsx";
import { Badge, ActionMenu, useToast } from "./Hrextras.jsx";

/* ───────── attendance ───────── */
const A_STATUS = {
  present: { label: "حاضر", cls: "bg-neutral-100 text-neutral-600" },
  late: { label: "متأخر", cls: "bg-red-50 text-red-500" },
  absent: { label: "غائب", cls: "bg-red-50 text-red-500" },
  leave: { label: "في إجازة", cls: "bg-neutral-100 text-neutral-600" },
};
const PRIORITY = ["EMP-0142", "EMP-0141", "EMP-0140", "EMP-0138", "EMP-0137"];
const FIXED = {
  "EMP-0142": "present",
  "EMP-0141": "late",
  "EMP-0140": "leave",
  "EMP-0138": "absent",
  "EMP-0137": "present",
};

const baseStatus = (id) => {
  if (FIXED[id]) return FIXED[id];
  const n = parseInt(id.slice(4), 10);
  if (n % 9 === 3) return "absent";
  if (n % 11 === 4) return "leave";
  if (n % 7 === 1) return "late";
  return "present";
};
const hm = (m) => {
  const h = Math.floor(m / 60);
  return `${String(h % 12 || 12).padStart(2, "0")}:${String(m % 60).padStart(2, "0")} ${h >= 12 ? "م" : "ص"}`;
};
const timesOf = (id, status) => {
  if (status === "absent" || status === "leave") return null;
  const n = parseInt(id.slice(4), 10);
  const inM =
    status === "late" ? 9 * 60 + 15 + (n % 20) : 8 * 60 + 40 + (n % 18);
  const outM = 17 * 60 + ((n * 7) % 35);
  const w = outM - inM;
  return {
    inT: hm(inM),
    outT: hm(outM),
    hours: `${Math.floor(w / 60)}س ${w % 60}د`,
  };
};

/* ───────── leaves ───────── */
const L_STATUS = {
  pending: { label: "معلقة", cls: "bg-neutral-100 text-neutral-600" },
  approved: { label: "موافق عليها", cls: "bg-sky-50 text-sky-600" },
  rejected: { label: "مرفوضة", cls: "bg-red-50 text-red-500" },
};
const L_TYPES = ["سنوية", "مرضية", "طارئة", "بدون راتب"];
const SEED_LEAVES = [
  ["EMP-0141", "سنوية", "2026-10-20", "2026-10-24", "pending"],
  ["EMP-0142", "مرضية", "2026-10-08", "2026-10-09", "approved"],
  ["EMP-0140", "سنوية", "2026-10-13", "2026-10-19", "approved"],
  ["EMP-0139", "طارئة", "2026-10-19", "2026-10-19", "pending"],
  ["EMP-0138", "بدون راتب", "2026-11-10", "2026-11-19", "rejected"],
];
const days = (a, b) => Math.round((new Date(b) - new Date(a)) / 864e5) + 1;
const dur = (n) =>
  n === 1 ? "يوم" : n === 2 ? "يومين" : n <= 10 ? `${n} أيام` : `${n} يوم`;
const dmy = (iso) => iso.split("-").reverse().join("/");
const PAGE = 5;

export default function Attendance() {
  const employees = useEmployees();
  const [toast, show] = useToast();

  /* attendance */
  const attBase = useMemo(() => {
    const rank = (id) => (PRIORITY.includes(id) ? PRIORITY.indexOf(id) : 99);
    return [...employees]
      .sort((a, b) => rank(a.id) - rank(b.id))
      .map((e) => ({
        id: e.id,
        name: e.name,
        dept: e.dept,
        status: baseStatus(e.id),
      }));
  }, [employees]);
  const [override, setOverride] = useState({});
  const [aFilter, setAFilter] = useState("all");
  const [aPage, setAPage] = useState(1);

  const att = attBase.map((r) => ({
    ...r,
    status: override[r.id] || r.status,
  }));
  const count = (s) => att.filter((r) => r.status === s).length;
  const aRows = att.filter((r) => aFilter === "all" || r.status === aFilter);
  const aPages = Math.max(1, Math.ceil(aRows.length / PAGE));
  const aCur = Math.min(aPage, aPages);
  const aShown = aRows.slice((aCur - 1) * PAGE, aCur * PAGE);
  const pickA = (s) => {
    setAFilter((f) => (f === s ? "all" : s));
    setAPage(1);
  };

  /* leaves */
  const byId = useMemo(
    () => Object.fromEntries(employees.map((e) => [e.id, e])),
    [employees],
  );
  const [leaves, setLeaves] = useState(() => {
    const seeded = SEED_LEAVES.map(([emp, type, from, to, status], i) => ({
      id: i + 1,
      emp,
      type,
      from,
      to,
      status,
    }));
    const extra = Array.from({ length: 9 }, (_, i) => {
      const day = 1 + ((i * 3) % 24);
      const from = `2026-09-${String(day).padStart(2, "0")}`;
      const to = `2026-09-${String(day + (i % 4)).padStart(2, "0")}`;
      return {
        id: 6 + i,
        emp: ["EMP-0141", "EMP-0142", "EMP-0140", "EMP-0139", "EMP-0138"][
          i % 5
        ],
        type: L_TYPES[i % 4],
        from,
        to,
        status: i % 5 === 4 ? "rejected" : "approved",
      };
    });
    return [...seeded, ...extra];
  });
  const [lFilter, setLFilter] = useState("all");
  const [lPage, setLPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    emp: "",
    type: L_TYPES[0],
    from: "",
    to: "",
  });
  const [err, setErr] = useState("");

  const lCount = (s) => leaves.filter((l) => l.status === s).length;
  const lRows = leaves.filter((l) => lFilter === "all" || l.status === lFilter);
  const lPages = Math.max(1, Math.ceil(lRows.length / PAGE));
  const lCur = Math.min(lPage, lPages);
  const lShown = lRows.slice((lCur - 1) * PAGE, lCur * PAGE);
  const avgBalance = employees.length
    ? Math.round(
        employees.reduce((s, e) => s + (e.leave?.annual || 0), 0) /
          employees.length,
      )
    : 0;
  const pickL = (s) => {
    setLFilter((f) => (f === s ? "all" : s));
    setLPage(1);
  };
  const setLeave = (id, patch) =>
    setLeaves((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const openAdd = () => {
    setForm({
      emp: employees[0]?.id || "",
      type: L_TYPES[0],
      from: "",
      to: "",
    });
    setErr("");
    setAdding(true);
  };
  const submitLeave = () => {
    if (!form.emp) return setErr("اختر الموظف");
    if (!form.from || !form.to) return setErr("حدد تاريخ البداية والنهاية");
    if (form.to < form.from) return setErr("تاريخ النهاية قبل تاريخ البداية");
    setLeaves((l) => [{ id: Date.now(), ...form, status: "pending" }, ...l]);
    setLFilter("all");
    setLPage(1);
    setAdding(false);
    show("تم إرسال طلب الإجازة");
  };

  const ring = (on) =>
    `rounded-xl transition-shadow ${on ? "ring-1 ring-ink" : ""}`;
  const clickable = "block w-full cursor-pointer text-right";

  return (
    <div className="space-y-6" dir="rtl">
      <PageHeader
        title="الحضور والإجازات"
        subtitle="متابعة حضور الفريق وطلبات الإجازات في مكان واحد"
      >
        <button
          onClick={openAdd}
          className={`${btnDark} transition-opacity hover:opacity-90`}
        >
          <Plus size={12} /> طلب إجازة
        </button>
      </PageHeader>

      {/* ───── attendance ───── */}
      <section className="space-y-3">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">
            الحضور والانصراف
          </h2>
          <p className="mt-0.5 text-[10.5px] text-neutral-500">
            حضور اليوم وأوقات الدخول والخروج
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            [
              "present",
              "حاضر اليوم",
              count("present"),
              "up",
              `${Math.round((count("present") / (att.length || 1)) * 100)}% من الفريق`,
            ],
            ["late", "متأخر", count("late"), "up", "أكثر من 15 دقيقة"],
            ["absent", "غائب", count("absent"), "down", "بدون إذن"],
            ["leave", "في إجازة", count("leave"), "muted", "إجازات معتمدة"],
          ].map(([k, t, v, tone, note]) => (
            <div
              key={k}
              role="button"
              tabIndex={0}
              aria-pressed={aFilter === k}
              onClick={() => pickA(k)}
              onKeyDown={(e) => e.key === "Enter" && pickA(k)}
              className={`${clickable} ${ring(aFilter === k)}`}
            >
              <KpiCard title={t} value={v} tone={tone} note={note} />
            </div>
          ))}
        </div>

        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line">
                  <th className={th}>الموظف</th>
                  <th className={th}>القسم</th>
                  <th className={th}>وقت الحضور</th>
                  <th className={th}>وقت الانصراف</th>
                  <th className={th}>ساعات العمل</th>
                  <th className={th}>الحالة</th>
                  <th className={th} />
                </tr>
              </thead>
              <tbody>
                {aShown.map((r) => {
                  const t = timesOf(r.id, r.status);
                  return (
                    <tr
                      key={r.id}
                      className="border-b border-line transition-colors last:border-0 hover:bg-neutral-50"
                    >
                      <td className={td}>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={r.name} size={26} />
                          <span className="font-semibold">{r.name}</span>
                        </div>
                      </td>
                      <td className={td}>{r.dept}</td>
                      <td className={td}>{t?.inT || "—"}</td>
                      <td className={td}>{t?.outT || "—"}</td>
                      <td className={td}>{t?.hours || "—"}</td>
                      <td className={td}>
                        <Badge cls={A_STATUS[r.status].cls}>
                          {A_STATUS[r.status].label}
                        </Badge>
                      </td>
                      <td className={td}>
                        <ActionMenu
                          items={Object.entries(A_STATUS)
                            .filter(([k]) => k !== r.status)
                            .map(([k, v]) => ({
                              label: `تسجيل كـ ${v.label}`,
                              onClick: () => {
                                setOverride((o) => ({ ...o, [r.id]: k }));
                                show(`تم تحديث حالة ${r.name}`);
                              },
                            }))}
                        />
                      </td>
                    </tr>
                  );
                })}
                {!aShown.length && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-[11px] text-neutral-400"
                    >
                      لا توجد سجلات
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <PagerBar
            page={aCur}
            pages={aPages}
            onPage={setAPage}
            info={`عرض ${aRows.length ? (aCur - 1) * PAGE + 1 : 0}–${Math.min(aCur * PAGE, aRows.length)} من ${aRows.length} موظف`}
          />
        </div>
      </section>

      {/* ───── leaves ───── */}
      <section className="space-y-3">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">الإجازات</h2>
          <p className="mt-0.5 text-[10.5px] text-neutral-500">
            طلبات الإجازة والموافقات وأرصدة الموظفين
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            [
              "pending",
              "طلبات معلقة",
              lCount("pending"),
              "warn",
              `${lCount("pending")} تحتاج موافقة`,
            ],
            ["approved", "موافق عليها", lCount("approved"), "up", "هذا الشهر"],
            ["rejected", "مرفوضة", lCount("rejected"), "down", "هذا الشهر"],
          ].map(([k, t, v, tone, note]) => (
            <div
              key={k}
              role="button"
              tabIndex={0}
              aria-pressed={lFilter === k}
              onClick={() => pickL(k)}
              onKeyDown={(e) => e.key === "Enter" && pickL(k)}
              className={`${clickable} ${ring(lFilter === k)}`}
            >
              <KpiCard title={t} value={v} tone={tone} note={note} />
            </div>
          ))}
          <KpiCard
            title="متوسط الرصيد"
            value={avgBalance}
            unit="يوم"
            note="لكل موظف"
          />
        </div>

        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-line">
                  <th className={th}>الموظف</th>
                  <th className={th}>نوع الإجازة</th>
                  <th className={th}>من</th>
                  <th className={th}>إلى</th>
                  <th className={th}>المدة</th>
                  <th className={th}>الحالة</th>
                  <th className={th}>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {lShown.map((l) => {
                  const e = byId[l.emp];
                  return (
                    <tr
                      key={l.id}
                      className="border-b border-line transition-colors last:border-0 hover:bg-neutral-50"
                    >
                      <td className={td}>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={e?.name} size={26} />
                          <span className="font-semibold">
                            {e?.name || l.emp}
                          </span>
                        </div>
                      </td>
                      <td className={td}>{l.type}</td>
                      <td className={td}>{dmy(l.from)}</td>
                      <td className={td}>{dmy(l.to)}</td>
                      <td className={td}>{dur(days(l.from, l.to))}</td>
                      <td className={td}>
                        <Badge cls={L_STATUS[l.status].cls}>
                          {L_STATUS[l.status].label}
                        </Badge>
                      </td>
                      <td className={td}>
                        {l.status === "pending" ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                setLeave(l.id, { status: "approved" });
                                show("تمت الموافقة على الطلب");
                              }}
                              className="h-6 rounded-full bg-ink px-3 text-[10px] font-semibold text-white transition-opacity hover:opacity-90"
                            >
                              موافقة
                            </button>
                            <button
                              onClick={() => {
                                setLeave(l.id, { status: "rejected" });
                                show("تم رفض الطلب");
                              }}
                              className="h-6 rounded-full border border-line bg-white px-3 text-[10px] font-semibold text-ink transition-colors hover:bg-neutral-100"
                            >
                              رفض
                            </button>
                          </div>
                        ) : (
                          <ActionMenu
                            items={[
                              {
                                label: "إعادة إلى معلقة",
                                onClick: () =>
                                  setLeave(l.id, { status: "pending" }),
                              },
                              {
                                label: "حذف الطلب",
                                danger: true,
                                onClick: () => {
                                  setLeaves((x) =>
                                    x.filter((r) => r.id !== l.id),
                                  );
                                  show("تم حذف الطلب");
                                },
                              },
                            ]}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!lShown.length && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-[11px] text-neutral-400"
                    >
                      لا توجد طلبات
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <PagerBar
            page={lCur}
            pages={lPages}
            onPage={setLPage}
            info={`عرض ${lRows.length ? (lCur - 1) * PAGE + 1 : 0}–${Math.min(lCur * PAGE, lRows.length)} من ${lRows.length} طلب`}
          />
        </div>
      </section>

      {adding && (
        <Modal
          title="طلب إجازة"
          onClose={() => setAdding(false)}
          onSubmit={submitLeave}
          submitLabel="إرسال الطلب"
        >
          <Field label="الموظف" full>
            <select
              className={inputCls}
              value={form.emp}
              onChange={(e) => setForm({ ...form, emp: e.target.value })}
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="نوع الإجازة">
            <select
              className={inputCls}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {L_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="من">
            <input
              type="date"
              className={inputCls}
              value={form.from}
              onChange={(e) => setForm({ ...form, from: e.target.value })}
            />
          </Field>
          <Field label="إلى">
            <input
              type="date"
              className={inputCls}
              value={form.to}
              min={form.from || undefined}
              onChange={(e) => setForm({ ...form, to: e.target.value })}
            />
          </Field>
          {err && (
            <p role="alert" className="col-span-2 text-[11px] text-red-600">
              {err}
            </p>
          )}
        </Modal>
      )}
      {toast}
    </div>
  );
}
