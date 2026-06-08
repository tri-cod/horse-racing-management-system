import axios from 'axios';

const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  const tokenType = localStorage.getItem('tokenType') || 'Bearer';
  return token ? `${tokenType} ${token}` : null;
};

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const authHeader = getAuthHeader();
    if (authHeader && config.headers) {
      config.headers.Authorization = authHeader;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('tokenType');
      localStorage.removeItem('user');
      if (!['/login', '/register', '/forgot-password'].includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
