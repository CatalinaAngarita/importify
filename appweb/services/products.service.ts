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
  // Imágenes
  uploadImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiPost<{ 
      id: string; 
      productId: string; 
      image: string; 
      processedImage: string | null; 
      altText: string | null; 
      isPrimary: boolean; 
      processingStatus: string;
      processingError: string | null;
    }>(
      `/products/${id}/images`,
      formData,
      true,
    );
  },
  getImages: (id: string) =>
    apiGet<Array<{ 
      id: string; 
      productId: string; 
      image: string; 
      processedImage: string | null; 
      altText: string | null; 
      isPrimary: boolean; 
      processingStatus: string;
      processingError: string | null;
    }>>(
      `/products/${id}/images`,
    ),
  removeImage: (id: string, imageId: string) =>
    apiDelete<{ deleted: boolean; id: string }>(`/products/${id}/images/${imageId}`, true),
  setPrimaryImage: (id: string, imageId: string) =>
    apiPatch<{ 
      id: string; 
      productId: string; 
      image: string; 
      processedImage: string | null; 
      altText: string | null; 
      isPrimary: boolean; 
      processingStatus: string;
      processingError: string | null;
    }>(
      `/products/${id}/images/${imageId}/primary`,
      {},
      true,
    ),
};
