import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import api from '../lib/api';
import { clearTokens, getAccessToken, setTokens } from '../lib/auth';
import type { LoginResponse, User } from '../types';
import { normalizeUser } from '../lib/api-helpers';

interface AuthContextValue {
  user: User | null;
  login: (username: string, pin: string) => Promise<User>;
  setupPin: (pin: string, pinConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): User | null {
  const stored = localStorage.getItem('cms_user');
  if (!stored) return null;
  try {
    return normalizeUser(JSON.parse(stored));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [isLoading, setIsLoading] = useState(Boolean(getAccessToken()));

  const persistUser = useCallback((next: User | null) => {
    if (next) {
      localStorage.setItem('cms_user', JSON.stringify(next));
    } else {
      localStorage.removeItem('cms_user');
    }
    setUser(next);
  }, []);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (!cancelled) persistUser(normalizeUser(data));
      } catch {
        if (!cancelled) {
          clearTokens();
          persistUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [persistUser]);

  const login = async (username: string, pin: string): Promise<User> => {
    const { data } = await api.post<LoginResponse>('/auth/login', { username, pin });
    const access = data.access_token ?? data.token;
    if (!access) throw new Error('No access token returned');

    setTokens(access, data.refresh_token ?? null);
    const normalized = normalizeUser(data.user);
    persistUser(normalized);
    return normalized;
  };

  const setupPin = async (pin: string, pinConfirmation: string) => {
    const { data } = await api.post('/auth/setup-pin', {
      pin,
      pin_confirmation: pinConfirmation,
    });
    persistUser(normalizeUser(data));
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearTokens();
      persistUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      login,
      setupPin,
      logout,
      isAuthenticated: !!user && !!getAccessToken(),
      isLoading,
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
