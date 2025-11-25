"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function useAuth() {
  const router = useRouter();

  // Lazy state initializer: reads localStorage only once on first render
  const [user, setUser] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = localStorage.getItem("auth-shereads");
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      console.error("Failed to parse auth-shereads:", err);
      return null;
    }
  });

  const login = (data) => {
    try {
      localStorage.setItem("auth-shereads", JSON.stringify(data));
      setUser(data);
    } catch (err) {
      console.error("Failed to save user data:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("auth-shereads");
    setUser(null);
    router.push("/signup");
  };

  return { user, login, logout };
}
