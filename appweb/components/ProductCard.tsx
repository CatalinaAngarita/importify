import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/catalog";
import { formatCOP } from "@/services/format";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/productos/${product.slug}`} className="card card-link">
      <div className="product-media" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 720px) 100vw, 300px"
          style={{ objectFit: "cover" }}
        />
      </div>
      <span className="tag">{product.category}</span>
      <h3>{product.name}</h3>
      <p className="muted">
        ⭐ {product.rating} · {product.sold} vendidos
      </p>
      <p className="price">
        {formatCOP(product.price)}{" "}
        {product.oldPrice && (
          <small className="muted">
            <s>{formatCOP(product.oldPrice)}</s>
          </small>
        )}
      </p>
    </Link>
  );
}
