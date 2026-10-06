"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS } from "@/services/catalog.mock";
import { formatCOP } from "@/services/format";
import { cartService } from "@/services/cart.service";

export default function ProductoDetalle({ params }: { params: { slug: string } }) {
  const product = PRODUCTS.find((p) => p.slug === params.slug);
  if (!product) notFound();
  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.slug !== product.slug,
  ).slice(0, 4);

  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);

  async function addToCart() {
    if (!product) return;
    setBusy(true);
    try {
      const cart = await cartService.getOrCreate();
      await cartService.addItem(cart.id, product.slug, quantity);
      setQuantity(1);
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
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
              <span className="tag">{product.category}</span>
              <h1>{product.name}</h1>
              <p className="muted">
                ⭐ {product.rating} · {product.sold} vendidos
              </p>
              <p className="price" style={{ fontSize: "1.6rem" }}>
                {formatCOP(product.price)}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0" }}>
                <span style={{ fontWeight: 600 }}>Cantidad:</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", border: "1px solid #dce3fa", borderRadius: "8px", overflow: "hidden" }}>
                  <button
                    className="btn btn-ghost"
                    disabled={busy || quantity <= 1}
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    style={{ padding: "0.5rem 1rem", minWidth: "44px" }}
                  >
                    −
                  </button>
                  <span style={{ minWidth: "3rem", textAlign: "center" }}>{quantity}</span>
                  <button
                    className="btn btn-ghost"
                    disabled={busy}
                    onClick={() => setQuantity(q => q + 1)}
                    style={{ padding: "0.5rem 1rem", minWidth: "44px" }}
                  >
                    +
                  </button>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button className="btn" onClick={addToCart} disabled={busy}>
                  {busy ? "Agregando..." : "Agregar al carrito"}
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
