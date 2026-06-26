export function safeGet(key) {
  if (typeof window === 'undefined') return null;
  try { return window.localStorage.getItem(key); } catch { return null; }
}

export function safeSet(key, value) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(key, value); } catch {}
}

export function safeRemove(key) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.removeItem(key); } catch {}
}
