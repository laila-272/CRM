import { Save } from "lucide-react";
import { useState } from "react";
import {
  DAYS,
  DURATIONS,
  loadSettings,
  saveSettings,
  toMin,
} from "../../data/scheduling.js";
import { Toast, useToast } from "../CRMPages/TaskModal.jsx";
import { PageHeader, btnDark, btnLight, card } from "../Shared/ui.jsx";

const NAV = [
  ["general", "عام"],
  ["hours", "ساعات العمل"],
  ["rules", "قواعد الحجز"],
  ["notifications", "الإشعارات"],
  ["payment", "الدفع والعربون"],
];

const field =
  "h-9 w-full rounded-lg border border-line bg-white px-3 text-[12px] outline-none focus:border-neutral-500";

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
    <div className="flex items-center justify-between gap-3 border-b border-line py-3 ">
      <div>
        <div className="text-[11.5px] font-semibold text-ink">{title}</div>
        {hint && <div className="text-[10px] text-neutral-500">{hint}</div>}
      </div>
      <Switch on={on} onChange={onChange} label={title} />
    </div>
  );
}

function Section({ id, title,desc, hint, error, children }) {
  return (
    <section id={id} className={`${card} min-w-0 scroll-mt-4 p-5`}>
      <h2 className="text-[15px] font-bold text-ink">{title}</h2>
      <p className="text-[12px] font-semibold text-[#717171]">{desc}</p>
      {hint && <p className="mt-1 text-[10.5px] text-neutral-500">{hint}</p>}
      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-[10.5px] text-red-600"
        >
          {error}
        </p>
      )}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function validate(s) {
  const e = {};
  Object.entries(s.hours).forEach(([i, h]) => {
    if (!e.hours && h.on && toMin(h.from) >= toMin(h.to))
      e.hours = `نهاية الدوام يوم ${DAYS[i]} يجب أن تكون بعد البداية.`;
  });
  if (!e.hours && !Object.values(s.hours).some((h) => h.on))
    e.hours = "فعّل يوم عمل واحدًا على الأقل.";
  if (s.maxAdvanceDays < 1 || s.maxAdvanceDays === "")
    e.general = "أقصى مدة للحجز المسبق يجب أن تكون يومًا واحدًا على الأقل.";
  else if (s.minNoticeHours < 0 || s.minNoticeHours === "")
    e.general = "الحد الأدنى للإشعار المسبق غير صحيح.";
  if (
    s.payment.requireDeposit &&
    (s.payment.depositPercent === "" ||
      s.payment.depositPercent < 1 ||
      s.payment.depositPercent > 100)
  )
    e.payment = "نسبة العربون يجب أن تكون بين 1 و100.";
  return e;
}

