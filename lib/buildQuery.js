// lib/buildQuery.js
export function buildQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) {
      v.forEach((item) => q.append(k, item));
    } else {
      q.append(k, String(v));
    }
  });
  const qs = q.toString();
  return qs ? `?${qs}` : "";
}
