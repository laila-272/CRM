import { useState } from 'react'
import { X } from 'lucide-react'
import { STATUSES, SOURCES, PROJECTS, OWNERS } from '../../data/customers.js'

const empty = {
  name: '', phone: '', altPhone: '', email: '', city: 'القاهرة الجديدة', job: '',
  project: PROJECTS[0], unitType: 'شقة – 3 غرف', budget: '', source: SOURCES[0],
  status: STATUSES[0], owner: OWNERS[0], payment: '', nextFollowUp: '', note: '',
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] text-neutral-500 mb-1">{label}</span>
      {children}
    </label>
  )
}

export default function CustomerFormModal({ initial, onSave, onClose }) {
  const [f, setF] = useState({ ...empty, ...(initial || {}) })
  const [err, setErr] = useState('')
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const select = (k, list) => (
    <select className="input" value={f[k]} onChange={set(k)}>{list.map((o) => <option key={o}>{o}</option>)}</select>
  )

  const submit = (e) => {
    e.preventDefault()
    if (!f.name.trim() || !/^\d{8,15}$/.test(f.phone.trim())) {
      setErr('الاسم مطلوب ورقم الهاتف يجب أن يكون أرقامًا فقط (8–15 رقمًا).')
      return
    }
    onSave({ ...f, name: f.name.trim(), phone: f.phone.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/45 grid place-items-center p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form onSubmit={submit} className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5 shadow-xl" dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold">{initial ? 'تعديل بيانات العميل' : 'إضافة عميل'}</h2>
          <button type="button" onClick={onClose} aria-label="إغلاق"><X size={18} /></button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="اسم العميل"><input className="input" value={f.name} onChange={set('name')} /></Field>
          <Field label="رقم الهاتف"><input className="input" dir="ltr" inputMode="numeric" value={f.phone} onChange={set('phone')} /></Field>
          <Field label="رقم بديل"><input className="input" dir="ltr" value={f.altPhone} onChange={set('altPhone')} /></Field>
          <Field label="البريد الإلكتروني"><input className="input" dir="ltr" type="email" value={f.email} onChange={set('email')} /></Field>
          <Field label="المدينة"><input className="input" value={f.city} onChange={set('city')} /></Field>
          <Field label="الوظيفة"><input className="input" value={f.job} onChange={set('job')} /></Field>
          <Field label="المشروع المهتم به">{select('project', PROJECTS)}</Field>
          <Field label="نوع الوحدة"><input className="input" value={f.unitType} onChange={set('unitType')} /></Field>
          <Field label="الميزانية"><input className="input" dir="ltr" placeholder="1.5 – 2 EGP M" value={f.budget} onChange={set('budget')} /></Field>
          <Field label="المصدر">{select('source', SOURCES)}</Field>
          <Field label="الحالة">{select('status', STATUSES)}</Field>
          <Field label="الشخص المسؤول">{select('owner', OWNERS)}</Field>
          <Field label="طريقة الدفع"><input className="input" value={f.payment} onChange={set('payment')} /></Field>
          <Field label="المتابعة القادمة"><input className="input" placeholder="غدًا / 15/7" value={f.nextFollowUp} onChange={set('nextFollowUp')} /></Field>
        </div>
        <Field label="ملاحظات">
          <textarea className="input !h-20 py-2 mt-0" value={f.note} onChange={set('note')} />
        </Field>
        {err && <p className="text-red-600 text-xs mt-2">{err}</p>}
        <div className="flex gap-2 mt-4">
          <button className="btn btn-dark" type="submit">{initial ? 'حفظ التعديلات' : 'إضافة العميل'}</button>
          <button className="btn" type="button" onClick={onClose}>إلغاء</button>
        </div>
      </form>
    </div>
  )
}
