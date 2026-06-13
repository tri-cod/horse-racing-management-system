import { createContext, useState, useCallback, useEffect } from 'react';
import { login as loginApi, getMe, logoutApi } from '../api/authApi';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // ✅ Hydrate optimistically from localStorage to avoid a "flash" of Sign up/Log in
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'));
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount. If token exists, verify with getMe()
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    // Token is already set in useState, just need to verify with the backend
    getMe()
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      })
      .catch((error) => {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          // ✅ Token is genuinely invalid → clear session
          localStorage.removeItem('accessToken');
          localStorage.removeItem('tokenType');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        } else {
          // ✅ Server 500/network down → keep the cached session
          // Don't penalize the user because the backend is down
          console.warn('getMe failed but keeping cached session:', error.message);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      const result = await loginApi(credentials);
      const { accessToken, tokenType, user: userData } = result;

      if (!accessToken) {
        throw new Error('No token received from server');
      }

      // Store in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('tokenType', tokenType || 'Bearer');
      localStorage.setItem('user', JSON.stringify(userData));

      // Update context
      setToken(accessToken);
      setUser(userData);

      return userData;
    } catch (error) {
      throw error;
    }
  }, []);

  // Async logout: call server API then always clear local storage/state
  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch (error) {
      // Don't block the UX if the logout API fails, still clear local state
      console.error('Logout API failed', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('tokenType');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  }, []);

  // Refresh user data on demand
  const refreshUser = useCallback(async () => {
    try {
      const freshUser = await getMe();
      setUser(freshUser);
      localStorage.setItem('user', JSON.stringify(freshUser));
      return freshUser;
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('tokenType');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      }
      throw error;
    }
  }, []);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
