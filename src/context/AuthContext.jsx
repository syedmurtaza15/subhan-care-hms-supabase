import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { STORAGE_KEYS, storage } from '../utils/storage';
import { isSupabaseConfigured } from '../lib/supabase';
import { fetchCurrentUser, onAuthStateChange, signOut } from '../services/authService';

/**
 * Auth context - holds the current user, the JWT, and exposes
 * login / logout. When Supabase is configured it subscribes to
 * auth state changes; otherwise it persists to localStorage like before.
 */

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => storage.get(STORAGE_KEYS.AUTH_USER));
  const [token, setToken] = useState(() => storage.get(STORAGE_KEYS.AUTH_TOKEN));
  const [remember, setRemember] = useState(
    () => storage.get(STORAGE_KEYS.AUTH_REMEMBER) === true,
  );
  const [isInitializing, setIsInitializing] = useState(true);

  // Subscribe to Supabase auth state changes (no-op in local mode).
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsInitializing(false);
      return undefined;
    }
    const { data } = onAuthStateChange(async (nextUser, nextToken) => {
      setUser(nextUser);
      setToken(nextToken);
      setIsInitializing(false);
    });
    // Resolve the initial session.
    fetchCurrentUser().then((u) => {
      if (u) {
        setUser(u);
      }
      setIsInitializing(false);
    });
    return () => data?.subscription?.unsubscribe?.();
  }, []);

  const persist = useCallback((nextUser, nextToken, nextRemember) => {
    if (nextRemember) {
      storage.set(STORAGE_KEYS.AUTH_USER, nextUser);
      storage.set(STORAGE_KEYS.AUTH_TOKEN, nextToken);
      storage.set(STORAGE_KEYS.AUTH_REMEMBER, true);
    } else {
      storage.set(STORAGE_KEYS.AUTH_USER, nextUser);
      storage.set(STORAGE_KEYS.AUTH_TOKEN, nextToken);
      storage.remove(STORAGE_KEYS.AUTH_REMEMBER);
    }
  }, []);

  const login = useCallback(
    (authUser, authToken, shouldRemember = true) => {
      setUser(authUser);
      setToken(authToken);
      setRemember(shouldRemember);
      persist(authUser, authToken, shouldRemember);
    },
    [persist],
  );

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) {
      try {
        await signOut();
      } catch (error) {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.warn('[AuthContext] signOut error', error);
        }
      }
    }
    setUser(null);
    setToken(null);
    setRemember(false);
    storage.remove(STORAGE_KEYS.AUTH_USER);
    storage.remove(STORAGE_KEYS.AUTH_TOKEN);
    storage.remove(STORAGE_KEYS.AUTH_REMEMBER);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      remember,
      isAuthenticated: Boolean(user && token),
      isInitializing,
      login,
      logout,
      setUser,
    }),
    [user, token, remember, isInitializing, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

export default AuthContext;
