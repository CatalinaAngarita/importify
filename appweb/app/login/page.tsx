"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { authService } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      await authService.login(form);
      router.push("/mi-cuenta");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    }
  }

  return (
    <main>
      <Container>
        <section className="section">
          <SectionTitle title="Iniciar sesión" sub="Accede a tu cuenta" />
          <form className="form card" onSubmit={submit}>
            <label>
              Correo
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="tu@correo.com"
                required
              />
            </label>
            <label>
              Contraseña
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </label>
            {status === "loading" && <p className="muted">Cargando…</p>}
            {status === "error" && <p>Error: {error}</p>}
            <button className="btn" type="submit">
              Entrar
            </button>
            <p className="muted">
              ¿Sin cuenta? <Link href="/registro">Regístrate</Link>
            </p>
          </form>
        </section>
      </Container>
    </main>
  );
}
