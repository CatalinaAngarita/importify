"use client";

import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { authService } from "@/services/auth.service";
import { ApiState } from "@/components/ApiState";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Protege /admin: JWT + rol ADMIN (verificado contra GET /auth/me). */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: me, status, error, reload } = useApi(() =>
    authService.me<{ roleName?: string; role?: string; email?: string; phone?: string }>(),
  );
  const role = (me?.roleName ?? me?.role ?? "").toUpperCase();

  useEffect(() => {
    if (status === "error" || (status === "success" && role !== "ADMIN")) {
      router.replace("/admin/login");
    }
  }, [status, role, router]);

  if (status === "loading" || status === "idle") {
    return (
      <main className="admin-guard-loading">
        <div className="guard-spinner" aria-label="Verificando permisos">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin">
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1"></path>
          </svg>
        </div>
        <p className="muted">Verificando permisos…</p>
      </main>
    );
  }
  if (status === "error" || role !== "ADMIN") {
    return null;
  }
  return <>{children}</>;
}
