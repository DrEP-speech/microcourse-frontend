"use client";
import { useEffect, useState, useCallback } from "react";

export default function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.status === 401) { setUser(null); setLoading(false); return; }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to fetch user");
      setUser(data?.user ?? null);
    } catch (e) { setError(e); setUser(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  return { user, loading, error, refresh: fetchUser };
}