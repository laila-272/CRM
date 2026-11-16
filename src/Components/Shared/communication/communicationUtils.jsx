export const COMMUNICATION_TYPES = [
  { value: "call", label: "مكالمة هاتفية" },
  { value: "meeting", label: "اجتماع" },
  { value: "email", label: "بريد إلكتروني" },
  { value: "whatsapp", label: "واتساب" },
];

export const getLocalDateTime = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset();

  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
};

export const formatApiDateTime = (value) => {
  return value ? new Date(value).toISOString() : null;
};