export default function SchedulingSettings() {
  const [saved, setSaved] = useState(loadSettings);
  const [draft, setDraft] = useState(saved);
  const [errors, setErrors] = useState({});
  const [active, setActive] = useState("general");
  const [toast, notify] = useToast();

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const up = (fn) =>
    setDraft((d) => {
      const n = structuredClone(d);
      fn(n);
      return n;
    });
  const num = (v) => (v === "" ? "" : Number(v));

  const save = () => {
    if (!dirty) return notify("لا توجد تغييرات للحفظ");
    const err = validate(draft);
    setErrors(err);
    if (Object.keys(err).length) return notify("راجع الأخطاء قبل الحفظ");
    setSaved(saveSettings(draft));
    notify("تم حفظ الإعدادات");
  };
  const cancel = () => {
    if (dirty && window.confirm("هل تريد تجاهل التغييرات غير المحفوظة؟")) {
      setDraft(saved);
      setErrors({});
    }
  };
  const go = (k) => {
    setActive(k);
    document
      .getElementById(`sec-${k}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div dir="rtl" className="max-w-full">
      <PageHeader
        title="إعدادات المواعيد والحجوزات"
        subtitle="اضبط ساعات العمل وقواعد الحجز والإشعارات والعربون بما يناسب شركتك."
      >
        <button type="button" onClick={save} className={btnDark}>
          <Save size={13} /> حفظ التغييرات
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={!dirty}
          className={`${btnLight} !rounded-lg disabled:opacity-40`}
        >
          إلغاء
        </button>
      </PageHeader>
      {dirty && (
        <p className="mt-2 text-[10.5px] text-orange-600">
          لديك تغييرات غير محفوظة.
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 items-start gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
        <nav className={`${card} p-3 lg:sticky lg:top-4`} aria-label="الأقسام">
          <h2 className="mb-2 px-1 text-[12px] font-extrabold text-ink">
            الأقسام
          </h2>
          <ul className="flex gap-1 overflow-x-auto lg:flex-col">
            {NAV.map(([k, label]) => (
              <li key={k} className="shrink-0">
                <button
                  type="button"
                  onClick={() => go(k)}
                  aria-current={active === k ? "true" : undefined}
                  className={`w-full rounded-lg px-3 py-2 text-right text-[11.5px] ${active === k ? "bg-ink font-bold text-white" : "text-neutral-500 hover:bg-neutral-50 hover:text-ink"}`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-4">
            <Section
              id="sec-terms"
              title="المصطلحات حسب نشاطك"
              hint="غيّر الأسماء لتناسب أي بزنس: عيادة، صالون، عقارات أو أي نشاط آخر."
              error={errors.general}
            >
              <span className="mb-1.5 block text-[11px] font-bold text-ink">
                نوع النشاط
              </span>

              {/* أزرار اختيار نوع النشاط */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {["عيادة", "صالون", "عقارات", "مركز تدريب", "مخصص"].map(
                  (activity) => (
                    <button
                      type="button"
                      key={activity}
                      aria-pressed={draft.activityType === activity}
                      onClick={() =>
                        up((n) => {
                          n.activityType = activity;
                          // يمكنك هنا تحديث الحقول الافتراضية بناءً على النشاط إذا رغبت
                        })
                      }
                      className={`h-7 rounded-full border px-3.5 text-[11px] font-semibold ${
                        draft.activityType === activity
                          ? "bg-ink text-white border-ink"
                          : "bg-white text-neutral-600 border-line"
                      }`}
                    >
                      {activity}
                    </button>
                  ),
                )}
              </div>

              {/* حقول تخصيص المصطلحات */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold text-ink">
                    اسم الخدمة
                  </span>
                  <input
                    type="text"
                    className={field}
                    value={draft.serviceTerm || ""}
                    onChange={(e) =>
                      up((n) => {
                        n.serviceTerm = e.target.value;
                      })
                    }
                    placeholder="الكشف"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold text-ink">
                    اسم المورد
                  </span>
                  <input
                    type="text"
                    className={field}
                    value={draft.providerTerm || ""}
                    onChange={(e) =>
                      up((n) => {
                        n.providerTerm = e.target.value;
                      })
                    }
                    placeholder="الطبيب"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-bold text-ink">
                    اسم العميل
                  </span>
                  <input
                    type="text"
                    className={field}
                    value={draft.clientTerm || ""}
                    onChange={(e) =>
                      up((n) => {
                        n.clientTerm = e.target.value;
                      })
                    }
                    placeholder="المريض"
                  />
                </label>
              </div>

              {/* صندوق المعاينة في الصفحات */}
              <div className="mt-4 rounded-xl border border-line p-3 text-xs text-neutral-600 bg-neutral-50/50">
                <span className="text-[10px] text-neutral-400 block mb-1">
                  معاينة في الصفحات
                </span>
                <span className="font-medium text-ink">
                  حجز {draft.serviceTerm || "كشف"} مع{" "}
                  {draft.providerTerm || "الطبيب"} لـ{" "}
                  {draft.clientTerm || "المريض"}
                </span>
              </div>
            </Section>

            <Section
              id="sec-hours"
              title="ساعات العمل"
              hint="حدّد أيام وساعات استقبال الحجوزات."
              error={errors.hours}
            >
              <ul className="divide-y divide-line">
                {DAYS.map((day, i) => {
                  const h = draft.hours[i];
                  return (
                    <li
                      key={day}
                      className="flex items-center justify-between py-3"
                    >
                      {/* اسم اليوم وزر التفعيل في الجهة اليمنى */}
                      <div className="flex items-center gap-4">
                        <span className="w-16 text-[11.5px] font-bold text-ink">
                          {day}
                        </span>
                        <Switch
                          on={h.on}
                          label={day}
                          onChange={(v) =>
                            up((n) => {
                              n.hours[i].on = v;
                            })
                          }
                        />
                      </div>

                      {/* حقول الوقت أو كلمة إجازة في الجهة اليسرى */}
                      <div>
                        {h.on ? (
                          <span className="flex items-center gap-2" dir="ltr">
                            <input
                              type="time"
                              aria-label={`نهاية ${day}`}
                              className={`${field} !w-[110px]`}
                              value={h.to}
                              onChange={(e) =>
                                up((n) => {
                                  n.hours[i].to = e.target.value;
                                })
                              }
                            />
                            <span className="text-neutral-400">إلى</span>
                            <input
                              type="time"
                              aria-label={`بداية ${day}`}
                              className={`${field} !w-[110px]`}
                              value={h.from}
                              onChange={(e) =>
                                up((n) => {
                                  n.hours[i].from = e.target.value;
                                })
                              }
                            />
                          </span>
                        ) : (
                          <span className="text-[10.5px] text-neutral-400 px-3 py-1 bg-neutral-100 rounded-md">
                            إجازة
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Section>
          </div>

          <div className="min-w-0 space-y-4">
            <Section
              id="sec-rules"
              title="قواعد الحجز"
              desc="تحكّم في طريقة قبول الحجوزات وتأكيدها."
            >
              <ToggleRow
                title="تأكيد الحجز يدويًا"
                hint="يتم تأكيد الحجز مباشرة بدون مراجعة"
                on={draft.rules.autoConfirm}
                onChange={(v) =>
                  up((n) => {
                    n.rules.autoConfirm = v;
                  })
                }
              />

              <ToggleRow
                title="السماح للعميل بالحجز بنفسه"
                hint="يمكن إلغاء الموعد قبل موعده"
                on={draft.rules.allowCancel}
                onChange={(v) =>
                  up((n) => {
                    n.rules.allowCancel = v;
                  })
                }
              />
              <ToggleRow
                title="منع تعارض المواعيد"
                hint="لا يُسمح بحجز مورد في وقت محجوز"
                on={draft.rules.preventOverlap}
                onChange={(v) =>
                  up((n) => {
                    n.rules.preventOverlap = v;
                  })
                }
              />
              <ToggleRow
                title="قائمة انتظار عند اكتمال الخانات"
                hint="تسجيل العملاء عند اكتمال الفترات"
                on={draft.rules.waitlist}
                onChange={(v) =>
                  up((n) => {
                    n.rules.waitlist = v;
                  })
                }
              />
              <div className="labels flex justify-between gap-4">
                {/* حقل نسبة العربون */}
                <label
                  className={`block py-3 flex-1 ${draft.payment.requireDeposit ? "" : "opacity-50"}`}
                >
                  <span className="mb-1.5 block text-[11px] font-bold text-ink">
                    مدة الخانة الافتراضية
                  </span>
                  <input
                    type="number"
                    dir="ltr"
                    disabled={!draft.payment.requireDeposit}
                    className={field}
                    value={draft.payment.depositPercent}
                    onChange={(e) =>
                      up((n) => {
                        n.payment.depositPercent = num(e.target.value);
                      })
                    }
                  />
                </label>

                {/* حقل مهلة الدفع */}
                <label
                  className={`block py-3 flex-1 ${draft.payment.requireDeposit ? "" : "opacity-50"}`}
                >
                  <span className="mb-1.5 block text-[11px] font-bold text-ink">
                    أقصى مدة حجز مسبق
                  </span>
                  <input
                    type="number"
                    dir="ltr"
                    disabled={!draft.payment.requireDeposit}
                    className={field}
                    value={draft.payment.depositDeadline}
                    onChange={(e) =>
                      up((n) => {
                        n.payment.depositDeadline = num(e.target.value);
                      })
                    }
                  />
                </label>
              </div>
            </Section>

            <Section
              id="sec-notifications"
              title="التذكيرات"
              desc="أرسل تذكيرات تلقائية لتقليل الغياب."
            >
              <ToggleRow
                title="واتساب قبل 24 ساعة"
                on={draft.notifications.remindCustomer}
                onChange={(v) =>
                  up((n) => {
                    n.notifications.remindCustomer = v;
                  })
                }
              />
              <ToggleRow
                title="رسالة SMS قبل ساعتين"
                on={draft.notifications.remindCustomer}
                onChange={(v) =>
                  up((n) => {
                    n.notifications.remindCustomer = v;
                  })
                }
              />
              <ToggleRow
                title="بريد إلكتروني عند التأكيد"
                on={draft.notifications.notifyOwner}
                onChange={(v) =>
                  up((n) => {
                    n.notifications.notifyOwner = v;
                  })
                }
              />
              <ToggleRow
                title="تنبيه للفريق عند حجز جديد"
                on={draft.notifications.dailySummary}
                onChange={(v) =>
                  up((n) => {
                    n.notifications.dailySummary = v;
                  })
                }
              />
            </Section>

            <Section
              id="sec-payment"
              title="الدفع والعربون"
              error={errors.payment}
            >
              <ToggleRow
                title="طلب عربون عند الحجز"
                hint="يظهر حقل الدفع في نموذج الحجز"
                on={draft.payment.requireDeposit}
                onChange={(v) =>
                  up((n) => {
                    n.payment.requireDeposit = v;
                  })
                }
              />
              <div className="labels flex justify-between gap-4">
                {/* حقل نسبة العربون */}
                <label
                  className={`block py-3 flex-1 ${draft.payment.requireDeposit ? "" : "opacity-50"}`}
                >
                  <span className="mb-1.5 block text-[11px] font-bold text-ink">
                    نسبة العربون (%)
                  </span>
                  <input
                    type="number"
                    dir="ltr"
                    disabled={!draft.payment.requireDeposit}
                    className={field}
                    value={draft.payment.depositPercent}
                    onChange={(e) =>
                      up((n) => {
                        n.payment.depositPercent = num(e.target.value);
                      })
                    }
                  />
                </label>

                {/* حقل مهلة الدفع */}
                <label
                  className={`block py-3 flex-1 ${draft.payment.requireDeposit ? "" : "opacity-50"}`}
                >
                  <span className="mb-1.5 block text-[11px] font-bold text-ink">
                    مهلة الدفع
                  </span>
                  <input
                    type="number"
                    dir="ltr"
                    disabled={!draft.payment.requireDeposit}
                    className={field}
                    value={draft.payment.depositDeadline}
                    onChange={(e) =>
                      up((n) => {
                        n.payment.depositDeadline = num(e.target.value);
                      })
                    }
                  />
                </label>
              </div>
              <ToggleRow
                title="إلغاء الحجز تلقائيًا بعد المهلة"
                on={draft.payment.refundOnCancel}
                onChange={(v) =>
                  up((n) => {
                    n.payment.refundOnCancel = v;
                  })
                }
              />
            </Section>
          </div>
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
}
