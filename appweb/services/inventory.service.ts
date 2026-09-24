import { apiGet, apiPatch, apiPost } from "./api";

export const inventoryService = {
  history(params: Record<string, string | number> = {}) {
    const qs = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)]),
    ).toString();
    return apiGet<{ data: unknown[]; meta: unknown }>(
      qs ? `/inventory/movements?${qs}` : "/inventory/movements",
      true,
    );
  },
  increase(productId: string, quantity: number, reason?: string) {
    return apiPost(`/inventory/products/${productId}/increase`, { quantity, reason }, true);
  },
  decrease(productId: string, quantity: number, reason?: string) {
    return apiPost(`/inventory/products/${productId}/decrease`, { quantity, reason }, true);
  },
  adjust(productId: string, quantity: number, reason?: string) {
    return apiPatch(`/inventory/products/${productId}/adjust`, { quantity, reason }, true);
  },
};
