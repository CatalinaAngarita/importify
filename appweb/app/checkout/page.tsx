"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/Container";
import { ApiState } from "@/components/ApiState";
import { useApi } from "@/hooks/useApi";
import { cartService } from "@/services/cart.service";
import { checkoutService } from "@/services/checkout.service";
import { paymentsService } from "@/services/payments.service";
import { formatCOP } from "@/services/format";

type CheckoutStep = 1 | 2 | 3;
type PaymentMethod = "card" | "paypal" | "wompi";
type PaymentChannel = "nequi" | "bancolombia" | "card" | "daviplata" | "qr" | "pse" | "corresponsales" | "sufipay";

const PAYMENT_METHODS: { id: PaymentMethod; title: string; description: string; mark: string }[] = [
  { id: "card", title: "Tarjeta de Débito o Crédito", description: "Visa, Mastercard, American Express, Banco de Bogotá…", mark: "▣" },
  { id: "paypal", title: "PayPal", description: "Puedes pagar con tu cuenta de PayPal.", mark: "P" },
  { id: "wompi", title: "Wompi", description: "Bancolombia, Daviplata, PSE, Código QR, Nequi, Sufi Pay", mark: "W" },
];

const PAYMENT_CHANNELS: { id: PaymentChannel; label: string; className: string }[] = [
  { id: "nequi", label: "Nequi", className: "nequi" },
  { id: "bancolombia", label: "Bancolombia", className: "bancolombia" },
  { id: "card", label: "TARJETAS DÉBITO Y CRÉDITO\n● ● ●", className: "card-brand" },
  { id: "daviplata", label: "DAVIPLATA", className: "daviplata" },
  { id: "qr", label: "QR\nINTEROPERABLE", className: "qr" },
  { id: "pse", label: "PSE", className: "pse" },
  { id: "corresponsales", label: "▣  CORRESPONSALES\nBANCOLOMBIA", className: "corresponsales" },
  { id: "sufipay", label: "Crédito\nSU+Pay", className: "sufipay" },
];

