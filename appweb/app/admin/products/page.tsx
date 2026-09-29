"use client";

import { useState } from "react";
import { ApiState } from "@/components/ApiState";
import { SectionTitle } from "@/components/SectionTitle";
import { useApi } from "@/hooks/useApi";
import { adminProducts, listProducts } from "@/services/products.service";
import { formatCOP } from "@/services/format";

export default function AdminProductsPage() {
  const { data, status, error, reload } = useApi(() => listProducts({ limit: 50 }));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState({ sku: "", name: "", slug: "", price: "" });

  async function run(fn: () => Promise<unknown>, msg?: string) {
    setBusy(true);
    setNotice(null);
    try {
      await fn();
      await reload();
      if (msg) setNotice(msg);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <SectionTitle title="Productos" sub="Crear, activar/desactivar" />
      <ApiState status={status} error={error} emptyText="Sin productos." onRetry={reload} />
      {notice && <p className="muted">{notice}</p>}

      <form
        className="form card"
        style={{ maxWidth: "none" }}
        onSubmit={(e) => {
          e.preventDefault();
          run(
            () =>
              adminProducts.create({
                sku: form.sku,
                name: form.name,
                slug: form.slug,
                price: Number(form.price),
              }),
            "Producto creado.",
          );
        }}
      >
        <h3>Crear producto</h3>
        <div className="form-row">
          <label>
            SKU<input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
          </label>
          <label>
            Nombre<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
        </div>
        <div className="form-row">
          <label>
            Slug<input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          </label>
          <label>
            Precio<input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
          </label>
        </div>
        <button className="btn" disabled={busy}>Crear</button>
      </form>

      {(status === "success" || status === "empty") && data && data.data.length > 0 && (
        <div className="card" style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>SKU</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Activo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>{formatCOP(Number(p.price))}</td>
                  <td>{p.stock}</td>
                  <td>{p.isActive ? "Sí" : "No"}</td>
                  <td>
                    <button
                      className="btn btn-ghost"
                      disabled={busy}
                      onClick={() => run(() => adminProducts.toggleActive(p.id, !p.isActive))}
                    >
                      {p.isActive ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="muted">Edición completa e imágenes: vía API PATCH /products/:id (stock solo por Inventario).</p>
    </section>
  );
}
