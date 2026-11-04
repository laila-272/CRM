import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * Shared field used by Login and Register: bold label, optional hint,
 * 44px input with leading icon and (for passwords) its own show/hide toggle.
 */
const AuthInput = forwardRef(function AuthInput(
  {
    id,
    label,
    optionalLabel,
    hint,
    icon: Icon,
    error,
    type = "text",
    showLabel,
    hideLabel,
    reserveHint = false,
    ...rest
  },
  ref,
) {
  const isPassword = type === "password";
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-[13px] font-bold leading-4 text-white"
      >
        {label}
        {optionalLabel && (
          <span className="font-normal text-[#8f8279]"> ({optionalLabel})</span>
        )}
      </label>
      {hint ? (
        <p className="mt-[6px] text-[11px] leading-[13px] text-[#7d6e64]">
          {hint}
        </p>
      ) : reserveHint ? (
        <p aria-hidden="true" className="mt-[6px] hidden h-[13px] sm:block" />
      ) : null}

      <div
        className={`group relative ${hint ? "mt-[9px]" : reserveHint ? "mt-[7px] sm:mt-[9px]" : "mt-[7px]"}`}
      >
        {Icon && (
          <Icon
            size={16}
            strokeWidth={2}
            className="pointer-events-none absolute start-[14px] top-1/2 -translate-y-1/2 text-[#4d3d34] transition-colors group-focus-within:text-accent"
          />
        )}
        <input
          ref={ref}
          id={id}
          type={isPassword && visible ? "text" : type}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`h-[44px] w-full rounded-[10px] border bg-[#0e0705] text-[13px] text-white outline-none transition-[border-color,box-shadow] placeholder:text-[#6e5f56] ${
            Icon ? "ps-[42px]" : "ps-[14px]"
          } ${isPassword ? "pe-[46px]" : "pe-[14px]"} ${
            error
              ? "border-red-500/70 focus:shadow-[0_0_0_3px_rgba(239,68,68,.15)]"
              : "border-[#6b3418]/60 focus:border-accent focus:shadow-[0_0_0_3px_rgba(234,106,26,.16)]"
          }`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? hideLabel : showLabel}
            aria-pressed={visible}
            className="absolute end-[14px] top-1/2 -translate-y-1/2 rounded p-1 text-[#ee7a1f] transition-colors hover:text-[#ff994d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            {visible ? (
              <EyeOff size={17} strokeWidth={2.2} />
            ) : (
              <Eye size={17} strokeWidth={2.2} />
            )}
          </button>
        )}
      </div>
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-[5px] text-[11.5px] text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
});

export default AuthInput;
