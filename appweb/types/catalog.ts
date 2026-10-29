export type CategorySlug =
  | "technology"
  | "automotive"
  | "accessories"
  | "personal-care"
  | "perfumeria"
  | "televentas"
  | "sokany"
  | "belleza"
  | "tecnologia"
  | "electricos"
  | "repuestos-electricos"
  | "jugueteria"
  | "herramientas"
  | "mascotas";

export interface Category {
  slug: string;
  name: string;
  emoji: string;
  blurb: string;
  image: string;
}

export interface Product {
  id?: string;
  sku?: string;
  stock?: number;
  slug: string;
  name: string;
  description?: string;
  category: string;
  categoryName?: string;
  price: number;
  oldPrice?: number;
  emoji: string;
  image: string;
  primaryImage?: string | null;
  primaryImageOriginal?: string | null;
  rating: number;
  sold: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
}

export interface Testimonial {
  name: string;
  text: string;
  rating: number;
  avatar: string;
}
