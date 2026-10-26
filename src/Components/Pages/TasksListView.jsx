import { Trash2 } from "lucide-react";
import { card } from "./ui.jsx";
import { statusOf, fmtDate, TYPE_CLS, STATUS_CLS } from "../../data/Tasks.js";

function Badge({ cls = "", children }) {
  return (
    <span
      className={`text-[9.5px] font-semibold rounded-full px-2 py-0.5 ${cls}`}
    >
      {children}
    </span>
  );
}

function Avatar({ name }) {
  return (
    <span className="w-8 h-8 shrink-0 rounded-full bg-blue-50 text-blue-600 grid place-items-center text-[11px] font-bold">
      {name?.[0] ?? "؟"}
    </span>
  );
}

function TaskRow({ task, onOpen, onDelete, onOpenCustomer, onEdit }) {
  const st = statusOf(task);

  return (
    <div
      dir="rtl"
      className={`${card} p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        task.done ? "opacity-70" : ""
      }`}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Avatar name={task.owner} />

        <div className="flex-1 min-w-0">
          <Badge cls={STATUS_CLS[st]}>{st}</Badge>

          <div className="flex items-center gap-2 flex-wrap mt-2">
            <h3 className="text-sm font-bold text-ink truncate">
              {task.title}
            </h3>

            <Badge cls={TYPE_CLS[task.type]}>{task.type}</Badge>
          </div>

          <p className="mt-1 text-[11px] text-neutral-400">
            <span className="text-neutral-600 font-medium">
              {task.customer}
            </span>

            {task.company && ` · ${task.company}`}
            {task.source && ` · المصدر: ${task.source}`}
          </p>

          <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-500 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full border border-neutral-200 bg-neutral-50/50">
              الموعد:{" "}
              <span className="font-semibold text-neutral-700">
                {fmtDate(task.due)} {task.time}
              </span>
            </span>

            <span className="px-2.5 py-0.5 rounded-full border border-neutral-200 bg-neutral-50/50">
              المسؤول:{" "}
              <span className="font-semibold text-neutral-700">
                {task.owner}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 w-full md:w-auto shrink-0">
        <button
          onClick={() => onOpenCustomer?.(task)}
          className="w-full md:w-auto px-3 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-medium rounded-full transition-colors"
        >
          فتح صفحة العميل
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpen(task)}
            className="px-3.5 py-1.5 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs rounded-full transition-colors"
          >
            التفاصيل
          </button>

          <button
            onClick={() => onEdit?.(task)}
            className="px-3.5 py-1.5 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs rounded-full transition-colors"
          >
            تعديل
          </button>

          <button
            onClick={() => onDelete(task)}
            aria-label="حذف"
            className="w-8 h-8 grid place-items-center rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TasksListView({
  rows = [],
  onOpen,
  onDelete,
  onOpenCustomer,
  onEdit,
}) {
  if (rows.length === 0) {
    return (
      <div className={`${card} p-8 text-center text-[11px] text-neutral-400`}>
        لا توجد مهام مطابقة
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          onOpen={onOpen}
          onDelete={onDelete}
          onOpenCustomer={onOpenCustomer}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
