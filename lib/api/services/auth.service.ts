import { api, apiPost } from "@/lib/api/client";

export const authService = {
  login: (username: string, password: string) =>
    apiPost("/sso/login", { username, password }),

  validateOtp: (username: string, password: string, otp: string) =>
    apiPost<{ success: boolean; token: string; message?: string; ssoToken?: unknown }>(
      "/sso/validate-otp",
      { username, password, otp },
    ),

  checkToken: async (token: string) => {
    const { data } = await api.post<{ valid: boolean; user?: unknown; message?: string }>(
      "/cektoken",
      { token },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return data;
  },
};
