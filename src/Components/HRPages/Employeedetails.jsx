import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { card, btnDark, btnLight } from "../Shared/ui.jsx"; // same shared path as the other modules
import {
  Badge,
  DataTable,
  Modal,
  Field,
  inputCls,
  useToast,
  num,
  Ltr,
} from "../AccountingPages/Accountingui.jsx";
import { useEmployees, employeesApi, STATUS } from "../../data/Employeesstore.js";
import { Avatar, EmployeeFormModal, dmy } from "./Hrshared.jsx";

const TABS = [
  ["general", "بيانات عامة"],
  ["job", "المعلومات الوظيفية"],
  ["att", "الحضور والانصراف"],
  ["salary", "الرواتب"],
  ["docs", "المستندات"],
  ["leaves", "الإجازات"],
];
const cur = (n) => `${num(n)} ج.م`;
const PERMS = {
  المبيعات: ["العملاء المحتملون", "الصفقات", "العقود وعروض الأسعار"],
  "خدمة العملاء": ["الدعم وخدمة العملاء", "العملاء"],
  المالية: ["الفواتير والتحصيل", "المشتريات والمصروفات", "القيود المحاسبية"],
  التسويق: ["التسويق", "العملاء المحتملون"],
  "الموارد البشرية": ["الموظفون", "الحضور والإجازات"],
};

