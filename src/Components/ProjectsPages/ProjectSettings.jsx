import { useState } from "react";
import { Plus, Save, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { PageHeader, card, btnDark, btnLight, Chip } from "../Shared/ui.jsx";
import { Toast, useToast } from "../CRMPages/TaskModal.jsx";
import {
  loadProjectSettings,
  saveProjectSettings,
} from "../../data/projects.js";

const iconBtn =
  "grid h-7 w-7 place-items-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-ink";

const uid = () => `st${Math.random().toString(36).slice(2, 7)}`;

function Switch({ on, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
        on ? "bg-ink" : "bg-neutral-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
          on ? "right-[18px]" : "right-0.5"
        }`}
      />
    </button>
  );
}

function ToggleRow({ title, hint, on, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0">
      <div>
        <div className="text-[11.5px] font-bold text-ink">{title}</div>
        {hint && <div className="text-[10px] text-neutral-500">{hint}</div>}
      </div>

      <Switch on={on} onChange={onChange} label={title} />
    </div>
  );
}

function ServiceTypesSection() {
  const initialServices = {
    ضمان: {
      label1: "مدة الضمان الافتراضية",
      value1: "12 شهراً",
      label2: "زمن الاستجابة المستهدف",
      value2: "24 ساعة",
    },
    صيانة: {
      label1: "نوع عقد الصيانة",
      value1: "دوري شامل",
      label2: "زمن الاستجابة المستهدف",
      value2: "4 ساعات",
    },
    دعم: {
      label1: "قناة الدعم الأساسية",
      value1: "تذاكر النظام",
      label2: "زمن الاستجابة المستهدف",
      value2: "ساعة واحدة",
    },
    تعديل: {
      label1: "حد التعديلات المجانية",
      value1: "3 مرات",
      label2: "زمن الاستجابة المستهدف",
      value2: "48 ساعة",
    },
  };

  const [services, setServices] = useState(initialServices);
  const [activeTab, setActiveTab] = useState("ضمان");
  const [editing, setEditing] = useState(false);
  const [newType, setNewType] = useState("");
  const [showAdd, setShowAdd] = useState(false);

  const current = services[activeTab];

  const updateField = (field, value) => {
    setServices((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [field]: value,
      },
    }));
  };

  const addService = () => {
    const name = newType.trim();

    if (!name || services[name]) return;

    setServices((prev) => ({
      ...prev,
      [name]: {
        label1: "الخاصية الأولى",
        value1: "",
        label2: "زمن الاستجابة المستهدف",
        value2: "",
      },
    }));

    setActiveTab(name);
    setNewType("");
    setShowAdd(false);
    setEditing(true);
  };

  const deleteService = () => {
    if (Object.keys(services).length <= 1) return;

    const next = { ...services };
    delete next[activeTab];

    setServices(next);
    setActiveTab(Object.keys(next)[0]);
    setEditing(false);
  };

  return (
    <section className={`${card} p-5`}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">
            أنواع طلبات الخدمة
          </h2>
         
        </div>

       
      </div>

      <div className="mt-4 flex flex-wrap  items-center gap-2">
        {Object.keys(services).map((type) => (
          <Chip
            key={type}
            active={activeTab === type}
            onClick={() => {
              setActiveTab(type);
              setEditing(false);
            }}
          >
            {type}
          </Chip>
        ))}

        <button
          type="button"
          onClick={() => setShowAdd((prev) => !prev)}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-neutral-300 px-3.5 py-1 text-[11px] font-medium text-neutral-600 hover:bg-neutral-50"
        >
          <Plus size={12} />
          إضافة
        </button>
      </div>

      {showAdd && (
        <div className="mt-4 flex gap-2">
          <input
            autoFocus
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addService();
            }}
            placeholder="اسم نوع الخدمة"
            className="h-9 min-w-0 flex-1 rounded-lg border border-line px-3 text-xs outline-none focus:border-neutral-400"
          />

          <button type="button" onClick={addService} className={btnDark}>
            إضافة
          </button>
        </div>
      )}

      {current && (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            ["label1", "value1"],
            ["label2", "value2"],
          ].map(([labelKey, valueKey]) => (
            <div key={labelKey} className="flex flex-col gap-1.5">
              {editing ? (
                <>
                  <input
                    aria-label="اسم الخاصية"
                    value={current[labelKey]}
                    onChange={(e) => updateField(labelKey, e.target.value)}
                    className="h-8 w-full border-b border-line bg-transparent text-[11px] text-neutral-500 outline-none focus:border-neutral-500"
                  />

                  <input
                    aria-label="قيمة الخاصية"
                    value={current[valueKey]}
                    onChange={(e) => updateField(valueKey, e.target.value)}
                    className="w-full rounded-xl border border-line bg-neutral-50/50 px-3.5 py-2.5 text-right text-[12px] font-semibold text-ink outline-none focus:border-neutral-400"
                  />
                </>
              ) : (
                <>
                  <label className="text-right text-[11px] font-medium text-neutral-500">
                    {current[labelKey]}
                  </label>

                  <div className="w-full rounded-xl border border-line bg-neutral-50/50 px-3.5 py-2.5 text-right text-[12px] font-semibold text-ink">
                    {current[valueKey] || "—"}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={deleteService}
            disabled={Object.keys(services).length <= 1}
            className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[11px] text-red-600 hover:bg-red-50 disabled:opacity-40"
          >
            <Trash2 size={13} />
            حذف النوع الحالي
          </button>
        </div>
      )}

     
    </section>
  );
}

export default function ProjectSettings() {
  const [saved, setSaved] = useState(() => loadProjectSettings());
  const [draft, setDraft] = useState(() =>
    structuredClone(loadProjectSettings()),
  );
  const [errors, setErrors] = useState({});
  const [toast, notify] = useToast();

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const up = (fn) => {
    setDraft((current) => {
      const next = structuredClone(current);
      fn(next);
      return next;
    });
  };

  const save = () => {
    if (!dirty) {
      notify("لا توجد تغييرات للحفظ");
      return;
    }

    const err = {};
    const names = draft.stages.map((stage) => stage.name.trim());

    if (draft.stages.length < 2) {
      err.stages = "يجب وجود مرحلتين على الأقل.";
    } else if (names.some((name) => !name)) {
      err.stages = "اسم المرحلة مطلوب لكل المراحل.";
    } else if (new Set(names).size !== names.length) {
      err.stages = "أسماء المراحل يجب ألا تتكرر.";
    }

    setErrors(err);

    if (Object.keys(err).length) {
      notify("راجع الأخطاء قبل الحفظ");
      return;
    }

    const result = saveProjectSettings({
      ...draft,
      stages: draft.stages.map((stage) => ({
        ...stage,
        name: stage.name.trim(),
      })),
    });

    setSaved(structuredClone(result));
    setDraft(structuredClone(result));
    notify("تم حفظ الإعدادات");
  };

  const cancel = () => {
    if (!dirty) return;

    if (window.confirm("هل تريد تجاهل التغييرات غير المحفوظة؟")) {
      setDraft(structuredClone(saved));
      setErrors({});
    }
  };

  const move = (index, delta) => {
    up((next) => {
      const target = index + delta;

      if (target < 0 || target >= next.stages.length) return;

      [next.stages[index], next.stages[target]] = [
        next.stages[target],
        next.stages[index],
      ];
    });
  };

  return (
    <div dir="rtl" className="max-w-full">
      <PageHeader
        title="إعدادات المشاريع والتنفيذ"
        subtitle="اضبط المراحل والخيارات الافتراضية التي تُطبَّق على المشاريع الجديدة."
      >
        <button type="button" onClick={save} className={btnDark}>
          <Save size={13} />
          حفظ التغييرات
        </button>

        <button
          type="button"
          onClick={cancel}
          disabled={!dirty}
          className={`${btnLight} !rounded-md disabled:opacity-40`}
        >
          إلغاء
        </button>
      </PageHeader>

      {dirty && (
        <p className="mt-2 text-[10.5px] text-orange-600">
          لديك تغييرات غير محفوظة.
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          <section className={`${card} p-5`}>
            <h2 className="text-[15px] font-semibold text-ink">
              الربط التلقائي
            </h2>

            <p className="mt-1 text-[10.5px] text-neutral-500">
              تحكم في الإجراءات التلقائية المرتبطة بالمشاريع والخدمات.
            </p>

            <div className="mt-3">
              <ToggleRow
                title="إنشاء مشروع تلقائيًا عند إقفال الصفقة"
                hint="يُربط بالعميل والعقد والفاتورة"
                on={draft.notifyDue}
                onChange={(value) =>
                  up((next) => {
                    next.notifyDue = value;
                  })
                }
              />

              <ToggleRow
                title="إنشاء طلب فاتورة أو تحصيل عند اعتماد التسليم"
                hint="يظهر في المحاسبة بعد توقيع العميل"
                on={draft.notifyLate}
                onChange={(value) =>
                  up((next) => {
                    next.notifyLate = value;
                  })
                }
              />

              <ToggleRow
                title="إظهار خدمات ما بعد البيع في ملف العميل"
                hint="عرض طلبات الخدمة ضمن بيانات العميل"
                on={draft.blockCloseWithOpenTasks}
                onChange={(value) =>
                  up((next) => {
                    next.blockCloseWithOpenTasks = value;
                  })
                }
              />

              <ToggleRow
                title="جدولة زيارات الخدمة تلقائيًا"
                hint="تحتاج موافقة مسؤول الخدمة"
                on={draft.autoCompleteWhenAllDone}
                onChange={(value) =>
                  up((next) => {
                    next.autoCompleteWhenAllDone = value;
                  })
                }
              />
            </div>
          </section>

          <section className={`${card} p-5`}>
            <div>
              <h2 className="text-[15px] font-semibold text-ink">
                مراحل المشروع
              </h2>

              <p className="mt-1 text-[10.5px] text-neutral-500">
                عدّل أسماء المراحل ورتب ظهورها في المشاريع واللوحة الزمنية.
              </p>
            </div>

            {errors.stages && (
              <p
                role="alert"
                className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[10.5px] text-red-600"
              >
                {errors.stages}
              </p>
            )}

            <ul className="mt-4 divide-y divide-line rounded-lg border-b border-line">
              {draft.stages.map((stage, index) => (
                <li
                  key={stage.id}
                  className="flex items-center gap-2 px-3 py-4"
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-neutral-100 text-[10.5px] font-bold text-neutral-500">
                    {index + 1}
                  </span>

                  <input
                    aria-label={`اسم المرحلة ${index + 1}`}
                    value={stage.name}
                    onChange={(e) => {
                      const value = e.target.value;

                      up((next) => {
                        next.stages[index].name = value;
                      });

                      setErrors((prev) => ({
                        ...prev,
                        stages: undefined,
                      }));
                    }}
                    className="h-8 min-w-0 flex-1 border-b border-transparent bg-transparent text-[12px] font-semibold text-ink outline-none focus:border-neutral-400"
                  />

                  

                  
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() =>
                up((next) => {
                  next.stages.push({
                    id: uid(),
                    name: "مرحلة جديدة",
                  });
                })
              }
              className={`${btnLight} !mt-3 !w-full !justify-center !rounded-lg`}
            >
              <Plus size={12} />
              إضافة مرحلة
            </button>
          </section>
        </div>

        <div className="space-y-4">
          <ServiceTypesSection />

         
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}
