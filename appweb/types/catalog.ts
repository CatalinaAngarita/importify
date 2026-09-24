export type CategorySlug =
  | "technology"
  | "automotive"
  | "accessories"
  | "personal-care";

export interface Category {
  slug: CategorySlug;
  name: string;
  emoji: string;
  blurb: string;
  image: string;
}

export interface Product {
  slug: string;
  name: string;
  category: CategorySlug;
  price: number;
  oldPrice?: number;
  emoji: string;
  image: string;
  rating: number;
  sold: number;
}

export interface Testimonial {
  name: string;
  text: string;
  rating: number;
  avatar: string;
}
