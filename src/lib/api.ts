import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken, setTokens } from './auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api/v1',
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  // InfinityFree sets a __test cookie after a JS challenge. Must send it on API calls.
  withCredentials: true,
  // Do not follow 302 challenge redirects as GET (causes 404 on /auth/login).
  maxRedirects: 0,
});

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  try {
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL || '/api/v1'}/auth/refresh`,
      { refresh_token: refresh },
      {
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        withCredentials: true,
        maxRedirects: 0,
      },
    );

    const access = (data.access_token ?? data.token) as string | undefined;
    const nextRefresh = (data.refresh_token ?? refresh) as string;
    if (!access) return null;

    setTokens(access, nextRefresh);
    return access;
  } catch {
    return null;
  }
}

function queueRefresh(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const isAuthRoute =
      original?.url?.includes('/auth/login') ||
      original?.url?.includes('/auth/refresh') ||
      original?.url?.includes('/auth/logout');

    if (error.response?.status !== 401 || !original || original._retry || isAuthRoute) {
      if (error.response?.status === 401 && !isAuthRoute) {
        clearTokens();
        localStorage.removeItem('cms_user');
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }

    original._retry = true;

    const hasRefresh = Boolean(getRefreshToken());
    const newAccess = hasRefresh ? await queueRefresh() : null;

    if (newAccess) {
      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    }

    clearTokens();
    localStorage.removeItem('cms_user');
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export { setAccessToken, setTokens };
export default api;
