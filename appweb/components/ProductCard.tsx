import type { Product } from "@/types/catalog";

export function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="card">
      <h3>{product.name}</h3>
      <p className="muted">{product.category}</p>
      <p className="price">{formatCOP(product.price)}</p>
    </article>
  );
}
