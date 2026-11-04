import { Lock, User } from "lucide-react";

/**
 * Responsive decorative CRM dashboard preview.
 * The illustration keeps its original proportions while scaling with its container.
 */
export default function DashboardPreview({
  variant = "login",
  className = "",
}) {
  const Icon = variant === "register" ? User : Lock;

  return (
    <div
      dir="ltr"
      className={`relative w-full max-w-[340px] aspect-[389/250] ${className}`}
    >
      <div className="absolute inset-0 overflow-hidden rounded-t-[14px] border border-white/[0.08] border-b-0 bg-gradient-to-b from-[#150b07] to-[#0d0604] shadow-[0_-6px_30px_rgba(234,106,26,.06)]">
        {/* Window chrome */}
        <div className="flex items-center gap-[4px] px-[3.1%] pt-[2.4%]">
          <i className="h-[4px] w-[4px] rounded-full bg-[#ef5a1f]" />
          <i className="h-[4px] w-[4px] rounded-full bg-[#e8a21e]" />
          <i className="h-[4px] w-[4px] rounded-full bg-[#2fc45d]" />
          <i className="ms-1 h-[5px] w-[15%] rounded-full bg-white/[0.07]" />
        </div>

        <div className="absolute inset-x-[3.1%] top-[8%] bottom-[3%] flex gap-[2%]">
          {/* Sidebar */}
          <div className="w-[10.5%] shrink-0">
            <i className="block h-[11px] rounded-[2px] bg-gradient-to-r from-[#f08a24] to-[#c9520f]" />
            {[0, 1, 2, 3].map((i) => (
              <i
                key={i}
                className="mt-[5px] block h-[2.5px] max-w-full rounded-full bg-white/[0.12]"
                style={{ width: i % 2 ? "70%" : "82%" }}
              />
            ))}
          </div>

          <div className="min-w-0 flex-1">
            {/* Top cards */}
            <div className="flex gap-[2%]">
              {[0, 1].map((c) => (
                <div
                  key={c}
                  className="h-[26px] min-w-0 flex-1 rounded-[4px] border border-white/[0.06] bg-white/[0.025] p-[4px]"
                >
                  <i
                    className="block h-[2px] w-[52%] rounded-full bg-gradient-to-r from-[#f08a24] to-[#c9520f]"
                    style={{ opacity: c ? 0.5 : 1 }}
                  />
                  <i className="mt-[3px] block h-[2px] w-[78%] rounded-full bg-white/[0.14]" />
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="mt-[2%] h-[60%] overflow-hidden rounded-[4px] border border-white/[0.06] bg-white/[0.02]">
              <svg
                viewBox="0 0 330 150"
                className="h-full w-full"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="dpFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ea6a1a" stopOpacity=".7" />
                    <stop offset="1" stopColor="#ea6a1a" stopOpacity=".04" />
                  </linearGradient>
                  <linearGradient id="dpFill2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#a8420f" stopOpacity=".55" />
                    <stop offset="1" stopColor="#a8420f" stopOpacity=".02" />
                  </linearGradient>
                </defs>
                <path
                  d="M0 126 C40 120 60 100 100 104 S150 124 190 94 S250 40 290 48 S320 52 330 50 V150 H0Z"
                  fill="url(#dpFill2)"
                />
                <path
                  d="M0 132 C40 128 70 114 105 112 S150 128 192 100 S248 62 292 70 S322 74 330 72 V150 H0Z"
                  fill="url(#dpFill)"
                />
                <path
                  d="M0 126 C40 120 60 100 100 104 S150 124 190 94 S250 40 290 48 S320 52 330 50"
                  fill="none"
                  stroke="#f08a24"
                  strokeWidth="1.4"
                />
              </svg>
            </div>

            {/* Bottom cards */}
            <div className="mt-[2%] flex gap-[2%]">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[24px] min-w-0 flex-1 rounded-[4px] border border-white/[0.06] bg-white/[0.025] p-[4px]"
                >
                  {i === 1 ? (
                    <span className="mx-auto block h-[10px] w-[10px] rounded-full border-2 border-[#f08a24]/70" />
                  ) : (
                    <>
                      <i className="block h-[2px] w-[50%] rounded-full bg-[#f08a24]/70" />
                      <i className="mt-[3px] block h-[2px] w-[75%] rounded-full bg-white/[0.12]" />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating icon */}
      <div className="absolute -start-[10%] top-[38%] flex h-[36px] w-[36px] items-center justify-center rounded-lg border border-[#e07a26]/50 bg-[#1a0d07] shadow-[0_0_14px_rgba(234,106,26,.18)]">
        <Icon
          size={16}
          strokeWidth={2.4}
          className="text-[#f08a24]"
          fill="currentColor"
        />
      </div>
    </div>
  );
}
