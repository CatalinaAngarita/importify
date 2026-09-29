"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { authService } from "@/services/auth.service";

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", email: "", password: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      await authService.register(form);
      router.push("/mi-cuenta");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "No se pudo registrar");
    }
  }

  return (
    <main>
      <Container>
        <section className="section">
          <SectionTitle title="Crear cuenta" sub="Únete a IMPORTIFY" />
          <form className="form card" onSubmit={submit}>
            <label>
              Nombre
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="Tu nombre"
                required
              />
            </label>
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
                placeholder="Mín. 8 caracteres"
                required
              />
            </label>
            {status === "loading" && <p className="muted">Cargando…</p>}
            {status === "error" && <p>Error: {error}</p>}
            <button className="btn" type="submit">
              Registrarme
            </button>
            <p className="muted">
              ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
            </p>
          </form>
        </section>
      </Container>
    </main>
  );
}
