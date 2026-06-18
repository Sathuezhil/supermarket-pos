import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import {
  getSession,
  setSession,
  clearSession,
  validateLogin,
  type AuthSession,
} from '../lib/authStorage';
import { getStaffById } from '../lib/staffStorage';

interface AuthContextType {
  session: AuthSession | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(() => getSession());

  const login = useCallback((username: string, password: string) => {
    if (!username.trim() || !password) {
      return { success: false, error: 'Username and password are required' };
    }

    const credential = validateLogin(username, password);
    if (!credential) {
      return { success: false, error: 'Invalid username or password' };
    }

    const staffUser = getStaffById(credential.userId);
    if (!staffUser) {
      return { success: false, error: 'User account not found' };
    }

    if (!staffUser.isActive) {
      return { success: false, error: 'This account has been deactivated' };
    }

    const newSession: AuthSession = {
      userId: credential.userId,
      username: credential.username,
      loggedInAt: new Date().toISOString(),
    };

    setSession(newSession);
    setSessionState(newSession);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSessionState(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: !!session,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
