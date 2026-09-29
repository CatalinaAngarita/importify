import { apiGet } from "./api";

export const adminService = {
  stats() {
    return apiGet<{
      sales: number;
      ordersCount: number;
      ordersByStatus: Record<string, number>;
      lowStockThreshold: number;
      lowStock: { id: string; name: string; sku: string; stock: number }[];
      outOfStock: number;
    }>("/admin/stats", true);
  },
  customers(params: Record<string, string | number> = {}) {
    const qs = new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)]),
    ).toString();
    return apiGet<{ data: unknown[]; meta: unknown }>(qs ? `/users?${qs}` : "/users", true);
  },
};
