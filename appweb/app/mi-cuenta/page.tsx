"use client";

import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { ApiState } from "@/components/ApiState";
import { useApi } from "@/hooks/useApi";
import { ordersService } from "@/services/orders.service";
import { formatCOP } from "@/services/format";

export default function MiCuentaPage() {
  const { data, status, error, reload } = useApi(() => ordersService.list({ limit: 20 }));

  return (
    <main>
      <Container>
        <section className="section">
          <SectionTitle title="Mi cuenta" sub="Mis pedidos (API)" />
          <ApiState status={status} error={error} emptyText="Aún no tienes pedidos." onRetry={reload} />
          {(status === "success" || status === "empty") && data && data.data.length > 0 && (
            <div className="card" style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Pedido</th>
                    <th>Estado</th>
                    <th>Pago</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((o) => (
                    <tr key={o.id}>
                      <td>{o.orderNumber}</td>
                      <td>
                        <span className="tag">{o.status}</span>
                      </td>
                      <td>
                        <span className="tag">{o.paymentStatus}</span>
                      </td>
                      <td>{formatCOP(Number(o.total))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </Container>
    </main>
  );
}
