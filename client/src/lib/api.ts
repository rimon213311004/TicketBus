import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/authStore';

const apiOrigin = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export const api = axios.create({
  baseURL: `${apiOrigin}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const { data } = await axios.post(`${apiOrigin}/api/auth/refresh`, {}, { withCredentials: true });
    const token = data.data.accessToken as string;
    useAuthStore.getState().setSession(data.data.user, token);
    return token;
  } catch {
    useAuthStore.getState().clearSession();
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retried?: boolean };

    if (error.response?.status === 401 && original && !original._retried) {
      original._retried = true;
      refreshing ??= refreshAccessToken().finally(() => {
        refreshing = null;
      });

      const token = await refreshing;
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
    }

    return Promise.reject(error);
  },
);

/** Pulls the server's message out of an axios error for display. */
export function apiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof AxiosError) {
    return (error.response?.data as { message?: string } | undefined)?.message ?? fallback;
  }
  return fallback;
}
