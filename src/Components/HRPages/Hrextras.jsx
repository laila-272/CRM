// src/Components/HRPages/Hrextras.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

export function Badge({ cls, children }) {
  return (
    <span
      className={`inline-flex h-5 items-center whitespace-nowrap rounded-full px-2.5 text-[9.5px] font-semibold ${cls}`}
    >
      {children}
    </span>
  );
}

/** "…" button with a dropdown. The menu is position:fixed so scrolling table wrappers never clip it. */
export function ActionMenu({ items }) {
  const [pos, setPos] = useState(null);
  const btn = useRef(null);
  const open = !!pos;

  useEffect(() => {
    if (!open) return;
    const close = () => setPos(null);
    const onDown = (e) => !e.target.closest?.("[data-action-menu]") && close();
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const toggle = () => {
    if (open) return setPos(null);
    const r = btn.current.getBoundingClientRect();
    setPos({
      top: r.bottom + 4,
      left: Math.max(8, Math.min(r.left, window.innerWidth - 168)),
    });
  };

  return (
    <div data-action-menu className="inline-block">
      <button
        ref={btn}
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="خيارات"
        className="grid h-6 w-6 place-items-center rounded-full border border-line bg-white text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-ink"
      >
        <MoreHorizontal size={13} />
      </button>
      {open && (
        <div
          role="menu"
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-50 min-w-[160px] rounded-lg border border-line bg-white p-1 shadow-lg"
        >
          {items.map((it) => (
            <button
              key={it.label}
              role="menuitem"
              onClick={() => {
                setPos(null);
                it.onClick();
              }}
              className={`block w-full rounded-md px-2.5 py-1.5 text-right text-[11px] transition-colors hover:bg-neutral-100 ${it.danger ? "text-red-500" : "text-ink"}`}
            >
              {it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** const [toast, show] = useToast();  render {toast} once, call show("...") */
export function useToast() {
  const [state, setState] = useState({ msg: "", on: false });
  const timer = useRef();
  const show = useCallback((msg) => {
    clearTimeout(timer.current);
    setState({ msg, on: true });
    timer.current = setTimeout(
      () => setState((s) => ({ ...s, on: false })),
      2800,
    );
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  const node = (
    <div
      role="status"
      className={`fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-[11px] font-semibold text-white shadow-lg transition-all duration-300 ${
        state.on
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      {state.msg}
    </div>
  );
  return [node, show];
}
