import { useState, useRef } from "react";
import { Users, CheckCircle2, Plus, X, Trash2 } from "lucide-react";
import {
  PageHeader,
  StatCard,
  card,
  btnDark,
  btnLight,
  SearchBox,
  Select,
  downloadCsv,
  th,
  td,
} from "../Shared/ui.jsx";
import { useToast, field } from "./SettingsKit.jsx";

const ROLES = [
  "مدير النظام",
  "مدير مبيعات",
  "مسؤول مبيعات",
  "مسؤول دعم",
  "مسؤول تسويق",
  "محاسب",
];
const SECTIONS = ["العملاء", "الصفقات", "العقود", "التقارير", "الإعدادات"];
const PERMS = ["عرض", "تعديل", "حذف"];
const INITIAL = [
  {
    id: 1,
    name: "نورة العتيبي",
    email: "noura@company.com",
    role: ROLES[0],
    last: "اليوم 09:15",
    active: true,
  },
  {
    id: 2,
    name: "سارة أحمد",
    email: "sara@company.com",
    role: ROLES[1],
    last: "اليوم 08:42",
    active: true,
  },
  {
    id: 3,
    name: "خالد المطيري",
    email: "khaled@company.com",
    role: ROLES[2],
    last: "أمس",
    active: true,
  },
  {
    id: 4,
    name: "فهد النوفري",
    email: "fahad@company.com",
    role: ROLES[3],
    last: "10 أكتوبر",
    active: true,
  },
  {
    id: 5,
    name: "هنا إبراهيم",
    email: "hana@company.com",
    role: ROLES[4],
    last: "—",
    active: false,
  },
  {
    id: 6,
    name: "محمد حسن",
    email: "m.hassan@company.com",
    role: ROLES[5],
    last: "2 أكتوبر",
    active: false,
  },
];
const MATRIX0 = {
  العملاء: [1, 1, 0],
  الصفقات: [1, 1, 0],
  العقود: [1, 1, 0],
  التقارير: [1, 0, 0],
  الإعدادات: [0, 0, 0],
};
const EMPTY = {
  name: "",
  email: "",
  role: ROLES[1],
  active: true,
  perms: SECTIONS.reduce((a, s) => ({ ...a, [s]: [1, 0, 0] }), {}),
};

