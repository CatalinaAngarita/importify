export type CategorySlug =
  | "technology"
  | "automotive"
  | "accessories"
  | "personal-care";

export interface Category {
  slug: CategorySlug;
  name: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  category: CategorySlug;
  price: number;
  image: string;
}
