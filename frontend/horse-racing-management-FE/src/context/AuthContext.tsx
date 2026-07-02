import {
 createContext,
 useContext,
 useState,
 useCallback,
 useEffect,
 type ReactNode,
} from 'react';
import { login as loginApi, getMe, logoutApi } from '@/api/authApi';
import { tokenStorage } from '@/api/axiosInstance';
import type { User, LoginPayload } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AuthContextValue {
 user: User | null;
 token: string | null;
 isLoading: boolean;
 isAuthenticated: boolean;
 login: (credentials: LoginPayload) => Promise<User>;
 logout: () => void;
 refreshUser: () => Promise<User>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
 // Hydrate optimistically from localStorage to avoid a flash of unauthenticated UI
 const [user, setUser] = useState<User | null>(() => {
 try {
 const stored = localStorage.getItem('user');
 return stored ? (JSON.parse(stored) as User) : null;
 } catch {
 return null;
 }
 });
 const [token, setToken] = useState<string | null>(tokenStorage.getToken);
 const [isLoading, setIsLoading] = useState(true);

 // On mount: verify the stored token with the backend
 useEffect(() => {
 if (!tokenStorage.getToken()) {
 setIsLoading(false);
 return;
 }

 getMe()
 .then((freshUser) => {
 setUser(freshUser);
 localStorage.setItem('user', JSON.stringify(freshUser));
 })
 .catch((error: { response?: { status?: number }; message?: string }) => {
 const status = error.response?.status;
 if (status === 401 || status === 403) {
 // Token is genuinely invalid — clear session
 tokenStorage.clear();
 setToken(null);
 setUser(null);
 }
 // On 5xx / network error: keep the cached session so users aren't
 // logged out just because the backend is temporarily down
 })
 .finally(() => setIsLoading(false));
 }, []);

 const login = useCallback(async (credentials: LoginPayload): Promise<User> => {
 const result = await loginApi(credentials);
 const { accessToken, tokenType, user: userData } = result;

 tokenStorage.set(accessToken, tokenType);
 localStorage.setItem('user', JSON.stringify(userData));
 setToken(accessToken);
 setUser(userData);

 return userData;
 }, []);

 const logout = useCallback(() => {
 // Clear local session immediately — don't block the user waiting for the server
 tokenStorage.clear();
 setToken(null);
 setUser(null);
 // Notify the server in the background (best-effort)
 logoutApi().catch(() => {});
 }, []);

 const refreshUser = useCallback(async (): Promise<User> => {
 const freshUser = await getMe();
 setUser(freshUser);
 localStorage.setItem('user', JSON.stringify(freshUser));
 return freshUser;
 }, []);

 return (
 <AuthContext.Provider
 value={{
 user,
 token,
 isLoading,
 isAuthenticated: !!token,
 login,
 logout,
 refreshUser,
 }}
 >
 {children}
 </AuthContext.Provider>
 );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

// Improvement: export a typed hook so consumers never need to import AuthContext directly
export function useAuth(): AuthContextValue {
 const context = useContext(AuthContext);
 if (!context) {
 throw new Error('useAuth must be used within <AuthProvider>');
 }
 return context;
}
