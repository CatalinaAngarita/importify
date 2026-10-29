"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import type { ApiCart } from "@/types/api";
import type { Product } from "@/types/catalog";
import { cartService } from "@/services/cart.service";
import { CATEGORIES } from "@/services/catalog.mock";

interface CartItem {
  itemId?: string;
  product: Product;
  qty: number;
}

interface CartContextType {
  items: CartItem[];
  count: number;
  loading: boolean;
  error: string | null;
  addItem: (product: CartItem["product"], qty?: number) => void;
  removeItem: (slug: string) => void;
  updateQty: (slug: string, qty: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const FALLBACK_IMAGE = "/images/brand/logo-superior.svg";

function categoryName(slug?: string | null): string {
  if (!slug) return "Otros";
  return CATEGORIES.find((category) => category.slug === slug)?.name ?? slug;
}

function fromApi(cart: ApiCart): CartItem[] {
  return cart.items.map((item) => ({
    itemId: item.id,
    qty: item.quantity,
    product: {
      id: item.productId,
      sku: item.productSku,
      stock: item.productStock,
      slug: item.productSlug,
      name: item.productName,
      category: item.productCategorySlug ?? "otros",
      categoryName: categoryName(item.productCategorySlug),
      price: Number(item.unitPrice),
      oldPrice: item.productCompareAtPrice ? Number(item.productCompareAtPrice) : undefined,
      emoji: "📦",
      image: item.productImage || item.productImageOriginal || FALLBACK_IMAGE,
      primaryImage: item.productImage,
      primaryImageOriginal: item.productImageOriginal,
      rating: 0,
      sold: 0,
    },
  }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cartId = useRef<string | null>(null);
  const cartPromise = useRef<Promise<ApiCart> | null>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const mounted = useRef(true);

  const applyCart = useCallback((cart: ApiCart) => {
    cartId.current = cart.id;
    if (mounted.current) setItems(fromApi(cart));
  }, []);

  const loadCart = useCallback((): Promise<ApiCart> => {
    if (!cartPromise.current) {
      cartPromise.current = cartService.getOrCreate().catch((err) => {
        cartPromise.current = null;
        throw err;
      });
    }
    return cartPromise.current;
  }, []);

  const ensureCart = useCallback(async (): Promise<string> => {
    if (cartId.current) return cartId.current;
    const cart = await loadCart();
    cartId.current = cart.id;
    return cart.id;
  }, [loadCart]);

  const run = useCallback(
    (action: (id: string) => Promise<ApiCart>) => {
      queue.current = queue.current.then(async () => {
        try {
          const id = await ensureCart();
          const cart = await action(id);
          applyCart(cart);
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : "No fue posible actualizar el carrito.");
          const id = cartId.current;
          if (id) {
            try {
              applyCart(await cartService.get(id));
            } catch {
              // El siguiente intento volverá a sincronizar con la API.
            }
          }
        }
      });
      return queue.current;
    },
    [applyCart, ensureCart],
  );

  useEffect(() => {
    mounted.current = true;
    loadCart()
      .then((cart) => {
        if (!mounted.current) return;
        applyCart(cart);
        setError(null);
      })
      .catch((err) => {
        if (mounted.current) {
          setError(err instanceof Error ? err.message : "No fue posible cargar el carrito.");
        }
      })
      .finally(() => {
        if (mounted.current) setLoading(false);
      });
    return () => {
      mounted.current = false;
    };
  }, [applyCart, loadCart]);

  const count = items.reduce((n, i) => n + i.qty, 0);

  const addItem = (product: CartItem["product"], qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.slug === product.slug);
      if (existing) {
        return prev.map((i) =>
          i.product.slug === product.slug ? { ...i, qty: i.qty + qty } : i,
        );
      }
      return [...prev, { product, qty }];
    });

    if (!product.id) return;
    void run((id) => cartService.addItem(id, product.id!, qty));
  };

  const removeItem = (slug: string) => {
    const target = items.find((i) => i.product.slug === slug);
    setItems((prev) => prev.filter((i) => i.product.slug !== slug));
    if (!target?.itemId) return;
    void run((id) => cartService.removeItem(id, target.itemId!));
  };

  const updateQty = (slug: string, qty: number) => {
    if (qty <= 0) {
      removeItem(slug);
      return;
    }
    const target = items.find((i) => i.product.slug === slug);
    setItems((prev) =>
      prev.map((i) => (i.product.slug === slug ? { ...i, qty } : i)),
    );
    if (!target?.itemId) return;
    void run((id) => cartService.updateQuantity(id, target.itemId!, qty));
  };

  const clearCart = () => {
    setItems([]);
    void run((id) => cartService.clear(id));
  };

  return (
    <CartContext.Provider
      value={{ items, count, loading, error, addItem, removeItem, updateQty, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