const Info = ({ label, value, ltr }) => (
  <div>
    <div className="text-[10px] text-neutral-400">{label}</div>
    <div className="mt-1 text-[12px] font-semibold text-ink">
      {ltr ? <Ltr>{value}</Ltr> : value}
    </div>
  </div>
);
function Section({ title, sub, children, action }) {
  return (
    <section className={`${card} p-5`}>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-[13px] font-semibold text-ink">{title}</h2>
          {sub && <p className="mt-0.5 text-[10px] text-neutral-500">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
const Grid3 = ({ children }) => (
  <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
    {children}
  </div>
);
const Bar = ({ left, total }) => (
  <div className="h-1.5 rounded-full bg-neutral-100">
    <div
      className="h-1.5 rounded-full bg-ink"
      style={{ width: `${Math.min(100, (left / total) * 100)}%` }}
    />
  </div>
);

export default function EmployeeDetails() {
  const { id } = useParams();
  const emp = useEmployees().find((e) => e.id === id);
  const [tab, setTab] = useState("general");
  const [edit, setEdit] = useState(false);
  const [perm, setPerm] = useState(false);
  const [extraDocs, setExtraDocs] = useState([]);
  const [reqs, setReqs] = useState([]);
  const [leaveModal, setLeaveModal] = useState(false);
  const [lf, setLf] = useState({ type: "اعتيادية", from: "", to: "" });
  const [toast, showToast] = useToast();
  useEffect(() => {
    setTab("general");
    setExtraDocs([]);
    setReqs([]);
  }, [id]);

  if (!emp)
    return (
      <div
        dir="rtl"
        className={`${card} p-10 text-center text-[12px] text-neutral-500`}
      >
        لم يتم العثور على الموظف.{" "}
        <Link to="/employees" className="font-semibold text-ink underline">
          العودة إلى الموظفين
        </Link>
      </div>
    );

  const net = emp.baseSalary + emp.allowances - emp.deductions;
  const trans = Math.round(emp.allowances * 0.6),
    house = emp.allowances - trans;
  const ins = Math.round(emp.deductions * 0.6),
    tax = emp.deductions - ins;
  const docs = [
    { name: "عقد العمل.pdf", date: emp.hired },
    { name: "بطاقة الهوية.pdf", date: emp.hired },
    { name: "الشهادة الجامعية.pdf", date: emp.hired },
    ...extraDocs,
  ];
  const leaves = [
    ["اعتيادية", emp.leave.annual, 21],
    ["مرضية", emp.leave.sick, 10],
    ["عارضة", emp.leave.casual, 6],
  ];
  const history = [
    ...reqs,
    {
      type: "اعتيادية",
      from: "2026-08-10",
      to: "2026-08-14",
      days: 5,
      status: "موافق عليها",
    },
    {
      type: "مرضية",
      from: "2026-06-02",
      to: "2026-06-03",
      days: 2,
      status: "موافق عليها",
    },
  ];
  const download = (d) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([`مستند تجريبي: ${d.name}\nالموظف: ${emp.name}`], {
        type: "text/plain;charset=utf-8",
      }),
    );
    a.download = d.name.replace(/\.pdf$/, "") + ".txt";
    a.click();
    URL.revokeObjectURL(a.href);
    showToast("تم تنزيل نسخة نصية تجريبية");
  };
  const upload = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setExtraDocs([
        ...extraDocs,
        { name: f.name, date: new Date().toISOString().slice(0, 10) },
      ]);
      showToast("تمت إضافة المستند (محلياً)");
    }
    e.target.value = "";
  };
  const addLeave = () => {
    if (!lf.from || !lf.to || lf.to < lf.from)
      return showToast("تحقق من تاريخي البداية والنهاية");
    const days = Math.round((new Date(lf.to) - new Date(lf.from)) / 864e5) + 1;
    setReqs([{ ...lf, days, status: "قيد المراجعة" }, ...reqs]);
    setLeaveModal(false);
    showToast("تم إرسال طلب الإجازة");
  };
  const attRows = [29, 28, 27, 26, 25, 22, 21, 20].map((d, k) => {
    const s = (d + k + emp.att.late) % 7;
    return {
      date: `2026-10-${d}`,
      in: s === 3 ? "—" : s === 5 ? "09:25" : "08:58",
      out: s === 3 ? "—" : "17:05",
      st: s === 3 ? "غائب" : s === 5 ? "متأخر" : "حاضر",
    };
  });

  const personal = (
    <Section title="البيانات الشخصية" sub="المعلومات الأساسية للموظف">
      <Grid3>
        <Info label="الاسم الكامل" value={emp.name} />
        <Info label="الرقم القومي" value={emp.nationalId} ltr />
        <Info label="تاريخ الميلاد" value={dmy(emp.birth)} ltr />
        <Info label="الجنس" value={emp.gender} />
        <Info label="الحالة الاجتماعية" value={emp.marital} />
        <Info label="الجنسية" value={emp.nationality} />
        <Info label="البريد الإلكتروني" value={emp.email} ltr />
        <Info label="رقم الهاتف" value={emp.phone} ltr />
        <Info label="جهة اتصال الطوارئ" value={emp.emergency} />
      </Grid3>
    </Section>
  );
  const job = (
    <Section title="البيانات الوظيفية" sub="تفاصيل العمل والتقارير الوظيفي">
      <Grid3>
        <Info label="المسمى الوظيفي" value={emp.title} />
        <Info label="القسم" value={emp.dept} />
        <Info label="المدير المباشر" value={emp.manager} />
        <Info label="نوع التوظيف" value={emp.type} />
        <Info label="تاريخ التعيين" value={dmy(emp.hired)} ltr />
        <Info label="مكان العمل" value={emp.location} />
      </Grid3>
    </Section>
  );
  const attCards = [
    ["أيام الحضور", `${emp.att.present} يوم`],
    ["أيام الغياب", `${emp.att.absent} يوم`],
    ["مرات التأخر", emp.att.late],
    ["ساعات إضافية", `${emp.att.overtime} ساعات`],
  ];
  const attendance = (
    <Section title="الحضور - أكتوبر 2026" sub="ملخص الحضور للشهر الحالي">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {attCards.map(([l, v]) => (
          <div key={l} className="rounded-lg bg-neutral-50 p-3">
            <div className="text-[10px] text-neutral-500">{l}</div>
            <div className="mt-1.5 text-[16px] font-semibold text-ink">{v}</div>
          </div>
        ))}
      </div>
    </Section>
  );

  const main = {
    general: (
      <>
        {personal}
        {job}
        {attendance}
      </>
    ),
    job: (
      <>
        {job}
        <Section title="العقد والدوام" sub="شروط التعاقد وجدول العمل">
          <Grid3>
            <Info label="رقم الموظف" value={emp.id} ltr />
            <Info label="نوع العقد" value={emp.type} />
            <Info
              label="نهاية فترة التجربة"
              value={dmy(
                new Date(new Date(emp.hired).getTime() + 90 * 864e5)
                  .toISOString()
                  .slice(0, 10),
              )}
              ltr
            />
            <Info label="ساعات الدوام" value="9:00 ص - 5:00 م" />
            <Info label="أيام العمل" value="الأحد - الخميس" />
            <Info label="الساعات الأسبوعية" value="40 ساعة" />
          </Grid3>
        </Section>
      </>
    ),
    att: (
      <>
        {attendance}
        <div className={`${card} overflow-hidden`}>
          <DataTable
            minWidth={460}
            rows={attRows}
            rowKey={(r) => r.date}
            columns={[
              {
                key: "date",
                label: "التاريخ",
                render: (r) => <Ltr>{dmy(r.date)}</Ltr>,
              },
              { key: "in", label: "الحضور", render: (r) => <Ltr>{r.in}</Ltr> },
              {
                key: "out",
                label: "الانصراف",
                render: (r) => <Ltr>{r.out}</Ltr>,
              },
              {
                key: "st",
                label: "الحالة",
                render: (r) => (
                  <Badge
                    tone={
                      r.st === "حاضر"
                        ? "green"
                        : r.st === "متأخر"
                          ? "orange"
                          : "red"
                    }
                  >
                    {r.st}
                  </Badge>
                ),
              },
            ]}
          />
        </div>
      </>
    ),
    salary: (
      <Section title="تفاصيل الراتب" sub="شهر أكتوبر 2026">
        <div className="divide-y divide-line text-[11.5px]">
          {[
            ["الراتب الأساسي", emp.baseSalary],
            ["بدل مواصلات", trans],
            ["بدل سكن", house],
            ["التأمينات الاجتماعية", -ins],
            ["ضريبة الدخل", -tax],
          ].map(([l, v]) => (
            <div key={l} className="flex justify-between py-2.5">
              <span className="text-neutral-600">{l}</span>
              <span
                dir="ltr"
                className={`font-semibold ${v < 0 ? "text-red-600" : ""}`}
              >
                {v < 0 ? "−" : ""}
                {cur(Math.abs(v))}
              </span>
            </div>
          ))}
          <div className="flex justify-between py-3 font-semibold text-ink">
            <span>صافي الراتب</span>
            <span dir="ltr">{cur(net)}</span>
          </div>
        </div>
        <div className="mt-4 text-[11px] font-semibold text-ink">
          كشوف الرواتب السابقة
        </div>
        {["سبتمبر", "أغسطس", "يوليو"].map((m) => (
          <div
            key={m}
            className="flex items-center justify-between border-b border-line py-2.5 text-[11px] last:border-0"
          >
            <span>كشف راتب {m} 2026</span>
            <button
              className={`${btnLight} h-7`}
              onClick={() => download({ name: `كشف راتب ${m}.pdf` })}
            >
              تحميل
            </button>
          </div>
        ))}
      </Section>
    ),
    docs: (
      <Section
        title="المستندات"
        sub="ملفات الموظف"
        action={
          <label className={`${btnDark} cursor-pointer`}>
            رفع مستند
            <input type="file" className="hidden" onChange={upload} />
          </label>
        }
      >
        {docs.map((d) => (
          <div
            key={d.name + d.date}
            className="flex items-center justify-between border-b border-line py-3 text-[11.5px] last:border-0"
          >
            <div>
              <div className="font-semibold">{d.name}</div>
              <div className="text-[10px] text-neutral-500">
                <Ltr>{dmy(d.date)}</Ltr>
              </div>
            </div>
            <button className={`${btnLight} h-7`} onClick={() => download(d)}>
              تحميل
            </button>
          </div>
        ))}
      </Section>
    ),
    leaves: (
      <>
        <Section
          title="رصيد الإجازات"
          sub="السنة المالية 2026"
          action={
            <button className={btnDark} onClick={() => setLeaveModal(true)}>
              طلب إجازة
            </button>
          }
        >
          <div className="space-y-4">
            {leaves.map(([l, r, t]) => (
              <div key={l}>
                <div className="mb-1.5 flex justify-between text-[11px]">
                  <span>إجازة {l}</span>
                  <span dir="ltr">
                    {r} / {t} يوم
                  </span>
                </div>
                <Bar left={r} total={t} />
              </div>
            ))}
          </div>
        </Section>
        <div className={`${card} overflow-hidden`}>
          <DataTable
            minWidth={480}
            rows={history}
            rowKey={(r) => r.type + r.from + r.to}
            columns={[
              { key: "type", label: "النوع" },
              {
                key: "from",
                label: "من",
                render: (r) => <Ltr>{dmy(r.from)}</Ltr>,
              },
              {
                key: "to",
                label: "إلى",
                render: (r) => <Ltr>{dmy(r.to)}</Ltr>,
              },
              { key: "days", label: "الأيام" },
              {
                key: "status",
                label: "الحالة",
                render: (r) => (
                  <Badge tone={r.status === "موافق عليها" ? "green" : "orange"}>
                    {r.status}
                  </Badge>
                ),
              },
            ]}
          />
        </div>
      </>
    ),
  }[tab];

  return (
    <div dir="rtl" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <nav className="text-[10px] text-neutral-500">
            <Link to="/employees" className="hover:text-ink">
              الموظفون
            </Link>{" "}
            / {emp.name}
          </nav>
          <h1 className="mt-1 text-[24px] font-semibold leading-tight text-ink">
            ملف الموظف
          </h1>
        </div>
        <div className="flex gap-2">
          <button className={btnDark} onClick={() => setPerm(true)}>
            عرض الصلاحيات
          </button>
          <button className={btnLight} onClick={() => setEdit(true)}>
            تعديل الملف
          </button>
        </div>
      </div>

      <div
        className={`${card} flex flex-wrap items-center justify-between gap-4 p-5`}
      >
        <div className="flex items-center gap-4">
          <Avatar name={emp.name} size={56} dark />
          <div>
            <div className="text-[22px] font-semibold leading-tight text-ink">
              {emp.name}
            </div>
            <div className="mt-1 text-[11px] text-neutral-500">
              {emp.title} · قسم {emp.dept}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge
                tone={
                  emp.status === "ended"
                    ? "red"
                    : emp.status === "leave"
                      ? "orange"
                      : "green"
                }
              >
                {STATUS[emp.status]}
              </Badge>
              <Badge>{emp.id}</Badge>
              <Badge>{emp.type}</Badge>
            </div>
          </div>
        </div>
        <div
          dir="ltr"
          className="space-y-1 text-left text-[10.5px] text-neutral-500"
        >
          <div>{emp.email}</div>
          <div>{emp.phone}</div>
          <div dir="rtl" className="text-left">
            {emp.address}
          </div>
        </div>
      </div>

      <div className="flex justify-center overflow-x-auto">
        <div
          role="tablist"
          className="flex gap-1 rounded-full border border-line bg-white p-1"
        >
          {TABS.map(([k, l]) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={`h-7 whitespace-nowrap rounded-full px-3 text-[10.5px] font-semibold transition-colors ${tab === k ? "bg-ink text-white" : "text-neutral-500 hover:text-ink"}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-3">{main}</div>
        <aside className="space-y-3">
          <Section title="ملخص الراتب" sub="شهر أكتوبر 2026">
            <div className="text-[10px] text-neutral-500">صافي الراتب</div>
            <div
              dir="ltr"
              className="mb-3 text-right text-[24px] font-semibold text-ink"
            >
              {cur(net)}
            </div>
            {[
              ["الراتب الأساسي", cur(emp.baseSalary), ""],
              ["البدلات", cur(emp.allowances), ""],
              ["الخصومات", `−${cur(emp.deductions)}`, "text-red-600"],
            ].map(([l, v, c]) => (
              <div key={l} className="flex justify-between py-1 text-[11px]">
                <span className="text-neutral-500">{l}</span>
                <span dir="ltr" className={`font-semibold ${c}`}>
                  {v}
                </span>
              </div>
            ))}
            <button
              className={`${btnDark} mt-3 w-full justify-center`}
              onClick={() => setTab("salary")}
            >
              عرض تفاصيل الراتب
            </button>
          </Section>
          <Section title="رصيد الإجازات" sub="السنة المالية 2026">
            <div className="space-y-3.5">
              {leaves.map(([l, r, t]) => (
                <div key={l}>
                  <div className="mb-1.5 flex justify-between text-[10.5px]">
                    <span>إجازة {l}</span>
                    <span dir="ltr" className="text-neutral-500">
                      {r} / {t} يوم
                    </span>
                  </div>
                  <Bar left={r} total={t} />
                </div>
              ))}
            </div>
          </Section>
          <Section title="المستندات" sub="آخر المستندات المرفوعة">
            {docs.slice(0, 3).map((d) => (
              <div
                key={d.name + d.date}
                className="flex items-center justify-between gap-2 py-2"
              >
                <div className="min-w-0">
                  <div className="truncate text-[11px] font-semibold">
                    {d.name}
                  </div>
                  <div className="text-[9.5px] text-neutral-400">
                    <Ltr>{dmy(d.date)}</Ltr>
                  </div>
                </div>
                <button
                  className={`${btnLight} h-7 shrink-0`}
                  onClick={() => download(d)}
                >
                  تحميل
                </button>
              </div>
            ))}
          </Section>
        </aside>
      </div>

      {edit && (
        <EmployeeFormModal
          employee={emp}
          onClose={() => setEdit(false)}
          onSave={(v) => {
            employeesApi.update(emp.id, v);
            setEdit(false);
            showToast("تم حفظ التعديلات");
          }}
        />
      )}
      {perm && (
        <Modal
          title={`صلاحيات ${emp.name}`}
          onClose={() => setPerm(false)}
          onSubmit={() => setPerm(false)}
          submitLabel="إغلاق"
        >
          <div className="col-span-2 space-y-2 text-[11.5px]">
            {(PERMS[emp.dept] || []).map((p) => (
              <div
                key={p}
                className="flex items-center justify-between rounded-lg border border-line px-3 py-2"
              >
                <span>{p}</span>
                <Badge tone="green">عرض وتعديل</Badge>
              </div>
            ))}
            <p className="pt-1 text-[10px] text-neutral-400">
              عرض تجريبي — لا يرتبط بنظام الصلاحيات الفعلي.
            </p>
          </div>
        </Modal>
      )}
      {leaveModal && (
        <Modal
          title="طلب إجازة"
          onClose={() => setLeaveModal(false)}
          onSubmit={addLeave}
          submitLabel="إرسال الطلب"
        >
          <Field label="نوع الإجازة" full>
            <select
              className={inputCls}
              value={lf.type}
              onChange={(e) => setLf({ ...lf, type: e.target.value })}
            >
              <option>اعتيادية</option>
              <option>مرضية</option>
              <option>عارضة</option>
            </select>
          </Field>
          <Field label="من">
            <input
              type="date"
              className={inputCls}
              value={lf.from}
              onChange={(e) => setLf({ ...lf, from: e.target.value })}
            />
          </Field>
          <Field label="إلى">
            <input
              type="date"
              className={inputCls}
              value={lf.to}
              onChange={(e) => setLf({ ...lf, to: e.target.value })}
            />
          </Field>
        </Modal>
      )}
      {toast}
    </div>
  );
}
