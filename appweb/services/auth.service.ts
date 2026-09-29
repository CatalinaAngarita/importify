import { apiGet, apiPost, setToken } from "./api";
import type { AuthTokens } from "@/types/api";

export const authService = {
  async register(data: { email: string; password: string; firstName?: string; lastName?: string }) {
    const res = await apiPost<AuthTokens>("/auth/register", data);
    if (res.accessToken) setToken(res.accessToken);
    if (typeof window !== "undefined" && res.refreshToken) {
      window.localStorage.setItem("importify_refresh_token", res.refreshToken);
    }
    return res;
  },
  async login(data: { email: string; password: string }) {
    const res = await apiPost<AuthTokens>("/auth/login", data);
    if (res.accessToken) setToken(res.accessToken);
    if (typeof window !== "undefined" && res.refreshToken) {
      window.localStorage.setItem("importify_refresh_token", res.refreshToken);
    }
    return res;
  },
  async me<T = unknown>() {
    return apiGet<T>("/auth/me", true);
  },
  logout() {
    setToken(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("importify_refresh_token");
    }
  },
};
