import { useLayoutEffect, useRef, useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { fmtDate, statusOf, PRIORITY_CLS } from "../../data/Tasks.js";

const VISIBLE_CARDS = 3;

const COLUMN_TITLE = {
  متأخرة: "text-red-500",
  اليوم: "text-ink",
  قادمة: "text-ink",
  مكتملة: "text-green-600",
};

function Badge({ cls = "", children }) {
  return (
    <span
      className={`text-[9.5px] font-semibold rounded-full px-2 py-0.5 ${cls}`}
    >
      {children}
    </span>
  );
}

function KanbanCard({ task, onOpen, onToggle }) {
  const st = statusOf(task);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", String(task.id));
        e.dataTransfer.effectAllowed = "move";
      }}
      className="bg-white border border-line rounded-xl p-3 shadow-sm cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center justify-between">
        <span className={`text-[9.5px] ${PRIORITY_CLS[task.priority] ?? ""}`}>
          {task.priority}
        </span>
      </div>

      <button
        onClick={() => onOpen(task)}
        className={`mt-2 block text-right text-[12px] font-bold text-ink hover:underline ${
          task.done ? "line-through opacity-70" : ""
        }`}
      >
        {task.title}
      </button>

      <div className="mt-1 text-[10px] text-neutral-500">{task.customer}</div>

      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-neutral-500">
        <span className="px-1 py-0.5 rounded-full border border-neutral-200 bg-neutral-50/50">
          المسؤول:{" "}
          <span className="font-semibold text-neutral-700">{task.owner}</span>
        </span>

        <span dir="ltr" className="shrink-0">
          {fmtDate(task.due)} · {task.time}
        </span>
      </div>

      <div className="mt-2.5 flex items-center justify-between">
        <Badge>{st}</Badge>

        <button
          onClick={() => onToggle(task)}
          aria-label={task.done ? "إعادة فتح" : "إكمال"}
          title={task.done ? "إعادة فتح المهمة" : "إكمال المهمة"}
          className={
            task.done ? "text-green-600" : "text-neutral-400 hover:text-ink"
          }
        >
          {task.done ? <CheckCircle2 size={16} /> : <Circle size={16} />}
        </button>
      </div>
    </div>
  );
}

function KanbanColumn({ status, tasks, onDrop, onOpen, onToggle, onAdd }) {
  const cardsRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(null);

  useLayoutEffect(() => {
    const container = cardsRef.current;

    if (!container) return;

    const updateHeight = () => {
      const cards = Array.from(container.children);
      const visibleCards = cards.slice(0, VISIBLE_CARDS);

      if (visibleCards.length === 0) {
        setMaxHeight(null);
        return;
      }

      const containerTop = container.getBoundingClientRect().top;

      const lastCard = visibleCards[visibleCards.length - 1];

      const lastCardBottom = lastCard.getBoundingClientRect().bottom;

      setMaxHeight(lastCardBottom - containerTop);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);

    observer.observe(container);

    Array.from(container.children).forEach((child) => {
      observer.observe(child);
    });

    return () => observer.disconnect();
  }, [tasks]);

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e, status)}
      className="rounded-xl bg-[#F1F2F4] border border-line p-2.5 h-fit"
    >
      <div className="flex items-center justify-between px-1 pb-2">
        <span
          className={`text-[12px] font-bold ${
            COLUMN_TITLE[status] ?? "text-ink"
          }`}
        >
          {status}
        </span>

        <span className="text-[9.5px] bg-white text-neutral-500 rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      <div
        ref={cardsRef}
        className="space-y-2.5 overflow-y-auto pl-1 [scrollbar-width:thin]"
        style={{
          maxHeight:
            tasks.length > VISIBLE_CARDS ? (maxHeight ?? undefined) : undefined,
        }}
      >
        {tasks.map((task) => (
          <KanbanCard
            key={task.id}
            task={task}
            onOpen={onOpen}
            onToggle={onToggle}
          />
        ))}
      </div>

      <button
        onClick={() => onAdd(status)}
        className="mt-2 w-full rounded-lg text-[10.5px] text-neutral-500 hover:text-ink"
      >
        + إضافة مهمة
      </button>
    </div>
  );
}

export default function TasksKanbanView({
  columns = [],
  onDrop,
  onOpen,
  onToggle,
  onAdd,
}) {
  return (
    <div className="mt-4 overflow-x-auto pb-2">
      <div className="grid grid-flow-col auto-cols-[minmax(230px,1fr)] gap-3 min-w-[960px] lg:min-w-0 lg:grid-flow-row lg:grid-cols-4">
        {columns.map(({ status, tasks }) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasks}
            onDrop={onDrop}
            onOpen={onOpen}
            onToggle={onToggle}
            onAdd={onAdd}
          />
        ))}
      </div>
    </div>
  );
}
