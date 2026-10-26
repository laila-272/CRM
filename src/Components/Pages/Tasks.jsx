import { useMemo, useState } from "react";
import {
  ClipboardList,
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
  Download,
  List,
  Columns3,
  Trash2,
  Circle,
} from "lucide-react";
import {
  PageHeader,
  SearchBox,
  Select,
  Chip,
  StatCard,
  PagerBar,
  downloadCsv,
  card,
  btnDark,
  btnLight,
} from "./ui.jsx";
import TaskModal, { Toast, useToast } from "./TaskModal.jsx";
import {
  useTasks,
  statusOf,
  moveToStatus,
  fmtDate,
  todayIso,
  addDays,
  TYPES,
  TYPE_CLS,
  STATUSES,
  STATUS_CLS,
  PRIORITY_CLS,
  EMPLOYEES,
} from "../../data/Tasks.js";
// const PAGE_SIZE = 5;
// الأعمدة اللي فيها أكتر من العدد ده بتبقى scrollable
const VISIBLE_CARDS = 3;
const PAGE_SIZE = 5;
const PRIORITY_ORDER = { عالية: 0, متوسطة: 1, منخفضة: 2 };
const COLUMN_TITLE = {
  متأخرة: "text-red-500",
  اليوم: "text-ink",
  قادمة: "text-ink",
  مكتملة: "text-green-600",
};

const Badge = ({ cls, children }) => (
  <span
    className={`text-[9.5px] font-semibold rounded-full px-2 py-0.5 ${cls}`}
  >
    {children}
  </span>
);

function Avatar({ name }) {
  return (
    <span className="w-8 h-8 shrink-0 rounded-full bg-blue-50 text-blue-600 grid place-items-center text-[11px] font-bold">
      {name[0]}
    </span>
  );
}

function TaskRow({ t, onOpen, onToggle, onDelete }) {
  const st = statusOf(t);
  return (
    <div
      className={`${card} p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${t.done ? "opacity-70" : ""}`}
      dir="rtl"
    >
      {/* الجزء الأيمن: الـ Avatar والمعلومات */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Avatar name={t.owner} />

        <div className="flex-1 min-w-0">
          <Badge cls={STATUS_CLS[st]}>{st}</Badge>

          {/* السطر الأول: شارة الحالة + العنوان + شارة النوع */}
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <h3 className="text-sm font-bold text-ink truncate">{t.title}</h3>

            <Badge cls={TYPE_CLS[t.type]}>{t.type}</Badge>
          </div>

          {/* السطر الثاني: اسم العميل والشركة والمصدر */}
          <p className="mt-1 text-[11px] text-neutral-400">
            <span className="text-neutral-600 font-medium">{t.customer}</span>
            {t.company && ` · ${t.company}`}
            {t.source && ` · المصدر: ${t.source}`}
          </p>

          {/* السطر الثالث: الموعد والمسؤول */}
          <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-500 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full border border-neutral-200 bg-neutral-50/50">
              الموعد:{" "}
              <span className="font-semibold text-neutral-700">
                {fmtDate(t.due)} {t.time}
              </span>
            </span>

            <span className="px-2.5 py-0.5 rounded-full border border-neutral-200 bg-neutral-50/50">
              المسؤول:{" "}
              <span className="font-semibold text-neutral-700">{t.owner}</span>
            </span>
          </div>
        </div>
      </div>

      {/* الجزء الأيسر: زر "فتح صفحة العميل" فوق وتحته باقي الأزرار */}
      <div className="flex flex-col items-end gap-2 w-full md:w-auto shrink-0">
        {/* زر فتح صفحة العميل في الأعلى */}
        <button
          onClick={() => onOpenCustomer?.(t)}
          className="w-full md:w-auto px-3 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-medium rounded-full transition-colors text-center"
        >
          فتح صفحة العميل
        </button>

        {/* باقي الأزرار في السطر اللي تحته */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpen(t)}
            className="px-3.5 py-1.5 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs rounded-full transition-colors"
          >
            التفاصيل
          </button>

          <button
            onClick={() => onEdit?.(t)}
            className="px-3.5 py-1.5 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs rounded-full transition-colors"
          >
            تعديل
          </button>

          <button
            onClick={() => onDelete(t)}
            aria-label="حذف"
            className="w-8 h-8 grid place-items-center rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function KanbanCard({ t, onOpen, onToggle, onMove }) {
  const st = statusOf(t);
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("text/plain", String(t.id))}
      className="bg-white border border-line rounded-xl p-3 shadow-sm cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center justify-between">
        {/* <Badge cls={TYPE_CLS[t.type]}>{t.type}</Badge> */}
        <span className={`text-[9.5px] ${PRIORITY_CLS[t.priority]}`}>
          {t.priority}
        </span>
      </div>
      <button
        onClick={() => onOpen(t)}
        className={`mt-2 block text-right text-[12px] font-bold text-ink hover:underline ${t.done ? "" : ""}`}
      >
        {t.title}
      </button>
      <div className="mt-1 text-[10px] text-neutral-500">{t.customer}</div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-500">
        <span className="px-1 py-0.5 rounded-full border border-neutral-200 bg-neutral-50/50">
          المسؤول:{" "}
          <span className="font-semibold text-neutral-700">{t.owner}</span>
        </span>
        <span dir="ltr">
          {fmtDate(t.due)} · {t.time}
        </span>
      </div>

      {/* <span>{t.owner}</span> */}

      <div className="mt-2.5 flex items-center justify-between">
        <Badge >{st}</Badge>
        <button
          onClick={() => onToggle(t)}
          aria-label={t.done ? "إعادة فتح" : "إكمال"}
          className={
            t.done ? "text-green-600" : "text-neutral-400 hover:text-ink"
          }
        >
          {t.done ? <CheckCircle2 size={16} /> : <Circle size={16} />}
        </button>
      </div>
    </div>
  );
}

