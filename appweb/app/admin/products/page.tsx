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
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null);
  const [images, setImages] = useState<Array<{ 
    id: string; 
    image: string; 
    processedImage: string | null; 
    altText: string | null; 
    isPrimary: boolean; 
    processingStatus: string;
    processingError: string | null;
  }>>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  async function handleUploadImage(productId: string, file: File) {
    setUploading(true);
    try {
      await adminProducts.uploadImage(productId, file);
      await loadImages(productId);
      setNotice("Imagen subida correctamente");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Error subiendo imagen");
    } finally {
      setUploading(false);
    }
  }

  async function loadImages(productId: string) {
    setLoadingImages(true);
    try {
      const imgs = await adminProducts.getImages(productId);
      setImages(imgs);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Error cargando imágenes");
    } finally {
      setLoadingImages(false);
    }
  }

  async function openImageModal(product: { id: string; name: string }) {
    setSelectedProduct(product);
    await loadImages(product.id);
  }

  async function handleRemoveImage(productId: string, imageId: string) {
    if (!confirm("¿Eliminar esta imagen?")) return;
    try {
      await adminProducts.removeImage(productId, imageId);
      await loadImages(productId);
      setNotice("Imagen eliminada");
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Error eliminando imagen");
    }
  }

  async function handleSetPrimary(productId: string, imageId: string) {
    try {
      await adminProducts.setPrimaryImage(productId, imageId);
      await loadImages(productId);
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Error estableciendo imagen principal");
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>, productId: string) {
    const file = e.target.files?.[0];
    if (file) handleUploadImage(productId, file);
    e.target.value = "";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  }

  function handleDragLeave(e: React.DragEvent) {
    e.currentTarget.classList.remove("drag-over");
  }

  function handleDrop(e: React.DragEvent, productId: string) {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleUploadImage(productId, file);
    }
  }

  function closeImageModal() {
    setSelectedProduct(null);
    setImages([]);
  }

  return (
    <section>
      <SectionTitle title="Productos" sub="Crear, activar/desactivar, gestionar imágenes" />
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
                <th>Imágenes</th>
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
                      disabled={busy || loadingImages}
                      onClick={() => openImageModal({ id: p.id, name: p.name })}
                    >
                      🖼️ {loadingImages ? "Cargando..." : "Gestionar"}
                    </button>
                  </td>
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

      {selectedProduct && (
        <div className="modal-overlay" onClick={closeImageModal}>
          <div className="modal card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px", width: "90%" }}>
            <div className="modal-header">
              <h3>Imágenes de: {selectedProduct.name}</h3>
              <button className="btn btn-ghost" onClick={closeImageModal}>✕</button>
            </div>

            <div
              className="drop-zone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, selectedProduct.id)}
            >
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, selectedProduct.id)}
                style={{ display: "none" }}
                id={`file-upload-${selectedProduct.id}`}
                disabled={uploading}
              />
              {!uploading && (
                <label htmlFor={`file-upload-${selectedProduct.id}`} className="btn">
                  Seleccionar imagen
                </label>
              )}
              {uploading && <span className="btn" style={{ opacity: 0.6 }}>Subiendo...</span>}
              <p className="muted">O arrastra una imagen aquí (JPG, PNG, WebP - máx 10MB)</p>
            </div>

            {images.length > 0 && (
              <div className="image-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "1rem", marginTop: "1rem" }}>
                {images.map((img) => {
                  const displayImage = img.processedImage || img.image;
                  const isProcessing = img.processingStatus === "processing" || img.processingStatus === "pending";
                  const hasError = img.processingStatus === "failed";
                  return (
                    <div key={img.id} className="image-item card" style={{ position: "relative", textAlign: "center" }}>
                      <img src={displayImage} alt={img.altText || ""} style={{ maxWidth: "100%", height: "120px", objectFit: "contain" }} />
                      {img.isPrimary && <span className="badge" style={{ position: "absolute", top: "0.5rem", right: "0.5rem" }}>Principal</span>}
                      {isProcessing && <span className="badge" style={{ position: "absolute", top: "0.5rem", left: "0.5rem", background: "#f59e0b" }}>Procesando...</span>}
                      {hasError && <span className="badge" style={{ position: "absolute", top: "0.5rem", left: "0.5rem", background: "#dc2626" }}>Error</span>}
                      <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
                        {!img.isPrimary && !isProcessing && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleSetPrimary(selectedProduct!.id, img.id)}
                            disabled={busy}
                          >
                            ⭐ Principal
                          </button>
                        )}
                        {isProcessing && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => loadImages(selectedProduct!.id)}
                            disabled={busy}
                          >
                            🔄 Actualizar
                          </button>
                        )}
                        <button
                          className="btn btn-ghost btn-sm btn-danger"
                          onClick={() => handleRemoveImage(selectedProduct!.id, img.id)}
                          disabled={busy}
                        >
                          🗑️
                        </button>
                      </div>
                      {hasError && img.processingError && (
                        <p className="muted" style={{ fontSize: "0.7rem", marginTop: "0.3rem", color: "#dc2626" }}>{img.processingError}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {images.length === 0 && !loadingImages && (
              <p className="muted" style={{ textAlign: "center", marginTop: "2rem" }}>Sin imágenes aún</p>
            )}
          </div>
        </div>
      )}

      <p className="muted">Edición completa e imágenes: vía API PATCH /products/:id (stock solo por Inventario).</p>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 1rem;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .drop-zone {
          border: 2px dashed var(--border);
          border-radius: 1rem;
          padding: 2rem;
          text-align: center;
          transition: border-color 0.2s, background 0.2s;
        }
        .drop-zone.drag-over {
          border-color: var(--primary);
          background: rgba(var(--primary-rgb), 0.1);
        }
        .drop-zone p {
          margin: 0.5rem 0 0;
        }
        .image-item img {
          border-radius: 0.5rem;
          background: #f5f5f5;
        }
        .badge {
          background: var(--primary);
          color: white;
          padding: 0.2rem 0.5rem;
          border-radius: 999px;
          font-size: 0.7rem;
        }
        .btn-sm {
          padding: 0.4rem 0.8rem;
          font-size: 0.8rem;
        }
        .btn-danger {
          color: #dc2626;
          border-color: #dc2626;
        }
        .btn-danger:hover {
          background: #dc2626;
          color: white;
        }
      `}</style>
    </section>
  );
}