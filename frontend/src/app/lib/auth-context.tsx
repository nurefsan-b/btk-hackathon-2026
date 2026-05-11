import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

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
  login: (email: string, password: string) => void;
  signup: (fullName: string, email: string, password: string, riskProfile: 'low' | 'medium' | 'high') => void;
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

// ─── Provider ───────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser);

  const login = useCallback((email: string, _password: string) => {
    // In a real app this would call the backend auth endpoint.
    // For the hackathon demo we create/restore a local user.
    const existing = loadUser();
    const u: User = existing && existing.email === email
      ? existing
      : {
          id: `user_${email.split('@')[0]}`,
          fullName: email.split('@')[0].replace(/[._]/g, ' '),
          email,
          riskProfile: 'medium',
          createdAt: new Date().toISOString(),
        };
    saveUser(u);
    setUser(u);
  }, []);

  const signup = useCallback(
    (fullName: string, email: string, _password: string, riskProfile: 'low' | 'medium' | 'high') => {
      const u: User = {
        id: `user_${email.split('@')[0]}`,
        fullName,
        email,
        riskProfile,
        createdAt: new Date().toISOString(),
      };
      saveUser(u);
      setUser(u);
    },
    [],
  );

  const logout = useCallback(() => {
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
