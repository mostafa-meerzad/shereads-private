// hooks/useAuthClient.js
"use client";

import { useRouter } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";

export function useAuthClient() {
  const router = useRouter();
  const [auth, setAuth] = useState(() => {
    if (typeof window === "undefined") return { user: null, token: null };
    try {
      const saved = localStorage.getItem("auth-shereads");
      return saved ? JSON.parse(saved) : { user: null, token: null };
    } catch {
      return { user: null, token: null };
    }
  });

  useEffect(() => {
    if (auth.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${auth.token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [auth.token]);

  const login = (payload) => {
    // payload = { user, token }
    try {
      localStorage.setItem("auth-shereads", JSON.stringify(payload));
      setAuth(payload);
      axios.defaults.headers.common["Authorization"] = `Bearer ${payload.token}`;
    } catch (err) {
      console.error("Failed to store auth", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth-shereads");
    setAuth({ user: null, token: null });
    delete axios.defaults.headers.common["Authorization"];
    router.push("/login");
  };

  return {
    user: auth.user,
    token: auth.token,
    isLoggedIn: !!auth.token,
    login,
    logout,
  };
}
