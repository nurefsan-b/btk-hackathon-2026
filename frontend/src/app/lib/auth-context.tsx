import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
  ApiUser,
  loginWithPassword,
  registerWithPassword,
  setAccessToken,
} from './api';

// ─── Types ──────────────────────────────────────────────────

export interface User {
  id: string;
  fullName: string;
  email: string;
  riskProfile: 'low' | 'medium' | 'high';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string, riskProfile: 'low' | 'medium' | 'high') => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<User, 'fullName' | 'email' | 'riskProfile'>>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Storage Helpers ────────────────────────────────────────

const STORAGE_KEY = 'kusurat_ai_user';

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function saveUser(user: User | null) {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function mapApiUser(user: ApiUser): User {
  return {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    riskProfile: user.risk_profile,
    createdAt: user.created_at,
  };
}

// ─── Provider ───────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser);

  const login = useCallback(async (email: string, password: string) => {
    const auth = await loginWithPassword(email, password);
    setAccessToken(auth.access_token);
    const u = mapApiUser(auth.user);
    saveUser(u);
    setUser(u);
  }, []);

  const signup = useCallback(
    async (fullName: string, email: string, password: string, riskProfile: 'low' | 'medium' | 'high') => {
      const auth = await registerWithPassword(fullName, email, password, riskProfile);
      setAccessToken(auth.access_token);
      const u = mapApiUser(auth.user);
      saveUser(u);
      setUser(u);
    },
    [],
  );

  const logout = useCallback(() => {
    setAccessToken(null);
    saveUser(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    (updates: Partial<Pick<User, 'fullName' | 'email' | 'riskProfile'>>) => {
      setUser((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, ...updates };
        saveUser(updated);
        return updated;
      });
    },
    [],
  );

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
