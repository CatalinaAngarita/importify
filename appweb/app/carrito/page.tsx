"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { useCart } from "@/context/CartContext";
import { fetchBestSellers } from "@/services/catalog.service";
import { formatCOP, formatCOPWithSuffix } from "@/services/format";
import type { Product } from "@/types/catalog";

const FREE_SHIPPING_THRESHOLD = 200000;
const SHIPPING_FLAT = 12000;

export default function CarritoPage() {
  const { items, count, loading, error, updateQty, removeItem } = useCart();
  const [notice, setNotice] = useState<string | null>(null);
  const [recommended, setRecommended] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    fetchBestSellers(4)
      .then((products) => {
        if (active) setRecommended(products);
      })
      .catch(() => {
        if (active) setRecommended([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const cartItems = items.map((item) => ({
    ...item,
    subtotal: item.product.price * item.qty,
  }));

  const subtotal = cartItems.reduce((sum, i) => sum + i.subtotal, 0);
  const shipping = cartItems.length === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const total = subtotal + shipping;

  function handleUpdateQty(slug: string, qty: number) {
    if (qty <= 0) {
      removeItem(slug);
      setNotice("Producto eliminado");
      return;
    }
    updateQty(slug, qty);
  }

  function handleRemove(slug: string) {
    removeItem(slug);
    setNotice("Producto eliminado");
  }

  return (
    <main className="cart-page">
      <Container>
        <section className="section">
          <SectionTitle title="TU CARRITO" />
          {notice && <p className="muted" style={{ marginBottom: "1rem" }}>{notice}</p>}
          {loading && <p className="muted" style={{ marginBottom: "1rem" }}>Cargando carrito…</p>}
          {error && <p className="muted" style={{ marginBottom: "1rem" }}>{error}</p>}
          {loading ? null : count === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <p className="muted" style={{ marginBottom: "1.5rem" }}>Tu carrito está vacío.</p>
              <Link href="/productos" className="btn">
                Ver productos
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div>
                <div className="cart-head">
                  <span className="cart-head-select">Todos los productos</span>
                </div>
                {cartItems.map((item) => (
                  <div key={item.product.slug} className="cart-card">
                    <div className="cart-card-media">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        width={118}
                        height={118}
                        className="cart-card-image"
                      />
                    </div>
                    <div className="cart-card-body">
                      <div className="cart-card-top">
                        <div>
                          <p className="cart-card-name">{item.product.name}</p>
                          <p className="cart-card-category">{item.product.categoryName ?? item.product.category}</p>
                          <div className="cart-card-tags">
                            <span className="cart-card-tag">Color: Oro</span>
                            <span className="cart-card-tag">Cantidad: {item.qty}</span>
                          </div>
                        </div>
                        <button
                          className="cart-card-remove"
                          onClick={() => handleRemove(item.product.slug)}
                          aria-label="Eliminar"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                      <div className="cart-card-bottom">
                        <div className="cart-card-price">{formatCOP(item.product.price)}</div>
                        <div className="cart-card-qty">
                          <button
                            className="cart-card-qty-btn cart-card-qty-btn-minus"
                            onClick={() => handleUpdateQty(item.product.slug, item.qty - 1)}
                            aria-label="Disminuir cantidad"
                          >
                            <Image
                              src="/images/carrito/signo--carrito.svg"
                              alt=""
                              width={24}
                              height={24}
                              className="cart-card-qty-icon"
                            />
                          </button>
                          <span className="cart-card-qty-value">{item.qty}</span>
                          <button
                            className="cart-card-qty-btn cart-card-qty-btn-plus"
                            onClick={() => handleUpdateQty(item.product.slug, item.qty + 1)}
                            aria-label="Aumentar cantidad"
                          >
                            <Image
                              src="/images/carrito/signo+-carrito.svg"
                              alt=""
                              width={24}
                              height={24}
                              className="cart-card-qty-icon"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <aside className="cart-aside">
                <div className="card cart-summary">
                  <h3 className="cart-summary-title">RESUMEN DE COMPRA</h3>
                  <div className="cart-summary-line">
                    <span className="muted">Envío</span>
                    <span className="cart-summary-value">{shipping === 0 ? "Gratis" : formatCOP(shipping)}</span>
                  </div>
                  <div className="cart-summary-line">
                    <span className="muted">Impuestos</span>
                    <span className="cart-summary-value">Incluidos</span>
                  </div>
                  <hr className="cart-summary-divider" />
                  <div className="cart-summary-total">
                    <span>TOTAL</span>
                    <span className="cart-summary-total-value">{formatCOPWithSuffix(total)}</span>
                  </div>
                  <p className="cart-summary-note">¡TÚ PEDIDO NOS IMPORTA!</p>
                  <Link href="/checkout" className="btn cart-checkout">
                    FINALIZAR COMPRA
                  </Link>
                  <Link href="/productos" className="btn cart-checkout cart-continue">
                    SEGUIR COMPRANDO
                  </Link>
                </div>
              </aside>
            </div>
          )}
        </section>

        <section className="section">
          <SectionTitle title="PRODUCTOS MÁS VENDIDOS" />
          <div className="grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            {recommended.map((p) => (
              <Link key={p.slug} href={`/productos/${p.slug}`} className="card card-link" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div className="product-media" style={{ padding: 0, overflow: "hidden", position: "relative", width: "100%", aspectRatio: "1 / 1" }}>
                  <Image src={p.image} alt={p.name} fill sizes="(max-width: 720px) 100vw, 300px" style={{ objectFit: "cover" }} />
                </div>
                <h3 style={{ fontFamily: '"Days One", "Arial Black", sans-serif', fontWeight: 400, fontSize: "1.1rem", color: "#200332", margin: "0.75rem 0 0.5rem", lineHeight: 1.1 }}>{p.name}</h3>
                <span className="tag" style={{ marginTop: "0.5rem" }}>{p.categoryName ?? p.category}</span>
                <p className="muted" style={{ margin: "0.5rem 0" }}>⭐ {p.rating} · {p.sold} vendidos</p>
                <p style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 600, fontSize: "1.2rem", color: "#200332", margin: "0.5rem 0 0" }}>{formatCOP(p.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}