// Tipos espejo de la API de `app`. Fuente de verdad: app/src.
export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; pages: number };
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  isActive: boolean;
}

export interface ApiProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  price: string;
  compareAtPrice?: string | null;
  stock: number;
  categoryId?: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  primaryImage?: string | null;
  primaryImageOriginal?: string | null;
}

export interface ApiCartItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  productName: string;
  productSlug: string;
  productSku: string;
  subtotal: number;
}

export interface ApiCart {
  id: string;
  userId?: string | null;
  items: ApiCartItem[];
  meta: { count: number; totalQuantity: number; total: number };
}

export interface ApiOrder {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: string;
  shippingCost: string;
  discount: string;
  total: string;
  paymentStatus: string;
  items?: unknown[];
}

export interface ApiPayment {
  id: string;
  orderId: string;
  reference: string;
  amountCents: number;
  currency: string;
  status: string;
  wompiTransactionId?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export type RequestStatus = "idle" | "loading" | "success" | "error" | "empty";
