import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  PageHeader,
  SearchBox,
  Chip,
  PagerBar,
  btnDark,
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
import { DEPTS } from "../../data/Employeesstore.js";
import { dmy } from "./Hrshared.jsx";
import { Stat, SectionTitle } from "./HRKit.jsx";
import { createStore, uid } from "../../data/Hrstores.js";

const ST = {
  published: ["منشور", "green"],
  scheduled: ["مجدول", "orange"],
  draft: ["مسودة", "gray"],
  archived: ["مؤرشف", "gray"],
};
const CHIPS = [
  ["all", "الكل"],
  ["published", "منشورة"],
  ["scheduled", "مجدولة"],
  ["draft", "مسودات"],
  ["archived", "مؤرشفة"],
];
const SEED = [
  {
    id: "AN-018",
    title: "تحديث سياسة الدوام الجديدة",
    body: "تعديل مواعيد الحضور والانصراف اعتباراً من الأسبوع القادم.",
    audience: "كل الموظفين",
    issuer: "الموارد البشرية",
    date: "2026-10-29",
    status: "published",
    read: 91,
  },
  {
    id: "AN-017",
    title: "ترتيب الاجتماع العام الشهري",
    body: "اجتماع نهاية الشهر مع الإدارة العليا لمناقشة الأداء.",
    audience: "كل الموظفين",
    issuer: "المدير العام",
    date: "2026-10-18",
    status: "published",
    read: 84,
  },
  {
    id: "AN-016",
    title: "دورة تدريبية: مهارات التفاوض",
    body: "التسجيل مفتوح لفريق المبيعات حتى نهاية الأسبوع.",
    audience: "المبيعات",
    issuer: "الموارد البشرية",
    date: "2026-10-15",
    status: "published",
    read: 88,
  },
  {
    id: "AN-015",
    title: "جدول العطلات الرسمية لعام 2027",
    body: "الجدول المعتمد للعطلات الرسمية والإجازات الوطنية.",
    audience: "كل الموظفين",
    issuer: "الموارد البشرية",
    date: "2026-11-01",
    status: "scheduled",
    read: 0,
  },
  {
    id: "AN-014",
    title: "إطلاق نظام التقييم السنوي",
    body: "تفاصيل مراحل التقييم السنوي وآلية التقديم.",
    audience: "كل الموظفين",
    issuer: "الموارد البشرية",
    date: "",
    status: "draft",
    read: 0,
  },
  {
    id: "AN-013",
    title: "تنبيه: صيانة الأنظمة نهاية الأسبوع",
    body: "سيتوقف النظام لمدة ساعتين يوم الجمعة.",
    audience: "خدمة العملاء",
    issuer: "المدير العام",
    date: "2026-10-15",
    status: "archived",
    read: 79,
  },
];
const useAnn = createStore("hr-announcements-v1", SEED);
const EMPTY = {
  title: "",
  body: "",
  audience: "كل الموظفين",
  issuer: "الموارد البشرية",
  date: today(),
  status: "published",
};

