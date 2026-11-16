import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Download,
  Repeat,
  Trash2,
  Undo2,
} from "lucide-react";

import {
  PageHeader,
  SearchBox,
  PagerBar,
  card,
  btnLight,
  downloadCsv,
  th,
  td,
} from "../Shared/ui.jsx";

import { Toast, useToast } from "../CRMPages/TaskModal.jsx";

import {
  getDeletedCustomers,
  restoreCustomer,
  forceDeleteCustomer,
} from "../../Services/contactService.js";

import {
  getDeletedLeads,
  restoreLead,
  forceDeleteLead,
} from "../../Services/leadService.js";

import {
  getDeletedDeals,
  restoreDeal,
  forceDeleteDeal,
} from "../../Services/dealService.js";

const RETENTION_DAYS = 30;
const SOON_DAYS = 7;

const PREVIEW = 8;
const PAGE_SIZE = 10;

const CHIPS = [
  ["all", "كل العناصر"],
  ["customers", "العملاء"],
  ["leads", "العملاء المحتملون"],
  ["deals", "الصفقات"],
];

/* ---------- helpers ---------- */

const getDeletedDate = (item) => {
  return item.deleted_at ? new Date(item.deleted_at) : null;
};

const daysSince = (item) => {
  const deletedDate = getDeletedDate(item);

  if (!deletedDate || Number.isNaN(deletedDate.getTime())) {
    return 0;
  }

  const now = new Date();

  const deleted = new Date(
    deletedDate.getFullYear(),
    deletedDate.getMonth(),
    deletedDate.getDate(),
  );

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return Math.max(0, Math.floor((today - deleted) / (1000 * 60 * 60 * 24)));
};

const daysLeft = (item) => {
  return Math.max(0, RETENTION_DAYS - daysSince(item));
};

const fmtStamp = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  const dateText = date.toLocaleDateString("en-GB");

  const timeText = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${dateText} · ${timeText}`;
};

const daysText = (n) =>
  n === 1
    ? "يوم واحد"
    : n === 2
      ? "يومان"
      : n <= 10
        ? `${n} أيام`
        : `${n} يومًا`;

/* ---------- local pieces ---------- */

function ArchiveStat({ icon: Icon, label, value, note, tone = "gray" }) {
  const tones = {
    gray: "text-neutral-500",
    green: "text-green-600",
    orange: "text-orange-600",
  };

  return (
    <div className={`${card} p-5`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[12px] font-semibold text-ink">{label}</span>

        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-line text-neutral-500">
          <Icon size={14} />
        </span>
      </div>

      <div
        className="mt-4 text-[26px] font-bold leading-none text-ink"
        dir="ltr"
        style={{ textAlign: "right" }}
      >
        {value}
      </div>

      <div className={`mt-3 text-[10.5px] ${tones[tone]}`}>{note}</div>
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-8 rounded-full border px-3.5 text-[11px] font-semibold transition-colors ${
        active
          ? "border-neutral-200 bg-neutral-200 text-ink"
          : "border-line bg-white text-neutral-600 hover:bg-neutral-50"
      }`}
    >
      {children}
    </button>
  );
}

