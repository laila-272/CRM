import { useEffect, useState, useCallback } from "react";
import { getCustomers } from "../Services/contactService.js";

// Temporary filter options until the backend provides lookup endpoints.
export const REF = new Date();

export const PROJECTS = ["مشروع النور", "حدائق العاصمة", "وهاج ريزيدنس"];

export const OWNERS = ["سارة طارق", "أحمد علي", "ريم عادل", "زياد كمال"];

export const SOURCES = ["فيسبوك", "إحالة", "موقع إلكتروني", "معرض", "واتساب"];

export const STATUSES = ["نشط", "جديد", "يحتاج متابعة", "غير نشط", "مرفوض"];

// Format date
export const dmy = (iso) => {
  if (!iso) return "—";

  const datePart = String(iso).slice(0, 10);
  const parts = datePart.split("-");

  if (parts.length !== 3) return "—";

  return parts.reverse().join("/");
};

// Calculate days since a date
export const daysSince = (iso) => {
  if (!iso) return 0;

  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) return 0;

  const today = new Date();

  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  return Math.floor((startOfToday - startOfDate) / 864e5);
};

// Check if contact needs attention
export const needsAttention = (contact) =>
  contact.status === "يحتاج متابعة" ||
  (contact.status !== "غير نشط" &&
    contact.status !== "مرفوض" &&
    contact.last &&
    daysSince(contact.last) > 14);

// Format money
export const money = (n) =>
  n >= 1e6
    ? `${(n / 1e6).toFixed(1)} مليون ج.م`
    : `${Number(n || 0).toLocaleString("en-US")} ج.م`;

// WhatsApp link
export const waLink = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");

  return `https://wa.me/${
    digits.startsWith("0") ? "20" + digits.slice(1) : digits
  }`;
};

// Map backend status to frontend status
const statusMap = {
  active: "نشط",
  declined: "مرفوض",
  inactive: "غير نشط",
  new: "جديد",
  follow_up: "يحتاج متابعة",
};

// Convert API customer to frontend contact
const mapCustomer = (customer) => {
  const communications = customer.communications || [];

  const lastCommunication = communications
    .map((item) => item.communicated_at)
    .filter(Boolean)
    .sort()
    .at(-1);

  return {
    id: customer.id,
    name: customer.name || "",
    email: customer.email || "",
    phone: customer.phone || "",
    whatsapp: customer.whatsapp || "",
    address: customer.address || "",
    city: "—",

    // Not available in the current customers API response
    kind: "—",
    project: "—",

    owner: customer.assigned_to?.name || "—",
    source: customer.source?.name || "—",

    status: statusMap[customer.status] || customer.status_label || "—",

    apiStatus: customer.status,

    notes: customer.notes || "",

    created: customer.created_at ? customer.created_at.slice(0, 10) : "",

    last: lastCommunication
      ? lastCommunication.slice(0, 10)
      : customer.updated_at
        ? customer.updated_at.slice(0, 10)
        : "",

    timeline: communications,
    raw: customer,
  };
};

// Fetch contacts from backend API
export function useContactsApi() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getCustomers();
console.log("Customers result:", result);
console.log("Customers array:", result.data);
      if (!Array.isArray(result.data)) {
        throw new Error("Invalid customers response");
      }

      setContacts(result.data.map(mapCustomer));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "حدث خطأ أثناء تحميل جهات الاتصال",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  return {
    contacts,
    loading,
    error,
    refresh: fetchContacts,
  };
}
