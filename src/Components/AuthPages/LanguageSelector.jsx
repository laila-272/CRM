import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";

export default function LanguageSelector({ lang, onChange, t }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (box.current && !box.current.contains(e.target)) setOpen(false);
    };
    const esc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  const options = [
    ["en", t.english],
    ["ar", t.arabic],
  ];

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-[158px] items-center justify-center gap-[7px] rounded-full border border-white/20 bg-[#0d0604]/90 text-[12.5px] font-medium text-white transition-colors hover:border-accent/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        <Globe size={14} strokeWidth={2} />
        <span dir="ltr">
          English <span className="text-white/70">/</span>{" "}
          <span className="text-white/80">Arabic</span>
        </span>
        <ChevronDown
          size={15}
          strokeWidth={2.5}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute end-0 top-[42px] z-30 w-[158px] overflow-hidden rounded-xl border border-accent/25 bg-[#120907] py-1 shadow-[0_12px_30px_rgba(0,0,0,.6)]"
        >
          {options.map(([code, label]) => (
            <li key={code} role="option" aria-selected={lang === code}>
              <button
                type="button"
                onClick={() => {
                  onChange(code);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between px-3.5 py-2 text-[12.5px] text-white/90 hover:bg-accent/15"
              >
                {label}
                {lang === code && <Check size={14} className="text-accent" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
