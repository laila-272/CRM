import {
  AlignLeft,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckSquare,
  ChevronsUpDown,
  CircleDot,
  Copy,
  Download,
  GripVertical,
  ListChecks,
  Mail,
  Monitor,
  Phone,
  Send,
  Smartphone,
  Trash2,
  Type,
  Upload,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  FIELD_DEFAULTS,
  OPTIONS,
  THEME_COLORS,
  getResponses,
  loadForm,
  saveForm,
} from "../../data/forms.js";
import {
  PageHeader,
  PagerBar,
  SearchBox,
  Select,
  btnDark,
  btnLight,
  card,
  downloadCsv,
  td,
  th,
} from "../Shared/ui.jsx";
import { Toast, useToast } from "./TaskModal.jsx";

const PALETTE = [
  ["text", "نص قصير", Type],
  ["phone", "رقم الهاتف", Phone],
  ["email", "البريد الإلكتروني", Mail],
  ["select", "قائمة منسدلة", ChevronsUpDown],
  ["multi", "اختيار متعدد", ListChecks],
  ["radio", "اختيار واحد", CircleDot],
  ["date", "تاريخ", CalendarDays],
  ["textarea", "نص طويل", AlignLeft],
  ["file", "رفع ملف", Upload],
  ["consent", "موافقة", CheckSquare],
];
const HAS_OPTIONS = ["select", "multi", "radio"];
const HAS_PLACEHOLDER = ["text", "phone", "email", "select", "textarea"];
const PAGE_SIZE = 8;

const inputCls =
  "w-full h-9 rounded-lg border border-line bg-white px-3 text-[12px] outline-none focus:border-neutral-500 placeholder:text-neutral-400";

const timeLabel = (iso) => {
  if (!iso) return "لم يُحفظ بعد";
  const d = new Date(iso);
  const h = d.getHours();
  return `${String(h % 12 || 12).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} ${h >= 12 ? "م" : "ص"}`;
};

function Switch({ on, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${on ? "bg-ink" : "bg-neutral-300"}`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${on ? "right-[18px]" : "right-0.5"}`}
      />
    </button>
  );
}

function Labeled({ label, children }) {
  return (
    <label className="block">
      <span className="block mb-1.5 text-[11px] font-bold text-ink">
        {label}
      </span>
      {children}
    </label>
  );
}

/* ---------- Field rendering inside the preview ---------- */
function FieldInput({ f, value, onChange, color }) {
  const base =
    "w-full rounded-lg border bg-white px-3 text-[12px] outline-none focus:border-neutral-500 placeholder:text-neutral-400";
  switch (f.type) {
    case "textarea":
      return (
        <textarea
          rows={3}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={f.placeholder}
          className={`${base} py-2 resize-none border-line`}
        />
      );
    case "select":
      return (
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={`${base} h-10 border-line`}
        >
          <option value="">{f.placeholder || "اختر"}</option>
          {(f.options || []).map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      );
    case "multi": {
      const cur = value || [];
      return (
        <div className="space-y-1.5">
          {(f.options || []).map((o) => (
            <label
              key={o}
              className="flex items-center gap-2 text-[12px] text-ink"
            >
              <input
                type="checkbox"
                checked={cur.includes(o)}
                style={{ accentColor: color }}
                onChange={() =>
                  onChange(
                    cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o],
                  )
                }
              />
              {o}
            </label>
          ))}
        </div>
      );
    }
    case "radio":
      return (
        <div className="flex flex-wrap gap-4">
          {(f.options || []).map((o) => (
            <label
              key={f.id + o}
              className="flex items-center gap-2 text-[12px] text-ink"
            >
              <input
                type="radio"
                name={f.id}
                checked={value === o}
                onChange={() => onChange(o)}
                style={{ accentColor: color }}
              />
              {o}
            </label>
          ))}
        </div>
      );
    case "date":
      return (
        <input
          type="date"
          dir="ltr"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={`${base} h-10 border-line`}
        />
      );
    case "file":
      return (
        <input
          type="file"
          onChange={(e) => onChange(e.target.files?.[0]?.name || "")}
          className="block w-full text-[11px] text-neutral-500 file:me-3 file:rounded-md file:border file:border-line file:bg-white file:px-3 file:py-1.5 file:text-[11px]"
        />
      );
    default:
      return (
        <input
          type={f.type === "email" ? "email" : "text"}
          dir={f.type === "phone" || f.type === "email" ? "ltr" : undefined}
          style={
            f.type === "phone" || f.type === "email"
              ? { textAlign: "right" }
              : undefined
          }
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={f.placeholder}
          className={`${base} h-10 border-line`}
        />
      );
  }
}

