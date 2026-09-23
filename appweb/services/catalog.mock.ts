import type { Category, Product } from "@/types/catalog";

// Datos mock de presentación. La API real se conecta en etapas posteriores.
export const CATEGORIES: Category[] = [
  { slug: "technology", name: "Tecnología", image: "/images/categories/technology.webp" },
  { slug: "automotive", name: "Automotriz", image: "/images/categories/automotive.webp" },
  { slug: "accessories", name: "Accesorios", image: "/images/categories/accessories.webp" },
  { slug: "personal-care", name: "Cuidado personal", image: "/images/categories/personal-care.webp" },
];

export const FEATURED_PRODUCTS: Product[] = [
  { id: "p1", name: "Audífonos importados", category: "technology", price: 189900, image: "/images/products/technology/audifonos.webp" },
  { id: "p2", name: "Kit cuidado auto", category: "automotive", price: 94900, image: "/images/products/automotive/kit.webp" },
  { id: "p3", name: "Mochila urbana", category: "accessories", price: 129900, image: "/images/products/accessories/mochila.webp" },
  { id: "p4", name: "Set cuidado facial", category: "personal-care", price: 74900, image: "/images/products/personal-care/set-facial.webp" },
];
