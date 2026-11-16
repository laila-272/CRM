import { useState } from "react";
import { Plus } from "lucide-react";
import CommunicationModal from "./CommunicationModal.jsx";

const formatDateTime = (date) => {
  if (!date) return "غير محدد";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleString("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function CommunicationLog({
  logs = [],
  onAdd,
  loading = false,
}) {
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (communication) => {
    await onAdd(communication);
    setShowModal(false);
  };

  return (
    <>
      <section className="bg-white border border-line rounded-xl p-4">
        <h2 className="text-[13px] font-extrabold text-ink mb-3.5">
          سجل التواصل
        </h2>

        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 text-[11px] font-semibold text-white transition hover:bg-neutral-700"
          >
            <Plus size={14} />
            إضافة سجل تواصل
          </button>
        </div>

        {logs.length === 0 ? (
          <p className="text-[11px] text-neutral-400">
            لا يوجد سجل تواصل حتى الآن.
          </p>
        ) : (
          <ol className="space-y-3 pr-4 border-r border-line">
            {logs.map((log) => (
              <li key={log.id} className="relative">
                <i className="absolute -right-[21px] top-1.5 w-2 h-2 rounded-full bg-orange-400" />

                <div className="text-[12px] font-semibold text-ink break-words">
                  {[log.subject, log.type_label || log.type]
                    .filter(Boolean)
                    .join(" · ")}
                </div>

                <div className="mt-1 text-[10px] text-neutral-400">
                  {formatDateTime(log.communicated_at || log.created_at)}
                  {" · "}
                  {log.created_by?.name || "—"}
                </div>

                <p className="mt-1 text-[11px] text-neutral-600 leading-6 whitespace-pre-wrap break-words">
                  {log.notes || log.content || "—"}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>

      {showModal && (
        <CommunicationModal
          onClose={() => {
            if (!loading) setShowModal(false);
          }}
          onSubmit={handleSubmit}
          saving={loading}
        />
      )}
    </>
  );
}
