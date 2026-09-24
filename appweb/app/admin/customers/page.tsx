"use client";

import { ApiState } from "@/components/ApiState";
import { SectionTitle } from "@/components/SectionTitle";
import { useApi } from "@/hooks/useApi";
import { adminService } from "@/services/admin.service";

export default function AdminCustomersPage() {
  const { data, status, error, reload } = useApi(() => adminService.customers({ limit: 30 }));

  return (
    <section>
      <SectionTitle title="Clientes" sub="Consulta (solo lectura)" />
      <ApiState status={status} error={error} emptyText="Sin clientes." onRetry={reload} />
      {(status === "success" || status === "empty") && data && (data.data as unknown[]).length > 0 && (
        <div className="card" style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Activo</th>
              </tr>
            </thead>
            <tbody>
              {(data.data as { id: string; email: string; firstName?: string; lastName?: string; roleName?: string; isActive: boolean }[]).map((u) => (
                <tr key={u.id}>
                  <td>{u.email}</td>
                  <td>{[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}</td>
                  <td><span className="tag">{u.roleName ?? "—"}</span></td>
                  <td>{u.isActive ? "Sí" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
