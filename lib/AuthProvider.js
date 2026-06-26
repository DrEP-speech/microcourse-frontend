'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from './apiClient';
import { safeGet, safeRemove, safeSet } from './storage';

const AUTH_KEY = 'mc_auth_v1';

const AuthContext = createContext(null);

function parseStored() {
  const raw = safeGet(AUTH_KEY);
  if (!raw) return { token: null, user: null };
  try {
    const obj = JSON.parse(raw);
    return { token: obj.token || null, user: obj.user || null };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const st = parseStored();
    setToken(st.token);
    setUser(st.user);
    setReady(true);
  }, []);

  function persist(nextToken, nextUser) {
    setToken(nextToken);
    setUser(nextUser);
    safeSet(AUTH_KEY, JSON.stringify({ token: nextToken, user: nextUser }));
  }

  function logout() {
    setToken(null);
    setUser(null);
    safeRemove(AUTH_KEY);
  }

  async function login(email, password) {
    const res = await api.login({ email, password });
    if (!res || !res.token) throw new Error('Login did not return a token');
    persist(res.token, res.user || null);
    return res;
  }

  async function register(name, email, password, role = 'student') {
    const res = await api.register({ name, email, password, role });
    if (!res || !res.token) throw new Error('Register did not return a token');
    persist(res.token, res.user || null);
    return res;
  }

  const value = useMemo(() => ({
    ready,
    token,
    user,
    isAuthed: !!token,
    login,
    register,
    logout,
  }), [ready, token, user]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider />');
  return ctx;
}
