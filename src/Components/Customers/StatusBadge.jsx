const styles = {
  'جديد': 'bg-neutral-100 text-neutral-600',
  'مهتم': 'bg-orange-50 text-orange-700',
  'ساخن': 'bg-red-50 text-red-600',
  'متابعة': 'bg-orange-50 text-orange-600',
  'بارد': 'bg-neutral-100 text-neutral-500',
}
export default function StatusBadge({ status }) {
  return <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${styles[status] || styles['جديد']}`}>{status}</span>
}
