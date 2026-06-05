import { createContext, useState, useCallback, useEffect } from 'react';
import { login as loginApi } from '../api/authApi';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }
    setIsLoading(false);
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

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: !!token,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
