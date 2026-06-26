"use client";

import { useEffect, useRef, useState } from "react";
import { getToken, me, type User } from "@/lib/auth";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prevent double-invoke in React 18 StrictMode (common in tests/dev)
  const didRun = useRef(false);

  const refresh = async () => {
    setLoading(true);
    setError(null);

    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const u = await me();
      setUser(u);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, loading, error, refresh };
}
