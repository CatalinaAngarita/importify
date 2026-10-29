"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { formatCOP } from "@/services/format";
import { cartService, getStoredCartId } from "@/services/cart.service";
import { paymentsService } from "@/services/payments.service";

type WompiStatusResponse = {
  payment: {
    id: string;
    status: string;
    amountCents: number;
    reference: string;
  };
  order: {
    id: string;
    orderNumber: string;
    total: number;
    status: string;
  };
  wompiTransaction: {
    id: string;
    status: string;
  };
};

type PageStatus = "idle" | "checking" | "approved" | "declined" | "error";

function ResultadoContent() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("id");

  const [pageStatus, setPageStatus] = useState<PageStatus>("checking");
  const [order, setOrder] = useState<WompiStatusResponse["order"] | null>(null);
  const [payment, setPayment] = useState<WompiStatusResponse["payment"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    cancelledRef.current = false;
    clearTimer();

    if (!transactionId) {
      setError("No se recibió el identificador de transacción de Wompi.");
      return;
    }

    const check = async () => {
      if (cancelledRef.current) return;

      try {
        setError(null);
        const res = await paymentsService.wompiStatus(transactionId);
        setPayment(res.payment);
        setOrder(res.order);

        if (res.payment.status === "APPROVED") {
          const storedCartId = getStoredCartId();
          if (storedCartId) {
            try {
              await cartService.clear(storedCartId);
            } catch {}
          }
          setPageStatus("approved");
          clearTimer();
          return;
        }

        if (["DECLINED", "VOIDED", "ERROR"].includes(res.payment.status)) {
          setPageStatus("declined");
          clearTimer();
          return;
        }

        if (!cancelledRef.current) {
          timerRef.current = setTimeout(check, 3000);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudo verificar el estado del pago.");
        clearTimer();
      }
    };

    check();
    return () => {
      cancelledRef.current = true;
      clearTimer();
    };
  }, [transactionId]);

  return (
    <main className="checkout-page">
      <Container>
        <section className="checkout-shell">
          <SectionTitle title={pageStatus === "approved" ? "Pago confirmado" : "Verificando pago"} />
          {error && <p className="checkout-notice">{error}</p>}

          {pageStatus === "checking" && (
            <div className="card">
              <p>Verificando el estado de tu pago con Wompi. Por favor espera.</p>
            </div>
          )}

          {pageStatus === "approved" && order && payment && (
            <div className="card checkout-success">
              <div className="checkout-success-mark">✓</div>
              <h2>Compra exitosa</h2>
              <p>
                Tu pago fue aprobado. Pedido <strong>{order.orderNumber}</strong> por{" "}
                {formatCOP(Number(order.total))}.
              </p>
              <p>Puedes ver el estado de tu pedido en Mi cuenta.</p>
              <div className="checkout-actions">
                <Link href="/mi-cuenta" className="checkout-home-button">VER PEDIDO</Link>
                <Link href="/" className="checkout-home-button">REGRESAR AL HOME</Link>
              </div>
            </div>
          )}

          {pageStatus === "declined" && (
            <div className="card">
              <h2>Pago no aprobado</h2>
              <p>
                La transacción con Wompi no se completó con éxito.{" "}
                {order?.orderNumber ? <strong>{order.orderNumber}</strong> : ""}.
              </p>
              <div className="checkout-actions">
                <Link href="/" className="checkout-home-button">REGRESAR AL HOME</Link>
              </div>
            </div>
          )}

          {pageStatus === "error" && (
            <div className="card">
              <h2>Error al verificar el pago</h2>
              <p>{error}</p>
              <div className="checkout-actions">
                <Link href="/mi-cuenta" className="checkout-home-button">VER MIS PEDIDOS</Link>
                <Link href="/" className="checkout-home-button">REGRESAR AL HOME</Link>
              </div>
            </div>
          )}
        </section>
      </Container>
    </main>
  );
}

export default function ResultadoPage() {
  return (
    <Suspense fallback={
      <main className="checkout-page">
        <Container>
          <section className="checkout-shell">
            <SectionTitle title="Verificando pago" />
            <div className="card">
              <p>Verificando el estado de tu pago con Wompi. Por favor espera.</p>
            </div>
          </section>
        </Container>
      </main>
    }>
      <ResultadoContent />
    </Suspense>
  );
}
