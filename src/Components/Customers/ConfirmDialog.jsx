export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "حذف",
  onConfirm,
  onCancel,
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 grid place-items-center p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="card w-full max-w-sm p-5 shadow-xl" role="alertdialog">
        <h3 className="font-bold mb-1">{title}</h3>
        <p className="text-sm text-neutral-600 mb-4">{message}</p>
        <div className="flex gap-2">
          <button
            className="btn !bg-red-600 !text-white !border-red-600"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
          <button className="btn" onClick={onCancel}>
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
