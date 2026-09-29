"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { ApiState } from "@/components/ApiState";
import { useApi } from "@/hooks/useApi";
import { cartService } from "@/services/cart.service";
import { checkoutService } from "@/services/checkout.service";
import { paymentsService } from "@/services/payments.service";
import { formatCOP } from "@/services/format";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cart, status, error, reload } = useApi(() => cartService.getOrCreate());
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", email: "" });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!cart || cart.items.length === 0) return;
    setBusy(true);
    setNotice(null);
    try {
      const { order } = await checkoutService.run({
        cartId: cart.id,
        shippingAddress: {
          name: form.name,
          phone: form.phone,
          address: form.address,
          city: form.city,
        },
      });
      await paymentsService.intent({ orderId: order.id, customerEmail: form.email });
      router.push("/mi-cuenta");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Error en el checkout");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <Container>
        <section className="section">
          <SectionTitle title="Checkout" sub="Carrito → Pedido → Pago Wompi" />
          <div className="steps">
            <span className="step active">1. Datos</span>
            <span className="step">2. Pedido</span>
            <span className="step">3. Pago Wompi</span>
          </div>
          <ApiState status={status} error={error} onRetry={reload} />
          {notice && <p className="muted">{notice}</p>}
          {status === "success" && cart && (
            <div className="grid-3" style={{ gridTemplateColumns: "2fr 1fr" }}>
              <form className="form card" style={{ maxWidth: "none" }} onSubmit={submit}>
                <div className="form-row">
                  <label>
                    Nombre
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Tu nombre"
                      required
                    />
                  </label>
                  <label>
                    Teléfono
                    <input
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="300 000 0000"
                      required
                    />
                  </label>
                </div>
                <label>
                  Correo (recibo Wompi)
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="tu@correo.com"
                    required
                  />
                </label>
                <label>
                  Dirección
                  <input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Calle 123 #45-67, Bogotá"
                    required
                  />
                </label>
                <label>
                  Ciudad
                  <input
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="Bogotá"
                    required
                  />
                </label>
                <button className="btn" type="submit" disabled={busy || cart.items.length === 0}>
                  {busy ? "Procesando…" : `Confirmar pedido ${formatCOP(cart.meta.total)}`}
                </button>
              </form>
              <aside className="card">
                <h3>Resumen</h3>
                {cart.items.map((i) => (
                  <p key={i.id} className="muted">
                    {i.quantity}× {i.productName} — {formatCOP(i.subtotal)}
                  </p>
                ))}
                <p className="price">Total: {formatCOP(cart.meta.total)}</p>
              </aside>
            </div>
          )}
        </section>
      </Container>
    </main>
  );
}
