/**
 * Wordmark recreation (no logo file was available in the workspace).
 * To use the real asset, replace the body with:
 *   <img src={logoUrl} alt="Strong" className="h-[42px] w-auto" />
 */
export default function StrongLogo({ className = "" }) {
  return (
    <div
      className={`inline-flex flex-col items-start leading-none ${className}`}
      aria-label="Strong - since 2024"
      dir="ltr"
    >
      <span
        className="relative text-[21px] font-extrabold uppercase tracking-[0.02em] text-white"
        style={{ fontStretch: "expanded" }}
      >
        Strong
        <sup className="absolute -right-[7px] top-0 text-[6px] font-bold">
          ®
        </sup>
      </span>
      <span className="ms-[22px] mt-[3px] text-[10px] font-medium tracking-wide text-white/85">
        Since 2024
      </span>
    </div>
  );
}
