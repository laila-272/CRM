import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { PageHeader, card, btnDark, btnLight } from "../Shared/ui.jsx";
import { Toast, useToast } from "../CRMPages/TaskModal.jsx";
import {
  PRIORITIES,
  loadProjectSettings,
  saveProjectSettings,
} from "../../data/projects.js";

const REMINDER_DAYS = [1, 3, 7, 14];
const iconBtn =
  "grid h-7 w-7 place-items-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-ink";

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

function ToggleRow({ title, hint, on, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0">
      <div>
        <div className="text-[11.5px] font-bold text-ink">{title}</div>
        <div className="text-[10px] text-neutral-500">{hint}</div>
      </div>
      <Switch on={on} onChange={onChange} label={title} />
    </div>
  );
}

const chip = (on) =>
  `h-7 rounded-full border px-3.5 text-[11px] font-semibold ${on ? "bg-ink text-white border-ink" : "bg-white text-neutral-600 border-line"}`;
const uid = () => `st${Math.random().toString(36).slice(2, 7)}`;

export default function ProjectSettings() {
  const [saved, setSaved] = useState(loadProjectSettings);
  const [draft, setDraft] = useState(saved);
  const [errors, setErrors] = useState({});
  const [toast, notify] = useToast();

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const up = (fn) =>
    setDraft((d) => {
      const n = structuredClone(d);
      fn(n);
      return n;
    });

  const save = () => {
    if (!dirty) return notify("لا توجد تغييرات للحفظ");
    const err = {};
    const names = draft.stages.map((s) => s.name.trim());
    if (draft.stages.length < 2) err.stages = "يجب وجود مرحلتين على الأقل.";
    else if (names.some((n) => !n))
      err.stages = "اسم المرحلة مطلوب لكل المراحل.";
    else if (new Set(names).size !== names.length)
      err.stages = "أسماء المراحل يجب ألا تتكرر.";
    setErrors(err);
    if (Object.keys(err).length) return notify("راجع الأخطاء قبل الحفظ");
    setSaved(
      saveProjectSettings({
        ...draft,
        stages: draft.stages.map((s) => ({ ...s, name: s.name.trim() })),
      }),
    );
    notify("تم حفظ الإعدادات");
  };
  const cancel = () => {
    if (dirty && window.confirm("هل تريد تجاهل التغييرات غير المحفوظة؟")) {
      setDraft(saved);
      setErrors({});
    }
  };
  const move = (i, delta) =>
    up((n) => {
      const j = i + delta;
      if (j < 0 || j >= n.stages.length) return;
      [n.stages[i], n.stages[j]] = [n.stages[j], n.stages[i]];
    });

  return (
    <div dir="rtl" className="max-w-full">
      <PageHeader
        title="إعدادات المشاريع والتنفيذ"
        subtitle="اضبط الأولويات والتنبيهات والمراحل الافتراضية التي تُطبَّق على المشاريع الجديدة."
      >
        <button type="button" onClick={save} className={btnDark}>
          <Save size={13} /> حفظ التغييرات
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

      <div className="mt-4 space-y-4">
        <section className={`${card} p-5`}>
          <h2 className="text-[15px] font-semibold text-ink">
            الأولوية والتنبيهات
          </h2>
          <p className="mt-1 text-[10.5px] text-neutral-500">
            القيم الافتراضية عند إنشاء المشاريع والمهام.
          </p>

          <div className="mt-4">
            <span className="mb-1.5 block text-[11px] font-bold text-ink">
              الأولوية الافتراضية
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PRIORITIES.map((p) => (
                <button
                  type="button"
                  key={p}
                  aria-pressed={draft.defaultPriority === p}
                  onClick={() =>
                    up((n) => {
                      n.defaultPriority = p;
                    })
                  }
                  className={chip(draft.defaultPriority === p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <span className="mb-1.5 block text-[11px] font-bold text-ink">
              التنبيه قبل موعد التسليم
            </span>
            <div className="flex flex-wrap gap-1.5">
              {REMINDER_DAYS.map((d) => (
                <button
                  type="button"
                  key={d}
                  aria-pressed={draft.reminderDays === d}
                  onClick={() =>
                    up((n) => {
                      n.reminderDays = d;
                    })
                  }
                  className={chip(draft.reminderDays === d)}
                >
                  {d === 1 ? "يوم" : `${d} أيام`}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <ToggleRow
              title="تنبيه عند اقتراب موعد التسليم"
              hint="إشعار للمسؤول قبل الموعد بالمدة المحددة"
              on={draft.notifyDue}
              onChange={(v) =>
                up((n) => {
                  n.notifyDue = v;
                })
              }
            />
            <ToggleRow
              title="تنبيه عند تأخر المهام"
              hint="إشعار للمسؤول ومدير المشروع عند تجاوز الموعد"
              on={draft.notifyLate}
              onChange={(v) =>
                up((n) => {
                  n.notifyLate = v;
                })
              }
            />
            <ToggleRow
              title="منع إتمام المشروع بوجود مهام مفتوحة"
              hint="يظهر تنبيه عند محاولة إتمام مشروع به مهام غير مكتملة"
              on={draft.blockCloseWithOpenTasks}
              onChange={(v) =>
                up((n) => {
                  n.blockCloseWithOpenTasks = v;
                })
              }
            />
            <ToggleRow
              title="إتمام المشروع تلقائيًا"
              hint="عند إكمال آخر مهمة مفتوحة في المشروع"
              on={draft.autoCompleteWhenAllDone}
              onChange={(v) =>
                up((n) => {
                  n.autoCompleteWhenAllDone = v;
                })
              }
            />
          </div>
        </section>

        <section className={`${card} p-5`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-[15px] font-semibold text-ink">
                مراحل المشروع الافتراضية
              </h2>
              <p className="mt-1 text-[10.5px] text-neutral-500">
                تُطبَّق على المشاريع الجديدة فقط، ولا تغيّر مراحل المشاريع
                القائمة.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                up((n) => {
                  n.stages.push({ id: uid(), name: "مرحلة جديدة" });
                })
              }
              className={`${btnLight} !rounded-lg`}
            >
              <Plus size={12} /> إضافة مرحلة
            </button>
          </div>
          {errors.stages && (
            <p
              role="alert"
              className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[10.5px] text-red-600"
            >
              {errors.stages}
            </p>
          )}

          <ul className="mt-4 divide-y divide-line rounded-lg border border-line">
            {draft.stages.map((s, i) => (
              <li key={s.id} className="flex items-center gap-2 px-3 py-2">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-neutral-100 text-[10.5px] font-bold text-neutral-500">
                  {i + 1}
                </span>
                <input
                  aria-label={`اسم المرحلة ${i + 1}`}
                  value={s.name}
                  onChange={(e) =>
                    up((n) => {
                      n.stages[i].name = e.target.value;
                    })
                  }
                  className="h-8 flex-1 bg-transparent text-[12px] font-semibold text-ink outline-none border-b border-transparent focus:border-neutral-400"
                />
                <button
                  type="button"
                  aria-label="للأعلى"
                  className={iconBtn}
                  onClick={() => move(i, -1)}
                >
                  <ArrowUp size={12} />
                </button>
                <button
                  type="button"
                  aria-label="للأسفل"
                  className={iconBtn}
                  onClick={() => move(i, 1)}
                >
                  <ArrowDown size={12} />
                </button>
                <button
                  type="button"
                  aria-label="حذف المرحلة"
                  className={`${iconBtn} hover:!text-red-500`}
                  onClick={() =>
                    draft.stages.length > 2
                      ? up((n) => {
                          n.stages.splice(i, 1);
                        })
                      : notify("يجب وجود مرحلتين على الأقل")
                  }
                >
                  <Trash2 size={12} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Toast message={toast} />
    </div>
  );
}