export default function Announcements() {
  const [rows, setRows] = useAnn();
  const [q, setQ] = useState("");
  const [chip, setChip] = useState("all");
  const [modal, setModal] = useState(null); // null | "add" | row (edit)
  const [view, setView] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [toast, showToast] = useToast();

  const filtered = useMemo(
    () =>
      rows
        .filter(
          (r) =>
            (chip === "all" || r.status === chip) &&
            (!q || `${r.title} ${r.body} ${r.audience}`.includes(q.trim())),
        )
        .sort((a, b) => (b.date || "9999").localeCompare(a.date || "9999")),
    [rows, chip, q],
  );
  const pg = usePaged(filtered, 6);
  const n = (s) => rows.filter((r) => r.status === s).length;
  const pub = rows.filter((r) => r.status === "published");
  const avg = pub.length
    ? Math.round(pub.reduce((s, r) => s + r.read, 0) / pub.length)
    : 0;
  const patch = (id, p) =>
    setRows((r) => r.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const openAdd = () => {
    setForm(EMPTY);
    setModal("add");
  };
  const openEdit = (r) => {
    setForm({ ...EMPTY, ...r });
    setModal(r);
  };
  const save = () => {
    if (!form.title.trim()) return showToast("أدخل عنوان الإعلان");
    if (form.status === "scheduled" && !form.date)
      return showToast("حدد تاريخ النشر للإعلان المجدول");
    if (modal === "add") {
      setRows((r) => [
        { ...form, title: form.title.trim(), id: uid("AN-"), read: 0 },
        ...r,
      ]);
      showToast("تم إنشاء الإعلان");
    } else {
      patch(modal.id, { ...form, title: form.title.trim() });
      showToast("تم حفظ التعديلات");
    }
    setModal(null);
  };

  const columns = [
    {
      key: "title",
      label: "العنوان",
      render: (r) => (
        <div>
          <div className="font-semibold">{r.title}</div>
          <div className="mt-0.5 max-w-[300px] truncate text-[10px] text-neutral-400">
            {r.body}
          </div>
        </div>
      ),
    },
    { key: "audience", label: "الفئة المستهدفة" },
    { key: "issuer", label: "القسم" },
    {
      key: "date",
      label: "تاريخ النشر",
      render: (r) => (
        <span dir="ltr" className="inline-block text-neutral-500">
          {r.date ? dmy(r.date) : "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "الحالة",
      render: (r) => <Badge tone={ST[r.status][1]}>{ST[r.status][0]}</Badge>,
    },
    {
      key: "act",
      label: "",
      render: (r) => (
        <div onClick={(e) => e.stopPropagation()}>
          <RowMenu
            items={[
              { label: "عرض التفاصيل", onClick: () => setView(r) },
              { label: "تعديل", onClick: () => openEdit(r) },
              ...(r.status === "draft" || r.status === "scheduled"
                ? [
                    {
                      label: "نشر الآن",
                      onClick: () => {
                        patch(r.id, { status: "published", date: today() });
                        showToast("تم نشر الإعلان");
                      },
                    },
                  ]
                : []),
              ...(r.status !== "archived"
                ? [
                    {
                      label: "أرشفة",
                      onClick: () => {
                        patch(r.id, { status: "archived" });
                        showToast("تمت الأرشفة");
                      },
                    },
                  ]
                : [
                    {
                      label: "استعادة كمسودة",
                      onClick: () => patch(r.id, { status: "draft" }),
                    },
                  ]),
              {
                label: "حذف",
                danger: true,
                onClick: () => {
                  setRows((x) => x.filter((y) => y.id !== r.id));
                  showToast("تم حذف الإعلان");
                },
              },
            ]}
          />
        </div>
      ),
    },
  ];
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div dir="rtl" className="space-y-4">
      <PageHeader
        title="الإعلانات"
        subtitle="إعلانات الشركة الموجهة للموظفين والأقسام"
      >
        <button className={btnDark} onClick={openAdd}>
          <Plus size={13} /> إعلان جديد
        </button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-3">
        <SearchBox
          className="min-w-[240px] flex-1"
          value={q}
          onChange={setQ}
          placeholder="ابحث في الإعلانات..."
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
          title="إعلانات منشورة"
          value={n("published")}
          sub="إجمالي المنشور"
          tone="green"
        />
        <Stat
          title="مجدولة"
          value={n("scheduled")}
          sub="بانتظار موعد النشر"
          tone="orange"
        />
        <Stat title="مسودات" value={n("draft")} sub="بانتظار النشر" />
        <Stat
          title="متوسط نسبة القراءة"
          value={`${avg}%`}
          sub="من الموظفين المستهدفين"
        />
      </div>

      <SectionTitle
        title="الإعلانات الأخيرة"
        sub="الإعلانات المنشورة والمعدّة لإبلاغ الموظفين عنها"
      />
      <div className={`${card} overflow-hidden`}>
        <DataTable
          columns={columns}
          rows={pg.slice}
          rowKey={(r) => r.id}
          onRowClick={setView}
          minWidth={820}
        />
        <PagerBar
          page={pg.page}
          pages={pg.pages}
          onPage={pg.setPage}
          info={pg.info + (filtered.length ? " إعلان" : "")}
        />
      </div>

      {modal && (
        <Modal
          title={modal === "add" ? "إعلان جديد" : "تعديل الإعلان"}
          onClose={() => setModal(null)}
          onSubmit={save}
          submitLabel={modal === "add" ? "إنشاء" : "حفظ"}
        >
          <Field label="العنوان" full>
            <input
              className={inputCls}
              value={form.title}
              onChange={set("title")}
              autoFocus
            />
          </Field>
          <Field label="نص الإعلان" full>
            <textarea
              rows={3}
              className={`${inputCls} h-auto py-2`}
              value={form.body}
              onChange={set("body")}
            />
          </Field>
          <Field label="الفئة المستهدفة">
            <select
              className={inputCls}
              value={form.audience}
              onChange={set("audience")}
            >
              <option>كل الموظفين</option>
              {DEPTS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="القسم المُصدِر">
            <select
              className={inputCls}
              value={form.issuer}
              onChange={set("issuer")}
            >
              {["المدير العام", ...DEPTS].map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </Field>
          <Field label="تاريخ النشر">
            <input
              type="date"
              className={inputCls}
              value={form.date}
              onChange={set("date")}
            />
          </Field>
          <Field label="الحالة">
            <select
              className={inputCls}
              value={form.status}
              onChange={set("status")}
            >
              {Object.entries(ST).map(([v, [l]]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
        </Modal>
      )}
      {view && (
        <Modal
          title={view.title}
          onClose={() => setView(null)}
          onSubmit={() => setView(null)}
          submitLabel="إغلاق"
        >
          <div className="col-span-2 space-y-3 text-[12px]">
            <p className="leading-relaxed text-neutral-700">
              {view.body || "—"}
            </p>
            <div className="grid grid-cols-2 gap-3 text-[11px] text-neutral-500">
              <div>
                الفئة: <b className="text-ink">{view.audience}</b>
              </div>
              <div>
                القسم: <b className="text-ink">{view.issuer}</b>
              </div>
              <div>
                التاريخ:{" "}
                <b dir="ltr" className="text-ink">
                  {view.date ? dmy(view.date) : "—"}
                </b>
              </div>
              <div>
                نسبة القراءة: <b className="text-ink">{view.read}%</b>
              </div>
            </div>
          </div>
        </Modal>
      )}
      {toast}
    </div>
  );
}
