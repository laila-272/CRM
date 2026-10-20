// Mock contracts/quotations. Replace the exported functions with API calls later.
export const OWNERS = ["سارة طارق", "فهد القحطاني", "ريم السالم", "أحمد سمير"];
export const QUOTE_STATUSES = ["مسودة", "مرسل", "تمت المشاهدة", "مقبول"];
export const CONTRACT_STATUSES = ["بانتظار التوقيع", "مفعل", "منتهي"];

const KEY = "crm.contracts.status.v1";
const MONTHS = ["أكتوبر", "نوفمبر", "ديسمبر"];
const PEOPLE = [
  ["خالد منصور", "شركة آفاق التقنية"],
  ["ليان العتيبي", "مجموعة النخبة"],
  ["تركي العتيبي", "مجموعة النخبة"],
  ["هبة الجندي", "مجموعة الجندي"],
  ["طارق منصور", "منصور للاستثمار"],
  ["نهى حسين", "شركة نماء للبرمجيات"],
  ["سامي رضوان", "رضوان للأغذية"],
  ["دينا العطار", "العطار للتصميم"],
  ["كريم الشامي", "الشامي العقارية"],
];
const SUBJECTS = [
  "نظام إدارة العملاء",
  "عقد خدمات الصيانة",
  "تجديد وترقية",
  "باقة الخدمات السنوية",
  "توريد وتركيب أنظمة",
  "استشارات عقارية",
];
const QUOTE_ST = [
  "مرسل",
  "تمت المشاهدة",
  "مسودة",
  "مرسل",
  "مقبول",
  "تمت المشاهدة",
  "مرسل",
  "مسودة",
  "مرسل",
  "تمت المشاهدة",
  "مسودة",
];
const CONTRACT_ST = [
  "بانتظار التوقيع",
  "مفعل",
  "بانتظار التوقيع",
  "مفعل",
  "منتهي",
  "بانتظار التوقيع",
  "بانتظار التوقيع",
];
const CONTRACT_AT = [2, 5, 8, 10, 12, 14, 16];
const pad = (n) => String(n).padStart(4, "0");

const rows = Array.from({ length: 18 }, (_, i) => {
  const j = CONTRACT_AT.indexOf(i);
  const isContract = j >= 0;
  const k = i - (j >= 0 ? j + 1 : CONTRACT_AT.filter((x) => x < i).length);
  const [customer, company] = PEOPLE[i % PEOPLE.length];
  const base = {
    id: isContract ? `CT-${pad(31 - j)}` : `QT-${pad(162 - k)}`,
    kind: isContract ? "عقد" : "عرض سعر",
    customer,
    company,
    deal: SUBJECTS[i % SUBJECTS.length],
    value: 180000 + (i % 5) * 45000 - (i % 3) * 20000,
    status: isContract ? CONTRACT_ST[j] : QUOTE_ST[k],
    expiry: `${((i * 5) % 27) + 1} ${MONTHS[i % 3]} 2026`,
    owner: OWNERS[i % OWNERS.length],
    phone: `01${String(100000000 + i * 7919311).slice(0, 9)}`,
  };
  return base;
});
// first three rows mirror the reference
Object.assign(rows[0], {
  deal: "نظام إدارة العملاء",
  value: 180000,
  status: "مرسل",
  expiry: "20 أكتوبر 2026",
  owner: "سارة طارق",
});
Object.assign(rows[1], {
  deal: "عقد خدمات الصيانة",
  value: 180000,
  status: "تمت المشاهدة",
  expiry: "18 أكتوبر 2026",
  owner: "فهد القحطاني",
});
Object.assign(rows[2], {
  deal: "تجديد وترقية",
  value: 180000,
  status: "بانتظار التوقيع",
  expiry: "12 أكتوبر 2026",
  owner: "ريم السالم",
});

function overrides() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

export function getContracts() {
  const o = overrides();
  return rows.map((r) => ({ ...r, status: o[r.id] || r.status }));
}

export function setContractStatus(id, status) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...overrides(), [id]: status }));
  } catch {
    /* ignore */
  }
}

export function getContract(id) {
  const r = getContracts().find((c) => c.id === id);
  if (!r) return null;
  const names = [
    "عند التوقيع",
    "الدفعة الأولى",
    "الدفعة الثانية",
    "الدفعة الثالثة",
    "الدفعة الأخيرة",
  ];
  const signed = r.status === "مفعل" || r.status === "منتهي";
  return {
    ...r,
    startDate: "15 أكتوبر 2026",
    endDate: r.expiry,
    signDate: signed ? "14 أكتوبر 2026" : "—",
    renewal: "تنبيه قبل 60 يومًا",
    legal: signed ? "تمت المراجعة" : "قيد المراجعة",
    payments: names.map((name, i) => ({
      name,
      due: `${15} ${["أكتوبر", "يناير", "أبريل", "يوليو", "أكتوبر"][i]} ${2026 + (i > 0 ? 1 : 0) + (i === 4 ? 1 : 0)}`,
      amount: r.value / 5,
      status: signed && i === 0 ? "مدفوعة" : i === 0 ? "مستحقة" : "مجدولة",
    })),
    signers: [
      {
        name: r.customer,
        role: `العميل - ${r.company}`,
        state: signed ? "وقّع" : "بانتظار",
      },
      { name: r.owner, role: "مسؤول المبيعات", state: "وقّع" },
      {
        name: "الشؤون القانونية",
        role: "المراجعة",
        state: signed ? "وقّع" : "بانتظار",
      },
    ],
    attachments: [
      { name: `${r.id}-${r.company}.pdf`, size: "2.4 MB", date: "اليوم 09:10" },
      { name: "ملحق الأسعار.pdf", size: "640 KB", date: "أمس" },
      {
        name: `السجل التجاري - ${r.company}.pdf`,
        size: "1.1 MB",
        date: "قبل 3 أيام",
      },
    ],
    activity: [
      {
        text: `أرسل التوقيع إلى ${r.customer}`,
        when: "اليوم 09:10",
        open: true,
      },
      { text: "انتهت المراجعة القانونية", when: "أمس 04:30 م" },
      { text: `تعديل البند 4 (الدفع) - الإصدار 3`, when: "قبل يومين" },
      {
        text: `أنشئ من عرض السعر ${r.kind === "عقد" ? "QT-0161" : r.id}`,
        when: "قبل أسبوع",
      },
    ],
  };
}
