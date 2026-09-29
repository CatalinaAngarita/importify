"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { ApiState } from "@/components/ApiState";
import { useApi } from "@/hooks/useApi";
import { cartService } from "@/services/cart.service";
import { formatCOP } from "@/services/format";

export default function CarritoPage() {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const { data: cart, status, error, reload } = useApi(() => cartService.getOrCreate());

  async function run(fn: () => Promise<unknown>, okMsg?: string) {
    setBusy(true);
    setNotice(null);
    try {
      await fn();
      await reload();
      if (okMsg) setNotice(okMsg);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <Container>
        <section className="section">
          <SectionTitle title="Carrito" sub="Conectado a la API" />
          <ApiState status={status} error={error} emptyText="Tu carrito está vacío." onRetry={reload} />
          {notice && <p className="muted">{notice}</p>}
          {status === "success" && cart && cart.items.length > 0 && (
            <div className="card" style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map((i) => (
                    <tr key={i.id}>
                      <td>{i.productName}</td>
                      <td>
                        <button
                          className="btn btn-ghost"
                          disabled={busy}
                          onClick={() =>
                            run(() => cartService.updateQuantity(cart.id, i.id, i.quantity - 1))
                          }
                        >
                          −
                        </button>{" "}
                        {i.quantity}{" "}
                        <button
                          className="btn btn-ghost"
                          disabled={busy}
                          onClick={() =>
                            run(
                              () => cartService.updateQuantity(cart.id, i.id, i.quantity + 1),
                              undefined,
                            )
                          }
                        >
                          +
                        </button>
                      </td>
                      <td>{formatCOP(i.subtotal)}</td>
                      <td>
                        <button
                          className="btn btn-ghost"
                          disabled={busy}
                          onClick={() => run(() => cartService.removeItem(cart.id, i.id))}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="cart-total">Total: {formatCOP(cart.meta.total)}</div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className="btn btn-ghost"
                  disabled={busy}
                  onClick={() => run(() => cartService.clear(cart.id), "Carrito vaciado.")}
                >
                  Vaciar
                </button>
                <Link href="/checkout" className="btn">
                  Ir al checkout
                </Link>
              </div>
            </div>
          )}
          {status === "success" && cart && cart.items.length === 0 && (
            <Link href="/productos" className="btn">
              Ver productos
            </Link>
          )}
        </section>
      </Container>
    </main>
  );
}