function CheckoutStepper({ current }: { current: CheckoutStep }) {
  const steps = ["Carrito", "Pago", "Confirmación"];

  return (
    <div className="checkout-stepper" aria-label="Progreso del pago">
      <div className="checkout-stepper-line" />
      {steps.map((label, index) => {
        const step = (index + 1) as CheckoutStep;
        const complete = step < current;
        const active = step === current;
        return (
          <div className="checkout-step" key={label}>
            <span className={`checkout-step-dot${complete ? " is-complete" : ""}${active ? " is-active" : ""}`}>
              {complete ? "✓" : step}
            </span>
            <span>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function CheckoutPage() {
  const { data: cart, status, error, reload } = useApi(() => cartService.getOrCreate());
  const [step, setStep] = useState<CheckoutStep>(1);
  const [method, setMethod] = useState<PaymentMethod>("wompi");
  const [channel, setChannel] = useState<PaymentChannel>("card");
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", email: "", cardNumber: "", cardName: "", expiry: "", cvv: "" });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const total = cart?.meta.total ?? 0;

  function updateForm(field: keyof typeof form, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!cart || cart.items.length === 0) {
      setNotice("Agrega productos al carrito antes de realizar el pago.");
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const { order } = await checkoutService.run({
        cartId: cart.id,
        shippingAddress: { name: form.name, phone: form.phone, address: form.address, city: form.city },
      });
      await paymentsService.intent({ orderId: order.id, customerEmail: form.email, paymentMethod: { method, channel } });
      setSuccess(true);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "No fue posible procesar el pago.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="checkout-page">
      <Container>
        <section className="checkout-shell">
          <ApiState status={status} error={error} onRetry={reload} />
          {notice && <p className="checkout-notice">{notice}</p>}
          <div className="checkout-card">
            <CheckoutStepper current={step} />

            {step === 1 && (
              <section className="checkout-panel" aria-labelledby="payment-method-title">
                <h1 id="payment-method-title">SELECCIONA TU MÉTODO DE PAGO</h1>
                <p>Elige la opción que prefieras. Todos los pagos se procesan de forma segura.</p>
                <div className="payment-method-list">
                  {PAYMENT_METHODS.map((item) => (
                    <button type="button" key={item.id} className={`payment-method${method === item.id ? " is-selected" : ""}`} onClick={() => setMethod(item.id)}>
                      <span className="payment-method-check">{method === item.id ? "✓" : ""}</span>
                      <span className={`payment-method-mark ${item.id}`}>{item.mark}</span>
                      <span className="payment-method-copy"><b>{item.title}</b><small>{item.description}</small></span>
                    </button>
                  ))}
                </div>
                <div className="checkout-pagination"><span className="is-current">1</span><button type="button" onClick={() => setStep(2)}>2</button><button type="button" onClick={() => setStep(3)}>3</button></div>
              </section>
            )}

            {step === 2 && (
              <section className="checkout-panel checkout-channel-panel" aria-labelledby="payment-channel-title">
                <h1 id="payment-channel-title">¿CÓMO QUIERES PAGAR?</h1>
                <p>Elige la opción que prefieras. Todos los pagos se procesan de forma segura.</p>
                <div className="payment-channel-grid">
                  {PAYMENT_CHANNELS.map((item) => (
                    <button type="button" key={item.id} className={`payment-channel ${item.className}${channel === item.id ? " is-selected" : ""}`} onClick={() => { setChannel(item.id); setStep(3); }}>
                      {item.label.split("\n").map((line) => <span key={line}>{line}</span>)}
                    </button>
                  ))}
                </div>
                <div className="checkout-pagination"><button type="button" onClick={() => setStep(1)}>1</button><span className="is-current">2</span><button type="button" onClick={() => setStep(3)}>3</button></div>
              </section>
            )}

            {step === 3 && (
              <section className="checkout-panel checkout-card-panel" aria-labelledby="card-payment-title">
                <h1 id="card-payment-title">INFORMACIÓN DE LA TARJETA</h1>
                <form onSubmit={submit}>
                  <div className="checkout-payment-form">
                    <div className="checkout-card-fields">
                      <label>Digite los números de su tarjeta<input value={form.cardNumber} onChange={(e) => updateForm("cardNumber", e.target.value)} placeholder="1234 5678 9012 3456" required /></label>
                      <label>Nombre completo<input value={form.cardName} onChange={(e) => updateForm("cardName", e.target.value)} placeholder="El titular de la tarjeta" required /></label>
                      <div className="checkout-card-mini-fields">
                        <label>Fecha de Expiración<input value={form.expiry} onChange={(e) => updateForm("expiry", e.target.value)} placeholder="MM/AA" required /></label>
                        <label>CVV<input value={form.cvv} onChange={(e) => updateForm("cvv", e.target.value)} placeholder="123" required /></label>
                      </div>
                      <label className="checkout-save-card"><input type="checkbox" defaultChecked /> Guardar esta tarjeta para futuras compras</label>
                    </div>
                    <div className="checkout-billing-fields">
                      <h2>Dirección de facturación</h2>
                      <label>Nombre<input value={form.name} onChange={(e) => updateForm("name", e.target.value)} placeholder="Nombre completo" required /></label>
                      <label>Dirección<input value={form.address} onChange={(e) => updateForm("address", e.target.value)} placeholder="Calle 123 #45-67" required /></label>
                      <div className="checkout-billing-row">
                        <label>Ciudad<input value={form.city} onChange={(e) => updateForm("city", e.target.value)} placeholder="Bogotá" required /></label>
                        <label>Teléfono<input value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} placeholder="300 000 0000" required /></label>
                      </div>
                      <label>Correo para el recibo<input type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} placeholder="tu@correo.com" required /></label>
                      <button className="checkout-pay-button" type="submit" disabled={busy}>{busy ? "PROCESANDO…" : `PAGAR ${formatCOP(total)}`}</button>
                      <button className="checkout-back-link" type="button" onClick={() => setStep(2)}>← Volver al método de pago</button>
                    </div>
                  </div>
                </form>
                <div className="checkout-pagination"><button type="button" onClick={() => setStep(1)}>1</button><button type="button" onClick={() => setStep(2)}>2</button><span className="is-current">3</span></div>
              </section>
            )}
          </div>
        </section>
      </Container>

      {success && (
        <div className="checkout-success-overlay" role="dialog" aria-modal="true" aria-labelledby="checkout-success-title">
          <div className="checkout-success-modal">
            <div className="checkout-success-mark">✓</div>
            <h2 id="checkout-success-title">COMPRA ÉXITOSA</h2>
            <p>Ha realizado un pago de {formatCOP(total)}, nos encargaremos de que tu producto llegue lo más pronto posible.</p>
            <span>Gracias por confiar en Importify</span>
            <Link href="/" className="checkout-home-button">REGRESAR AL HOME</Link>
          </div>
        </div>
      )}
    </main>
  );
}
