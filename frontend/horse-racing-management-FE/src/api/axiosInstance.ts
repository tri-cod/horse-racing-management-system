import axios, {
 type AxiosInstance,
 type InternalAxiosRequestConfig,
 type AxiosResponse,
 type AxiosError,
} from 'axios';

// ─── Token helpers ────────────────────────────────────────────────────────────
// Centralized so any future change (e.g. sessionStorage, httpOnly cookie) only
// needs updating here, not scattered across the codebase.

const TOKEN_KEY = 'accessToken';
const TOKEN_TYPE_KEY = 'tokenType';
const USER_KEY = 'user';

export const tokenStorage = {
 getToken: () => localStorage.getItem(TOKEN_KEY),
 getTokenType: () => localStorage.getItem(TOKEN_TYPE_KEY) ?? 'Bearer',
 getAuthHeader: () => {
 const token = localStorage.getItem(TOKEN_KEY);
 const type = localStorage.getItem(TOKEN_TYPE_KEY) ?? 'Bearer';
 return token ?`${type} ${token}` : null;
 },
 set: (accessToken: string, tokenType: string) => {
 localStorage.setItem(TOKEN_KEY, accessToken);
 localStorage.setItem(TOKEN_TYPE_KEY, tokenType);
 },
 clear: () => {
 localStorage.removeItem(TOKEN_KEY);
 localStorage.removeItem(TOKEN_TYPE_KEY);
 localStorage.removeItem(USER_KEY);
 },
};

// ─── Instance ─────────────────────────────────────────────────────────────────

const axiosInstance: AxiosInstance = axios.create({
 baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
 timeout: 10000,
});

// ─── Request interceptor ──────────────────────────────────────────────────────

axiosInstance.interceptors.request.use(
 (config: InternalAxiosRequestConfig) => {
 const authHeader = tokenStorage.getAuthHeader();
 if (authHeader && config.headers) {
 config.headers.Authorization = authHeader;
 }
 return config;
 },
 (error: AxiosError) => Promise.reject(error),
);

// ─── Response interceptor ─────────────────────────────────────────────────────

const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password', '/races', '/jockeys'];

axiosInstance.interceptors.response.use(
 (response: AxiosResponse) => response,
 (error: AxiosError) => {
 if (error.response?.status === 401) {
 tokenStorage.clear();
 const path = window.location.pathname;
 const isPublic =
 PUBLIC_PATHS.includes(path) || path.startsWith('/races/');
 if (!isPublic) {
 window.location.href = '/login';
 }
 }
 return Promise.reject(error);
 },
);

export default axiosInstance;
