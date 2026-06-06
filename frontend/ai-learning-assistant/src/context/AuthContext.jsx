import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axiosInstance from '../utils/axiosInstances';
import { API_PATHS } from '../utils/apiPaths';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Prevent the session-restore effect from firing twice in React Strict Mode
  const hasFetched = useRef(false);

  // ─── Session Restore ───────────────────────────────────────────────────────
  // Calls /api/auth/profile on mount — the httpOnly cookie is sent automatically.
  // A 401 here is normal (unauthenticated user) and is handled silently.
  // No localStorage: storing user data there is readable by JS / XSS attacks.
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const restoreSession = async () => {
      try {
        const { data } = await axiosInstance.get(API_PATHS.AUTH.ME);
        // GET /api/auth/profile returns { success, data: { id, username, email, … } }
        setUser(data.data);
        setIsAuthenticated(true);
      } catch {
        // 401 = no session — expected for unauthenticated users, not an error
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ─── Auth Actions ──────────────────────────────────────────────────────────

  // Called after a successful login — stores user in React state.
  // The actual session token lives in the httpOnly cookie set by the server.
  const login = useCallback((userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post(API_PATHS.AUTH.LOGOUT);
    } catch {
      // best-effort — clear client state regardless of server response
    }
    setUser(null);
    setIsAuthenticated(false);
    window.location.replace('/login');
  }, []);

  const updateUser = useCallback((updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  }, []);

  // ─── Context Value ─────────────────────────────────────────────────────────
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};