"use client";

import { useState } from "react";
import { ApiState } from "@/components/ApiState";
import { SectionTitle } from "@/components/SectionTitle";
import { useApi } from "@/hooks/useApi";
import { adminCategories, listCategories } from "@/services/categories.service";

export default function AdminCategoriesPage() {
  const { data, status, error, reload } = useApi(() => listCategories({ limit: 50 }));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "" });

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
      <SectionTitle title="Categorías" sub="Crear y gestionar" />
      <ApiState status={status} error={error} emptyText="Sin categorías." onRetry={reload} />
      {notice && <p className="muted">{notice}</p>}
      <form
        className="form card"
        style={{ maxWidth: "none" }}
        onSubmit={(e) => {
          e.preventDefault();
          run(() => adminCategories.create(form), "Categoría creada.");
        }}
      >
        <h3>Crear categoría</h3>
        <div className="form-row">
          <label>
            Nombre<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </label>
          <label>
            Slug<input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
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
                <th>Slug</th>
                <th>Activa</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.slug}</td>
                  <td>{c.isActive ? "Sí" : "No"}</td>
                  <td>
                    <button
                      className="btn btn-ghost"
                      disabled={busy}
                      onClick={() => run(() => adminCategories.update(c.id, { isActive: !c.isActive }))}
                    >
                      {c.isActive ? "Desactivar" : "Activar"}
                    </button>
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
