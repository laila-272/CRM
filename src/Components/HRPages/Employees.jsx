import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import {
  PageHeader,
  SearchBox,
  Chip,
  PagerBar,
  btnDark,
  card,
} from "../Shared/ui.jsx"; // same shared path as the other modules
import {
  Badge,
  DataTable,
  RowMenu,
  useToast,
  Ltr,
} from "../AccountingPages/Accountingui.jsx";
import { useEmployees, employeesApi, STATUS } from "../../data/Employeesstore.js";
import { Avatar, EmployeeFormModal, dmy } from "./Hrshared.jsx";

const FILTERS = [
  ["all", "الكل"],
  ["active", "نشط"],
  ["leave", "في إجازة"],
  ["ended", "منتهي الخدمة"],
];
const PAGE = 6;

const Stat = ({ title, value, sub, green }) => (
  <div className={`${card} p-4`}>
    <div className="text-[11px] text-neutral-500">{title}</div>
    <div className="mt-3 text-[28px] font-semibold leading-none text-ink">
      {value}
    </div>
    <div
      className={`mt-3 text-[10px] ${green ? "text-green-600" : "text-neutral-500"}`}
    >
      {sub}
    </div>
  </div>
);

export default function Employees() {
  const nav = useNavigate();
  const all = useEmployees();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | "add" | employee
  const [toast, showToast] = useToast();

  const count = (f) =>
    all.filter((e) =>
      f === "active"
        ? e.status === "active" || e.status === "new"
        : e.status === f,
    ).length;
  const month = all.filter((e) => e.hired.startsWith("2026-10")).length;
  const depts = [...new Set(all.map((e) => e.dept))];
  const rows = useMemo(
    () =>
      all.filter(
        (e) =>
          (filter === "all" ||
            (filter === "active"
              ? e.status === "active" || e.status === "new"
              : e.status === filter)) &&
          (!q ||
            `${e.name} ${e.email}`
              .toLowerCase()
              .includes(q.trim().toLowerCase())),
      ),
    [all, filter, q],
  );
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const p = Math.min(page, pages);
  const slice = rows.slice((p - 1) * PAGE, p * PAGE);
  const info = rows.length
    ? `عرض ${(p - 1) * PAGE + 1} - ${Math.min(p * PAGE, rows.length)} من ${rows.length} موظف`
    : "لا توجد نتائج";

  const columns = [
    {
      key: "emp",
      label: "الموظف",
      render: (e) => (
        <div className="flex items-center gap-3">
          <Avatar name={e.name} size={26} />
          <div>
            <div className="font-semibold">{e.name}</div>
            <div dir="ltr" className="text-right text-[10px] text-neutral-400">
              {e.email}
            </div>
          </div>
        </div>
      ),
    },
    { key: "dept", label: "القسم" },
    { key: "title", label: "المسمى الوظيفي" },
    {
      key: "hired",
      label: "تاريخ التعيين",
      render: (e) => (
        <span className="text-neutral-500">
          <Ltr>{dmy(e.hired)}</Ltr>
        </span>
      ),
    },
    {
      key: "status",
      label: "الحالة",
      render: (e) => <Badge tone="gray">{STATUS[e.status]}</Badge>,
    },
    {
      key: "act",
      label: "الإجراءات",
      render: (e) => (
        <div onClick={(ev) => ev.stopPropagation()}>
          <RowMenu
            items={[
              { label: "عرض الملف", onClick: () => nav(`/employees/${e.id}`) },
              { label: "تعديل", onClick: () => setModal(e) },
              e.status === "ended"
                ? {
                    label: "إعادة التفعيل",
                    onClick: () => {
                      employeesApi.update(e.id, { status: "active" });
                      showToast("تمت إعادة تفعيل الموظف");
                    },
                  }
                : e.status === "leave"
                  ? {
                      label: "إنهاء الإجازة",
                      onClick: () => {
                        employeesApi.update(e.id, { status: "active" });
                        showToast("تم تحديث الحالة");
                      },
                    }
                  : {
                      label: "تحويل إلى إجازة",
                      onClick: () => {
                        employeesApi.update(e.id, { status: "leave" });
                        showToast("تم تحويل الموظف إلى إجازة");
                      },
                    },
              ...(e.status !== "ended"
                ? [
                    {
                      label: "إنهاء الخدمة",
                      danger: true,
                      onClick: () => {
                        employeesApi.update(e.id, { status: "ended" });
                        showToast("تم إنهاء الخدمة");
                      },
                    },
                  ]
                : []),
              {
                label: "حذف",
                danger: true,
                onClick: () => {
                  if (window.confirm(`حذف ${e.name} نهائياً؟`)) {
                    employeesApi.remove(e.id);
                    showToast("تم حذف الموظف");
                  }
                },
              },
            ]}
          />
        </div>
      ),
    },
  ];

  const save = (v) => {
    if (modal === "add") {
      const id = employeesApi.add(v);
      showToast(`تمت إضافة ${v.name} (${id})`);
      setFilter("all");
      setQ("");
      setPage(1);
    } else {
      employeesApi.update(modal.id, v);
      showToast("تم حفظ التعديلات");
    }
    setModal(null);
  };

  return (
    <div dir="rtl" className="space-y-4">
      <PageHeader
        title="الموظفون"
        subtitle="إدارة بيانات فريق العمل وأقسامهم ومسمياتهم الوظيفية"
      >
        <button
          className={`${btnDark} !rounded-full`}
          onClick={() => setModal("add")}
        >
          <Plus size={13} /> موظف جديد
        </button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3">
        <SearchBox
          className="min-w-[240px] flex-1"
          value={q}
          onChange={(v) => {
            setQ(v);
            setPage(1);
          }}
          placeholder="ابحث عن موظف..."
        />
        <div className="flex flex-wrap gap-2">
          {FILTERS.map(([k, l]) => (
            <Chip
              key={k}
              active={filter === k}
              onClick={() => {
                setFilter(k);
                setPage(1);
              }}
            >
              {l}
            </Chip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          title="إجمالي الموظفين"
          value={all.length}
          sub={`+${month} هذا الشهر`}
          green
        />
        <Stat
          title="نشط"
          value={count("active")}
          sub={`${all.length ? Math.round((count("active") / all.length) * 100) : 0}% من الفريق`}
        />
        <Stat title="في إجازة" value={count("leave")} sub="عودة قريبة" />
        <Stat
          title="الأقسام"
          value={depts.length}
          sub={depts.slice(0, 3).join("، ") + (depts.length > 3 ? "..." : "")}
        />
      </div>

      <div className={`${card} overflow-hidden`}>
        <DataTable
          columns={columns}
          rows={slice}
          rowKey={(e) => e.id}
          onRowClick={(e) => nav(`/employees/${e.id}`)}
          minWidth={760}
        />
        <PagerBar page={p} pages={pages} onPage={setPage} info={info} />
      </div>

      {modal && (
        <EmployeeFormModal
          employee={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSave={save}
        />
      )}
      {toast}
    </div>
  );
}