export default function Tasks() {
  const { tasks, save, remove } = useTasks();
  const [view, setView] = useState("list");
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("due");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // { task?, defaults? }
  const [toast, notify] = useToast();

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = tasks.filter(
      (t) =>
        (type === "all" || t.type === type) &&
        (status === "all" || statusOf(t) === status) &&
        (!s ||
          [t.title, t.customer, t.owner].some((v) =>
            v.toLowerCase().includes(s),
          )),
    );
    return list.sort((a, b) =>
      sort === "priority"
        ? PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        : sort === "title"
          ? a.title.localeCompare(b.title, "ar")
          : (a.due + a.time).localeCompare(b.due + b.time),
    );
  }, [tasks, q, type, status, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const rows = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const from = filtered.length ? (cur - 1) * PAGE_SIZE + 1 : 0;

  const count = (st) => tasks.filter((t) => statusOf(t) === st).length;
  const open = tasks.filter((t) => !t.done);
  const upcoming = open
    .filter((t) => t.due >= todayIso())
    .sort((a, b) => (a.due + a.time).localeCompare(b.due + b.time))[0];
  const maxLoad = Math.max(
    1,
    ...EMPLOYEES.map((e) => open.filter((t) => t.owner === e).length),
  );

  const reset = (fn) => (v) => {
    fn(v);
    setPage(1);
  };
  const toggle = (t) => {
    save({ ...t, done: !t.done });
    notify(t.done ? "تمت إعادة فتح المهمة" : "تم إكمال المهمة");
  };
  const move = (t, st) => {
    if (statusOf(t) === st) return;
    save(moveToStatus(t, st));
    notify(`تم نقل المهمة إلى «${st}»`);
  };
  const del = (t) => {
    if (window.confirm(`هل تريد حذف المهمة «${t.title}»؟`)) {
      remove(t.id);
      setModal(null);
      notify("تم حذف المهمة");
    }
  };
  const onSave = (t) => {
    const isNew = !tasks.some((x) => x.id === t.id);
    save(t);
    setModal(null);
    notify(isNew ? "تمت إضافة المهمة" : "تم حفظ التعديلات");
  };
  const defaultsFor = (st) => ({
    due:
      st === "متأخرة"
        ? addDays(todayIso(), -1)
        : st === "قادمة"
          ? addDays(todayIso(), 1)
          : todayIso(),
  });

  const exportCsv = () =>
    downloadCsv(
      "tasks.csv",
      [
        "العنوان",
        "النوع",
        "العميل",
        "الحالة",
        "الأولوية",
        "التاريخ",
        "الوقت",
        "المسؤول",
      ],
      filtered.map((t) => [
        t.title,
        t.type,
        t.customer,
        statusOf(t),
        t.priority,
        t.due,
        t.time,
        t.owner,
      ]),
    );

  return (
    <div dir="rtl" className=" max-w-full">
      <PageHeader
        title="المتابعات والمهام"
        subtitle="تابع مكالماتك ومعايناتك ومهام الفريق من مكان واحد."
      >
        <button onClick={() => setModal({ defaults: {} })} className={btnDark}>
          <Plus size={13} /> إضافة مهمة
        </button>
      </PageHeader>

      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={ClipboardList}
          value={tasks.length}
          label="إجمالي المهام"
        />
        <StatCard
          icon={CalendarDays}
          value={count("اليوم")}
          label="مهام اليوم المعلقة"
        />
        <StatCard
          icon={CheckCircle2}
          value={count("مكتملة")}
          label="مهام مكتملة"
        />
        <StatCard
          icon={Clock}
          tag="متأخرة"
          value={count("متأخرة")}
          label="تحتاج إلى متابعة"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          <Chip active={type === "all"} onClick={() => reset(setType)("all")}>
            الكل
          </Chip>
          {TYPES.map((t) => (
            <Chip key={t} active={type === t} onClick={() => reset(setType)(t)}>
              {t}
            </Chip>
          ))}
        </div>
        <div
          className="flex rounded-lg border border-line bg-white p-0.5"
          role="tablist"
        >
          {[
            ["list", "جدول", List],
            ["kanban", "لوحة", Columns3],
          ].map(([k, label, Icon]) => (
            <button
              key={k}
              role="tab"
              aria-selected={view === k}
              onClick={() => setView(k)}
              className={`flex items-center gap-1.5 h-7 rounded-md px-3 text-[11px] font-semibold ${view === k ? "bg-ink text-white" : "text-neutral-500"}`}
            >
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>
      </div>

      {view === "list" ? (
        <div className="mt-4">
          <h2 className="mb-2 text-[13px] font-extrabold text-ink">
            الجدول الزمني
          </h2>
          <div className="my-3 flex flex-wrap items-center gap-2">
            <SearchBox
              value={q}
              onChange={reset(setQ)}
              placeholder="ابحث في المتابعات والمهام"
              className="flex-1 min-w-[220px]"
            />
            <div className="w-[140px]">
              <Select value={status} onChange={reset(setStatus)}>
                <option value="all">فلاتر متقدمة (الحالة)</option>
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </div>
            <div className="w-[150px]">
              <Select value={sort} onChange={setSort}>
                <option value="due">ترتيب حسب الاستحقاق</option>
                <option value="priority">ترتيب حسب الأولوية</option>
                <option value="title">ترتيب حسب العنوان</option>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            {rows.map((t) => (
              <TaskRow
                key={t.id}
                t={t}
                onOpen={(x) => setModal({ task: x })}
                onToggle={toggle}
                onDelete={del}
              />
            ))}
            {!rows.length && (
              <div
                className={`${card} p-8 text-center text-[11px] text-neutral-400`}
              >
                لا توجد مهام مطابقة
              </div>
            )}
          </div>

          <PagerBar
            page={cur}
            pages={pages}
            onPage={setPage}
            info={`عرض ${from}–${from ? from + rows.length - 1 : 0} من ${filtered.length} مهمة`}
          />
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto pb-2">
          <div className="grid grid-flow-col auto-cols-[minmax(230px,1fr)] gap-3 min-w-[960px] lg:min-w-0 lg:grid-flow-row lg:grid-cols-4">
            {STATUSES.map((st) => {
              const col = filtered.filter((t) => statusOf(t) === st);
              return (
                <div
                  key={st}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    const t = tasks.find(
                      (x) =>
                        String(x.id) === e.dataTransfer.getData("text/plain"),
                    );
                    if (t) move(t, st);
                  }}
                  className="rounded-xl bg-[#F1F2F4] border border-line p-2.5 h-fit"
                >
                  <div className="flex items-center justify-between px-1 pb-2">
                    <span
                      className={`text-[12px] font-bold ${COLUMN_TITLE[st]}`}
                    >
                      {st}
                    </span>
                    <span className="text-[9.5px] bg-white text-neutral-500 rounded-full px-2 py-0.5">
                      {col.length}
                    </span>
                  </div>
                  <div
                    className={`space-y-2.5 ${
                      col.length > VISIBLE_CARDS
                        ? "max-h-[445px] overflow-y-auto pl-1 [scrollbar-width:thin]"
                        : ""
                    }`}
                  >
                    {col.map((t) => (
                      <KanbanCard
                        key={t.id}
                        t={t}
                        onOpen={(x) => setModal({ task: x })}
                        onToggle={toggle}
                        onMove={move}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setModal({ defaults: defaultsFor(st) })}
                    className="mt-2 w-full  rounded-lg  border-neutral-300 text-[10.5px] text-neutral-500 hover:bg-white"
                  >
                    + إضافة مهمة
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className={`${card} p-4`}>
          <h2 className="text-[13px] font-extrabold text-ink mb-3">
            توزيع المهام المفتوحة
          </h2>
          <ul className="space-y-3">
            {EMPLOYEES.map((e) => {
              const n = open.filter((t) => t.owner === e).length;
              return (
                <li key={e}>
                  <div className="flex items-center justify-between text-[10.5px] mb-1">
                    <span className="font-semibold text-ink">{e}</span>
                    <span className="text-neutral-500">{n} مهمة</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-neutral-100">
                    <div
                      className="h-full rounded-full bg-orange-500"
                      style={{ width: `${(n / maxLoad) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
            <PagerBar
              page={cur}
              pages={pages}
              onPage={setPage}
              info={`عرض ${from}–${from ? from + rows.length - 1 : 0} من ${filtered.length} مهمة`}
            />
          </ul>
        </section>

        <section className={`${card} p-4`}>
          <h2 className="text-[13px] font-extrabold text-ink mb-3">
            المتابعة القادمة
          </h2>
          {upcoming ? (
            <button
              onClick={() => setModal({ task: upcoming })}
              className="block w-full text-right"
            >
              <div className="text-[12px] font-bold text-ink">
                {upcoming.customer} · {upcoming.title}
              </div>
              <div className="mt-1 text-[10.5px] text-neutral-500" dir="auto">
                {fmtDate(upcoming.due)} · {upcoming.time} · {upcoming.owner}
              </div>
              {upcoming.notes && (
                <p className="mt-2 text-[10.5px] text-neutral-400">
                  {upcoming.notes}
                </p>
              )}
            </button>
          ) : (
            <p className="text-[11px] text-neutral-400">
              لا توجد متابعات قادمة.
            </p>
          )}
        </section>
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
