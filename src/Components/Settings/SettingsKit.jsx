import { useState, useRef } from "react";

export function Switch({ on, onChange, disabled, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!on)}
      dir="ltr"
      className={`relative h-[18px] w-[34px] shrink-0 rounded-full transition-colors ${
        on ? "bg-ink" : "bg-neutral-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span
        className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white transition-all ${
          on ? "left-[18px]" : "left-[2px]"
        }`}
      />
    </button>
  );
}

export function useToast() {
  const [msg, setMsg] = useState("");
  const t = useRef();
  const show = (m) => {
    setMsg(m);
    clearTimeout(t.current);
    t.current = setTimeout(() => setMsg(""), 2200);
  };
  const node = msg ? (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-4 py-2 text-[12px] font-semibold text-white shadow-lg">
      {msg}
    </div>
  ) : null;
  return [node, show];
}

export const field =
  "w-full h-10 rounded-lg bg-[#F5F5F5] border border-transparent px-3 text-[12px] text-ink outline-none focus:border-neutral-400";
