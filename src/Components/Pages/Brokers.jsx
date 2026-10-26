import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { getBrokers, addBroker, removeBroker } from "../../data/brokers.js";
import {
  PageHeader,
  SearchBox,
  Select,
  Chip,
  PagerBar,
  card,
  btnDark,
  btnLight,
  downloadCsv,
  th,
  td,
} from "./ui.jsx";

const PAGE_SIZE = 7;
const EMPTY = { type: "وسيط", name: "", phone: "", email: "" };

function validate(f, existing) {
  const e = {};
  if (f.name.trim().length < 2) e.name = "الاسم مطلوب (حرفان على الأقل)";
  const phone = f.phone.trim();
  if (!phone) e.phone = "رقم الهاتف مطلوب";
  else if (!/^01[0125]\d{8}$/.test(phone))
    e.phone = "أدخل رقمًا مصريًا صحيحًا مثل 01012345678";
  else if (existing.some((b) => b.phone === phone))
    e.phone = "هذا الرقم مسجل بالفعل";
  if (f.email.trim() && !/^\S+@\S+\.\S+$/.test(f.email.trim()))
    e.email = "البريد الإلكتروني غير صحيح";
  return e;
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

export default function Brokers() {
  const [list, setList] = useState(getBrokers);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");
  const [source, setSource] = useState("all");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return list.filter(
      (b) =>
        (tab === "all" || b.type === tab) &&
        (source === "all" || b.source === source) &&
        (!s ||
          [b.name, b.phone, b.email].some((v) => v.toLowerCase().includes(s))),
    );
  }, [list, q, tab, source]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const rows = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const from = filtered.length ? (cur - 1) * PAGE_SIZE + 1 : 0;
  const count = (t) => list.filter((b) => b.type === t).length;

  const exportCsv = () =>
    downloadCsv(
      "brokers-partners.csv",
      ["الاسم", "النوع", "البريد", "الهاتف", "المصدر"],
      filtered.map((b) => [b.name, b.type, b.email, b.phone, b.source]),
    );

  const set = (k) => (e) => {
    setForm({ ...form, [k]: e.target.value });
    if (errors[k]) setErrors({ ...errors, [k]: undefined });
  };

  const submit = (e) => {
    e.preventDefault();
    const errs = validate(form, list);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setList(
      addBroker({
        ...form,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || "—",
      }),
    );
    setForm({ ...EMPTY, type: form.type });
    setPage(1);
    setNotice(`تمت إضافة ${form.name.trim()} بنجاح`);
    setTimeout(() => setNotice(""), 3000);
  };

  const remove = (b) => {
    if (window.confirm(`هل تريد حذف «${b.name}» نهائيًا؟`))
      setList(removeBroker(b.id));
  };

  const reset = (fn) => (v) => {
    fn(v);
    setPage(1);
  };

  return (
    <div dir="rtl" className=" max-w-full">
      <PageHeader
        title="الوسطاء والشركاء"
        subtitle="نظم علاقاتك مع شركاء النجاح وتابع الإحالات والصفقات وأداء كل شريك."
      >
        <button
          className="btn !bg-black text-white !rounded-lg h-9"
          onClick={() => document.getElementById("broker-name")?.focus()}
        >
          + إضافة شريك
        </button>
        <button className="btn" onClick={exportCsv}>
          <Download size={12} /> تصدير الدليل
        </button>
      </PageHeader>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SearchBox
          value={q}
          onChange={reset(setQ)}
          placeholder="ابحث باسم الوسيط أو الشريك أو رقم الهاتف"
          className="flex-1 min-w-[240px]"
        />
        <Select value={tab} onChange={reset(setTab)}>
          <option value="all">كل الحالات</option>
          <option>وسيط</option>
          <option>شريك</option>
        </Select>
        <Select value={source} onChange={reset(setSource)}>
          <option value="all">كل المسؤولين </option>
          <option>يدوي</option>
          <option>ملف Excel</option>
        </Select>
        <Select value={tab} onChange={reset(setTab)}>
          <option value="all">كل الأنواع</option>
          <option>وسيط</option>
          <option>شريك</option>
        </Select>

        <button className={`${btnLight} !rounded-lg h-9`} onClick={exportCsv}>
          <Download size={12} /> تصدير
        </button>
      </div>

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
        {/* Form (right in RTL) */}
        <form
          onSubmit={submit}
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
              {["وسيط", "شريك"].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setForm({ ...form, type: t })}
                  aria-pressed={form.type === t}
                  className={`h-8 px-5 rounded-full border text-[11px] font-semibold ${
                    form.type === t
                      ? "bg-ink text-white border-ink"
                      : "bg-white text-neutral-600 border-line"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <Input
            id="broker-name"
            label="الاسم"
            placeholder="اسم الوسيط أو الشريك"
            value={form.name}
            onChange={set("name")}
            error={errors.name}
          />
          <Input
            label="الهاتف"
            placeholder="01XXXXXXXXX"
            inputMode="numeric"
            dir="ltr"
            style={{ textAlign: "right" }}
            value={form.phone}
            onChange={set("phone")}
            error={errors.phone}
          />
          <Input
            label="البريد الإلكتروني (اختياري)"
            placeholder="name@example.com"
            dir="ltr"
            style={{ textAlign: "right" }}
            value={form.email}
            onChange={set("email")}
            error={errors.email}
          />
          <button
            type="submit"
            className="w-full h-10 rounded-full bg-ink text-white text-[12px] font-bold"
          >
            إضافة
          </button>
          {notice && (
            <p
              role="status"
              className="text-[10.5px] text-green-600 text-center"
            >
              {notice}
            </p>
          )}
        </form>

        {/* Table */}
        <div className={`${card} p-3 min-w-0 flex flex-col justify-between`}>
          <div className="overflow-x-auto">
            {/* إضافة table-fixed تمنع تغيير عرض الأعمدة بناءً على طول النص */}
            <table className="w-full min-w-[560px] table-fixed">
              <thead className="bg-[#F7F8FA]">
                <tr>
                  {/* تحديد عرض ثابت نسبي لكل عمود */}
                  <th className={`${th} w-[25%]`}>الاسم</th>
                  <th className={`${th} w-[30%]`}>البريد الإلكتروني</th>
                  <th className={`${th} w-[20%]`}>الهاتف</th>
                  <th className={`${th} w-[15%]`}>المصدر</th>
                  <th className={`${th} w-[10%]`}></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 block sm:table-row-group min-h-[420px]">
                {rows.map((b) => (
                  <tr key={b.id} className="border-line">
                    <td className={`${td} font-semibold text-[14px] truncate`}>
                      {b.name}
                    </td>
                    <td
                      className={`${td} text-neutral-500 text-right truncate`}
                      dir="ltr"
                    >
                      {b.email}
                    </td>
                    <td className={`${td} text-right truncate`} dir="ltr">
                      {b.phone}
                    </td>
                    <td className={`${td} text-neutral-500 truncate`}>
                      {b.source}
                    </td>
                    <td className={`${td} text-center`}>
                      <button
                        onClick={() => remove(b)}
                        className="h-6 rounded-full border border-red-300 text-red-500 px-3 text-[10px] hover:bg-red-50 transition-colors"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
                {!rows.length && (
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

          <div >
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
