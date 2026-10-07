"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { useCart } from "@/context/CartContext";
import { PRODUCTS } from "@/services/catalog.mock";
import { formatCOP } from "@/services/format";

export default function CarritoPage() {
  const { items, count, updateQty, removeItem, clearCart } = useCart();
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

  function handleClear() {
    clearCart();
    setNotice("Carrito vaciado");
  }

  function handleRemove(slug: string) {
    removeItem(slug);
    setNotice("Producto eliminado");
  }

  return (
    <main>
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "2rem", alignItems: "start" }}>
              <div>
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap", fontSize: "0.9rem", color: "#5c5c72" }}>
                  <span style={{ fontWeight: 600, width: "120px" }}>Producto</span>
                  <span style={{ fontWeight: 600 }}>Precio</span>
                  <span style={{ fontWeight: 600, width: "140px" }}>Cantidad</span>
                  <span style={{ fontWeight: 600, width: "100px" }}>Subtotal</span>
                  <span></span>
                </div>
                {cartItems.map((item) => (
                  <div key={item.product.slug} style={{ display: "flex", gap: "1rem", alignItems: "center", padding: "1rem 0", borderBottom: "1px solid #dce3fa", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: "200px" }}>
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        width={80}
                        height={80}
                        style={{ objectFit: "contain", borderRadius: "8px", background: "#f5f5f5" }}
                      />
                      <div>
                        <p style={{ margin: 0, fontWeight: 500, fontSize: "0.95rem" }}>{item.product.name}</p>
                        <p style={{ margin: "0.25rem 0 0", fontSize: "0.8rem", color: "#5c5c72" }}>{item.product.category}</p>
                      </div>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: "1rem", whiteSpace: "nowrap" }}>{formatCOP(item.product.price)}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "140px" }}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: "0.35rem 0.7rem", fontSize: "1rem", minWidth: "36px" }}
                        onClick={() => handleUpdateQty(item.product.slug, item.qty - 1)}
                      >
                        −
                      </button>
                      <span style={{ minWidth: "30px", textAlign: "center", fontWeight: 600 }}>{item.qty}</span>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: "0.35rem 0.7rem", fontSize: "1rem", minWidth: "36px" }}
                        onClick={() => handleUpdateQty(item.product.slug, item.qty + 1)}
                      >
                        +
                      </button>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: "1rem", whiteSpace: "nowrap", width: "100px" }}>{formatCOP(item.subtotal)}</div>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "0.35rem 0.7rem", fontSize: "0.8rem" }}
                      onClick={() => handleRemove(item.product.slug)}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
                  <Link href="/productos" className="btn btn-ghost">
                    ← SEGUIR COMPRANDO
                  </Link>
                  <button className="btn btn-ghost" onClick={handleClear}>
                    VACIAR CARRITO
                  </button>
                </div>
              </div>

              <aside style={{ position: "sticky", top: "100px" }}>
                <div className="card" style={{ padding: "1.5rem" }}>
                  <h3 style={{ margin: "0 0 1rem", fontFamily: '"Days One", "Arial Black", sans-serif', fontSize: "1.2rem" }}>RESUMEN DE COMPRA</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span className="muted">Subtotal</span>
                    <span style={{ fontWeight: 600 }}>{formatCOP(subtotal)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span className="muted">Envío</span>
                    <span style={{ fontWeight: 600 }}>{shipping === 0 ? "Gratis" : formatCOP(shipping)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span className="muted">Impuestos (19%)</span>
                    <span style={{ fontWeight: 600 }}>{formatCOP(tax)}</span>
                  </div>
                  <hr style={{ borderColor: "#dce3fa", margin: "1rem 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.2rem", fontWeight: 800, fontFamily: '"Poppins", sans-serif' }}>
                    <span>TOTAL</span>
                    <span>{formatCOP(total)}</span>
                  </div>
                  <Link href="/checkout" className="btn" style={{ width: "100%", marginTop: "1.5rem", textAlign: "center", padding: "1rem" }}>
                    FINALIZAR COMPRA
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