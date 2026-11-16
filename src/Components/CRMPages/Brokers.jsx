import { Download, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  getPartners,
  createPartner,
  deletePartner,
} from "../../Services/partnerService.js";

import {
  Chip,
  PageHeader,
  PagerBar,
  SearchBox,
  Select,
  btnLight,
  card,
  downloadCsv,
  td,
  th,
} from "../Shared/ui.jsx";

const PAGE_SIZE = 7;

const EMPTY = {
  type: "وسيط",
  name: "",
  phone: "",
  email: "",
};

function validate(form, existing) {
  const errors = {};

  if (form.name.trim().length < 2) {
    errors.name = "الاسم مطلوب (حرفان على الأقل)";
  }

  const phone = form.phone.trim();

  if (!phone) {
    errors.phone = "رقم الهاتف مطلوب";
  } else if (existing.some((b) => b.phone === phone)) {
    errors.phone = "هذا الرقم مسجل بالفعل";
  }

  if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
    errors.email = "البريد الإلكتروني غير صحيح";
  }

  return errors;
}

function Input({ label, error, ...props }) {
  return (
    <label className="block">
      <span className="block mb-1.5 text-[11px] font-bold text-ink">
        {label}
      </span>

      <input
        {...props}
        className={`w-full h-10 rounded-lg border bg-white px-3 text-[11.5px] outline-none placeholder:text-neutral-400 focus:border-neutral-500 ${
          error ? "border-red-400" : "border-line"
        }`}
      />

      {error && (
        <span className="block mt-1 text-[10px] text-red-500">{error}</span>
      )}
    </label>
  );
}

function mapPartner(partner) {
  return {
    id: partner.id,
    name: partner.name || "",
    email: partner.email || "",
    phone: partner.phone || "",
    type: partner.type || "شريك",
  };
}

