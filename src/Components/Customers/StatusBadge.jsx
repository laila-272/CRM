const styles = {
  جديد: "bg-[#F3F4F6] text-[#818181] rounded-xl",
  مهتم: "bg-[#F3F4F6] text-[#818181] rounded-xl",
  معاينة: "bg-[#F3F4F6] text-[#818181] rounded-xl",
  متابعة: "bg-[#F3F4F6] text-[#818181] rounded-xl",
  "لا رد": "bg-[#FFF1F2] text-[#D92D20] rounded-xl",
};
export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${styles[status] || styles["جديد"]}`}
    >
      {status}
    </span>
  );
}
