"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Container } from "@/components/Container";
import { ApiState } from "@/components/ApiState";
import { useApi } from "@/hooks/useApi";
import { cartService } from "@/services/cart.service";
import { checkoutService } from "@/services/checkout.service";
import { paymentsService } from "@/services/payments.service";
import { formatCOP } from "@/services/format";

type CheckoutStep = 1 | 2 | 3;
type PaymentMethod = "wompi";

type WompiConfig = {
  publicKey: string;
  reference: string;
  amountInCents: number;
  signature: string;
};

const PAYMENT_METHODS: { id: PaymentMethod; title: string; description: string; mark: string }[] = [
  { id: "wompi", title: "Wompi", description: "Tarjetas, Nequi, PSE, Daviplata, QR y más", mark: "W" },
];

function CheckoutStepper({ current }: { current: CheckoutStep }) {
  const steps = ["Método de pago", "Datos y resumen", "Pago Wompi"];

  return (
    <div className="checkout-stepper" aria-label="Progreso del pago">
      <div className="checkout-stepper-line" />
      {steps.map((label, index) => {
        const step = (index + 1) as CheckoutStep;
        const complete = step < current;
        const active = step === current;
        return (
          <div className="checkout-step" key={label}>
            <div className={`checkout-step-dot${complete ? " is-complete" : ""}${active ? " is-active" : ""}`}>
              {complete ? "✓" : step}
            </div>
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
  const [form, setForm] = useState({ name: "", phone: "", address: "", city: "", email: "" });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [config, setConfig] = useState<WompiConfig | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [widgetError, setWidgetError] = useState<string | null>(null);

  const widgetRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  const subtotal = cart?.meta.total ?? 0;
  const shipping = subtotal === 0 || subtotal >= 200000 ? 0 : 12000;
  const total = subtotal + shipping;

  function updateForm(field: keyof typeof form, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  const loadScript = useCallback(() => {
    if (document.querySelector('script[src="https://checkout.wompi.co/widget.js"]')) return;
    const script = document.createElement("script");
    script.src = "https://checkout.wompi.co/widget.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!widgetRef.current || !config) return;

    const el = widgetRef.current;
    el.setAttribute("data-public-key", config.publicKey);
    el.setAttribute("data-currency", "COP");
    el.setAttribute("data-amount-in-cents", String(config.amountInCents));
    el.setAttribute("data-reference", config.reference);
    el.setAttribute("data-signature:integrity", config.signature);
    el.setAttribute("data-redirect-url", `${window.location.origin}/checkout/resultado`);
    el.setAttribute("data-customer-data:email", form.email);
    el.setAttribute("data-render", "button");

    if (!scriptLoaded.current) {
      loadScript();
      scriptLoaded.current = true;
    }
  }, [config, form.email, loadScript]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    if (!cart || (cart.items ?? []).length === 0) {
      setNotice("Agrega productos al carrito antes de realizar el pago.");
      return;
    }

    setBusy(true);
    setNotice(null);
    setWidgetError(null);

    try {
      const { order } = await checkoutService.run({
        items: (cart.items ?? []).map(({ productId, quantity }) => ({ productId, quantity })),
        shippingAddress: {
          name: form.name,
          phone: form.phone,
          address: form.address,
          city: form.city,
        },
      });

      const { payment, wompi } = await paymentsService.intent({
        orderId: order.id,
        customerEmail: form.email,
      });

      if (!wompi || !wompi.publicKey || !wompi.reference || !wompi.signature) {
        throw new Error("Wompi no devolvió los datos de pago.");
      }

      setOrderId(order.id);
      setConfig({
        publicKey: wompi.publicKey,
        reference: wompi.reference,
        amountInCents: wompi.amountInCents,
        signature: wompi.signature,
      });
      setStep(3);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "No fue posible crear el intento de pago.");
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
          {widgetError && <p className="checkout-notice">{widgetError}</p>}
          <div className="checkout-card">
            <CheckoutStepper current={step} />

            {step === 1 && (
              <section className="checkout-panel" aria-labelledby="payment-method-title">
                <h1 id="payment-method-title">SELECCIONA TU MÉTODO DE PAGO</h1>
                <p>Los pagos se procesan a través de Wompi.</p>
                <div className="payment-method-list">
                  {PAYMENT_METHODS.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      className={`payment-method${method === item.id ? " is-selected" : ""}`}
                      onClick={() => setMethod(item.id)}
                    >
                      <span className="payment-method-check">✓</span>
                      <span className={`payment-method-mark ${item.id}`}>{item.mark}</span>
                      <span className="payment-method-copy"><b>{item.title}</b><small>{item.description}</small></span>
                    </button>
                  ))}
                </div>
                <div className="checkout-pagination">
                  <span className="is-current">1</span>
                  <button type="button" onClick={() => setStep(2)}>2</button>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="checkout-panel checkout-form-panel" aria-labelledby="checkout-form-title">
                <h1 id="checkout-form-title">DATOS Y RESUMEN</h1>
                <p>Revisa tus datos antes de pagar con Wompi.</p>
                <form onSubmit={submit}>
                  <div className="checkout-payment-form">
                    <div className="checkout-card-fields">
                      <label>
                        Nombre completo
                        <input value={form.name} onChange={(e) => updateForm("name", e.target.value)} placeholder="Nombre completo" required />
                      </label>
                      <label>
                        Correo para el recibo
                        <input type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} placeholder="tu@correo.com" required />
                      </label>
                    </div>
                    <div className="checkout-billing-fields">
                      <h2>Dirección de envío</h2>
                      <label>
                        Dirección
                        <input value={form.address} onChange={(e) => updateForm("address", e.target.value)} placeholder="Calle 123 #45-67" required />
                      </label>
                      <div className="checkout-billing-row">
                        <label>
                          Ciudad
                          <input value={form.city} onChange={(e) => updateForm("city", e.target.value)} placeholder="Bogotá" required />
                        </label>
                        <label>
                          Teléfono
                          <input value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} placeholder="300 000 0000" required />
                        </label>
                      </div>
                      <button
                        className="checkout-pay-button"
                        type="submit"
                        disabled={busy}
                      >
                        {busy ? "PROCESANDO…" : `PAGAR ${formatCOP(total)}`}
                      </button>
                      <button className="checkout-back-link" type="button" onClick={() => setStep(1)}>
                        ← Volver al método de pago
                      </button>
                    </div>
                  </div>
                </form>
                <div className="checkout-pagination">
                  <button type="button" onClick={() => setStep(1)}>1</button>
                  <span className="is-current">2</span>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="checkout-panel checkout-wompi-panel" aria-labelledby="wompi-payment-title">
                <h1 id="wompi-payment-title">PAGO CON WOMPI</h1>
                <p>Completa el pago en el widget de Wompi. Al terminar serás redirigido a la confirmación.</p>
                {!config ? (
                  <p className="checkout-notice">No se pudo cargar la configuración de pago. Intenta de nuevo.</p>
                ) : (
                  <div ref={widgetRef} className="wompi-widget-container" key={orderId}></div>
                )}
                <div className="checkout-pagination">
                  <button type="button" onClick={() => setStep(2)}>← Volver a los datos</button>
                  <span className="is-current">3</span>
                </div>
              </section>
            )}
          </div>
        </section>
      </Container>
    </main>
  );
}
