"use client";

import { useState } from "react";
import { ApiState } from "@/components/ApiState";
import { SectionTitle } from "@/components/SectionTitle";
import { useApi } from "@/hooks/useApi";
import { inventoryService } from "@/services/inventory.service";
import { listProducts } from "@/services/products.service";

type Op = "increase" | "decrease" | "adjust";

export default function AdminInventoryPage() {
  const { data: prods } = useApi(() => listProducts({ limit: 50 }));
  const { data: hist, status, error, reload } = useApi(() => inventoryService.history({ limit: 30 }));
  const [form, setForm] = useState({ productId: "", op: "increase" as Op, quantity: "", reason: "" });
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setNotice(null);
    try {
      const qty = Number(form.quantity);
      if (form.op === "increase") await inventoryService.increase(form.productId, qty, form.reason || undefined);
      if (form.op === "decrease") await inventoryService.decrease(form.productId, qty, form.reason || undefined);
      if (form.op === "adjust") await inventoryService.adjust(form.productId, qty, form.reason || undefined);
      setNotice("Movimiento registrado.");
      await reload();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <SectionTitle title="Inventario" sub="Entradas, salidas, ajustes e historial" />
      {notice && <p className="muted">{notice}</p>}
      <form className="form card" style={{ maxWidth: "none" }} onSubmit={submit}>
        <h3>Movimiento de stock</h3>
        <div className="form-row">
          <label>
            Producto
            <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} required>
              <option value="">Seleccionar…</option>
              {prods?.data.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (stock {p.stock})
                </option>
              ))}
            </select>
          </label>
          <label>
            Operación
            <select value={form.op} onChange={(e) => setForm({ ...form, op: e.target.value as Op })}>
              <option value="increase">Entrada</option>
              <option value="decrease">Salida</option>
              <option value="adjust">Ajuste (fijar stock)</option>
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Cantidad
            <input type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
          </label>
          <label>
            Motivo
            <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Opcional" />
          </label>
        </div>
        <button className="btn" disabled={busy}>Registrar</button>
      </form>
      <h3>Historial</h3>
      <ApiState status={status} error={error} emptyText="Sin movimientos." onRetry={reload} />
      {(status === "success" || status === "empty") && hist && (hist.data as unknown[]).length > 0 && (
        <div className="card" style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Cantidad</th>
                <th>Antes → Después</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {(hist.data as { id: string; movementType: string; quantity: number; previousStock: number; newStock: number; reason?: string }[]).map((m) => (
                <tr key={m.id}>
                  <td><span className="tag">{m.movementType}</span></td>
                  <td>{m.quantity}</td>
                  <td>{m.previousStock} → {m.newStock}</td>
                  <td>{m.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
