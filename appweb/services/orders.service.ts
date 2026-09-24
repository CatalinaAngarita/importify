import { apiGet, apiPatch, apiPost } from "./api";
import type { ApiOrder, Paginated } from "@/types/api";

export const ordersService = {
  list(params: Record<string, string | number> = {}, auth = true) {
    const qs = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)]),
    ).toString();
    return apiGet<Paginated<ApiOrder>>(qs ? `/orders?${qs}` : "/orders", auth);
  },
  get(id: string, auth = true) {
    return apiGet<ApiOrder>(`/orders/${id}`, auth);
  },
  create(data: {
    cartId?: string;
    items?: { productId: string; quantity: number }[];
    discountCode?: string;
    shippingAddress?: Record<string, unknown>;
  }) {
    return apiPost<ApiOrder>("/orders", data);
  },
  // Administración (requiere JWT ADMIN).
  updateStatus(id: string, status: string) {
    return apiPatch<ApiOrder>(`/orders/${id}/status`, { status }, true);
  },
};
