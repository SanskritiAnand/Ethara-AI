'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api, setToken, clearToken } from '@/lib/api';

interface User { id: number; name: string; email: string; role: string; }
interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ethara_token');
    if (token) {
      api.me().then(d => setUser(d.user)).catch(() => clearToken()).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.login(email, password);
    setToken(data.token);
    setUser(data.user);
  };

  const signup = async (name: string, email: string, password: string, role: string) => {
    const data = await api.signup(name, email, password, role);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => { clearToken(); setUser(null); };

  return <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