function ConfirmDialog({ item, onConfirm, onClose, loading }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !loading) onClose();
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, loading]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
      onClick={() => {
        if (!loading) onClose();
      }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="del-title"
    >
      <div
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[380px] rounded-2xl bg-white p-5 shadow-xl"
      >
        <h2 id="del-title" className="text-[16px] font-semibold text-ink">
          حذف نهائي
        </h2>

        <p className="mt-2 text-[12px] leading-6 text-neutral-600">
          سيتم حذف «<b className="text-ink">{item.name}</b>» نهائيًا من النظام
          ولا يمكن استرجاعه بعد ذلك.
        </p>

        <div className="mt-5 flex items-center gap-2">
          <button
            onClick={() => onConfirm(item)}
            disabled={loading}
            className="h-9 rounded-full bg-red-600 px-5 text-[11.5px] font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "جاري الحذف..." : "حذف نهائيًا"}
          </button>

          <button
            onClick={onClose}
            disabled={loading}
            className="h-9 rounded-full border border-line bg-white px-5 text-[11.5px] font-semibold text-ink hover:bg-neutral-50 disabled:opacity-50"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- Archive page ---------- */

export default function Archive() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [all, setAll] = useState(false);
  const [page, setPage] = useState(1);

  const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const [toast, notify] = useToast();

  /* ---------- Fetch deleted customers, leads and deals ---------- */

  const fetchArchive = async () => {
    try {
      setLoading(true);

      const [customersResponse, leadsResponse, dealsResponse] =
        await Promise.all([
          getDeletedCustomers(),
          getDeletedLeads(),
          getDeletedDeals(),
        ]);

      const getArray = (response) => {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response?.data?.data)) {
          return response.data.data;
        }
        return [];
      };

      const customers = getArray(customersResponse).map((customer) => ({
        ...customer,
        type: "عميل",
        entityType: "customer",
        by: customer.deleted_by?.name || "-",
      }));

      const leads = getArray(leadsResponse).map((lead) => ({
        ...lead,
        type: "عميل محتمل",
        entityType: "lead",
        by: lead.deleted_by?.name || "-",
      }));

      const deals = getArray(dealsResponse).map((deal) => ({
        ...deal,
        type: "صفقة",
        entityType: "deal",
        by: deal.deleted_by?.name || "-",
      }));

      const combined = [...customers, ...leads, ...deals].sort(
        (a, b) => new Date(b.deleted_at || 0) - new Date(a.deleted_at || 0),
      );

      setItems(combined);
    } catch (error) {
      console.error("FETCH ARCHIVE ERROR:", error);

      notify(
        error.response?.data?.message ||
          error.message ||
          "حدث خطأ أثناء تحميل الأرشيف",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchive();
  }, []);

  /* ---------- Statistics ---------- */

  const thisWeek = items.filter((item) => daysSince(item) <= 6).length;

  const lastWeek = items.filter(
    (item) => daysSince(item) >= 7 && daysSince(item) <= 13,
  ).length;

  const soon = items.filter((item) => daysLeft(item) <= SOON_DAYS).length;

  const restorable = items.length - soon;

  const diff = thisWeek - lastWeek;

  /* ---------- Search and filters ---------- */

  const list = useMemo(() => {
    const search = q.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory =
        cat === "all" ||
        (cat === "customers" && item.entityType === "customer") ||
        (cat === "leads" && item.entityType === "lead") ||
        (cat === "deals" && item.entityType === "deal");

      const searchableValues = [
        item.name,
        item.number,
        item.email,
        item.phone,
        item.type,
        item.by,
      ];

      const matchesSearch =
        !search ||
        searchableValues.some((value) =>
          String(value || "")
            .toLowerCase()
            .includes(search),
        );

      return matchesCategory && matchesSearch;
    });
  }, [items, q, cat]);

  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));

  const cur = Math.min(page, pages);

  const rows = all
    ? list.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE)
    : list.slice(0, PREVIEW);

  const from = list.length ? (cur - 1) * PAGE_SIZE + 1 : 0;

  const reset = (fn) => (value) => {
    fn(value);
    setPage(1);
  };

  /* ---------- Restore customer, lead or deal ---------- */

  const restore = async (item) => {
    const busyKey = `${item.entityType}-${item.id}`;

    try {
      setBusyId(busyKey);

      if (item.entityType === "lead") {
        await restoreLead(item.id);
      } else if (item.entityType === "deal") {
        await restoreDeal(item.id);
      } else {
        await restoreCustomer(item.id);
      }

      setItems((prev) =>
        prev.filter(
          (current) =>
            !(
              current.entityType === item.entityType &&
              String(current.id) === String(item.id)
            ),
        ),
      );

      notify(`تم استرجاع «${item.name}» بنجاح`);
    } catch (error) {
      console.error("RESTORE ERROR:", error);

      notify(
        error.response?.data?.message || error.message || "فشل استرجاع العنصر",
      );
    } finally {
      setBusyId(null);
    }
  };

  /* ---------- Permanently delete customer, lead or deal ---------- */

  const destroy = async (item) => {
    try {
      setActionLoading(true);

      if (item.entityType === "lead") {
        await forceDeleteLead(item.id);
      } else if (item.entityType === "deal") {
        await forceDeleteDeal(item.id);
      } else {
        await forceDeleteCustomer(item.id);
      }

      setItems((prev) =>
        prev.filter(
          (current) =>
            !(
              current.entityType === item.entityType &&
              String(current.id) === String(item.id)
            ),
        ),
      );

      setConfirm(null);

      notify("تم حذف العنصر نهائيًا بنجاح");
    } catch (error) {
      console.error("FORCE DELETE ERROR:", error);

      notify(
        error.response?.data?.message ||
          error.message ||
          "فشل حذف العنصر نهائيًا",
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* ---------- Export ---------- */

  const exportArchive = () => {
    downloadCsv(
      "archive.csv",
      [
        "اسم العنصر",
        "النوع",
        "رقم الصفقة",
        "حذف بواسطة",
        "تاريخ الحذف",
        "المتبقي (يوم)",
        "الإيميل",
        "رقم الهاتف",
      ],
      list.map((item) => [
        item.name,
        item.type,
        item.number || "",
        item.by,
        fmtStamp(item.deleted_at),
        daysLeft(item),
        item.email || "",
        item.phone || "",
      ]),
    );
  };

  return (
    <div dir="rtl" className="max-w-full">
      <PageHeader
        title="الأرشيف"
        subtitle={`كل ما يتم حذفه من النظام يُحفظ هنا لمدة ${RETENTION_DAYS} يومًا — يمكنك استرجاعه أو حذفه نهائيًا.`}
      >
        <button
          onClick={exportArchive}
          disabled={!list.length}
          className={`${btnLight} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <Download size={12} />
          تصدير البيانات
        </button>
      </PageHeader>

      {/* Statistics */}

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <ArchiveStat
          icon={Undo2}
          label="إجمالي العناصر المؤرشفة"
          value={items.length}
          note={`منذ آخر ${RETENTION_DAYS} يومًا`}
          tone="orange"
        />

        <ArchiveStat
          icon={ArrowUp}
          label="محذوفة هذا الأسبوع"
          value={thisWeek}
          note={
            diff === 0
              ? "مثل الأسبوع الماضي"
              : `${diff > 0 ? "+" : "−"}${Math.abs(diff)} عن الأسبوع الماضي`
          }
        />

        <ArchiveStat
          icon={ArrowDown}
          label="قابلة للاسترجاع"
          value={restorable}
          note={`خلال ${RETENTION_DAYS} يومًا من الحذف`}
          tone="green"
        />

        <ArchiveStat
          icon={Repeat}
          label="تحذف نهائيًا قريبًا"
          value={soon}
          note={`خلال ${SOON_DAYS} أيام`}
          tone="green"
        />
      </div>

      {/* Search and filters */}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SearchBox
          value={q}
          onChange={reset(setQ)}
          placeholder="ابحث في الأرشيف..."
          className="w-full sm:w-[280px]"
        />

        <div className="flex flex-wrap gap-1.5">
          {CHIPS.map(([key, label]) => (
            <FilterChip
              key={key}
              active={cat === key}
              onClick={() => reset(setCat)(key)}
            >
              {label}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Archived customers, leads and deals table */}

      <section className={`${card} mt-4 overflow-hidden`}>
        <div className="flex flex-wrap items-start justify-between gap-2 p-5 pb-3">
          <div>
            <h2 className="text-[16px] font-semibold text-ink">
              العناصر المحذوفة
            </h2>

            <p className="mt-0.5 text-[10.5px] text-neutral-500">
              آخر العملاء والعملاء المحتملين والصفقات التي تم حذفها من النظام.
            </p>
          </div>

          {list.length > PREVIEW && (
            <button
              type="button"
              onClick={() => {
                setAll(!all);
                setPage(1);
              }}
              className="text-[11px] font-semibold text-ink hover:underline"
            >
              {all ? "عرض أقل" : "عرض الكل"}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead className="border-b border-line">
              <tr>
                {[
                  "العنصر المحذوف",
                  "النوع",
                  "حذف بواسطة",
                  "تاريخ الحذف",
                  "يُحذف نهائيًا خلال",
                  "الإجراءات",
                ].map((heading) => (
                  <th key={heading} className={th}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-10 text-center text-[11px] text-neutral-400"
                  >
                    جاري تحميل الأرشيف...
                  </td>
                </tr>
              ) : (
                <>
                  {rows.map((item) => {
                    const left = daysLeft(item);

                    const isBusy = busyId === `${item.entityType}-${item.id}`;

                    return (
                      <tr
                        key={`${item.entityType}-${item.id}`}
                        className="border-b border-line last:border-0 hover:bg-neutral-50/60"
                      >
                        <td className={`${td} !py-3 text-[12px]`}>
                          <div className="font-medium text-ink">
                            {item.name}
                          </div>

                          {item.entityType === "deal" && (
                            <div className="mt-1 text-[10px] text-neutral-400">
                              رقم الصفقة: {item.number || "-"}
                            </div>
                          )}

                          {item.entityType === "deal" && (
                            <div className="mt-1 text-[10px] text-neutral-400">
                              القيمة:{" "}
                              {Number(item.net_value || 0).toLocaleString(
                                "en-US",
                              )}{" "}
                              EGP
                            </div>
                          )}

                          {item.email && (
                            <div className="mt-1 text-[10px] text-neutral-400">
                              {item.email}
                            </div>
                          )}
                        </td>

                        <td className={td}>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] ${
                              item.entityType === "lead"
                                ? "bg-orange-50 text-orange-700"
                                : item.entityType === "deal"
                                  ? "bg-blue-50 text-blue-700"
                                  : "bg-neutral-100 text-neutral-600"
                            }`}
                          >
                            {item.type}
                          </span>
                        </td>

                        <td className={td}>{item.by}</td>

                        <td
                          className={`${td} text-neutral-600`}
                          dir="ltr"
                          style={{ textAlign: "right" }}
                        >
                          {fmtStamp(item.deleted_at)}
                        </td>

                        <td
                          className={`${td} ${
                            left <= SOON_DAYS
                              ? "font-semibold text-red-500"
                              : "text-neutral-600"
                          }`}
                        >
                          {daysText(left)}
                        </td>

                        <td className={td}>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => restore(item)}
                              disabled={isBusy || actionLoading}
                              className="h-7 rounded-md border border-line bg-white px-3 text-[10.5px] font-semibold text-ink hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isBusy ? "جاري الاسترجاع..." : "استرجاع"}
                            </button>

                            <button
                              onClick={() => setConfirm(item)}
                              disabled={isBusy || actionLoading}
                              aria-label={`حذف ${item.name} نهائيًا`}
                              className="grid h-6 w-6 place-items-center rounded-md border border-red-200 bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {!rows.length && (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-10 text-center text-[11px] text-neutral-400"
                      >
                        لا توجد عناصر مطابقة
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>

        {all && !loading && (
          <PagerBar
            page={cur}
            pages={pages}
            onPage={setPage}
            info={`عرض ${from}–${from ? from + rows.length - 1 : 0} من ${list.length} عنصرًا`}
          />
        )}
      </section>

      {/* Confirm permanent delete */}

      {confirm && (
        <ConfirmDialog
          item={confirm}
          onConfirm={destroy}
          loading={actionLoading}
          onClose={() => {
            if (!actionLoading) setConfirm(null);
          }}
        />
      )}

      <Toast message={toast} />
    </div>
  );
}
