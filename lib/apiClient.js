// lib/apiClient.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// read token from localStorage (if any) on each request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("auth-shereads");
    if (saved) {
      try {
        const { token } = JSON.parse(saved) || {};
        if (token) config.headers.Authorization = `Bearer ${token}`;
      } catch {}
    }
  }
  return config;
});

// unify error payloads
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const payload = err.response?.data || { error: err.message || "Network error" };
    return Promise.reject(payload);
  }
);

export default api;
