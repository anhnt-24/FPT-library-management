import { createContext, useContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth.js';
import { tokenStore } from '../api/client.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
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

  async function login(email, password) {
    const r = await authApi.login({ email, password });
    tokenStore.set(r);
    setUser(r.user);
    return r.user;
  }

  async function register(data) {
    const r = await authApi.register(data);
    tokenStore.set(r);
    setUser(r.user);
    return r.user;
  }

  async function logout() {
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
