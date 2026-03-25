import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import api from '../api/axios';
import { authEventEmitter } from '../utils/authEvents';

type User = {
  id?: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
} | null;

type UserProfile = {
  id?: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
};

type AuthPayload = {
  access_token: string;
  token_type: string;
  user: UserProfile;
};

type AuthContextType = {
  user: User;
  token: string | null;
  isReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  loginWithFacebook: (token: string) => Promise<void>;
  logout: () => void;
  register: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<void>;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to validate JWT format
const isValidJWT = (token: string): boolean => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    // Basic validation that each part is base64-like
    return parts.every(part => /^[A-Za-z0-9_-]*$/.test(part));
  } catch {
    return false;
  }
};

// Helper to decode JWT without verification (client-side only)
const decodeJWT = (token: string): any => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const decoded = JSON.parse(atob(parts[1]));
    return decoded;
  } catch {
    return null;
  }
};

// Helper to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    // exp is in seconds, Date.now() is in milliseconds
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  }, []);

  const saveAuth = useCallback((payload: AuthPayload) => {
    const t = payload.access_token;
    if (!isValidJWT(t)) {
      setError('Invalid token format received');
      return;
    }

    localStorage.setItem('access_token', t);
    setToken(t);
    setUser(payload.user);
    setError(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      const persistedToken = localStorage.getItem('access_token');
      if (!persistedToken || !isValidJWT(persistedToken) || isTokenExpired(persistedToken)) {
        clearAuth();
        if (isMounted) {
          setIsReady(true);
        }
        return;
      }

      try {
        const res = await api.get<UserProfile>('/users/me', {
          headers: {
            Authorization: `Bearer ${persistedToken}`,
          },
        });

        if (!isMounted) {
          return;
        }

        setToken(persistedToken);
        setUser(res.data);
      } catch {
        clearAuth();
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  // Token expiration check with proper event emission
  useEffect(() => {
    if (!token) return;

    const decoded = decodeJWT(token);
    if (!decoded?.exp) return;

    const expiresIn = decoded.exp * 1000 - Date.now();
    if (expiresIn <= 0) {
      // Token already expired
      clearAuth();
      authEventEmitter.sessionExpired();
      return;
    }

    // Warn user 2 minutes before expiration
    const warningTimeout = setTimeout(() => {
      authEventEmitter.sessionExpiringsoon();
    }, Math.max(0, expiresIn - 120000));

    // Logout 1 minute before expiration
    const logoutTimeout = setTimeout(() => {
      clearAuth();
      authEventEmitter.sessionExpired();
    }, Math.max(0, expiresIn - 60000));

    return () => {
      clearTimeout(warningTimeout);
      clearTimeout(logoutTimeout);
    };
  }, [token, clearAuth]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        setError(null);
        const res = await api.post<AuthPayload>('/login', { email, password });
        saveAuth(res.data);
      } catch (err: any) {
        const message = err?.response?.data?.detail || 'Login failed';
        setError(message);
        throw err;
      }
    },
    [saveAuth],
  );

  const loginWithGoogle = useCallback(
    async (googleToken: string) => {
      try {
        setError(null);
        const res = await api.post<AuthPayload>('/google', { token: googleToken });
        saveAuth(res.data);
      } catch (err: any) {
        const message = err?.response?.data?.detail || 'Google login failed';
        setError(message);
        throw err;
      }
    },
    [saveAuth],
  );

  const loginWithFacebook = useCallback(
    async (facebookToken: string) => {
      try {
        setError(null);
        const res = await api.post<AuthPayload>('/facebook', { token: facebookToken });
        saveAuth(res.data);
      } catch (err: any) {
        const message = err?.response?.data?.detail || 'Facebook login failed';
        setError(message);
        throw err;
      }
    },
    [saveAuth],
  );

  const register = useCallback(
    async (email: string, password: string, fullName?: string) => {
      try {
        setError(null);
        const res = await api.post<AuthPayload>('/register', {
          email,
          password,
          full_name: fullName,
        });
        saveAuth(res.data);
      } catch (err: any) {
        const message = err?.response?.data?.detail || 'Registration failed';
        setError(message);
        throw err;
      }
    },
    [saveAuth],
  );

  const logout = useCallback(() => {
    clearAuth();
    setError(null);
  }, [clearAuth]);

  const value = useMemo(
    () => ({
      user,
      token,
      isReady,
      login,
      loginWithGoogle,
      loginWithFacebook,
      logout,
      register,
      error,
    }),
    [
      user,
      token,
      isReady,
      login,
      loginWithGoogle,
      loginWithFacebook,
      logout,
      register,
      error,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
