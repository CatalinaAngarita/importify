import type { ApiCategory, ApiProduct } from "@/types/api";
import type { Category, Product } from "@/types/catalog";
import { CATEGORIES, PRODUCTS } from "./catalog.mock";
import { CATALOG } from "./catalog.products";
import { ApiError } from "./api";
import { listCategories } from "./categories.service";
import { getProductBySlug, listProducts as listProductsFromApi } from "./products.service";

const LOCAL_PRODUCTS = new Map<string, Product>();
for (const product of [...PRODUCTS, ...Object.values(CATALOG).flat()]) {
  LOCAL_PRODUCTS.set(product.slug, product);
}

const LOCAL_CATEGORIES = new Map(CATEGORIES.map((category) => [category.slug, category]));
const FALLBACK_IMAGE = "/images/brand/logo-superior.svg";

function normalizeImage(image?: string | null): string | null {
  if (!image) return null;
  return image;
}

function resolveProductImage(api: ApiProduct, local?: Product): string {
  const processed = normalizeImage(api.primaryImage);
  if (processed) return processed;

  const original = normalizeImage(api.primaryImageOriginal);
  if (original) return original;

  return local?.image ?? FALLBACK_IMAGE;
}

export function apiProductToProduct(api: ApiProduct): Product {
  const local = LOCAL_PRODUCTS.get(api.slug);
  const category = api.categorySlug ?? local?.category ?? "otros";
  return {
    id: api.id,
    sku: api.sku,
    stock: api.stock,
    slug: api.slug,
    name: api.name || local?.name || api.slug,
    description: api.shortDescription ?? undefined,
    category,
    categoryName: LOCAL_CATEGORIES.get(category)?.name ?? api.categoryName ?? category,
    price: Number(api.price),
    oldPrice: api.compareAtPrice ? Number(api.compareAtPrice) : local?.oldPrice,
    emoji: local?.emoji ?? "📦",
    image: resolveProductImage(api, local),
    primaryImage: api.primaryImage,
    primaryImageOriginal: api.primaryImageOriginal,
    rating: local?.rating ?? 0,
    sold: local?.sold ?? 0,
    isFeatured: api.isFeatured,
    isBestSeller: api.isBestSeller,
  };
}

export function apiCategoryToCategory(api: ApiCategory): Category {
  const local = LOCAL_CATEGORIES.get(api.slug);
  return {
    slug: api.slug,
    name: local?.name ?? api.name,
    emoji: local?.emoji ?? "📦",
    blurb: local?.blurb ?? api.description ?? "",
    image: normalizeImage(api.image) ?? local?.image ?? FALLBACK_IMAGE,
  };
}

export async function fetchCatalog(): Promise<{ products: Product[]; categories: Category[] }> {
  const [products, categories] = await Promise.all([
    listProductsFromApi({ limit: 100, isActive: "true" }),
    listCategories({ limit: 100 }),
  ]);
  return {
    products: products.data.map(apiProductToProduct),
    categories: categories.data.map(apiCategoryToCategory),
  };
}

export async function fetchProducts(
  params: Record<string, string | number> = {},
): Promise<Product[]> {
  const result = await listProductsFromApi({ limit: 100, isActive: "true", ...params });
  return result.data.map(apiProductToProduct);
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
  const api = await getProductBySlug(slug);
  if (!api.isActive) throw new ApiError(404, `Producto '${slug}' no encontrado`);
  return apiProductToProduct(api);
}

export async function fetchFeaturedProducts(limit = 6): Promise<Product[]> {
  const featured = await fetchProducts({ isFeatured: "true", limit });
  if (featured.length > 0) return featured.slice(0, limit);
  return fetchProducts({ limit });
}

export async function fetchBestSellers(limit = 8): Promise<Product[]> {
  const bestSellers = await fetchProducts({ isBestSeller: "true", limit });
  if (bestSellers.length > 0) return bestSellers.slice(0, limit);
  return fetchProducts({ limit });
}

export function getLocalCatalog(): { products: Product[]; categories: Category[] } {
  return {
    products: Array.from(LOCAL_PRODUCTS.values()),
    categories: CATEGORIES,
  };
}
