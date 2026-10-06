import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/catalog";

export function ProductCard({ product }: { product: Product }) {
  const priceStr = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(product.price).replace("COP", "$");

  const oldPriceStr = product.oldPrice
    ? new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        maximumFractionDigits: 0,
      }).format(product.oldPrice).replace("COP", "$")
    : null;

  return (
    <Link href={`/productos/${product.slug}`} className="card card-link" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", width: "280px" }}>
      <h3 style={{
        fontFamily: '"Days One", "Arial Black", sans-serif',
        fontWeight: 400,
        fontSize: "64.67px",
        color: "#200332",
        margin: "0 0 0.5rem 0",
        lineHeight: 1.1,
        letterSpacing: "0.015em",
      }}>
        {product.name}
      </h3>
      <div className="product-media" style={{ padding: 0, overflow: "hidden", position: "relative", width: "100%", aspectRatio: "1 / 0.85" }}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 720px) 100vw, 300px"
          style={{ objectFit: "cover" }}
        />
      </div>
      <span className="tag" style={{ marginTop: "0.5rem" }}>{product.category}</span>
      <p className="muted" style={{ margin: "0.25rem 0" }}>
        ⭐ {product.rating} · {product.sold} vendidos
      </p>
      <p style={{
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 600,
        fontSize: "133.07px",
        color: "#200332",
        margin: "0.25rem 0 0 0",
        lineHeight: 1,
      }}>
        {priceStr}
        {oldPriceStr && (
          <small style={{
            fontSize: "0.5em",
            fontWeight: 400,
            color: "#5c5c72",
            textDecoration: "line-through",
            marginLeft: "0.5rem",
          }}>
            {oldPriceStr}
          </small>
        )}
      </p>
    </Link>
  );
}
