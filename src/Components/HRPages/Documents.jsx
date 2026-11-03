import { useMemo, useState } from "react";
import { FileText, Upload } from "lucide-react";
import {
  PageHeader,
  SearchBox,
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

const REF = new Date("2026-11-03");
const TYPES = {
  عقد: "عقد",
  هوية: "هوية",
  شهادة: "شهادة",
  طبي: "مستند طبي",
  أخرى: "أخرى",
};
const CHIPS = [
  ["all", "الكل"],
  ["عقد", "العقود"],
  ["هوية", "الهويات"],
  ["شهادة", "الشهادات"],
  ["طبي", "المستندات الطبية"],
  ["أخرى", "أخرى"],
];
const ST = {
  valid: ["ساري", "green"],
  soon: ["ينتهي قريباً", "orange"],
  expired: ["منتهي", "red"],
};
const status = (d) => {
  if (!d.expiry) return "valid";
  const days = Math.ceil((new Date(d.expiry) - REF) / 864e5);
  return days < 0 ? "expired" : days <= 90 ? "soon" : "valid";
};

const DOCS = [
  {
    id: "D-010",
    name: "عقد عمل - أحمد علي",
    emp: "أحمد علي",
    type: "عقد",
    uploaded: "2022-01-03",
    expiry: "2027-01-09",
    meta: "PDF · 1.8 MB",
  },
  {
    id: "D-009",
    name: "صورة الهوية الوطنية",
    emp: "سارة محمود",
    type: "هوية",
    uploaded: "2023-06-15",
    expiry: "2028-12-12",
    meta: "PDF · 0.6 MB",
  },
  {
    id: "D-008",
    name: "شهادة بكالوريوس لغة",
    emp: "محمد حسين",
    type: "شهادة",
    uploaded: "2023-09-22",
    expiry: "",
    meta: "PDF · 2.1 MB",
  },
  {
    id: "D-007",
    name: "تقرير طبي - فحص دوري",
    emp: "سارة إبراهيم",
    type: "طبي",
    uploaded: "2026-10-05",
    expiry: "2027-10-05",
    meta: "PDF · 0.9 MB",
  },
  {
    id: "D-006",
    name: "رخصة القيادة",
    emp: "نور الدين",
    type: "هوية",
    uploaded: "2021-02-01",
    expiry: "2026-10-30",
    meta: "JPG · 0.4 MB",
  },
  {
    id: "D-005",
    name: "عقد عمل - خالد منصور",
    emp: "خالد منصور",
    type: "عقد",
    uploaded: "2020-03-12",
    expiry: "2026-03-12",
    meta: "PDF · 1.6 MB",
  },
  {
    id: "D-004",
    name: "عقد عمل - سارة محمود",
    emp: "سارة محمود",
    type: "عقد",
    uploaded: "2023-06-15",
    expiry: "2027-06-15",
    meta: "PDF · 1.7 MB",
  },
  {
    id: "D-003",
    name: "شهادة خبرة - نور الدين",
    emp: "نور الدين",
    type: "شهادة",
    uploaded: "2021-02-01",
    expiry: "",
    meta: "PDF · 0.5 MB",
  },
  {
    id: "D-002",
    name: "تأمين صحي - أحمد علي",
    emp: "أحمد علي",
    type: "طبي",
    uploaded: "2025-11-20",
    expiry: "2026-11-20",
    meta: "PDF · 1.1 MB",
  },
  {
    id: "D-001",
    name: "خطاب تعيين - هبة إبراهيم",
    emp: "هبة إبراهيم",
    type: "عقد",
    uploaded: "2026-10-05",
    expiry: "2027-10-05",
    meta: "PDF · 0.7 MB",
  },
];
const REQ = [
  {
    id: "R-3",
    emp: "هبة إبراهيم",
    dept: "التسويق",
    doc: "صورة الهوية الوطنية",
    due: "2026-10-15",
    status: "مطلوب",
  },
  {
    id: "R-2",
    emp: "أحمد علي",
    dept: "المبيعات",
    doc: "شهادة الخدمة العسكرية",
    due: "2026-10-30",
    status: "مطلوب",
  },
  {
    id: "R-1",
    emp: "سارة محمود",
    dept: "المبيعات",
    doc: "وثيقة الحالة الجنائية",
    due: "2026-11-01",
    status: "قيد الرفع",
  },
];
const useDocs = createStore("hr-documents-v1", DOCS);
const useReq = createStore("hr-required-docs-v1", REQ);
const EMPTY = {
  name: "",
  emp: "",
  type: "عقد",
  uploaded: today(),
  expiry: "",
  meta: "PDF",
};
const REQ_TONE = { مطلوب: "red", "قيد الرفع": "gray", "تم الرفع": "green" };

export default function Documents() {
  const [docs, setDocs] = useDocs();
  const [req, setReq] = useReq();
  const employees = useEmployees();
  const [q, setQ] = useState("");
  const [chip, setChip] = useState("all");
  const [modal, setModal] = useState(null);
  const [view, setView] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [reminded, setReminded] = useState([]);
  const [toast, showToast] = useToast();

  const filtered = useMemo(
    () =>
      docs
        .filter(
          (d) =>
            (chip === "all" || d.type === chip) &&
            (!q || `${d.name} ${d.emp}`.includes(q.trim())),
        )
        .sort((a, b) => b.uploaded.localeCompare(a.uploaded)),
    [docs, chip, q],
  );
  const pg = usePaged(filtered, 6),
    pgR = usePaged(req, 5);
  const cnt = (s) => docs.filter((d) => status(d) === s).length;
  const missing = req.filter((r) => r.status !== "تم الرفع").length;

  const openAdd = () => {
    setForm(EMPTY);
    setModal("add");
  };
  const openEdit = (d) => {
    setForm(d);
    setModal(d);
  };
  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = (f.name.split(".").pop() || "FILE").toUpperCase();
    setForm((s) => ({
      ...s,
      name: s.name || f.name.replace(/\.[^.]+$/, ""),
      meta: `${ext} · ${(f.size / 1048576).toFixed(1)} MB`,
    }));
  };
  const save = () => {
    if (!form.name.trim() || !form.emp)
      return showToast("أدخل اسم المستند واختر الموظف");
    if (form.expiry && form.expiry < form.uploaded)
      return showToast("تاريخ الانتهاء قبل تاريخ الرفع");
    if (modal === "add") {
      setDocs((d) => [
        { ...form, name: form.name.trim(), id: uid("D-") },
        ...d,
      ]);
      showToast("تمت إضافة المستند");
    } else {
      setDocs((d) => d.map((x) => (x.id === modal.id ? { ...x, ...form } : x)));
      showToast("تم تحديث المستند");
    }
    setModal(null);
  };
  const receive = (r) => {
    setReq((x) =>
      x.map((y) => (y.id === r.id ? { ...y, status: "تم الرفع" } : y)),
    );
    setDocs((d) => [
      {
        id: uid("D-"),
        name: r.doc,
        emp: r.emp,
        type: "أخرى",
        uploaded: today(),
        expiry: "",
        meta: "PDF",
      },
      ...d,
    ]);
    showToast(`تم استلام «${r.doc}» وإضافته للمستندات`);
  };
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const columns = [
    {
      key: "name",
      label: "المستند",
      render: (d) => (
        <div className="flex items-center gap-3">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-neutral-100">
            <FileText size={13} className="text-neutral-500" />
          </span>
          <div>
            <div className="font-semibold">{d.name}</div>
            <div dir="ltr" className="text-right text-[10px] text-neutral-400">
              {d.meta}
            </div>
          </div>
        </div>
      ),
    },
    { key: "emp", label: "الموظف" },
    { key: "type", label: "النوع", render: (d) => TYPES[d.type] },
    {
      key: "uploaded",
      label: "تاريخ الرفع",
      render: (d) => (
        <span dir="ltr" className="inline-block text-neutral-500">
          {dmy(d.uploaded)}
        </span>
      ),
    },
    {
      key: "expiry",
      label: "تاريخ الانتهاء",
      render: (d) => (
        <span dir="ltr" className="inline-block text-neutral-500">
          {d.expiry ? dmy(d.expiry) : "—"}
        </span>
      ),
    },
    {
      key: "st",
      label: "الحالة",
      render: (d) => <Badge tone={ST[status(d)][1]}>{ST[status(d)][0]}</Badge>,
    },
    {
      key: "act",
      label: "",
      render: (d) => (
        <div onClick={(e) => e.stopPropagation()}>
          <RowMenu
            items={[
              { label: "عرض التفاصيل", onClick: () => setView(d) },
              { label: "تعديل", onClick: () => openEdit(d) },
              ...(d.expiry
                ? [
                    {
                      label: "تجديد سنة",
                      onClick: () => {
                        const y = new Date(d.expiry);
                        y.setFullYear(y.getFullYear() + 1);
                        setDocs((x) =>
                          x.map((z) =>
                            z.id === d.id
                              ? { ...z, expiry: y.toISOString().slice(0, 10) }
                              : z,
                          ),
                        );
                        showToast("تم تجديد صلاحية المستند");
                      },
                    },
                  ]
                : []),
              {
                label: "حذف",
                danger: true,
                onClick: () => {
                  setDocs((x) => x.filter((y) => y.id !== d.id));
                  showToast("تم حذف المستند");
                },
              },
            ]}
          />
        </div>
      ),
    },
  ];
  const reqCols = [
    {
      key: "emp",
      label: "الموظف",
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.emp} size={26} />
          <div>
            <div className="font-semibold">{r.emp}</div>
            <div className="text-[10px] text-neutral-400">{r.dept}</div>
          </div>
        </div>
      ),
    },
    { key: "doc", label: "المستند المطلوب" },
    {
      key: "due",
      label: "الموعد النهائي",
      render: (r) => (
        <span dir="ltr" className="inline-block text-neutral-500">
          {dmy(r.due)}
        </span>
      ),
    },
    {
      key: "st",
      label: "الحالة",
      render: (r) => <Badge tone={REQ_TONE[r.status]}>{r.status}</Badge>,
    },
    {
      key: "act",
      label: "",
      render: (r) =>
        r.status === "تم الرفع" ? (
          <span className="text-[10px] text-neutral-400">مكتمل</span>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              className={`${btnLight} h-6 !px-2.5 !text-[10px]`}
              disabled={reminded.includes(r.id)}
              onClick={() => {
                setReminded([...reminded, r.id]);
                showToast(`تم إرسال تذكير إلى ${r.emp} (عرض تجريبي)`);
              }}
            >
              {reminded.includes(r.id) ? "تم الإرسال" : "إرسال تذكير"}
            </button>
            <RowMenu
              items={[{ label: "تسجيل كمستلم", onClick: () => receive(r) }]}
            />
          </div>
        ),
    },
  ];

  return (
    <div dir="rtl" className="space-y-4">
      <PageHeader
        title="المستندات"
        subtitle="ملفات الموظفين والعقود والشهادات والوثائق الرسمية"
      >
        <button className={btnDark} onClick={openAdd}>
          <Upload size={13} /> رفع مستند
        </button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3">
        <SearchBox
          className="min-w-[240px] flex-1"
          value={q}
          onChange={setQ}
          placeholder="ابحث عن مستند أو موظف..."
        />
        <div className="flex flex-wrap gap-2">
          {CHIPS.map(([k, l]) => (
            <Chip key={k} active={chip === k} onClick={() => setChip(k)}>
              {l}
            </Chip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat
          title="إجمالي المستندات"
          value={docs.length.toLocaleString("en-US")}
          sub="كل الملفات المرفوعة"
        />
        <Stat
          title="تنتهي قريباً"
          value={cnt("soon")}
          sub="خلال 90 يوماً"
          tone="orange"
        />
        <Stat
          title="مستندات ناقصة"
          value={missing}
          sub="تحتاج رفع"
          tone="red"
        />
        <Stat
          title="منتهية"
          value={cnt("expired")}
          sub="تحتاج تجديد"
          tone="red"
        />
      </div>

      <SectionTitle
        title="مستندات الموظفين"
        sub="أحدث الملفات المرفوعة وحالة صلاحيتها"
      />
      <div className={`${card} overflow-hidden`}>
        <DataTable
          columns={columns}
          rows={pg.slice}
          rowKey={(d) => d.id}
          onRowClick={setView}
          minWidth={900}
        />
        <PagerBar
          page={pg.page}
          pages={pg.pages}
          onPage={pg.setPage}
          info={pg.info + (filtered.length ? " مستند" : "")}
        />
      </div>

      <SectionTitle
        title="مستندات مطلوبة"
        sub="مستندات يلزم رفعها أو تجديدها من الموظفين"
      />
      <div className={`${card} overflow-hidden`}>
        <DataTable
          columns={reqCols}
          rows={pgR.slice}
          rowKey={(r) => r.id}
          minWidth={700}
        />
        <PagerBar
          page={pgR.page}
          pages={pgR.pages}
          onPage={pgR.setPage}
          info={pgR.info + (req.length ? " مستندات مطلوبة" : "")}
        />
      </div>

      {modal && (
        <Modal
          title={modal === "add" ? "رفع مستند" : "تعديل المستند"}
          onClose={() => setModal(null)}
          onSubmit={save}
          submitLabel={modal === "add" ? "حفظ المستند" : "حفظ التعديلات"}
        >
          {modal === "add" && (
            <Field label="الملف (اختياري في العرض التجريبي)" full>
              <input
                type="file"
                onChange={onFile}
                className="block w-full text-[11px]"
              />
            </Field>
          )}
          <Field label="اسم المستند" full>
            <input
              className={inputCls}
              value={form.name}
              onChange={set("name")}
            />
          </Field>
          <Field label="الموظف">
            <select className={inputCls} value={form.emp} onChange={set("emp")}>
              <option value="">اختر الموظف</option>
              {[
                ...new Set(
                  [...employees.map((e) => e.name), form.emp].filter(Boolean),
                ),
              ].map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </Field>
          <Field label="النوع">
            <select
              className={inputCls}
              value={form.type}
              onChange={set("type")}
            >
              {Object.entries(TYPES).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
          <Field label="تاريخ الرفع">
            <input
              type="date"
              className={inputCls}
              value={form.uploaded}
              onChange={set("uploaded")}
            />
          </Field>
          <Field label="تاريخ الانتهاء (اختياري)">
            <input
              type="date"
              className={inputCls}
              value={form.expiry}
              onChange={set("expiry")}
            />
          </Field>
        </Modal>
      )}
      {view && (
        <Modal
          title={view.name}
          onClose={() => setView(null)}
          onSubmit={() => setView(null)}
          submitLabel="إغلاق"
        >
          <div className="col-span-2 grid grid-cols-2 gap-3 text-[11px] text-neutral-500">
            <div>
              الموظف: <b className="text-ink">{view.emp}</b>
            </div>
            <div>
              النوع: <b className="text-ink">{TYPES[view.type]}</b>
            </div>
            <div>
              تاريخ الرفع:{" "}
              <b dir="ltr" className="text-ink">
                {dmy(view.uploaded)}
              </b>
            </div>
            <div>
              تاريخ الانتهاء:{" "}
              <b dir="ltr" className="text-ink">
                {view.expiry ? dmy(view.expiry) : "—"}
              </b>
            </div>
            <div>
              الملف:{" "}
              <b dir="ltr" className="text-ink">
                {view.meta}
              </b>
            </div>
            <div>
              الحالة:{" "}
              <Badge tone={ST[status(view)][1]}>{ST[status(view)][0]}</Badge>
            </div>
          </div>
        </Modal>
      )}
      {toast}
    </div>
  );
}
