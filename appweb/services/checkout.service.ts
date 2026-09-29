import { apiPost } from "./api";

export const checkoutService = {
  run(data: {
    cartId?: string;
    items?: { productId: string; quantity: number }[];
    discountCode?: string;
    shippingAddress: Record<string, unknown>;
  }) {
    return apiPost<{ order: { id: string }; payment: unknown }>("/checkout", data);
  },
};
