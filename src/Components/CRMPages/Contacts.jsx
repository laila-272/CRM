import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Download,
  Users,
  UserCheck,
  Building2,
  UserPlus,
  X,
} from "lucide-react";
import {
  PageHeader,
  SearchBox,
  Select,
  Chip,
  PagerBar,
  StatCard,
  downloadCsv,
  btnDark,
  btnLight,
  card,
} from "../Shared/ui.jsx";
import {
  Badge,
  DataTable,
  RowMenu,
  Modal,
  usePaged,
  useToast,
  Ltr,
} from "../AccountingPages/Accountingui.jsx";
import {
  useContactsApi,
  PROJECTS,
  OWNERS,
  SOURCES,
  STATUSES,
  daysSince,
  needsAttention,
  dmy,
  waLink,
} from "../../data/contacts.js";
import ContactForm from "./Contactform.jsx";

const ACCENT = "#FF7E52";
const TONE = {
  نشط: "green",
  جديد: "gray",
  "يحتاج متابعة": "orange",
  "غير نشط": "red",
};
const sub = (c) => `${c.kind === "فرد" ? "عميل فردي" : "شركة"} · ${c.city}`;

export default function Contacts() {
  const nav = useNavigate();
  const { contacts, add, update, remove } = useContactsApi();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("all");
  const [source, setSource] = useState("all");
  const [status, setStatus] = useState("all");
  const [owner, setOwner] = useState("all");
  const [project, setProject] = useState("all");
  const [attn, setAttn] = useState(false);
  const [modal, setModal] = useState(null); // null | "add" | contact (edit)
  const [del, setDel] = useState(null);
  const [toast, showToast] = useToast();

  const filtered = useMemo(
    () =>
      contacts.filter(
        (c) =>
          (kind === "all" || c.kind === kind) &&
          (source === "all" || c.source === source) &&
          (status === "all" || c.status === status) &&
          (owner === "all" || c.owner === owner) &&
          (project === "all" || c.project === project) &&
          (!attn || needsAttention(c)) &&
          (!q ||
            `${c.name} ${c.phone} ${c.email}`
              .toLowerCase()
              .includes(q.trim().toLowerCase())),
      ),
    [contacts, kind, source, status, owner, project, attn, q],
  );
  const pg = usePaged(filtered, 8);

  const stale = contacts.filter(needsAttention);
  const byProject = PROJECTS.map((p) => [
    p,
    contacts.filter((c) => c.project === p).length,
  ]);
  const fresh = contacts.filter((c) => daysSince(c.created) <= 30).length;
  const opt = (all, list) => (
    <>
      <option value="all">{all}</option>
      {list.map((x) => (
        <option key={x}>{x}</option>
      ))}
    </>
  );

  const columns = [
    {
      key: "name",
      label: "جهة الاتصال",
      render: (c) => (
        <div>
          <div className="font-semibold">{c.name}</div>
          <div className="mt-0.5 text-[10px] text-neutral-400">{sub(c)}</div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "بيانات التواصل",
      render: (c) => (
        <div>
          <Ltr>{c.phone}</Ltr>
          <div dir="ltr" className="text-right text-[10px] text-neutral-400">
            {c.email}
          </div>
        </div>
      ),
    },
    { key: "project", label: "المشروع" },
    { key: "owner", label: "المسؤول" },
    {
      key: "status",
      label: "الحالة",
      render: (c) => <Badge tone={TONE[c.status]}>{c.status}</Badge>,
    },
    {
      key: "last",
      label: "آخر تواصل",
      render: (c) => (
        <span className="text-neutral-500">
          <Ltr>{dmy(c.last)}</Ltr>
        </span>
      ),
    },
    {
      key: "act",
      label: "إجراء",
      render: (c) => (
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="text-[10.5px] font-semibold text-neutral-500 hover:text-ink"
            onClick={() => nav(`/contacts/${c.id}`)}
          >
            عرض
          </button>
          <RowMenu
            items={[
              {
                label: "فتح التفاصيل",
                onClick: () => nav(`/contacts/${c.id}`),
              },
              { label: "تعديل", onClick: () => setModal(c) },
              {
                label: "مراسلة واتساب",
                onClick: () =>
                  window.open(waLink(c.phone), "_blank", "noopener"),
              },
              { label: "حذف", danger: true, onClick: () => setDel(c) },
            ]}
          />
        </div>
      ),
    },
  ];

  const exportCsv = () =>
    downloadCsv(
      "contacts.csv",
      [
        "الاسم",
        "النوع",
        "الهاتف",
        "البريد",
        "المشروع",
        "المسؤول",
        "المصدر",
        "الحالة",
        "آخر تواصل",
      ],
      filtered.map((c) => [
        c.name,
        c.kind,
        c.phone,
        c.email,
        c.project,
        c.owner,
        c.source,
        c.status,
        c.last,
      ]),
    );

  return (
    <div dir="rtl" className="space-y-4">
      <PageHeader
        title="جهات الاتصال والعملاء"
        subtitle="كل جهات الاتصال في مكان واحد، مع تفاصيل التواصل والمتابعة والمسؤول عن كل عميل"
      >
        <button className={btnLight} onClick={exportCsv}>
          <Download size={13} /> تصدير Excel
        </button>
        <button className={btnDark} onClick={() => setModal("add")}>
          <Plus size={13} /> إضافة جهة اتصال
        </button>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2">
        <SearchBox
          className="min-w-[240px] flex-[2]"
          value={q}
          onChange={(v) => {
            setQ(v);
          }}
          placeholder="ابحث بالاسم أو الهاتف أو البريد الإلكتروني"
        />
        <div className="w-[120px]">
          <Select value={status} onChange={setStatus}>
            {opt("كل الحالات", STATUSES)}
          </Select>
        </div>
        <div className="w-[120px]">
          <Select value={source} onChange={setSource}>
            {opt("كل المصادر", SOURCES)}
          </Select>
        </div>
        <div className="w-[120px]">
          <Select value={owner} onChange={setOwner}>
            {opt("كل المسؤولين", OWNERS)}
          </Select>
        </div>
        <div className="w-[130px]">
          <Select value={project} onChange={setProject}>
            {opt("كل المشاريع", PROJECTS)}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Users}
          tag="الكل"
          value={contacts.length}
          label="إجمالي جهات الاتصال"
        />
        <StatCard
          icon={UserCheck}
          tag="نشط"
          value={contacts.filter((c) => c.status === "نشط").length}
          label="عملاء نشطون"
        />
        <StatCard
          icon={Building2}
          tag="شركات"
          value={contacts.filter((c) => c.kind === "شركة").length}
          label="جهات ومؤسسات"
        />
        <StatCard
          icon={UserPlus}
          tag="آخر 30 يوماً"
          value={fresh}
          label="جهات اتصال جديدة"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {[
          ["all", "الكل"],
          ["فرد", "الأفراد"],
          ["شركة", "الشركات"],
        ].map(([k, l]) => (
          <Chip key={k} active={kind === k} onClick={() => setKind(k)}>
            {l}{" "}
            {k === "all"
              ? contacts.length
              : contacts.filter((c) => c.kind === k).length}
          </Chip>
        ))}
        {attn && (
          <button
            className="inline-flex h-7 items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-3 text-[10.5px] font-semibold text-orange-600"
            onClick={() => setAttn(false)}
          >
            قائمة المتابعة <X size={11} />
          </button>
        )}
      </div>

      <div className={`${card} overflow-hidden`}>
        <DataTable
          columns={columns}
          rows={pg.slice}
          rowKey={(c) => c.id}
          onRowClick={(c) => nav(`/contacts/${c.id}`)}
          minWidth={860}
        />
        <PagerBar
          page={pg.page}
          pages={pg.pages}
          onPage={pg.setPage}
          info={pg.info + (filtered.length ? " جهة اتصال" : "")}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className={`${card} p-4`}>
          <div className="flex items-center justify-between">
            <h2 className="text-[13px] font-semibold text-ink">
              عملاء يحتاجون اهتمامك
            </h2>
            <Badge tone="orange">{stale.length} عميل</Badge>
          </div>
          <p className="mt-3 text-[12px] font-semibold text-ink">
            {stale.length} عملاء لم يتم التواصل معهم منذ فترة أو في حالة متابعة
          </p>
          <p className="mt-1 text-[10.5px] text-neutral-500">
            {stale
              .slice(0, 3)
              .map((c) => c.name)
              .join("، ") || "لا يوجد عملاء حالياً"}
          </p>
          <button
            className="mt-3 text-[10.5px] font-semibold"
            style={{ color: ACCENT }}
            onClick={() => {
              setAttn(true);
              setKind("all");
              setStatus("all");
              pg.setPage(1);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            عرض قائمة المتابعة ←
          </button>
        </section>
        <section className={`${card} p-4`}>
          <h2 className="text-[13px] font-semibold text-ink">
            توزيع العملاء حسب المشروع
          </h2>
          <div className="mt-3 space-y-3">
            {byProject.map(([p, n]) => (
              <button
                key={p}
                className="block w-full text-right"
                onClick={() => setProject(project === p ? "all" : p)}
              >
                <div className="mb-1 flex justify-between text-[10.5px]">
                  <span className="font-semibold text-ink">{p}</span>
                  <span className="text-neutral-500">{n} عميل</span>
                </div>
                <div className="h-1.5 rounded-full bg-neutral-100">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${contacts.length ? (n / contacts.length) * 100 : 0}%`,
                      background: ACCENT,
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {modal && (
        <ContactForm
          contact={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSave={(v) => {
            if (modal === "add") {
              add(v);
              showToast("تمت إضافة جهة الاتصال");
            } else {
              update(modal.id, v);
              showToast("تم حفظ التعديلات");
            }
            setModal(null);
          }}
        />
      )}
      {del && (
        <Modal
          title="حذف جهة الاتصال"
          onClose={() => setDel(null)}
          onSubmit={() => {
            remove(del.id);
            setDel(null);
            showToast("تم الحذف");
          }}
          submitLabel="تأكيد الحذف"
        >
          <p className="col-span-2 text-[12px] text-neutral-600">
            هل تريد حذف «{del.name}» نهائياً؟ لا يمكن التراجع عن هذا الإجراء.
          </p>
        </Modal>
      )}
      {toast}
    </div>
  );
}
