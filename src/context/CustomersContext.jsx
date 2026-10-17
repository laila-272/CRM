import { createContext, useContext, useEffect, useState } from "react";
import { initialCustomers } from "../data/customers.js";

const KEY = "crm_customers_v1";
const Ctx = createContext(null);

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    /* ignore */
  }
  return initialCustomers;
}

export function CustomersProvider({ children }) {
  const [customers, setCustomers] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(customers));
    } catch (e) {
      /* ignore */
    }
  }, [customers]);

  const addCustomer = (c) =>
    setCustomers((prev) => [
      {
        ...c,
        id: Math.max(0, ...prev.map((p) => p.id)) + 1,
        createdAt: "اليوم",
        score: 50,
      },
      ...prev,
    ]);
  const updateCustomer = (id, data) =>
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c)),
    );
  const deleteCustomer = (id) =>
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  const resetData = () => setCustomers(initialCustomers);

  return (
    <Ctx.Provider
      value={{
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        resetData,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useCustomers = () => useContext(Ctx);
