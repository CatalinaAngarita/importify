"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { ProductCard } from "@/components/ProductCard";
import { ApiError } from "@/services/api";
import { fetchProductBySlug, fetchProducts } from "@/services/catalog.service";
import { formatCOP } from "@/services/format";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types/catalog";

export default function ProductoDetalle({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let active = true;
    setProduct(null);
    setRelated([]);
    setMissing(false);
    setError(null);

    fetchProductBySlug(params.slug)
      .then(async (loaded) => {
        if (!active) return;
        setProduct(loaded);
        const siblings = await fetchProducts({ categorySlug: loaded.category, limit: 5 });
        if (active) {
          setRelated(siblings.filter((item) => item.slug !== loaded.slug).slice(0, 4));
        }
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 404) setMissing(true);
        else setError(err instanceof Error ? err.message : "No fue posible cargar el producto.");
      });

    return () => {
      active = false;
    };
  }, [params.slug]);

  if (missing) notFound();
  if (!product) {
    return (
      <main>
        <Container>
          <section className="section">
            <p className="muted">{error ?? "Cargando producto…"}</p>
          </section>
        </Container>
      </main>
    );
  }

  const soldOut = product.stock !== undefined && product.stock <= 0;

  function addToCart() {
    if (!product || soldOut) return;
    addItem(product, quantity);
    setQuantity(1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <main>
      <Container>
        <section className="section">
          <div className="detail">
            <div className="product-media" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
<Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 720px) 100vw, 500px"
          style={{ objectFit: "cover" }}
          priority
        />
          </div>
            <div>
              <span className="tag">{product.categoryName ?? product.category}</span>
              <h1>{product.name}</h1>
              <p className="muted">
                ⭐ {product.rating} · {product.sold} vendidos
                {product.stock !== undefined && ` · ${product.stock} disponibles`}
              </p>
              <p className="price" style={{ fontSize: "1.6rem" }}>
                {formatCOP(product.price)}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0" }}>
                <span style={{ fontWeight: 600 }}>Cantidad:</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid #dce3fa", borderRadius: "8px", overflow: "hidden" }}>
                  <button
                    className="btn btn-ghost"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{ padding: "0.5rem 1rem", minWidth: "44px" }}
                  >
                    −
                  </button>
                  <span style={{ minWidth: "3rem", textAlign: "center" }}>{quantity}</span>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setQuantity(q => q + 1)}
                    style={{ padding: "0.5rem 1rem", minWidth: "44px" }}
                  >
                    +
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button className="btn" onClick={addToCart} disabled={soldOut}>
                  {soldOut ? "Agotado" : added ? "Agregado al carrito" : "Agregar al carrito"}
                </button>
                <Link href="/checkout" className="btn btn-ghost">
                  Comprar ahora
                </Link>
              </div>
            </div>
          </div>
        </section>
        {related.length > 0 && (
          <section className="section">
            <SectionTitle title="Relacionados" />
            <div className="grid">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </main>
  );
}
