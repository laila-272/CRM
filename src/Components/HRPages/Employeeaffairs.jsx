import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  PageHeader,
  SearchBox,
  Select,
  Chip,
  PagerBar,
  btnDark,
  btnLight,
  card,
} from "../Shared/ui.jsx";
import {
  Badge,
  DataTable,
  RowMenu,
  Modal,
  Field,
  inputCls,
  usePaged,
  useToast,
  today,
} from "../AccountingPages/Accountingui.jsx";
import { useEmployees } from "../../data/Employeesstore.js";
import { Avatar, dmy } from "./Hrshared.jsx";
import { Stat, SectionTitle } from "./HRKit.jsx";
import { createStore, uid } from "../../data/Hrstores.js";

const TYPES = [
  "ترقية",
  "نقل",
  "استقالة",
  "شكوى",
  "إنذار",
  "مكافأة",
  "إنهاء خدمة",
];
const CHIP_LABEL = {
  ترقية: "الترقيات",
  نقل: "النقل",
  استقالة: "الاستقالات",
  شكوى: "الشكاوى",
  إنذار: "الإنذارات",
  مكافأة: "المكافآت",
  "إنهاء خدمة": "إنهاء الخدمة",
};
const OPTIONS = { إنذار: ["فعّال", "ملغى"], شكوى: ["قيد المراجعة", "تم الحل"] };
const GENERIC = ["معلق", "تمت الموافقة", "مرفوض", "مكتمل"];
const DEFAULT_STATUS = { إنذار: "فعّال", شكوى: "قيد المراجعة" };
const ALL_STATUS = [...GENERIC, "فعّال", "قيد المراجعة", "تم الحل", "ملغى"];
const TONE = {
  فعّال: "red",
  مرفوض: "red",
  "قيد المراجعة": "orange",
  "تم الحل": "green",
};

const SEED = [
  {
    id: "AF-013",
    emp: "سارة محمود",
    dept: "المبيعات",
    type: "ترقية",
    details: "من مسؤول مبيعات إلى مدير مبيعات",
    date: "2026-10-19",
    status: "معلق",
  },
  {
    id: "AF-012",
    emp: "أحمد علي",
    dept: "المبيعات",
    type: "نقل",
    details: "من المبيعات إلى خدمة العملاء",
    date: "2026-10-17",
    status: "معلق",
  },
  {
    id: "AF-011",
    emp: "نور الدين",
    dept: "المالية",
    type: "استقالة",
    details: "إشعار 30 يوماً - آخر يوم عمل 20/11/2026",
    date: "2026-10-15",
    status: "معلق",
  },
  {
    id: "AF-010",
    emp: "هبة إبراهيم",
    dept: "التسويق",
    type: "مكافأة",
    details: "مكافأة أداء الربع الثالث - 1,500 ج.م",
    date: "2026-10-12",
    status: "تمت الموافقة",
  },
  {
    id: "AF-009",
    emp: "محمد حسين",
    dept: "خدمة العملاء",
    type: "إنذار",
    details: "إنذار أول - تأخر متكرر عن الدوام",
    date: "2026-10-10",
    status: "فعّال",
  },
  {
    id: "AF-008",
    emp: "محمد حسين",
    dept: "خدمة العملاء",
    type: "شكوى",
    details: "شكوى عميل بخصوص التأخر في الرد",
    date: "2026-10-02",
    status: "قيد المراجعة",
  },
  {
    id: "AF-007",
    emp: "خالد منصور",
    dept: "الموارد البشرية",
    type: "إنهاء خدمة",
    details: "انتهاء مدة العقد",
    date: "2026-10-05",
    status: "مكتمل",
  },
  {
    id: "AF-006",
    emp: "سارة محمود",
    dept: "المبيعات",
    type: "شكوى",
    details: "شكوى من عميل بخصوص توزيع الدوام",
    date: "2026-10-08",
    status: "قيد المراجعة",
  },
  {
    id: "AF-005",
    emp: "أحمد علي",
    dept: "المبيعات",
    type: "إنذار",
    details: "إنذار كتابي - مخالفة سياسة الاستخدام",
    date: "2026-09-29",
    status: "فعّال",
  },
  {
    id: "AF-004",
    emp: "نور الدين",
    dept: "المالية",
    type: "شكوى",
    details: "شكوى بخصوص بيئة العمل",
    date: "2026-09-21",
    status: "تم الحل",
  },
];
const useAffairs = createStore("hr-affairs-v1", SEED);
const EMPTY = { empId: "", type: "ترقية", details: "", date: today() };

