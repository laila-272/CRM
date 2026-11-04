import { ArrowRight, Loader2 } from "lucide-react";

export default function SubmitButton({ loading, children }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="flex h-[43px] w-full items-center justify-center gap-[8px] rounded-full bg-gradient-to-r from-[#8c3b14] via-[#c4581a] to-[#e88a1f] text-[13px] font-bold text-white shadow-[0_8px_26px_rgba(234,106,26,.22)] transition-[filter,transform,box-shadow] hover:brightness-110 hover:shadow-[0_10px_30px_rgba(234,106,26,.34)] active:scale-[.995] disabled:cursor-not-allowed disabled:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {children}
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <ArrowRight size={16} strokeWidth={2.6} className="rtl:rotate-180" />
      )}
    </button>
  );
}
