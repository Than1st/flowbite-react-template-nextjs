import axios, { AxiosError } from "axios";
import { storage, STORAGE_KEYS } from "@/lib/storage";
import type { LoginData } from "@/types";

export const baseUrl =
  process.env.NEXT_PUBLIC_API_URL || "https://dev-immax-be.kai.id";

// Backend immax-app memakai header ini — web ikut agar token diterima
const platform = "mobile";

export const api = axios.create({
  baseURL: `${baseUrl}/api`,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "x-platform": platform,
  },
});

export const getToken = (): string | null => {
  const loginData = storage.get<LoginData>(STORAGE_KEYS.LOGIN_DATA);
  return loginData?.token ?? null;
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["x-platform"] = platform;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Jangan auto-logout pada 401 — biarkan halaman menangani error API.
    // Auto-redirect sebelumnya menyebabkan logout setelah masuk dashboard
    // ketika salah satu endpoint mengembalikan 401.
    return Promise.reject(error);
  },
);

export async function apiGet<T>(
  endpoint: string,
  params?: Record<string, unknown>,
): Promise<T> {
  const { data } = await api.get<T>(endpoint, { params });
  return data;
}

export async function apiPost<T>(
  endpoint: string,
  body?: unknown,
  params?: Record<string, unknown>,
): Promise<T> {
  const { data } = await api.post<T>(endpoint, body ?? {}, { params });
  return data;
}

export async function apiPut<T>(
  endpoint: string,
  body?: unknown,
): Promise<T> {
  const { data } = await api.put<T>(endpoint, body ?? {});
  return data;
}

export async function apiDelete<T>(
  endpoint: string,
  params?: Record<string, unknown>,
): Promise<T> {
  const { data } = await api.delete<T>(endpoint, { params });
  return data;
}

export async function downloadPdf(
  endpoint: string,
  params?: Record<string, unknown>,
): Promise<Blob> {
  const { data } = await api.get(endpoint, {
    params,
    responseType: "blob",
  });
  return new Blob([data], { type: "application/pdf" });
}
