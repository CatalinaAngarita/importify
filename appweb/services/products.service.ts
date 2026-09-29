import { apiDelete, apiGet, apiPatch, apiPost } from "./api";
import type { ApiProduct, Paginated } from "@/types/api";

export function listProducts(params: Record<string, string | number> = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  return apiGet<Paginated<ApiProduct>>(qs ? `/products?${qs}` : "/products");
}

export function getProductBySlug(slug: string) {
  return apiGet<ApiProduct>(`/products/slug/${encodeURIComponent(slug)}`);
}

// Administración (requiere JWT ADMIN).
export const adminProducts = {
  create: (data: Record<string, unknown>) => apiPost<ApiProduct>("/products", data, true),
  update: (id: string, data: Record<string, unknown>) =>
    apiPatch<ApiProduct>(`/products/${id}`, data, true),
  toggleActive: (id: string, isActive: boolean) =>
    apiPatch<ApiProduct>(`/products/${id}`, { isActive }, true),
  remove: (id: string) => apiDelete<{ deleted: boolean }>(`/products/${id}`, true),
};
