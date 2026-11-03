// Tiny persisted store factory (module state + localStorage). Requires React 18.
import { useSyncExternalStore } from "react";
export const uid = (p = "") => p + Math.random().toString(36).slice(2, 8);
export function createStore(key, seed) {
  let state;
  try {
    const s = JSON.parse(localStorage.getItem(key));
    state = s ?? seed;
  } catch {
    state = seed;
  }
  const subs = new Set();
  const set = (next) => {
    state = typeof next === "function" ? next(state) : next;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
    subs.forEach((f) => f());
  };
  const get = () => state;
  const sub = (cb) => {
    subs.add(cb);
    return () => subs.delete(cb);
  };
  return () => [useSyncExternalStore(sub, get), set];
}