export default function UsersPermissions() {
  const [users, setUsers] = useState(INITIAL);
  const [matrix, setMatrix] = useState(MATRIX0);
  const [q, setQ] = useState("");
  const [modal, setModal] = useState(null);
  const [err, setErr] = useState({});
  const [toast, show] = useToast();
  const matrixRef = useRef();

  const shown = users.filter((u) => u.name.includes(q) || u.email.includes(q));
  const activeCount = users.filter((u) => u.active).length;

  const open = (u) => {
    setErr({});
    setModal(
      u ? { ...EMPTY, ...u, perms: u.perms || EMPTY.perms } : { ...EMPTY },
    );
  };
  const save = () => {
    const e = {};
    if (!modal.name.trim()) e.name = "الاسم مطلوب";
    if (!/^\S+@\S+\.\S+$/.test(modal.email)) e.email = "بريد إلكتروني غير صالح";
    if (users.some((u) => u.email === modal.email && u.id !== modal.id))
      e.email = "البريد مستخدم بالفعل";
    setErr(e);
    if (Object.keys(e).length) return;
    if (modal.id)
      setUsers(users.map((u) => (u.id === modal.id ? { ...u, ...modal } : u)));
    else setUsers([{ ...modal, id: Date.now(), last: "—" }, ...users]);
    show(modal.id ? "تم تحديث المستخدم" : "تمت إضافة المستخدم");
    setModal(null);
  };
  const remove = () => {
    setUsers(users.filter((u) => u.id !== modal.id));
    show("تم حذف المستخدم");
    setModal(null);
  };
  const flip = (id) =>
    setUsers(users.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
  const setRole = (id, role) =>
    setUsers(users.map((u) => (u.id === id ? { ...u, role } : u)));
  const flipPerm = (s, i) =>
    setMatrix({ ...matrix, [s]: matrix[s].map((v, k) => (k === i ? +!v : v)) });
  const flipModalPerm = (s, i) =>
    setModal({
      ...modal,
      perms: {
        ...modal.perms,
        [s]: modal.perms[s].map((v, k) => (k === i ? +!v : v)),
      },
    });

  return (
    <div dir="rtl" className="">
      <PageHeader
        title="المستخدمون والصلاحيات"
        subtitle="إدارة حسابات الفريق وأدوارهم وصلاحيات الوصول إلى أقسام النظام"
      >
        <button className={btnDark} onClick={() => open()}>
          <Plus size={13} />
          دعوة مستخدم
        </button>
        <button
          className={btnLight}
          onClick={() =>
            matrixRef.current?.scrollIntoView({ behavior: "smooth" })
          }
        >
          إدارة الأدوار
        </button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 mt-2">
        <StatCard
          icon={Users}
          label="المستخدمون"
          value={users.length}
          tag="+5 هذا الشهر"
        />
        <StatCard
          icon={CheckCircle2}
          label="نشطون اليوم"
          value={activeCount}
          tag={`${Math.round((activeCount / users.length) * 100)}% من الفريق`}
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] mt-4">
        <div className={`${card} overflow-hidden`}>
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <h3 className="text-[14px] font-semibold">المستخدمون</h3>
              <p className="text-[10.5px] text-neutral-500">
                حسابات الفريق وأدوارهم
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SearchBox
                value={q}
                onChange={setQ}
                placeholder="بحث..."
                className="w-44"
              />
              <button
                className="text-[10.5px] font-semibold text-neutral-500"
                onClick={() =>
                  downloadCsv(
                    "users.csv",
                    ["الاسم", "البريد", "الدور", "الحالة"],
                    users.map((u) => [
                      u.name,
                      u.email,
                      u.role,
                      u.active ? "نشط" : "موقوف",
                    ]),
                  )
                }
              >
                عرض الكل
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className={th}>الاسم</th>
                  <th className={th}>البريد الإلكتروني</th>
                  <th className={th}>الدور</th>
                  <th className={th}>آخر دخول</th>
                  <th className={th}>الحالة</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => open(u)}
                    className="cursor-pointer border-t border-line hover:bg-neutral-50"
                  >
                    <td className={`${td} font-semibold`}>{u.name}</td>
                    <td
                      className={`${td} text-neutral-500`}
                      dir="ltr"
                      style={{ textAlign: "right" }}
                    >
                      {u.email}
                    </td>
                    <td className={td} onClick={(e) => e.stopPropagation()}>
                      <Select
                        value={u.role}
                        onChange={(v) => setRole(u.id, v)}
                        className="!h-7 !rounded-full !bg-[#F1F2F4] !text-[10px]"
                      >
                        {ROLES.map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </Select>
                    </td>
                    <td className={`${td} text-neutral-500`}>{u.last}</td>
                    <td className={td} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => flip(u.id)}
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${u.active ? "bg-[#F1F2F4] text-ink" : "bg-red-50 text-red-500"}`}
                      >
                        {u.active ? "نشط" : "موقوف"}
                      </button>
                    </td>
                  </tr>
                ))}
                {!shown.length && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-[11px] text-neutral-400"
                    >
                      لا توجد نتائج
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div ref={matrixRef} className={`${card} p-4`}>
          <h3 className="text-[14px] font-semibold">مصفوفة الصلاحيات</h3>
          <p className="mb-3 text-[10.5px] text-neutral-500">
            صلاحيات كل دور حسب القسم
          </p>
          <table className="w-full">
            <thead>
              <tr>
                <th className={th}>القسم</th>
                {PERMS.map((p) => (
                  <th key={p} className={`${th} text-center`}>
                    {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SECTIONS.map((s) => (
                <tr key={s} className="border-t border-line">
                  <td className={`${td} font-semibold`}>{s}</td>
                  {matrix[s].map((v, i) => (
                    <td key={i} className={`${td} text-center`}>
                      <button
                        onClick={() => flipPerm(s, i)}
                        className={`text-[10.5px] font-semibold ${v ? "text-emerald-600" : "text-neutral-300"}`}
                      >
                        {v ? "نعم" : "—"}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onClick={() => setModal(null)}
        >
          <div
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold">
                {modal.id ? "تعديل مستخدم" : "دعوة مستخدم"}
              </h3>
              <button onClick={() => setModal(null)} aria-label="إغلاق">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <label className="block text-[10.5px] text-neutral-500">
                الاسم الكامل
                <input
                  className={`${field} mt-1`}
                  value={modal.name}
                  onChange={(e) => setModal({ ...modal, name: e.target.value })}
                />
                {err.name && (
                  <span className="text-[10px] text-red-500">{err.name}</span>
                )}
              </label>
              <label className="block text-[10.5px] text-neutral-500">
                البريد الإلكتروني
                <input
                  dir="ltr"
                  className={`${field} mt-1`}
                  value={modal.email}
                  onChange={(e) =>
                    setModal({ ...modal, email: e.target.value })
                  }
                />
                {err.email && (
                  <span className="text-[10px] text-red-500">{err.email}</span>
                )}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-[10.5px] text-neutral-500">
                  الدور
                  <div className="mt-1">
                    <Select
                      value={modal.role}
                      onChange={(v) => setModal({ ...modal, role: v })}
                      className="!h-10 !bg-[#F5F5F5] !border-transparent"
                    >
                      {ROLES.map((r) => (
                        <option key={r}>{r}</option>
                      ))}
                    </Select>
                  </div>
                </label>
                <label className="text-[10.5px] text-neutral-500">
                  حالة الحساب
                  <div className="mt-1">
                    <Select
                      value={modal.active ? "1" : "0"}
                      onChange={(v) =>
                        setModal({ ...modal, active: v === "1" })
                      }
                      className="!h-10 !bg-[#F5F5F5] !border-transparent"
                    >
                      <option value="1">نشط</option>
                      <option value="0">موقوف</option>
                    </Select>
                  </div>
                </label>
              </div>
              <div className="text-[10.5px] text-neutral-500">الصلاحيات</div>
              <div className="rounded-lg border border-line">
                {SECTIONS.map((s) => (
                  <div
                    key={s}
                    className="flex items-center justify-between border-b border-line px-3 py-2 last:border-0"
                  >
                    <span className="text-[11px] font-semibold">{s}</span>
                    <div className="flex gap-3">
                      {PERMS.map((p, i) => (
                        <label
                          key={p}
                          className="flex items-center gap-1 text-[10.5px]"
                        >
                          <input
                            type="checkbox"
                            checked={!!modal.perms[s][i]}
                            onChange={() => flipModalPerm(s, i)}
                          />
                          {p}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-5 flex items-center gap-2">
              <button className={btnDark} onClick={save}>
                حفظ
              </button>
              <button className={btnLight} onClick={() => setModal(null)}>
                إلغاء
              </button>
              {modal.id && (
                <button
                  onClick={remove}
                  className="ms-auto inline-flex items-center gap-1 text-[11px] font-semibold text-red-500"
                >
                  <Trash2 size={13} />
                  حذف
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {toast}
    </div>
  );
}
