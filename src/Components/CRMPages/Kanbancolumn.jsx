import { useLayoutEffect, useRef, useState } from "react";

const VISIBLE_CARDS = 3;

/**
 * Column container used by the Deals board. Same look as the column in TasksKanbanView:
 * light gray surface, bordered, count badge, and the card list scrolls after VISIBLE_CARDS cards.
 *
 * title / titleCls : column title (and optional color class)
 * count            : text shown in the count badge
 * itemCount        : number of children cards (decides when the list becomes scrollable)
 */
export default function KanbanColumn({
  title,
  titleCls = "text-ink",
  count,
  itemCount,
  children,
}) {
  const cardsRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState(null);

  useLayoutEffect(() => {
    const container = cardsRef.current;
    if (!container) return;

    const updateHeight = () => {
      const visible = Array.from(container.children).slice(0, VISIBLE_CARDS);
      if (!visible.length) return setMaxHeight(null);
      const top = container.getBoundingClientRect().top;
      const bottom = visible[visible.length - 1].getBoundingClientRect().bottom;
      setMaxHeight(bottom - top);
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(container);
    Array.from(container.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [children]);

  return (
    <div className="rounded-xl bg-[#F1F2F4] border border-line p-2.5 h-fit min-w-0">
      <div className="flex items-center justify-between px-1 pb-2">
        <span className={`text-[12px] font-bold ${titleCls}`}>{title}</span>
        <span className="text-[9.5px] bg-white text-neutral-500 rounded-full px-2 py-0.5">
          {count}
        </span>
      </div>

      <div
        ref={cardsRef}
        className="space-y-2.5 overflow-y-auto pl-1 [scrollbar-width:thin]"
        style={{
          maxHeight:
            itemCount > VISIBLE_CARDS ? (maxHeight ?? undefined) : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}
