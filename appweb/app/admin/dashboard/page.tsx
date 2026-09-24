"use client";

import { ApiState } from "@/components/ApiState";
import { SectionTitle } from "@/components/SectionTitle";
import { useApi } from "@/hooks/useApi";
import { adminService } from "@/services/admin.service";
import { formatCOP } from "@/services/format";

export default function AdminDashboardPage() {
  const { data, status, error, reload } = useApi(() => adminService.stats());

  return (
    <section>
      <SectionTitle title="Dashboard" sub="Ventas, pedidos y stock" />
      <ApiState status={status} error={error} onRetry={reload} />
      {status === "success" && data && (
        <>
          <div className="grid-3">
            <div className="card">
              <h3>Ventas aprobadas</h3>
              <p className="price">{formatCOP(data.sales)}</p>
            </div>
            <div className="card">
              <h3>Pedidos</h3>
              <p className="price">{data.ordersCount}</p>
              <p className="muted">
                {Object.entries(data.ordersByStatus)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(" · ")}
              </p>
            </div>
            <div className="card">
              <h3>Agotados</h3>
              <p className="price">{data.outOfStock}</p>
              <p className="muted">Umbral bajo: ≤ {data.lowStockThreshold}</p>
            </div>
          </div>
          <h3>Stock bajo</h3>
          {data.lowStock.length === 0 ? (
            <p className="muted">Sin productos en stock bajo.</p>
          ) : (
            <div className="card" style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>SKU</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStock.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.sku}</td>
                      <td>{p.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