export default function EmployeeAffairs() {
  const [rows, setRows] = useAffairs();
  const employees = useEmployees();
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [toast, showToast] = useToast();

  const setStatusOf = (id, s) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status: s } : x)));
  const matches = (r) =>
    !q || `${r.emp} ${r.details} ${r.type}`.includes(q.trim());
  const main = useMemo(
    () =>
      rows
        .filter(
          (r) =>
            matches(r) &&
            (type === "all" || r.type === type) &&
            (status === "all" || r.status === status),
        )
        .sort((a, b) => b.date.localeCompare(a.date)),
    [rows, q, type, status],
  );
  const issues = useMemo(
    () =>
      rows
        .filter((r) => matches(r) && (r.type === "شكوى" || r.type === "إنذار"))
        .sort((a, b) => b.date.localeCompare(a.date)),
    [rows, q],
  );
  const pg1 = usePaged(main, 7),
    pg2 = usePaged(issues, 4);

  const n = (f) => rows.filter(f).length;
  const add = () => {
    const e = employees.find((x) => x.id === form.empId);
    if (!e || !form.details.trim())
      return showToast("اختر الموظف وأدخل التفاصيل");
    setRows((r) => [
      {
        id: uid("AF-"),
        emp: e.name,
        dept: e.dept,
        type: form.type,
        details: form.details.trim(),
        date: form.date,
        status: DEFAULT_STATUS[form.type] || "معلق",
      },
      ...r,
    ]);
    setModal(false);
    setForm(EMPTY);
    showToast("تمت إضافة الطلب");
  };

  const empCell = (r) => (
    <div className="flex items-center gap-3">
      <Avatar name={r.emp} size={26} />
      <div>
        <div className="font-semibold">{r.emp}</div>
        <div className="text-[10px] text-neutral-400">{r.dept}</div>
      </div>
    </div>
  );
  const menu = (r) => (
    <div onClick={(e) => e.stopPropagation()}>
      <RowMenu
        items={[
          ...(OPTIONS[r.type] || GENERIC)
            .filter((s) => s !== r.status)
            .map((s) => ({
              label: `تغيير الحالة إلى: ${s}`,
              onClick: () => {
                setStatusOf(r.id, s);
                showToast("تم تحديث الحالة");
              },
            })),
          {
            label: "حذف",
            danger: true,
            onClick: () => {
              setRows((x) => x.filter((y) => y.id !== r.id));
              showToast("تم الحذف");
            },
          },
        ]}
      />
    </div>
  );
  const statusBadge = (r) => (
    <Badge tone={TONE[r.status] || "gray"}>{r.status}</Badge>
  );
  const actions = (r) =>
    r.status === "معلق" ? (
      <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
        <button
          className={`${btnDark} h-6 !px-2.5 !text-[10px]`}
          onClick={() => {
            setStatusOf(r.id, "تمت الموافقة");
            showToast("تمت الموافقة على الطلب");
          }}
        >
          موافقة
        </button>
        <button
          className={`${btnLight} h-6 !px-2.5 !text-[10px]`}
          onClick={() => {
            setStatusOf(r.id, "مرفوض");
            showToast("تم رفض الطلب");
          }}
        >
          رفض
        </button>
      </div>
    ) : (
      menu(r)
    );

  const cols1 = [
    { key: "emp", label: "الموظف", render: empCell },
    { key: "type", label: "نوع الإجراء" },
    {
      key: "details",
      label: "التفاصيل",
      render: (r) => <span className="text-neutral-600">{r.details}</span>,
    },
    {
      key: "date",
      label: "التاريخ",
      render: (r) => (
        <span dir="ltr" className="inline-block text-neutral-500">
          {dmy(r.date)}
        </span>
      ),
    },
    { key: "status", label: "الحالة", render: statusBadge },
    { key: "act", label: "", render: actions },
  ];
  const cols2 = [
    { key: "emp", label: "الموظف", render: empCell },
    { key: "type", label: "النوع" },
    {
      key: "details",
      label: "الوصف",
      render: (r) => <span className="text-neutral-600">{r.details}</span>,
    },
    {
      key: "date",
      label: "التاريخ",
      render: (r) => (
        <span dir="ltr" className="inline-block text-neutral-500">
          {dmy(r.date)}
        </span>
      ),
    },
    { key: "status", label: "الحالة", render: statusBadge },
    { key: "act", label: "", render: menu },
  ];

  return (
    <div dir="rtl" className="space-y-4">
      <PageHeader
        title="شؤون الموظفين"
        subtitle="الترقيات والنقل والاستقالات والشكاوى والإنذارات والمكافآت وإنهاء الخدمة"
      >
        <button className={btnDark} onClick={() => setModal(true)}>
          <Plus size={13} /> طلب جديد
        </button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBox
          className="min-w-[220px] flex-1"
          value={q}
          onChange={setQ}
          placeholder="ابحث عن موظف أو إجراء..."
        />
        <div className="w-[130px]">
          <Select value={status} onChange={setStatus}>
            <option value="all">كل الحالات</option>
            {ALL_STATUS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip active={type === "all"} onClick={() => setType("all")}>
          الكل
        </Chip>
        {TYPES.map((t) => (
          <Chip key={t} active={type === t} onClick={() => setType(t)}>
            {CHIP_LABEL[t]}
          </Chip>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          title="طلبات معلقة"
          value={n((r) => r.status === "معلق")}
          sub="بانتظار الاعتماد"
          tone="orange"
        />
        <Stat
          title="تمت الموافقة"
          value={n((r) => r.status === "تمت الموافقة" || r.status === "مكتمل")}
          sub="هذا الشهر"
        />
        <Stat
          title="مرفوضة"
          value={n((r) => r.status === "مرفوض")}
          sub="هذا الشهر"
          tone="red"
        />
        <Stat
          title="إنذارات سارية"
          value={n((r) => r.type === "إنذار" && r.status === "فعّال")}
          sub="تحتاج متابعة"
        />
      </div>

      <SectionTitle
        title="سجل إجراءات شؤون الموظفين"
        sub="آخر الطلبات والإجراءات الجارية على الموظفين"
      />
      <div className={`${card} overflow-hidden`}>
        <DataTable
          columns={cols1}
          rows={pg1.slice}
          rowKey={(r) => r.id}
          minWidth={820}
        />
        <PagerBar
          page={pg1.page}
          pages={pg1.pages}
          onPage={pg1.setPage}
          info={pg1.info + (main.length ? " إجراء" : "")}
        />
      </div>

      <SectionTitle
        title="الشكاوى والإنذارات"
        sub="المخالفات والإنذارات المسجلة وحالة المعالجة"
      />
      <div className={`${card} overflow-hidden`}>
        <DataTable
          columns={cols2}
          rows={pg2.slice}
          rowKey={(r) => r.id}
          minWidth={820}
        />
        <PagerBar
          page={pg2.page}
          pages={pg2.pages}
          onPage={pg2.setPage}
          info={pg2.info + (issues.length ? " سجلات" : "")}
        />
      </div>

      {modal && (
        <Modal
          title="طلب جديد"
          onClose={() => setModal(false)}
          onSubmit={add}
          submitLabel="إضافة الطلب"
        >
          <Field label="الموظف" full>
            <select
              className={inputCls}
              value={form.empId}
              onChange={(e) => setForm({ ...form, empId: e.target.value })}
            >
              <option value="">اختر الموظف</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} · {e.dept}
                </option>
              ))}
            </select>
          </Field>
          <Field label="نوع الإجراء">
            <select
              className={inputCls}
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="التاريخ">
            <input
              type="date"
              className={inputCls}
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </Field>
          <Field label="التفاصيل" full>
            <input
              className={inputCls}
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
            />
          </Field>
        </Modal>
      )}
      {toast}
    </div>
  );
}
