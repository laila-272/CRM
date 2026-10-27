import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { useRef, useState } from "react";
import {
  loadSettings,
  OWNERS,
  saveSettings,
  STAGE_KINDS,
} from "../../data/settings.js";
import {
  btnDark,
  btnLight,
  card,
  PageHeader,
  Select,
  td,
  th,
} from "../Shared/ui.jsx";
import { Toast, useToast } from "./TaskModal.jsx";

const NAV = [
  ["overview", "نظرة عامة"],
  ["stages", "مراحل خط المبيعات"],
  ["sources", "مصادر العملاء"],
  ["assignment", "تعيين العملاء"],
  ["fields", "الحقول المخصصة"],
  ["ratings", "التقييمات والعلامات"],
  ["permissions", "الصلاحيات"],
  ["integrations", "التكاملات"],
];

const uid = () => Math.random().toString(36).slice(2, 8);
const cell =
  "w-full bg-transparent py-1 text-[11.5px] text-ink outline-none border-b border-transparent focus:border-neutral-400";
const field =
  "h-9 w-full rounded-lg border border-line bg-white px-3 text-[12px] outline-none focus:border-neutral-500 placeholder:text-neutral-400";
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
    <div className="flex items-center justify-between gap-3 pt-3">
      <div>
        <div className="text-[11.5px] font-bold text-ink">{title}</div>
        <div className="text-[10px] text-neutral-500">{hint}</div>
      </div>
      <Switch on={on} onChange={onChange} label={title} />
    </div>
  );
}

function Section({ title, hint, action, error, children }) {
  return (
    <section className={`${card} p-5 min-w-0`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-[16px] font-semibold text-ink">{title}</h2>
          {hint && (
            <p className="mt-1 text-[10.5px] text-neutral-500">{hint}</p>
          )}
        </div>
        {action}
      </div>
      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[10.5px] text-red-600"
        >
          {error}
        </p>
      )}
      <div className="mt-4">{children}</div>
    </section>
  );
}

const AddBtn = ({ onClick, children }) => (
  <button type="button" onClick={onClick} className={`${btnLight} !rounded-lg`}>
    <Plus size={12} /> {children}
  </button>
);

