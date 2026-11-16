import { useState } from "react";
import { X } from "lucide-react";
import {
  COMMUNICATION_TYPES,
  getLocalDateTime,
  formatApiDateTime,
} from "./communicationUtils.jsx";

export default function CommunicationModal({
  onClose,
  onSubmit,
  saving = false,
}) {
  const [form, setForm] = useState({
    type: "call",
    subject: "",
    notes: "",
    communicated_at: getLocalDateTime(),
  });

  const update = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.subject.trim() || !form.notes.trim()) return;

    onSubmit({
      type: form.type,
      subject: form.subject.trim(),
      notes: form.notes.trim(),
      communicated_at: formatApiDateTime(form.communicated_at),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"
      onMouseDown={onClose}
    >
      <div
        dir="rtl"
        onMouseDown={(e) => e.stopPropagation()}
        className="w-full max-w-[460px] rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-ink">
            إضافة سجل تواصل
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="grid h-8 w-8 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
          >
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-neutral-600">
              نوع التواصل
            </label>

            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              className="h-10 w-full rounded-lg border border-line bg-white px-3 text-[12px] outline-none focus:border-orange-400"
              required
            >
              {COMMUNICATION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-neutral-600">
              عنوان التواصل
            </label>

            <input
              type="text"
              value={form.subject}
              onChange={(e) => update("subject", e.target.value)}
              placeholder="مثال: متابعة العرض المالي"
              className="h-10 w-full rounded-lg border border-line px-3 text-[12px] outline-none focus:border-orange-400"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-neutral-600">
              تفاصيل التواصل
            </label>

            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="اكتبي تفاصيل التواصل مع العميل..."
              rows={4}
              className="w-full resize-none rounded-lg border border-line p-3 text-[12px] outline-none focus:border-orange-400"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold text-neutral-600">
              تاريخ ووقت التواصل
            </label>

            <input
              type="datetime-local"
              value={form.communicated_at}
              onChange={(e) => update("communicated_at", e.target.value)}
              className="h-10 w-full rounded-lg border border-line px-3 text-[12px] outline-none focus:border-orange-400"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="h-9 rounded-full bg-neutral-900 px-5 text-[11px] font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
            >
              {saving ? "جاري الحفظ..." : "حفظ سجل التواصل"}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-9 rounded-full border border-line px-5 text-[11px] font-semibold text-ink hover:bg-neutral-50 disabled:opacity-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
