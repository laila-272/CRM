// Brokers & partners service (localStorage). Swap for API calls later.
const KEY = "crm.brokers.v1";

const seed = [
  [
    "محمود صلاح",
    "mahmoud.salah@example.com",
    "01080640237",
    "وسيط",
    "ملف Excel",
  ],
  [
    "مكتب النخبة العقاري",
    "elite.office@example.com",
    "01146729130",
    "شريك",
    "ملف Excel",
  ],
  ["أبو ندى", "abu.nada@example.com", "01207360805", "وسيط", "ملف Excel"],
  ["شركة أركان", "info@arkan.example.com", "01009017785", "شريك", "يدوي"],
  ["قاسم", "qassem@example.com", "01151796976", "وسيط", "ملف Excel"],
  [
    "نرمين سوهاج الجديدة",
    "nermeen@example.com",
    "01501633001",
    "وسيط",
    "ملف Excel",
  ],
  ["ثمار للتسويق", "thimar@example.com", "01124455667", "شريك", "يدوي"],
  ["هاني عبد الرحمن", "hany.ar@example.com", "01012345671", "وسيط", "يدوي"],
  [
    "مجموعة الندى",
    "nada.group@example.com",
    "01234567812",
    "شريك",
    "ملف Excel",
  ],
  ["سلمى فؤاد", "salma.fouad@example.com", "01098765432", "وسيط", "ملف Excel"],
  ["شركة بداية", "info@bedaya.example.com", "01187654321", "شريك", "يدوي"],
  ["إسلام جمال", "eslam.g@example.com", "01022334455", "وسيط", "يدوي"],
  ["مكتب الريادة", "riyada@example.com", "01133445566", "شريك", "ملف Excel"],
  ["عبير النجار", "abeer.n@example.com", "01244556677", "وسيط", "ملف Excel"],
  ["شركة المدى", "info@mada.example.com", "01055667788", "شريك", "يدوي"],
  ["بسام وائل", "bassam.w@example.com", "01166778899", "وسيط", "يدوي"],
].map(([name, email, phone, type, source], i) => ({
  id: i + 1,
  name,
  email,
  phone,
  type,
  source,
}));

export function getBrokers() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* fall back to seed */
  }
  return seed;
}

function save(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
  return list;
}

export const addBroker = (b) =>
  save([{ ...b, id: Date.now(), source: "يدوي" }, ...getBrokers()]);
export const removeBroker = (id) =>
  save(getBrokers().filter((b) => b.id !== id));
