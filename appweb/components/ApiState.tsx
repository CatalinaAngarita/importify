import type { RequestStatus } from "@/types/api";

export function ApiState({
  status,
  error,
  emptyText = "Sin resultados.",
  onRetry,
}: {
  status: RequestStatus;
  error?: string | null;
  emptyText?: string;
  onRetry?: () => void;
}) {
  if (status === "loading") return <p className="muted">Cargando…</p>;
  if (status === "error")
    return (
      <div className="card">
        <p>Error: {error ?? "No se pudo cargar."}</p>
        <p className="muted">Verifica que la API esté en línea (NEXT_PUBLIC_API_URL).</p>
        {onRetry && (
          <button className="btn btn-ghost" onClick={onRetry}>
            Reintentar
          </button>
        )}
      </div>
    );
  if (status === "empty") return <p className="muted">{emptyText}</p>;
  return null;
}
