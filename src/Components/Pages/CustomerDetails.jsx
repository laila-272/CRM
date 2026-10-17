import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, MessageCircle, Pencil, Trash2, ChevronDown } from 'lucide-react'
import { useCustomers } from '../../context/CustomersContext.jsx'
import StatusBadge from '../Customers/StatusBadge.jsx'
import CustomerFormModal from '../Customers/CustomerFormModal.jsx'
import ConfirmDialog from '../Customers/ConfirmDialog.jsx'

function Info({ label, value, ltr }) {
  return (
    <div>
      <div className="text-[11px] text-neutral-500 mb-1">{label}</div>
      <div className="text-[13px] font-semibold">{ltr ? <span className="ltr-text">{value || '—'}</span> : value || '—'}</div>
    </div>
  )
}

function Summary({ label, value, sub, subClass = 'text-neutral-400', ltr }) {
  return (
    <div className="card px-5 py-4">
      <div className="text-[11px] text-neutral-500">{label}</div>
      <div className="text-2xl font-extrabold my-1.5">{ltr ? <span className="ltr-text">{value}</span> : value}</div>
      <div className={`text-[11px] ${subClass}`}>{sub}</div>
    </div>
  )
}

export default function CustomerDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { customers, updateCustomer, deleteCustomer } = useCustomers()
  const [editing, setEditing] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const [menu, setMenu] = useState(false)
  const c = customers.find((x) => String(x.id) === id)

  if (!c) {
    return (
      <div className="card p-8 text-center">
        <p className="mb-3">لم يتم العثور على هذا العميل. ربما تم حذفه.</p>
        <Link to="/potential-clients" className="btn btn-dark">العودة إلى العملاء المحتملين</Link>
      </div>
    )
  }

  const strong = c.score >= 70
  const wa = `https://wa.me/2${c.phone.replace(/^0/, '0')}`
  const exportOne = () => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows = [['الاسم', c.name], ['الهاتف', c.phone], ['البريد', c.email], ['المشروع', c.project], ['الميزانية', c.budget], ['المصدر', c.source], ['الحالة', c.status]]
    const blob = new Blob(['\uFEFF' + rows.map((r) => r.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${c.name}.csv`; a.click(); URL.revokeObjectURL(a.href)
    setMenu(false)
  }

  const history = [
    { t: 'قادم · إرسال مسودة العقد', d: `غدًا 11:00 ص · ${c.owner}`, up: true },
    { t: 'اتصال هاتفي · تم الرد', d: `اليوم 09:10 ص · ${c.owner}` },
    { t: 'رسالة واتساب · تفاصيل المشروع', d: `${c.createdAt} 04:30 م · ${c.owner}` },
  ]

  return (
    <div className="space-y-4">
      <Link to="/potential-clients" className="inline-flex items-center gap-1 text-[12px] text-neutral-500 hover:text-ink">
        <ArrowRight size={13} /> العملاء المحتملون
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold">{c.name}</h1>
            <StatusBadge status={c.status} />
          </div>
          <p className="text-[12px] text-neutral-500 mt-1.5">عميل محتمل · أُضيف في {c.createdAt} · آخر تواصل 10/7</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <a href={wa} target="_blank" rel="noreferrer" aria-label="واتساب" className="w-9 h-9 rounded-lg bg-green-500 text-white grid place-items-center hover:bg-green-600"><MessageCircle size={17} /></a>
          <div className="relative">
            <button className="btn" onClick={() => setMenu(!menu)}>تصدير <ChevronDown size={12} /></button>
            {menu && <div className="absolute z-10 mt-1 card shadow-md min-w-[130px] text-[12px]"><button className="w-full text-right px-3 py-2 hover:bg-neutral-50" onClick={exportOne}>ملف CSV</button></div>}
          </div>
          <button className="btn" onClick={() => setEditing(true)}><Pencil size={12} /> تعديل</button>
          <button className="btn text-red-600" onClick={() => setConfirmDel(true)}><Trash2 size={12} /> حذف</button>
          <button className="btn btn-dark" onClick={() => { updateCustomer(c.id, { status: 'ساخن' }) }}>+ تحويل إلى صفقة</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Summary label="درجة العميل" value={c.score} sub={strong ? 'فرصة قوية (+70)' : 'فرصة متوسطة'} subClass={strong ? 'text-orange-700' : 'text-neutral-500'} />
        <Summary label="الميزانية" value={c.budget} ltr sub="حسب طلب العميل" />
        <Summary label="المتابعة القادمة" value={c.nextFollowUp} sub="مكالمة هاتفية 11:00 ص" />
        <Summary label="المصدر" value={c.source} sub={`أُضيف ${c.createdAt}`} />
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-4 items-start">
        <div className="space-y-4">
          <section className="card p-5">
            <h2 className="text-base font-bold mb-4">معلومات التواصل</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-4">
              <Info label="الاسم الكامل" value={c.name} />
              <Info label="الهاتف" value={c.phone} ltr />
              <Info label="رقم بديل" value={c.altPhone} ltr />
              <Info label="البريد الإلكتروني" value={c.email} ltr />
              <Info label="المدينة" value={c.city} />
              <Info label="الوظيفة" value={c.job} />
            </div>
          </section>

          <section className="card p-5">
            <h2 className="text-base font-bold mb-4">الاهتمام والميزانية</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-4">
              <Info label="المشروع المهتم به" value={c.project} />
              <Info label="نوع الوحدة" value={c.unitType} />
              <Info label="الميزانية" value={c.budget} ltr />
              <Info label="طريقة الدفع" value={c.payment} />
              <Info label="المصدر" value={c.source} />
              <Info label="الحالة" value={c.status} />
            </div>
          </section>

          <section className="card p-5">
            <h2 className="text-base font-bold mb-3">ملاحظات</h2>
            <p className="text-[13px] leading-7 text-neutral-700">{c.note || 'لا توجد ملاحظات.'}</p>
          </section>
        </div>

        <div className="space-y-4">
          <section className="card p-5">
            <h2 className="text-base font-bold mb-3">المسؤول عن الصفقة</h2>
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-orange-100 text-orange-700 grid place-items-center font-bold text-sm">{c.owner[0]}</span>
              <div className="leading-tight">
                <div className="text-[13px] font-semibold text-orange-700">{c.owner}</div>
                <div className="text-[11px] text-neutral-500">مسؤولة مبيعات</div>
              </div>
            </div>
          </section>

          <section className="card p-5">
            <h2 className="text-base font-bold mb-3">سجل التواصل</h2>
            <div className="rounded-lg bg-orange-50 p-3 space-y-2 mb-4 text-[12px]">
              <div><div className="text-[10.5px] text-orange-700">آخر تواصل</div>مكالمة هاتفية · تم الرد · اليوم 09:10</div>
              <div><div className="text-[10.5px] text-orange-700">نتيجة التواصل</div>العميل مهتم ويطلب تعديل شروط الدفع، وبانتظار مسودة العقد</div>
              <div><div className="text-[10.5px] text-orange-700">التواصل القادم</div>غدًا 11:00 ص · إرسال مسودة العقد</div>
            </div>
            <ol className="space-y-3 pr-4 border-r border-line">
              {history.map((h) => (
                <li key={h.t} className="relative">
                  <i className={`absolute -right-[21px] top-1.5 w-2 h-2 rounded-full ${h.up ? 'bg-orange-500' : 'bg-neutral-400'}`} />
                  <div className={`text-[12.5px] font-semibold ${h.up ? 'text-orange-700' : ''}`}>{h.t}</div>
                  <div className="text-[11px] text-neutral-500">{h.d}</div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      {editing && <CustomerFormModal initial={c} onClose={() => setEditing(false)} onSave={(d) => { updateCustomer(c.id, d); setEditing(false) }} />}
      {confirmDel && (
        <ConfirmDialog title="حذف العميل" message={`هل أنت متأكد من حذف ${c.name}؟ لا يمكن التراجع عن هذا الإجراء.`}
          onCancel={() => setConfirmDel(false)} onConfirm={() => { deleteCustomer(c.id); navigate('/potential-clients') }} />
      )}
    </div>
  )
}
