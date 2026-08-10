import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import * as authApi from '../api/auth';
import { tokenStore } from '../api/client';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);
export const useAuth = (): AuthContextValue => useContext(AuthContext) as AuthContextValue;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Khôi phục phiên khi mở lại app (có access token → gọi /me).
  useEffect(() => {
    if (tokenStore.access) {
      authApi
        .me()
        .then((r) => setUser(r.user))
        .catch(() => tokenStore.clear())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function login(email: string, password: string): Promise<User> {
    const r = await authApi.login({ email, password });
    tokenStore.set(r);
    setUser(r.user);
    return r.user;
  }

  async function register(data: { name: string; email: string; password: string }): Promise<User> {
    const r = await authApi.register(data);
    tokenStore.set(r);
    setUser(r.user);
    return r.user;
  }

  async function logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch {
      /* bỏ qua lỗi mạng khi logout */
    }
    tokenStore.clear();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}
