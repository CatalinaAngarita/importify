"use client";

import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { authService } from "@/services/auth.service";
import { ApiState } from "@/components/ApiState";

/** Protege /admin: JWT + rol ADMIN (verificado contra GET /auth/me). */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { data: me, status, error, reload } = useApi(() =>
    authService.me<{ roleName?: string; role?: string; email?: string }>(),
  );
  const role = (me?.roleName ?? me?.role ?? "").toUpperCase();

  if (status === "loading" || status === "idle") {
    return (
      <main>
        <p className="muted" style={{ padding: "2rem" }}>
          Verificando permisos…
        </p>
      </main>
    );
  }
  if (status === "error" || role !== "ADMIN") {
    return (
      <main>
        <div className="section" style={{ padding: "2rem" }}>
          <h1>Acceso restringido</h1>
          <ApiState status={status} error={error} onRetry={reload} />
          {status === "success" && (
            <p className="muted">Se requiere rol ADMIN. Tu rol: {role || "desconocido"}.</p>
          )}
          <Link href="/login" className="btn">
            Ir al login
          </Link>
        </div>
      </main>
    );
  }
  return <>{children}</>;
}
