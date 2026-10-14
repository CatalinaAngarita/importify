"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { useCart } from "@/context/CartContext";
import { PRODUCTS } from "@/services/catalog.mock";
import { formatCOP, formatCOPWithSuffix } from "@/services/format";

export default function CarritoPage() {
  const { items, count, updateQty, removeItem } = useCart();
  const [notice, setNotice] = useState<string | null>(null);

  const cartItems = items.map((item) => {
    const product = PRODUCTS.find((p) => p.slug === item.product.slug);
    return {
      ...item,
      product: product ?? item.product,
      subtotal: (product?.price ?? item.product.price) * item.qty,
    };
  });

  const subtotal = cartItems.reduce((sum, i) => sum + i.subtotal, 0);
  const shipping = subtotal > 0 ? 15000 : 0;
  const tax = Math.round(subtotal * 0.19);
  const total = subtotal + shipping + tax;

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
          {count === 0 ? (
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
                  <span className="cart-head-product">Producto</span>
                  <span>Precio</span>
                  <span className="cart-head-qty">Cantidad</span>
                  <span className="cart-head-subtotal">Subtotal</span>
                  <span></span>
                </div>
                {cartItems.map((item) => (
                  <div key={item.product.slug} className="cart-row">
                    <div className="cart-product">
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        width={130}
                        height={130}
                        className="cart-product-image"
                      />
                      <div>
                        <p className="cart-product-name">{item.product.name}</p>
                        <p className="cart-product-category">{item.product.category}</p>
                      </div>
                    </div>
                    <div className="cart-price">{formatCOP(item.product.price)}</div>
                    <div className="cart-qty">
                      <button
                        className="btn btn-ghost cart-qty-btn"
                        onClick={() => handleUpdateQty(item.product.slug, item.qty - 1)}
                      >
                        −
                      </button>
                      <span className="cart-qty-value">{item.qty}</span>
                      <button
                        className="btn btn-ghost cart-qty-btn"
                        onClick={() => handleUpdateQty(item.product.slug, item.qty + 1)}
                      >
                        +
                      </button>
                    </div>
                    <div className="cart-subtotal">{formatCOP(item.subtotal)}</div>
                    <button
                      className="btn btn-ghost cart-remove"
                      onClick={() => handleRemove(item.product.slug)}
                    >
                      Eliminar
                    </button>
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
                    <span className="cart-summary-value">{formatCOP(tax)}</span>
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
            {PRODUCTS.slice(0, 4).map((p) => (
              <Link key={p.slug} href={`/productos/${p.slug}`} className="card card-link" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div className="product-media" style={{ padding: 0, overflow: "hidden", position: "relative", width: "100%", aspectRatio: "1 / 1" }}>
                  <Image src={p.image} alt={p.name} fill sizes="(max-width: 720px) 100vw, 300px" style={{ objectFit: "cover" }} />
                </div>
                <h3 style={{ fontFamily: '"Days One", "Arial Black", sans-serif', fontWeight: 400, fontSize: "1.1rem", color: "#200332", margin: "0.75rem 0 0.5rem", lineHeight: 1.1 }}>{p.name}</h3>
                <span className="tag" style={{ marginTop: "0.5rem" }}>{p.category}</span>
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