/* ---------------- Stages ---------------- */
function StagesSection({ d, up, error }) {
  const drag = useRef(null);
  const list = d.stages.list;
  const set = (id, k, v) =>
    up((n) => {
      n.stages.list.find((s) => s.id === id)[k] = v;
    });
  const move = (i, delta) =>
    up((n) => {
      const j = i + delta;
      if (j < 0 || j >= n.stages.list.length) return;
      [n.stages.list[i], n.stages.list[j]] = [
        n.stages.list[j],
        n.stages.list[i],
      ];
    });
  const add = () =>
    up((n) => {
      const at = n.stages.list.findIndex((s) => s.kind !== "نشطة");
      const stage = {
        id: uid(),
        name: "مرحلة جديدة",
        probability: 50,
        days: 3,
        kind: "نشطة",
      };
      n.stages.list.splice(at < 0 ? n.stages.list.length : at, 0, stage);
    });
  const del = (s) => {
    if (list.length <= 2)
      return window.alert("يجب أن يحتوي خط المبيعات على مرحلتين على الأقل.");
    if (window.confirm(`حذف المرحلة «${s.name}»؟`))
      up((n) => {
        n.stages.list = n.stages.list.filter((x) => x.id !== s.id);
      });
  };
  const drop = (targetId) => {
    const id = drag.current;
    drag.current = null;
    if (!id || id === targetId) return;
    up((n) => {
      const item = n.stages.list.find((s) => s.id === id);
      const rest = n.stages.list.filter((s) => s.id !== id);
      rest.splice(
        rest.findIndex((s) => s.id === targetId),
        0,
        item,
      );
      n.stages.list = rest;
    });
  };

  return (
    <Section
      title="مراحل خط المبيعات"
      hint="رتّب المراحل بالسحب وحدد احتمالية الإغلاق والمدة المستهدفة لكل مرحلة."
      error={error}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[11.5px] font-bold text-ink">
          <input
            aria-label="اسم خط المبيعات"
            value={d.stages.name}
            onChange={(e) =>
              up((n) => {
                n.stages.name = e.target.value;
              })
            }
            className="w-[130px] bg-transparent outline-none border-b border-transparent focus:border-neutral-400"
          />
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[9.5px] font-normal text-neutral-500">
            افتراضي
          </span>
        </div>
        <AddBtn onClick={add}>إضافة مرحلة</AddBtn>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[640px]">
          <thead className="bg-neutral-50/70">
            <tr>
              {[
                "اسم المرحلة",
                "احتمالية الإغلاق",
                "المدة المستهدفة",
                "نوع المرحلة",
                "إجراء",
              ].map((h) => (
                <th key={h} className={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((s, i) => {
              const closing = s.kind !== "نشطة";
              return (
                <tr
                  key={s.id}
                  draggable
                  onDragStart={() => (drag.current = s.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => drop(s.id)}
                  className="border-t border-line bg-white"
                >
                  <td className={td}>
                    <input
                      aria-label="اسم المرحلة"
                      className={cell}
                      value={s.name}
                      onChange={(e) => set(s.id, "name", e.target.value)}
                    />
                  </td>
                  <td className={td}>
                    <span className="flex items-center gap-1" dir="ltr">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        aria-label="احتمالية الإغلاق"
                        className={`${cell} w-12 text-right`}
                        value={s.probability}
                        onChange={(e) =>
                          set(
                            s.id,
                            "probability",
                            e.target.value === "" ? "" : Number(e.target.value),
                          )
                        }
                      />
                      %
                    </span>
                  </td>
                  <td className={td}>
                    {closing ? (
                      <span className="text-neutral-400">—</span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          aria-label="المدة بالأيام"
                          className={`${cell} w-10`}
                          value={s.days}
                          onChange={(e) =>
                            set(
                              s.id,
                              "days",
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                            )
                          }
                        />{" "}
                        يوم
                      </span>
                    )}
                  </td>
                  <td className={td}>
                    <select
                      aria-label="نوع المرحلة"
                      value={s.kind}
                      onChange={(e) =>
                        up((n) => {
                          const x = n.stages.list.find((y) => y.id === s.id);
                          x.kind = e.target.value;
                          if (e.target.value === "إغلاق ناجح")
                            x.probability = 100;
                          if (e.target.value === "إغلاق خاسر")
                            x.probability = 0;
                        })
                      }
                      className={`bg-transparent text-[11px] outline-none cursor-pointer ${s.kind === "نشطة" ? "text-ink" : s.kind === "إغلاق ناجح" ? "text-green-600" : "text-red-500"}`}
                    >
                      {STAGE_KINDS.map((k) => (
                        <option key={k}>{k}</option>
                      ))}
                    </select>
                  </td>
                  <td className={td}>
                    <div className="flex items-center gap-0.5">
                      <GripVertical
                        size={13}
                        className="cursor-grab text-neutral-300"
                        aria-hidden
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
                        onClick={() => del(s)}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ToggleRow
        title="التنبيه عند تجاوز مدة المرحلة"
        hint="يُرسل إشعار إلى مسؤول العميل ومدير المبيعات."
        on={d.stages.alertOverdue}
        onChange={(v) =>
          up((n) => {
            n.stages.alertOverdue = v;
          })
        }
      />
    </Section>
  );
}

/* ---------------- Sources ---------------- */
function SourcesSection({ d, up, error }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const active = d.sources.list.filter((s) => s.active);
  const add = () => {
    const v = name.trim();
    if (!v || d.sources.list.some((s) => s.name === v)) return;
    up((n) => {
      n.sources.list.push({ id: uid(), name: v, active: true });
    });
    setName("");
    setAdding(false);
  };
  const del = (s) => {
    if (window.confirm(`حذف المصدر «${s.name}»؟`))
      up((n) => {
        n.sources.list = n.sources.list.filter((x) => x.id !== s.id);
        if (n.sources.defaultSource === s.name)
          n.sources.defaultSource =
            n.sources.list.find((x) => x.active)?.name || "";
      });
  };
  return (
    <Section
      title="مصادر العملاء"
      hint="مصادر مؤهلة لتتبع الحملات وقياس التحويل."
      error={error}
      action={<AddBtn onClick={() => setAdding(!adding)}>إضافة مصدر</AddBtn>}
    >
      {adding && (
        <div className="mb-3 flex gap-2">
          <input
            autoFocus
            className={field}
            placeholder="اسم المصدر"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          />
          <button type="button" onClick={add} className={btnDark}>
            إضافة
          </button>
        </div>
      )}
      <ul className="divide-y divide-line rounded-lg border border-line">
        {d.sources.list.map((s) => (
          <li key={s.id} className="flex items-center gap-2 px-3 py-2">
            <input
              aria-label="اسم المصدر"
              className={`${cell} flex-1`}
              value={s.name}
              onChange={(e) =>
                up((n) => {
                  n.sources.list.find((x) => x.id === s.id).name =
                    e.target.value;
                })
              }
            />
            <button
              type="button"
              onClick={() =>
                up((n) => {
                  const x = n.sources.list.find((y) => y.id === s.id);
                  x.active = !x.active;
                })
              }
              className={`rounded-full px-2 py-0.5 text-[9.5px] font-semibold ${s.active ? "bg-green-50 text-green-600" : "bg-neutral-100 text-neutral-500"}`}
            >
              {s.active ? "مفعل" : "معطل"}
            </button>
            <button
              type="button"
              aria-label="حذف المصدر"
              className={`${iconBtn} hover:!text-red-500`}
              onClick={() => del(s)}
            >
              <Trash2 size={12} />
            </button>
          </li>
        ))}
      </ul>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-[11px] font-bold text-ink">
          المصدر الافتراضي للإدخال اليدوي
        </span>
        <Select
          value={d.sources.defaultSource}
          onChange={(v) =>
            up((n) => {
              n.sources.defaultSource = v;
            })
          }
        >
          {active.map((s) => (
            <option key={s.id}>{s.name}</option>
          ))}
        </Select>
      </label>
      <ToggleRow
        title="إلزام تحديد مصدر العميل"
        hint="لا يمكن حفظ عميل جديد من غير مصدر."
        on={d.sources.required}
        onChange={(v) =>
          up((n) => {
            n.sources.required = v;
          })
        }
      />
    </Section>
  );
}

/* ---------------- Assignment ---------------- */
function AssignmentSection({ d, up, error }) {
  const a = d.assignment;
  const modes = [
    ["equal", "توزيع بالتساوي", "بالتناوب بين أعضاء الفريق المتاحين"],
    ["manual", "تعيين يدوي بواسطة المدير", ""],
  ];
  return (
    <Section
      title="قواعد تعيين العملاء"
      hint="حدد من يستلم العملاء الجدد تلقائيًا."
      error={error}
    >
      <div className="space-y-2">
        {modes.map(([k, title, hint]) => (
          <label
            key={k}
            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 ${a.mode === k ? "border-orange-300 bg-orange-50/60" : "border-line bg-white"}`}
          >
            <input
              type="radio"
              name="assign-mode"
              checked={a.mode === k}
              onChange={() =>
                up((n) => {
                  n.assignment.mode = k;
                })
              }
              className="sr-only"
            />
            <span
              className={`grid h-4 w-4 place-items-center rounded-full border ${a.mode === k ? "border-orange-500 text-orange-500" : "border-neutral-300"}`}
            >
              {a.mode === k && (
                <span className="h-2 w-2 rounded-full bg-orange-500" />
              )}
            </span>
            <span>
              <span className="block text-[12px] font-bold text-ink">
                {title}
              </span>
              {hint && (
                <span className="block text-[10px] text-neutral-500">
                  {hint}
                </span>
              )}
            </span>
          </label>
        ))}
      </div>

      <div className={`mt-4 ${a.mode === "manual" ? "opacity-50" : ""}`}>
        <div className="mb-2 text-[11px] font-bold text-ink">
          الفريق المستلم
        </div>
        <ul className="space-y-2">
          {a.team.map((m) => (
            <li
              key={m.name}
              className="flex items-center justify-between rounded-lg border border-line px-3 py-2"
            >
              <label className="flex items-center gap-2 text-[11.5px] text-ink">
                <input
                  type="checkbox"
                  disabled={a.mode === "manual"}
                  checked={m.active}
                  onChange={(e) =>
                    up((n) => {
                      n.assignment.team.find((x) => x.name === m.name).active =
                        e.target.checked;
                    })
                  }
                />
                {m.name}
              </label>
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[9.5px] text-neutral-500">
                {m.load} عملاء نشطين
              </span>
            </li>
          ))}
        </ul>
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-[11px] font-bold text-ink">
          المسؤول البديل
        </span>
        <Select
          value={a.fallback}
          onChange={(v) =>
            up((n) => {
              n.assignment.fallback = v;
            })
          }
        >
          {OWNERS.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </Select>
      </label>
      <ToggleRow
        title="استبعاد غير المتاحين"
        hint="حسب حالة التوافر في الفريق"
        on={a.skipUnavailable}
        onChange={(v) =>
          up((n) => {
            n.assignment.skipUnavailable = v;
          })
        }
      />
      <ToggleRow
        title="إعادة تعيين عند عدم التواصل"
        hint="بعد مرور 24 ساعة دون أول تواصل"
        on={a.reassign}
        onChange={(v) =>
          up((n) => {
            n.assignment.reassign = v;
          })
        }
      />
    </Section>
  );
}

/* ---------------- Page ---------------- */
export default function CrmSettings() {
  const [saved, setSaved] = useState(loadSettings);
  const [draft, setDraft] = useState(saved);
  const [section, setSection] = useState("overview");
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
    const err = validate(draft);
    setErrors(err);
    if (Object.keys(err).length) return notify("راجع الأخطاء قبل الحفظ");
    setSaved(saveSettings(draft));
    notify("تم حفظ الإعدادات");
  };
  const cancel = () => {
    if (!dirty) return;
    if (window.confirm("هل تريد تجاهل التغييرات غير المحفوظة؟")) {
      setDraft(saved);
      setErrors({});
    }
  };

  const show = (k) =>
    section === "overview"
      ? ["stages", "sources", "assignment"].includes(k)
      : section === k;
  const props = (k) => ({ d: draft, up, error: errors[k] });

  return (
    <div dir="rtl" className="max-w-full">
      <PageHeader
        title="إعدادات الـCRM"
        subtitle="اضبط مراحل البيع ومصادر العملاء وقواعد التوزيع بما يناسب طريقة عمل شركتك."
      >
        <button type="button" onClick={save} className={btnDark}>
          <Save size={13} /> حفظ التغييرات
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={!dirty}
          className={`${btnLight} !rounded-lg `}
        >
          إلغاء
        </button>
      </PageHeader>
      {dirty && (
        <p className="mt-2 text-[10.5px] text-orange-600">
          لديك تغييرات غير محفوظة.
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[190px_minmax(0,1fr)] items-start">
        <nav
          className={`${card} p-3 lg:sticky lg:top-4`}
          aria-label="أقسام الإعدادات"
        >
          <h2 className="mb-2 px-1 text-[12px] font-extrabold text-ink">
            إعدادات إدارة العملاء
          </h2>
          <ul className="flex gap-1 overflow-x-auto lg:flex-col">
            {NAV.map(([k, label]) => (
              <li key={k} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setSection(k)}
                  aria-current={section === k ? "page" : undefined}
                  className={`w-full rounded-lg px-3 py-2 text-right text-[11.5px] ${section === k ? "bg-orange-50 font-bold text-orange-600" : "text-neutral-500 hover:bg-neutral-50 hover:text-ink"}`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-4 min-w-0">
          {show("stages") && <StagesSection {...props("stages")} />}
          {(show("sources") || show("assignment")) && (
            <div
              className={`grid gap-4 ${section === "overview" ? "xl:grid-cols-2" : ""}`}
            >
              {show("sources") && <SourcesSection {...props("sources")} />}
              {show("assignment") && (
                <AssignmentSection {...props("assignment")} />
              )}
            </div>
          )}
          {show("fields") && <StagesSection d={draft} up={up} />}
          {show("ratings") && <StagesSection d={draft} up={up} />}
          {show("permissions") && <StagesSection d={draft} up={up} />}
          {show("integrations") && <StagesSection d={draft} up={up} />}
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}
