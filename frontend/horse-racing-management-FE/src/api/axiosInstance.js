import axios from 'axios';

const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password', '/races', '/jockeys'];
const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh'];

const isPublicPath = (path) =>
  PUBLIC_PATHS.includes(path) || path.startsWith('/races/') || path.startsWith('/jockeys/');

const clearSession = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('tokenType');
  localStorage.removeItem('user');
};

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    const tokenType = localStorage.getItem('tokenType') || 'Bearer';
    if (token && config.headers) {
      config.headers.Authorization = `${tokenType} ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Flag to prevent multiple simultaneous logout redirects
let isRedirectingToLogin = false;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';

    // Skip auth endpoints to avoid redirect loops
    const isAuthEndpoint = AUTH_ENDPOINTS.some((ep) => requestUrl.includes(ep));

    if (status === 401 && !isAuthEndpoint && !isRedirectingToLogin) {
      // NOTE: When backend adds /auth/refresh endpoint, replace clearSession()
      // with a token refresh call here before falling back to logout.
      // Example:
      //   const refreshToken = localStorage.getItem('refreshToken');
      //   const { data } = await axios.post('/auth/refresh', { refreshToken });
      //   localStorage.setItem('accessToken', data.accessToken);
      //   return axiosInstance(error.config); // retry original request

      clearSession();

      if (!isPublicPath(window.location.pathname)) {
        isRedirectingToLogin = true;
        window.location.href = '/login';
        // Reset flag after navigation completes
        setTimeout(() => { isRedirectingToLogin = false; }, 1000);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
