import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Download,
  Users,
  UserCheck,
  UserPlus,
  X,
  RefreshCw,
} from "lucide-react";

import {
  PageHeader,
  SearchBox,
  Select,
  Chip,
  PagerBar,
  StatCard,
  btnDark,
  btnLight,
  card,
} from "../Shared/ui.jsx";

import {
  Badge,
  DataTable,
  RowMenu,
  usePaged,
  Ltr,
} from "../AccountingPages/Accountingui.jsx";

import {
  useContactsApi,
  STATUSES,
  daysSince,
  needsAttention,
  dmy,
  waLink,
} from "../../data/contacts.js";

import ContactForm from "./Contactform.jsx";

import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  exportCustomersPDF,
  exportCustomersExcel,
  getCustomerSources,
} from "../../Services/contactService.js";

const ACCENT = "#FF7E52";

const TONE = {
  نشط: "green",
  جديد: "gray",
  "يحتاج متابعة": "orange",
  "غير نشط": "red",
  مرفوض: "red",
};

const STATUS_MAP = {
  نشط: "active",
  "غير نشط": "inactive",
  مرفوض: "declined",
};

const sub = (contact) => {
  if (contact.kind === "فرد") {
    return `عميل فردي · ${contact.city || ""}`;
  }

  if (contact.kind === "شركة") {
    return `شركة · ${contact.city || ""}`;
  }

  return contact.address || "—";
};