function validateValues(fields, values) {
  const err = {};
  fields.forEach((f) => {
    const v = values[f.id];
    const empty =
      v === undefined ||
      v === "" ||
      v === false ||
      (Array.isArray(v) && !v.length);
    if (f.required && empty) err[f.id] = "هذا الحقل مطلوب";
    else if (!empty && f.type === "phone" && !/^01[0125]\d{8}$/.test(v))
      err[f.id] = "أدخل رقم هاتف مصري صحيح";
    else if (!empty && f.type === "email" && !/^\S+@\S+\.\S+$/.test(v))
      err[f.id] = "البريد الإلكتروني غير صحيح";
  });
  return err;
}

/* ---------- Inline editor for the selected field ---------- */
function FieldEditor({ f, onChange }) {
  return (
    <div
      className="mt-2 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-3 space-y-2.5"
      onClick={(e) => e.stopPropagation()}
    >
      <Labeled label="عنوان الحقل">
        <input
          className={inputCls}
          value={f.label}
          onChange={(e) => onChange({ label: e.target.value })}
        />
      </Labeled>
      {HAS_PLACEHOLDER.includes(f.type) && (
        <Labeled label="النص التوضيحي">
          <input
            className={inputCls}
            value={f.placeholder || ""}
            onChange={(e) => onChange({ placeholder: e.target.value })}
          />
        </Labeled>
      )}
      {HAS_OPTIONS.includes(f.type) && (
        <Labeled label="الخيارات (خيار في كل سطر)">
          <textarea
            rows={4}
            className="w-full rounded-lg border border-line bg-white p-2 text-[12px] outline-none focus:border-neutral-500"
            value={(f.options || []).join("\n")}
            onChange={(e) => onChange({ options: e.target.value.split("\n") })}
            onBlur={(e) =>
              onChange({
                options: e.target.value
                  .split("\n")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </Labeled>
      )}
      <label className="flex items-center gap-2 text-[11px] text-ink">
        <input
          type="checkbox"
          checked={!!f.required}
          onChange={(e) => onChange({ required: e.target.checked })}
        />{" "}
        حقل مطلوب
      </label>
    </div>
  );
}

/* ---------- Tabs other than the designer ---------- */
function ResponsesTab() {
  const all = useMemo(getResponses, []);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return all.filter(
      (r) =>
        !s ||
        [r.name, r.phone, r.email, r.unit].some((v) =>
          v.toLowerCase().includes(s),
        ),
    );
  }, [all, q]);
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const cur = Math.min(page, pages);
  const rows = list.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const from = list.length ? (cur - 1) * PAGE_SIZE + 1 : 0;
  return (
    <section className={`${card} p-4`}>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <SearchBox
          value={q}
          onChange={(v) => {
            setQ(v);
            setPage(1);
          }}
          placeholder="ابحث في الردود بالاسم أو الهاتف"
          className="flex-1 min-w-[220px]"
        />
        <button
          className={btnLight}
          onClick={() =>
            downloadCsv(
              "form-responses.csv",
              [
                "الاسم",
                "الهاتف",
                "البريد",
                "نوع الوحدة",
                "الميزانية",
                "التاريخ",
              ],
              list.map((r) => [
                r.name,
                r.phone,
                r.email,
                r.unit,
                r.budget,
                r.date,
              ]),
            )
          }
        >
          <Download size={12} /> تصدير
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead className="bg-neutral-50/70">
            <tr>
              {[
                "الاسم",
                "الهاتف",
                "البريد الإلكتروني",
                "نوع الوحدة",
                "الميزانية",
                "التاريخ",
              ].map((h) => (
                <th key={h} className={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className={`${td} font-bold`}>{r.name}</td>
                <td className={td} dir="ltr" style={{ textAlign: "right" }}>
                  {r.phone}
                </td>
                <td
                  className={`${td} text-neutral-500`}
                  dir="ltr"
                  style={{ textAlign: "right" }}
                >
                  {r.email}
                </td>
                <td className={td}>{r.unit}</td>
                <td className={td}>{r.budget}</td>
                <td className={`${td} text-neutral-500`}>{r.date}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td
                  colSpan={6}
                  className="p-8 text-center text-[11px] text-neutral-400"
                >
                  لا توجد ردود مطابقة
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <PagerBar
        page={cur}
        pages={pages}
        onPage={setPage}
        info={`عرض ${from}–${from ? from + rows.length - 1 : 0} من ${list.length} رد`}
      />
    </section>
  );
}

function InfoTab({ form, setIn }) {
  const f = (k, label, multi) => (
    <Labeled label={label} key={k}>
      {multi ? (
        <textarea
          rows={3}
          className="w-full rounded-lg border border-line p-3 text-[12px] outline-none focus:border-neutral-500"
          value={form.info[k]}
          onChange={(e) => setIn("info", { [k]: e.target.value })}
        />
      ) : (
        <input
          className={inputCls}
          value={form.info[k]}
          onChange={(e) => setIn("info", { [k]: e.target.value })}
        />
      )}
    </Labeled>
  );
  return (
    <section className={`${card} p-4 max-w-[640px] space-y-3.5`}>
      <h2 className="text-[14px] font-extrabold text-ink">إعدادات النموذج</h2>
      <Labeled label="اسم النموذج (داخلي)">
        <input
          className={inputCls}
          value={form.name}
          onChange={(e) => setIn(null, { name: e.target.value })}
        />
      </Labeled>
      {f("company", "اسم الشركة")}
      {f("badge", "اسم المشروع (الشارة)")}
      {f("heading", "العنوان الرئيسي")}
      {f("description", "الوصف", true)}
      {f("privacy", "ملاحظة الخصوصية")}
    </section>
  );
}

function ShareTab({ form, notify }) {
  const json = JSON.stringify(
    {
      name: form.name,
      info: form.info,
      appearance: form.appearance,
      after: form.after,
      fields: form.fields,
    },
    null,
    2,
  );
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      notify("تم نسخ تعريف النموذج");
    } catch {
      notify("تعذر النسخ، حدد النص يدويًا");
    }
  };
  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([json], { type: "application/json" }),
    );
    a.download = "form-definition.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <section className={`${card} p-4`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          <h2 className="text-[14px] font-extrabold text-ink">
            المشاركة والتصدير
          </h2>
          <p className="text-[10.5px] text-neutral-500 mt-0.5">
            صدّر تعريف النموذج (الحقول والمظهر وإعدادات ما بعد الإرسال)
            لاستخدامه في موقعك أو ربطه بالـ API.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={copy} className={btnLight}>
            <Copy size={12} /> نسخ
          </button>
          <button onClick={download} className={btnDark}>
            <Download size={12} /> تنزيل JSON
          </button>
        </div>
      </div>
      <pre
        dir="ltr"
        className="max-h-[420px] overflow-auto rounded-lg bg-neutral-50 border border-line p-3 text-[10.5px] leading-relaxed text-neutral-700"
      >
        {json}
      </pre>
    </section>
  );
}

/* ---------- Page ---------- */
export default function FormBuilder() {
  const [form, setForm] = useState(loadForm);
  const [savedStr, setSavedStr] = useState(() => JSON.stringify(loadForm()));
  const [tab, setTab] = useState("design");
  const [device, setDevice] = useState("desktop");
  const [selected, setSelected] = useState(null);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [toast, notify] = useToast();
  const drag = useRef(null);

  const dirty = JSON.stringify(form) !== savedStr;
  const color = form.appearance.color;
  const dir = form.appearance.lang === "en" ? "ltr" : "rtl";

  const setIn = (section, patch) =>
    setForm((f) =>
      section
        ? { ...f, [section]: { ...f[section], ...patch } }
        : { ...f, ...patch },
    );
  const setFields = (fn) => setForm((f) => ({ ...f, fields: fn(f.fields) }));
  const updateField = (id, patch) =>
    setFields((fs) => fs.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const newId = () => `f${Date.now()}${Math.floor(Math.random() * 100)}`;
  const addField = (type, beforeId) => {
    const nf = { id: newId(), type, required: false, ...FIELD_DEFAULTS[type] };
    setFields((fs) => {
      const i = beforeId ? fs.findIndex((x) => x.id === beforeId) : -1;
      return i < 0 ? [...fs, nf] : [...fs.slice(0, i), nf, ...fs.slice(i)];
    });
    setSelected(nf.id);
  };
  const removeField = (id) => {
    setFields((fs) => fs.filter((x) => x.id !== id));
    setSelected(null);
  };
  const duplicate = (id) =>
    setFields((fs) => {
      const i = fs.findIndex((x) => x.id === id);
      const copy = { ...fs[i], id: newId() };
      return [...fs.slice(0, i + 1), copy, ...fs.slice(i + 1)];
    });
  const move = (id, delta) =>
    setFields((fs) => {
      const i = fs.findIndex((x) => x.id === id);
      const j = i + delta;
      if (j < 0 || j >= fs.length) return fs;
      const next = [...fs];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  const dropOn = (targetId) => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    if (d.kind === "palette") return addField(d.type, targetId);
    if (d.id === targetId) return;
    setFields((fs) => {
      const item = fs.find((x) => x.id === d.id);
      const rest = fs.filter((x) => x.id !== d.id);
      const i = targetId ? rest.findIndex((x) => x.id === targetId) : -1;
      return i < 0
        ? [...rest, item]
        : [...rest.slice(0, i), item, ...rest.slice(i)];
    });
  };

  const persist = (status) => {
    const saved = saveForm({ ...form, status });
    setForm(saved);
    setSavedStr(JSON.stringify(saved));
    notify(status === "منشور" ? "تم نشر التعديلات" : "تم حفظ المسودة");
  };

  const submitPreview = (e) => {
    e.preventDefault();
    const err = validateValues(form.fields, values);
    setErrors(err);
    if (!Object.keys(err).length) setSubmitted(true);
  };

  const tabs = [
    ["design", "تصميم النموذج"],
    ["settings", "إعدادات النموذج"],
    ["share", "المشاركة والتصدير"],
    ["responses", `الردود ${getResponses().length}`],
  ];

  return (
    <div dir="rtl" className="max-w-full">
      <PageHeader
        title="منشئ النماذج"
        subtitle="ابنِ نموذجك لجمع العملاء المحتملين واربطه بمراحل المبيعات القادمة."
      >
        <button onClick={() => persist("منشور")} className={btnDark}>
          <Send size={13} /> نشر التعديلات
        </button>
      </PageHeader>

      {/* Form name bar */}
      <div
        className={`${card} mt-4 flex flex-wrap items-center justify-between gap-3 px-4 py-2.5`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] text-neutral-500">طلب:</span>
          <input
            value={form.name}
            onChange={(e) => setIn(null, { name: e.target.value })}
            aria-label="اسم النموذج"
            className="min-w-[200px] bg-transparent text-[12.5px] font-bold text-ink outline-none border-b border-transparent focus:border-neutral-400"
          />
          <span
            className={`text-[9.5px] font-semibold rounded-full px-2 py-0.5 ${form.status === "منشور" ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"}`}
          >
            {form.status}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-neutral-400">
            {dirty
              ? "تعديلات غير محفوظة"
              : `تم الحفظ آخر ${timeLabel(form.savedAt)}`}
          </span>
          <button onClick={() => persist("مسودة")} className={btnLight}>
            حفظ كمسودة
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex flex-wrap gap-2" role="tablist">
        {tabs.map(([k, label]) => (
          <button
            key={k}
            role="tab"
            aria-selected={tab === k}
            onClick={() => setTab(k)}
            className={`h-8 rounded-full px-4 text-[11.5px] font-semibold border ${tab === k ? "bg-ink text-white border-ink" : "bg-[#F1F2F4] text-neutral-500 border-line hover:text-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === "settings" && <InfoTab form={form} setIn={setIn} />}
        {tab === "share" && <ShareTab form={form} notify={notify} />}
        {tab === "responses" && <ResponsesTab />}

        {tab === "design" && (
          <div className="grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)_250px] gap-4 items-start">
            {/* Right column: palette + appearance */}
            <div className="space-y-4">
              <section className={`${card} p-4`}>
                <h2 className="text-[15px] font-semibold text-ink">
                  إضافة حقل
                </h2>
                <p className="mt-1 mb-3 text-[10px] text-neutral-500">
                  اضغط أو اسحب الحقل إلى النموذج
                </p>
                <ul className="space-y-2">
                  {PALETTE.map(([type, label, Icon]) => (
                    <li key={type}>
                      <button
                        draggable
                        onDragStart={() =>
                          (drag.current = { kind: "palette", type })
                        }
                        onClick={() => addField(type)}
                        className="flex w-full items-center gap-2 rounded-lg border border-line bg-white px-3 h-10 text-[11.5px] text-ink hover:bg-neutral-50 cursor-grab"
                      >
                        <Icon size={14} className="text-neutral-500" />
                        <span className="flex-1 text-right">{label}</span>
                        <GripVertical size={13} className="text-neutral-300" />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>

              <section className={`${card} p-4 space-y-3.5`}>
                <h2 className="text-[15px] font-semibold text-ink">
                  إعدادات المظهر
                </h2>
                <Labeled label="عنوان الزر">
                  <input
                    className={inputCls}
                    value={form.appearance.buttonLabel}
                    onChange={(e) =>
                      setIn("appearance", { buttonLabel: e.target.value })
                    }
                  />
                </Labeled>
                <div>
                  <span className="block mb-1.5 text-[11px] font-bold text-ink">
                    لون الزر الأساسي
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      aria-label="لون الزر"
                      value={color}
                      onChange={(e) =>
                        setIn("appearance", { color: e.target.value })
                      }
                      className="h-8 w-8 cursor-pointer rounded border border-line bg-white p-0.5"
                    />
                    {THEME_COLORS.map((c) => (
                      <button
                        key={c}
                        aria-label={c}
                        onClick={() => setIn("appearance", { color: c })}
                        className={`h-6 w-6 rounded-full border ${color === c ? "ring-2 ring-offset-1 ring-neutral-400" : "border-line"}`}
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
                <Labeled label="لغة النموذج">
                  <Select
                    value={form.appearance.lang}
                    onChange={(v) => setIn("appearance", { lang: v })}
                  >
                    <option value="ar">العربية · RTL</option>
                    <option value="en">English · LTR</option>
                  </Select>
                </Labeled>
              </section>
            </div>

            {/* Center: canvas */}
            <section className="rounded-xl border border-line bg-neutral-100/70 p-4 min-w-0">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex gap-1">
                  {[
                    ["mobile", Smartphone, "موبايل"],
                    ["desktop", Monitor, "سطح المكتب"],
                  ].map(([k, Icon, label]) => (
                    <button
                      key={k}
                      aria-label={label}
                      aria-pressed={device === k}
                      onClick={() => setDevice(k)}
                      className={`h-7 w-7 grid place-items-center rounded-md ${device === k ? "bg-ink text-white" : "bg-white text-neutral-500 border border-line"}`}
                    >
                      <Icon size={13} />
                    </button>
                  ))}
                </div>
                <span className="text-[9.5px] text-neutral-400">
                  معاينة مباشرة · {form.fields.length} حقول
                </span>
              </div>

              <div
                dir={dir}
                className={`mx-auto rounded-xl bg-white border border-line p-5 transition-all ${device === "mobile" ? "max-w-[340px]" : "max-w-[620px]"}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => dropOn(null)}
              >
                {submitted ? (
                  <div className="py-10 text-center">
                    <p className="text-[15px] font-bold text-ink">
                      {form.after.successMessage}
                    </p>
                    <p className="mt-1 text-[10.5px] text-neutral-400">
                      (وضع المعاينة: لا يتم حفظ هذا الرد)
                    </p>
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setValues({});
                      }}
                      className={`${btnLight} mt-4`}
                    >
                      العودة إلى النموذج
                    </button>
                  </div>
                ) : (
                  <form onSubmit={submitPreview} noValidate>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-ink">
                        {form.info.company}
                      </span>
                      <span className="text-[9.5px] rounded-full bg-orange-50 px-2 py-0.5 text-orange-600">
                        {form.info.badge}
                      </span>
                    </div>
                    <h2 className="mt-5 text-[24px] font-extrabold leading-tight text-ink">
                      {form.info.heading}
                    </h2>
                    <p className="mt-2 text-[11px] text-neutral-500">
                      {form.info.description}
                    </p>

                    <div className="mt-5 space-y-4">
                      {form.fields.map((f) => {
                        const sel = selected === f.id;
                        return (
                          <div
                            key={f.id}
                            draggable
                            onDragStart={() =>
                              (drag.current = { kind: "field", id: f.id })
                            }
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.stopPropagation();
                              dropOn(f.id);
                            }}
                            onClick={() => setSelected(sel ? null : f.id)}
                            className={`rounded-lg p-2 -m-2 cursor-pointer ${sel ? "ring-1 ring-neutral-400 bg-neutral-50/60" : "hover:bg-neutral-50"}`}
                          >
                            {sel && (
                              <div
                                className="mb-2 flex items-center gap-1 text-neutral-500"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <GripVertical
                                  size={13}
                                  className="cursor-grab"
                                />
                                <button
                                  type="button"
                                  aria-label="للأعلى"
                                  onClick={() => move(f.id, -1)}
                                  className="p-1 hover:text-ink"
                                >
                                  <ArrowUp size={13} />
                                </button>
                                <button
                                  type="button"
                                  aria-label="للأسفل"
                                  onClick={() => move(f.id, 1)}
                                  className="p-1 hover:text-ink"
                                >
                                  <ArrowDown size={13} />
                                </button>
                                <button
                                  type="button"
                                  aria-label="تكرار"
                                  onClick={() => duplicate(f.id)}
                                  className="p-1 hover:text-ink"
                                >
                                  <Copy size={13} />
                                </button>
                                <button
                                  type="button"
                                  aria-label="حذف الحقل"
                                  onClick={() => removeField(f.id)}
                                  className="p-1 text-red-500"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                            {f.type !== "consent" && (
                              <span className="mb-1.5 block text-[11px] font-bold text-ink">
                                {f.label}{" "}
                                {f.required && (
                                  <b className="text-red-500">*</b>
                                )}
                              </span>
                            )}
                            <div onClick={(e) => sel && e.stopPropagation()}>
                              {f.type === "consent" ? (
                                <label className="flex items-start gap-2 text-[11px] text-neutral-600">
                                  <input
                                    type="checkbox"
                                    className="mt-0.5"
                                    style={{ accentColor: color }}
                                    checked={!!values[f.id]}
                                    onChange={(e) =>
                                      setValues({
                                        ...values,
                                        [f.id]: e.target.checked,
                                      })
                                    }
                                  />
                                  <span>
                                    {f.label}{" "}
                                    {f.required && (
                                      <b className="text-red-500">*</b>
                                    )}
                                  </span>
                                </label>
                              ) : (
                                <FieldInput
                                  f={f}
                                  value={values[f.id]}
                                  color={color}
                                  onChange={(v) =>
                                    setValues({ ...values, [f.id]: v })
                                  }
                                />
                              )}
                            </div>
                            {errors[f.id] && (
                              <span className="mt-1 block text-[10px] text-red-500">
                                {errors[f.id]}
                              </span>
                            )}
                            {sel && (
                              <FieldEditor
                                f={f}
                                onChange={(p) => updateField(f.id, p)}
                              />
                            )}
                          </div>
                        );
                      })}
                      {!form.fields.length && (
                        <div className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-[11px] text-neutral-400">
                          اسحب حقلاً من القائمة أو اضغط عليه لإضافته
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      style={{ background: color }}
                      className="mt-6 h-11 w-full rounded-lg text-[13px] font-bold text-white"
                    >
                      {form.appearance.buttonLabel}
                    </button>
                    <p className="mt-3 text-center text-[10px] text-neutral-400">
                      {form.info.privacy}
                    </p>
                  </form>
                )}
              </div>
              <p className="mt-3 text-center text-[10px] text-neutral-400">
                النموذج متوافق مع الموبايل ويدعم العربية من اليمين لليسار.
              </p>
            </section>

            {/* Left column: after submit */}
            <section className={`${card} p-4 space-y-3.5`}>
              <h2 className="text-[15px] font-semibold text-ink">
                بعد إرسال النموذج
              </h2>
              <Labeled label="مصدر العميل">
                <Select
                  value={form.after.source}
                  onChange={(v) => setIn("after", { source: v })}
                >
                  {OPTIONS.sources.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </Select>
              </Labeled>
              <Labeled label="المرحلة الافتراضية">
                <Select
                  value={form.after.stage}
                  onChange={(v) => setIn("after", { stage: v })}
                >
                  {OPTIONS.stages.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </Select>
              </Labeled>
              <Labeled label="تعيين المسؤول">
                <Select
                  value={form.after.owner}
                  onChange={(v) => setIn("after", { owner: v })}
                >
                  {OPTIONS.owners.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </Select>
              </Labeled>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] font-bold text-ink">
                    إشعار المسؤول
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    عند وصول رد جديد
                  </div>
                </div>
                <Switch
                  on={form.after.notify}
                  label="إشعار المسؤول"
                  onChange={(v) => setIn("after", { notify: v })}
                />
              </div>
              <Labeled label="رسالة النجاح">
                <textarea
                  rows={4}
                  value={form.after.successMessage}
                  onChange={(e) =>
                    setIn("after", { successMessage: e.target.value })
                  }
                  className="w-full resize-none rounded-lg border border-line p-3 text-[12px] outline-none focus:border-neutral-500"
                />
              </Labeled>
            </section>
          </div>
        )}
      </div>

      <Toast message={toast} />
    </div>
  );
}