export default function Brokers() {
  const [list, setList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("success");

  // Fetch partners
  const fetchPartners = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPartners();

      setList(data.map(mapPartner));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "حدث خطأ أثناء تحميل الشركاء",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // Filter partners
  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();

    return list.filter(
      (b) =>
        (tab === "all" || b.type === tab) &&
        (!search ||
          [b.name, b.phone, b.email].some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(search),
          )),
    );
  }, [list, q, tab]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const cur = Math.min(page, pages);

  const rows = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);

  const from = filtered.length ? (cur - 1) * PAGE_SIZE + 1 : 0;

  const count = (type) => list.filter((b) => b.type === type).length;

  // CSV Export
  const exportCsv = () =>
    downloadCsv(
      "partners.csv",
      ["الاسم", "النوع", "البريد", "الهاتف"],
      filtered.map((b) => [b.name, b.type, b.email, b.phone]),
    );

  // Reset pagination
  const reset = (fn) => (value) => {
    fn(value);
    setPage(1);
  };

  // Form input
  const handleChange = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: undefined,
    }));
  };

  // Create partner
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate(form, list);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setSubmitting(true);
      setNotice("");

      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        type: form.type,
      };

      const createdPartner = await createPartner(payload);

      setList((prev) => [mapPartner(createdPartner), ...prev]);

      setForm({
        ...EMPTY,
        type: form.type,
      });

      setErrors({});
      setTab("all");
      setQ("");
      setPage(1);

      setNoticeType("success");
      setNotice(`تمت إضافة ${createdPartner.name} بنجاح`);
    } catch (err) {
      setNoticeType("error");
      setNotice(
        err.response?.data?.message ||
          err.message ||
          "حدث خطأ أثناء إضافة الشريك",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Delete partner
  const handleDelete = async (partner) => {
    if (!window.confirm(`هل تريد حذف «${partner.name}»؟`)) {
      return;
    }

    try {
      setDeletingId(partner.id);
      setNotice("");

      await deletePartner(partner.id);

      setList((prev) => prev.filter((b) => b.id !== partner.id));

      setNoticeType("success");
      setNotice(`تم حذف ${partner.name} بنجاح`);
    } catch (err) {
      setNoticeType("error");
      setNotice(
        err.response?.data?.message ||
          err.message ||
          "حدث خطأ أثناء حذف الشريك",
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div dir="rtl" className="max-w-full">
      <PageHeader
        title="الوسطاء والشركاء"
        subtitle="نظم علاقاتك مع شركاء النجاح وتابع الإحالات والصفقات وأداء كل شريك."
      >
        <button
          type="button"
          className="btn !bg-black text-white !rounded-lg h-9"
          onClick={() => document.getElementById("broker-name")?.focus()}
        >
          + إضافة شريك
        </button>

        <button type="button" className="btn" onClick={exportCsv}>
          <Download size={12} />
          تصدير الدليل
        </button>
      </PageHeader>

      {/* Search and filters */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SearchBox
          value={q}
          onChange={reset(setQ)}
          placeholder="ابحث باسم الوسيط أو الشريك أو رقم الهاتف"
          className="flex-1 min-w-[240px]"
        />

        <Select value={tab} onChange={reset(setTab)}>
          <option value="all">كل الأنواع</option>
          <option value="وسيط">وسيط</option>
          <option value="شريك">شريك</option>
        </Select>

        <button
          type="button"
          className={`${btnLight} !rounded-lg h-9`}
          onClick={exportCsv}
        >
          <Download size={12} />
          تصدير
        </button>
      </div>

      {/* Tabs */}
      <div className="my-5 flex gap-2">
        <Chip active={tab === "all"} onClick={() => reset(setTab)("all")}>
          الكل {list.length}
        </Chip>

        <Chip active={tab === "وسيط"} onClick={() => reset(setTab)("وسيط")}>
          وسطاء {count("وسيط")}
        </Chip>

        <Chip active={tab === "شريك"} onClick={() => reset(setTab)("شريك")}>
          شركاء {count("شريك")}
        </Chip>
      </div>

      <div className="mt-3 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 items-start">
        {/* Add Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className={`${card} p-4 space-y-3.5`}
        >
          <h2 className="text-[12.5px] font-semibold text-ink">
            إضافة وسيط أو شريك
          </h2>

          <div>
            <span className="block mb-1.5 text-[11px] font-bold text-ink">
              النوع
            </span>

            <div className="flex gap-2">
              {["وسيط", "شريك"].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      type,
                    }))
                  }
                  aria-pressed={form.type === type}
                  className={`h-8 px-5 rounded-full border text-[11px] font-semibold ${
                    form.type === type
                      ? "bg-ink text-white border-ink"
                      : "bg-white text-neutral-600 border-line"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <Input
            id="broker-name"
            label="الاسم"
            placeholder="اسم الوسيط أو الشريك"
            value={form.name}
            onChange={handleChange("name")}
            error={errors.name}
          />

          <Input
            label="الهاتف"
            placeholder="رقم الهاتف"
            inputMode="tel"
            dir="ltr"
            style={{ textAlign: "right" }}
            value={form.phone}
            onChange={handleChange("phone")}
            error={errors.phone}
          />

          <Input
            label="البريد الإلكتروني (اختياري)"
            placeholder="name@example.com"
            dir="ltr"
            style={{ textAlign: "right" }}
            value={form.email}
            onChange={handleChange("email")}
            error={errors.email}
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-10 rounded-full bg-ink text-white text-[12px] font-bold disabled:opacity-60"
          >
            {submitting ? "جاري الإضافة..." : "إضافة"}
          </button>

          {notice && (
            <p
              role="status"
              className={`text-[10.5px] text-center ${
                noticeType === "error" ? "text-red-500" : "text-green-600"
              }`}
            >
              {notice}
            </p>
          )}
        </form>

        {/* Partners Table */}
        <div className={`${card} p-3 min-w-0 flex flex-col justify-between`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] table-fixed">
              <thead className="bg-[#F7F8FA]">
                <tr>
                  <th className={`${th} w-[25%]`}>الاسم</th>

                  <th className={`${th} w-[30%]`}>البريد الإلكتروني</th>

                  <th className={`${th} w-[20%]`}>الهاتف</th>

                  <th className={`${th} w-[15%]`}>النوع</th>

                  <th className={`${th} w-[10%]`}></th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 block sm:table-row-group min-h-[420px]">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-[11px] text-neutral-400"
                    >
                      جاري تحميل الشركاء...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <p className="text-[11px] text-red-500 mb-3">{error}</p>

                      <button
                        type="button"
                        onClick={fetchPartners}
                        className="inline-flex items-center gap-2 text-[11px] text-ink"
                      >
                        <RefreshCw size={13} />
                        إعادة المحاولة
                      </button>
                    </td>
                  </tr>
                ) : rows.length ? (
                  rows.map((b) => (
                    <tr key={b.id} className="border-line">
                      <td
                        className={`${td} font-semibold text-[14px] truncate`}
                      >
                        {b.name}
                      </td>

                      <td
                        className={`${td} text-neutral-500 text-right truncate`}
                        dir="ltr"
                      >
                        {b.email || "—"}
                      </td>

                      <td className={`${td} text-right truncate`} dir="ltr">
                        {b.phone || "—"}
                      </td>

                      <td className={`${td} text-neutral-500 truncate`}>
                        {b.type}
                      </td>

                      <td className={`${td} text-center`}>
                        <button
                          type="button"
                          disabled={deletingId === b.id}
                          onClick={() => handleDelete(b)}
                          className="h-6 rounded-full border border-red-300 text-red-500 px-3 text-[10px] hover:bg-red-50 transition-colors disabled:opacity-50"
                        >
                          {deletingId === b.id ? "..." : "حذف"}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-[11px] text-neutral-400"
                    >
                      لا توجد نتائج
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div>
            <PagerBar
              page={cur}
              pages={pages}
              onPage={setPage}
              info={`عرض ${from}–${from ? from + rows.length - 1 : 0} من ${filtered.length} نتيجة`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