export default function Contacts() {
  const nav = useNavigate();

  const { contacts, loading, error, refresh } = useContactsApi();

  const [sources, setSources] = useState([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [sourcesError, setSourcesError] = useState("");

  const [q, setQ] = useState("");
  const [source, setSource] = useState("all");
  const [status, setStatus] = useState("all");
  const [owner, setOwner] = useState("all");
  const [attn, setAttn] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [exporting, setExporting] = useState("");

  // Load customer sources from API
  const loadSources = async () => {
    try {
      setSourcesLoading(true);
      setSourcesError("");

      const data = await getCustomerSources();
      setSources(Array.isArray(data) ? data : []);
    } catch (error) {
      setSourcesError(
        error.response?.data?.message ||
          error.message ||
          "حدث خطأ أثناء تحميل مصادر العملاء",
      );
    } finally {
      setSourcesLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  // Get source ID from selected source
  const getSourceId = (formData) => {
    if (formData.sourceId != null && formData.sourceId !== "") {
      return Number(formData.sourceId);
    }

    if (formData.source_id != null && formData.source_id !== "") {
      return Number(formData.source_id);
    }

    const selectedSource = sources.find(
      (item) => item.name === formData.source,
    );

    return selectedSource?.id;
  };

  // Create or update customer
  const handleSave = async (formData) => {
    try {
      setSaving(true);
      setSaveError("");

      const payload = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone,
        whatsapp: formData.whatsapp || formData.phone,
        address: formData.address || null,
        notes: formData.notes || null,
        status: STATUS_MAP[formData.status] || formData.status,
      };

      const sourceId = getSourceId(formData);

      if (sourceId != null && !Number.isNaN(sourceId)) {
        payload.source_id = sourceId;
      }

      if (formData.owner) {
        payload.assigned_to = Number(formData.owner);
      } else if (editingContact) {
        payload.assigned_to = null;
      }

      if (editingContact) {
        await updateCustomer(editingContact.id, payload);
      } else {
        await createCustomer(payload);
      }

      await refresh();

      setShowForm(false);
      setEditingContact(null);
    } catch (error) {
      setSaveError(
        error.response?.data?.message ||
          error.message ||
          (editingContact
            ? "حدث خطأ أثناء تعديل بيانات العميل"
            : "حدث خطأ أثناء إضافة العميل"),
      );
    } finally {
      setSaving(false);
    }
  };

  // Move customer to recycle bin
  const handleDelete = async (contact) => {
    const confirmed = window.confirm(
      `هل أنتِ متأكدة من نقل العميل "${contact.name}" إلى سلة المهملات؟`,
    );

    if (!confirmed) return;

    try {
      setSaveError("");

      await deleteCustomer(contact.id);
      await refresh();
    } catch (error) {
      setSaveError(
        error.response?.data?.message ||
          error.message ||
          "حدث خطأ أثناء نقل العميل إلى سلة المهملات",
      );
    }
  };

  const openCreateForm = () => {
    setSaveError("");
    setEditingContact(null);
    setShowForm(true);
  };

  const openEditForm = (contact) => {
    setSaveError("");
    setEditingContact(contact);
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingContact(null);
  };

  // Export PDF or Excel using backend APIs
  const handleExport = async (type) => {
    try {
      setExporting(type);
      setSaveError("");

      if (type === "pdf") {
        await exportCustomersPDF();
      } else {
        await exportCustomersExcel();
      }
    } catch (error) {
      setSaveError(
        error.response?.data?.message ||
          error.message ||
          "حدث خطأ أثناء تصدير البيانات",
      );
    } finally {
      setExporting("");
    }
  };

  // Filter contacts
  const filtered = useMemo(() => {
    return contacts.filter((c) => {
     const selectedSource = sources.find((item) => String(item.id) === source);

     const contactSourceId =
       c.source_id ??
       c.sourceId ??
       c.raw?.source?.id ??
       (typeof c.source === "object" ? c.source?.id : null);

     const contactSourceName =
       typeof c.source === "string"
         ? c.source
         : c.source?.name || c.raw?.source?.name;

     const matchesSource =
       source === "all" ||
       String(contactSourceId ?? "") === source ||
       contactSourceName === selectedSource?.name;

      const matchesStatus = status === "all" || c.status === status;
      const matchesOwner = owner === "all" || c.owner === owner;
      const matchesAttention = !attn || needsAttention(c);

      const matchesSearch =
        !q ||
        `${c.name || ""} ${c.phone || ""} ${c.email || ""}`
          .toLowerCase()
          .includes(q.trim().toLowerCase());

      return (
        matchesSource &&
        matchesStatus &&
        matchesOwner &&
        matchesAttention &&
        matchesSearch
      );
    });
  }, [contacts, source, status, owner, attn, q]);

  const pg = usePaged(filtered, 8);

  const stale = contacts.filter(needsAttention);

  const fresh = contacts.filter(
    (c) => c.created && daysSince(c.created) <= 30,
  ).length;

  const opt = (all, list) => (
    <>
      <option value="all">{all}</option>

      {list.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </>
  );

  // Table columns
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
          <Ltr>{c.phone || "—"}</Ltr>
          <div dir="ltr" className="text-right text-[10px] text-neutral-400">
            {c.email || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "owner",
      label: "المسؤول",
      render: (c) => c.owner || "—",
    },
    {
      key: "source",
      label: "المصدر",
      render: (c) =>
        c.source?.name ||
        sources.find(
          (item) => String(item.id) === String(c.source_id ?? c.sourceId ?? ""),
        )?.name ||
        c.source ||
        "—",
    },
    {
      key: "status",
      label: "الحالة",
      render: (c) => (
        <Badge tone={TONE[c.status] || "gray"}>{c.status || "—"}</Badge>
      ),
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
          className="flex items-center gap-2"
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
                label: "تعديل بيانات العميل",
                onClick: () => openEditForm(c),
              },
              {
                label: "نقل إلى سلة المهملات",
                onClick: () => handleDelete(c),
              },
              {
                label: "فتح التفاصيل",
                onClick: () => nav(`/contacts/${c.id}`),
              },
              {
                label: "مراسلة واتساب",
                onClick: () =>
                  window.open(waLink(c.phone), "_blank", "noopener,noreferrer"),
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div dir="rtl" className="space-y-4">
      <PageHeader
        title="جهات الاتصال والعملاء"
        subtitle="كل جهات الاتصال في مكان واحد، مع تفاصيل التواصل والمتابعة والمسؤول عن كل عميل"
      >
        <button
          className={btnLight}
          onClick={() => handleExport("excel")}
          disabled={loading || contacts.length === 0 || exporting !== ""}
        >
          <Download size={13} />
          {exporting === "excel" ? "جاري التصدير..." : "تصدير Excel"}
        </button>

        <button
          className={btnLight}
          onClick={() => handleExport("pdf")}
          disabled={loading || contacts.length === 0 || exporting !== ""}
        >
          <Download size={13} />
          {exporting === "pdf" ? "جاري التصدير..." : "تصدير PDF"}
        </button>

        <button className={btnDark} onClick={openCreateForm}>
          <Plus size={13} />
          إضافة جهة اتصال
        </button>
      </PageHeader>

      {loading && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 text-center">
          <RefreshCw
            size={20}
            className="mx-auto mb-2 animate-spin text-neutral-400"
          />
          <p className="text-sm text-neutral-500">جاري تحميل جهات الاتصال...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          <p>{error}</p>
          <button onClick={refresh} className="mt-2 font-semibold underline">
            إعادة المحاولة
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <SearchBox
              className="min-w-[240px] flex-[2]"
              value={q}
              onChange={setQ}
              placeholder="ابحث بالاسم أو الهاتف أو البريد الإلكتروني"
            />

            <div className="w-[120px]">
              <Select value={status} onChange={setStatus}>
                {opt("كل الحالات", STATUSES)}
              </Select>
            </div>

            <div className="w-[160px]">
              <Select value={source} onChange={setSource}>
                <option value="all">كل المصادر</option>

                {sources.map((item) => (
                  <option key={item.id} value={String(item.id)}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="w-[140px]">
              <Select value={owner} onChange={setOwner}>
                {opt("كل المسؤولين", [
                  ...new Set(
                    contacts
                      .map((c) => c.owner)
                      .filter((value) => value && value !== "—"),
                  ),
                ])}
              </Select>
            </div>
          </div>

          {sourcesError && (
            <div className="flex items-center justify-between rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs text-orange-700">
              <span>{sourcesError}</span>
              <button
                onClick={loadSources}
                disabled={sourcesLoading}
                className="font-semibold underline"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* Statistics */}
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
              icon={UserPlus}
              tag="مرفوض"
              value={contacts.filter((c) => c.status === "مرفوض").length}
              label="عملاء مرفوضون"
            />

            <StatCard
              icon={Users}
              tag="آخر 30 يوماً"
              value={fresh}
              label="جهات اتصال جديدة"
            />
          </div>

          {/* Quick filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Chip active={!attn} onClick={() => setAttn(false)}>
              الكل {contacts.length}
            </Chip>

            <Chip
              active={attn}
              onClick={() => {
                setAttn(true);
                pg.setPage(1);
              }}
            >
              يحتاج متابعة {stale.length}
            </Chip>

            {attn && (
              <button
                className="inline-flex h-7 items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-3 text-[10.5px] font-semibold text-orange-600"
                onClick={() => setAttn(false)}
              >
                قائمة المتابعة
                <X size={11} />
              </button>
            )}
          </div>

          {/* Contacts Table */}
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

          {/* Follow-up and attention */}
          <section className={`${card} p-4`}>
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold text-ink">
                عملاء يحتاجون اهتمامك
              </h2>

              <Badge tone="orange">{stale.length} عميل</Badge>
            </div>

            <p className="mt-3 text-[12px] font-semibold text-ink">
              {stale.length} عملاء لم يتم التواصل معهم منذ فترة أو في حالة
              متابعة
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
                setStatus("all");
                setSource("all");
                pg.setPage(1);

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
            >
              عرض قائمة المتابعة ←
            </button>
          </section>
        </>
      )}

      {/* Add / Edit Contact Modal */}
      {showForm && (
        <ContactForm
          contact={editingContact}
          sources={sources}
          sourcesLoading={sourcesLoading}
          saving={saving}
          onClose={closeForm}
          onSave={handleSave}
        />
      )}

      {/* Save / Delete / Export Error */}
      {saveError && (
        <div className="fixed bottom-5 left-5 z-[100] max-w-sm rounded-xl border border-red-200 bg-white p-4 text-sm text-red-600 shadow-lg">
          {saveError}
        </div>
      )}
    </div>
  );
}
