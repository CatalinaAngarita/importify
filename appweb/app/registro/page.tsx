"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authService } from "@/services/auth.service";
import { EyeIcon, EyeOffIcon } from "@/components/AuthIcons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function validate(): string | null {
    if (!form.firstName.trim()) return "Ingresa tu nombre.";
    if (!form.email.trim()) return "Ingresa tu correo electrónico.";
    if (!EMAIL_RE.test(form.email.trim())) return "Ingresa un correo electrónico válido.";
    if (!form.password) return "Ingresa una contraseña.";
    if (form.password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (!acceptedTerms) return "Debes aceptar los Términos y Condiciones para continuar.";
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setStatus("error");
      setError(problem);
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      await authService.register({
        firstName: form.firstName.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      router.push("/mi-cuenta");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "No se pudo registrar");
    }
  }

  return (
    <main className="auth-page auth-page-registro">
      <div
        className="auth-photo"
        role="img"
        aria-label="Espacio para la fotografía de un cliente de Importify con su computador"
      >
        <div className="auth-photo-image auth-photo-image-registro" aria-hidden="true" />
      </div>

      <section className="auth-panel" aria-labelledby="registro-title">
        <form className="auth-card" onSubmit={submit} noValidate>
          <h1 id="registro-title" className="auth-title">¡BIENVENIDO!</h1>
          <p className="auth-sub">Crea tu cuenta en Importify y empieza a importar sin límites.</p>

          <div className="auth-field">
            <label className="auth-label" htmlFor="registro-nombre">Nombre</label>
            <div className="auth-control">
              <input
                id="registro-nombre"
                type="text"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                placeholder="Ingresa tu nombre"
                autoComplete="given-name"
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="registro-email">Correo electrónico</label>
            <div className="auth-control">
              <input
                id="registro-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ejemplo@correo.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="registro-password">Contraseña</label>
            <div className="auth-control auth-control-eye">
              <input
                id="registro-password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Ingresa tu contraseña"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            <p className="auth-hint">Mínimo 8 caracteres</p>
          </div>

          <label className="auth-terms">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />
            <span>
              Acepto los{" "}
              <Link href="/terminos-y-condiciones">Términos y Condiciones</Link> y el{" "}
              <Link href="/tratamiento-de-datos">Tratamiento de datos</Link>
            </span>
          </label>

          {status === "error" && error && (
            <p className="auth-error" role="alert">{error}</p>
          )}

          <button className="auth-submit" type="submit" disabled={status === "loading"} aria-busy={status === "loading"}>
            {status === "loading" ? "CREANDO CUENTA…" : "REGISTRARME"}
          </button>

          <p className="auth-switch">
            ¿Ya tienes una cuenta? <Link href="/login">Inicia sesión</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
