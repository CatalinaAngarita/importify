import { apiDelete, apiGet, apiPatch, apiPost } from "./api";
import type { ApiCategory, Paginated } from "@/types/api";

export function listCategories(params: Record<string, string | number> = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  return apiGet<Paginated<ApiCategory>>(qs ? `/categories?${qs}` : "/categories");
}

// Administración (requiere JWT ADMIN).
export const adminCategories = {
  create: (data: Record<string, unknown>) => apiPost<ApiCategory>("/categories", data, true),
  update: (id: string, data: Record<string, unknown>) =>
    apiPatch<ApiCategory>(`/categories/${id}`, data, true),
  remove: (id: string) => apiDelete<{ deleted: boolean }>(`/categories/${id}`, true),
};
