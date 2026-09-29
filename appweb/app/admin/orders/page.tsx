"use client";

import { useState } from "react";
import { ApiState } from "@/components/ApiState";
import { SectionTitle } from "@/components/SectionTitle";
import { useApi } from "@/hooks/useApi";
import { ordersService } from "@/services/orders.service";
import { formatCOP } from "@/services/format";

const STATUSES = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const { data, status, error, reload } = useApi(() => ordersService.list({ limit: 30 }));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <section>
      <SectionTitle title="Pedidos" sub="Consultar y cambiar estado" />
      <ApiState status={status} error={error} emptyText="Sin pedidos." onRetry={reload} />
      {notice && <p className="muted">{notice}</p>}
      {(status === "success" || status === "empty") && data && data.data.length > 0 && (
        <div className="card" style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Estado</th>
                <th>Pago</th>
                <th>Total</th>
                <th>Cambiar a</th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((o) => (
                <tr key={o.id}>
                  <td>{o.orderNumber}</td>
                  <td><span className="tag">{o.status}</span></td>
                  <td><span className="tag">{o.paymentStatus}</span></td>
                  <td>{formatCOP(Number(o.total))}</td>
                  <td>
                    <select
                      disabled={busy}
                      defaultValue=""
                      onChange={async (e) => {
                        if (!e.target.value) return;
                        setBusy(true);
                        setNotice(null);
                        try {
                          await ordersService.updateStatus(o.id, e.target.value);
                          await reload();
                          setNotice(`Pedido ${o.orderNumber} → ${e.target.value}.`);
                        } catch (err) {
                          setNotice(err instanceof Error ? err.message : "Error inesperado");
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      <option value="">…</option>
                      {STATUSES.filter((s) => s !== o.status).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
