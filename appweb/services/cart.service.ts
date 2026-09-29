import { apiDelete, apiGet, apiPatch, apiPost } from "./api";
import type { ApiCart } from "@/types/api";

const CART_KEY = "importify_cart_id";

export function getStoredCartId(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CART_KEY);
}

function storeCartId(id: string) {
  if (typeof window !== "undefined") window.localStorage.setItem(CART_KEY, id);
}

export const cartService = {
  async getOrCreate(): Promise<ApiCart> {
    const stored = getStoredCartId();
    if (stored) {
      try {
        return await apiGet<ApiCart>(`/cart/${stored}`);
      } catch {
        // Carrito inválido: se crea uno nuevo abajo.
      }
    }
    const cart = await apiPost<ApiCart>("/cart", {});
    storeCartId(cart.id);
    return cart;
  },
  get(id: string) {
    return apiGet<ApiCart>(`/cart/${id}`);
  },
  addItem(id: string, productId: string, quantity = 1) {
    return apiPost<ApiCart>(`/cart/${id}/items`, { productId, quantity });
  },
  updateQuantity(id: string, itemId: string, quantity: number) {
    return apiPatch<ApiCart>(`/cart/${id}/items/${itemId}`, { quantity });
  },
  removeItem(id: string, itemId: string) {
    return apiDelete<ApiCart>(`/cart/${id}/items/${itemId}`);
  },
  clear(id: string) {
    return apiDelete<ApiCart>(`/cart/${id}`);
  },
};
