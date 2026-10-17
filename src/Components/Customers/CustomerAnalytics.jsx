import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { SOURCES } from '../../data/customers.js'

const trend = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو'].map((m, i) => ({ m, v: [12, 18, 15, 26, 22, 34, 40][i] }))
const COLORS = ['#ea580c', '#111111', '#a3a3a3', '#fdba74', '#525252']

export default function CustomerAnalytics({ customers }) {
  const bySource = SOURCES.map((s) => ({ name: s, value: customers.filter((c) => c.source === s).length })).filter((d) => d.value)
  const hot = customers.filter((c) => c.score >= 70).length
  const mid = customers.filter((c) => c.score >= 40 && c.score < 70).length
  const low = customers.length - hot - mid
  const total = customers.length || 1
  const rows = [
    { label: 'فرصة قوية (+70)', n: hot, color: 'bg-orange-500' },
    { label: 'فرصة متوسطة (40–69)', n: mid, color: 'bg-neutral-800' },
    { label: 'فرصة ضعيفة (أقل من 40)', n: low, color: 'bg-neutral-300' },
  ]

  return (
    <section>
      <h2 className="text-sm font-bold mb-0.5">تحليل جودة العملاء</h2>
      <p className="text-[11px] text-neutral-500 mb-3">اعرف من الذي يستحق المتابعة أولًا</p>
      <div className="grid gap-3 lg:grid-cols-3">
        <div className="card p-4">
          <h3 className="text-[12.5px] font-bold mb-2">اتجاه العملاء</h3>
          <div dir="ltr" className="h-[150px]">
            <ResponsiveContainer>
              <LineChart data={trend}>
                <XAxis dataKey="m" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={24} />
                <Tooltip contentStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="v" name="عملاء" stroke="#ea580c" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-[12.5px] font-bold mb-2">مصادر العملاء</h3>
          <div className="flex items-center gap-3">
            <div dir="ltr" className="h-[150px] w-[150px] relative shrink-0">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={bySource} dataKey="value" innerRadius={48} outerRadius={68} paddingAngle={2} stroke="none">
                    {bySource.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 grid place-items-center pointer-events-none text-center leading-tight">
                <div><div className="text-lg font-bold">{customers.length}</div><div className="text-[9px] text-neutral-500">عميل</div></div>
              </div>
            </div>
            <ul className="text-[11px] space-y-1.5 flex-1">
              {bySource.map((d, i) => (
                <li key={d.name} className="flex items-center gap-2">
                  <i className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="flex-1">{d.name}</span><b>{d.value}</b>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="text-[12.5px] font-bold mb-2">توزيع الجودة</h3>
          <div className="flex h-2 rounded-full overflow-hidden bg-neutral-100 mb-4">
            {rows.map((r) => <div key={r.label} className={r.color} style={{ width: `${(r.n / total) * 100}%` }} />)}
          </div>
          <ul className="space-y-3">
            {rows.map((r) => (
              <li key={r.label} className="flex items-center gap-2 text-[11.5px]">
                <i className={`w-2 h-2 rounded-full ${r.color}`} />
                <span className="flex-1">{r.label}</span>
                <b>{r.n} عميل</b>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
