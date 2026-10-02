"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import { AppleIcon, EyeIcon, EyeOffIcon, GoogleIcon } from "@/components/AuthIcons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REMEMBER_KEY = "importify_remember_email";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      setForm((f) => ({ ...f, email: saved }));
      setRemember(true);
    }
  }, []);

  function validate(): string | null {
    if (!form.email.trim()) return "Ingresa tu correo electrónico.";
    if (!EMAIL_RE.test(form.email.trim())) return "Ingresa un correo electrónico válido.";
    if (!form.password) return "Ingresa tu contraseña.";
    if (form.password.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setNotice(null);
    const problem = validate();
    if (problem) {
      setStatus("error");
      setError(problem);
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      if (remember) window.localStorage.setItem(REMEMBER_KEY, form.email.trim());
      else window.localStorage.removeItem(REMEMBER_KEY);
      await authService.login({ email: form.email.trim(), password: form.password });
      router.push("/mi-cuenta");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    }
  }

  return (
    <main className="auth-page auth-page-login">
      {/* CAPA 1 — Fondo completo del viewport (configurar imagen en CSS: --auth-photo-img) */}
      <div className="auth-bg" aria-hidden="true">
        <div className="auth-bg-image" />
      </div>

      {/* CAPA 2 — Elementos decorativos (banner superior, formas). Configurar en CSS: --auth-banner-img */}
      <div className="auth-decor" aria-hidden="true">
        <div className="auth-banner" />
      </div>

      {/* CAPA 3 — Logo independiente. Configurar en CSS: --auth-logo-img y posición */}
      <div className="auth-brand" aria-hidden="true">
        <div className="auth-logo" />
      </div>

      {/* CAPA 4 — Formulario (sin cambios) */}
      <section className="auth-panel" aria-labelledby="login-title">
        <form className="auth-card" onSubmit={submit} noValidate>
          <p className="auth-top-switch">¿No tienes cuenta? <Link href="/registro">Regístrate</Link></p>
          <h1 id="login-title" className="auth-title">¡BIENVENIDO!</h1>
          <p className="auth-sub">Inicia Sesión en tu cuenta de Importify y continúa con tus compras.</p>

          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">Correo electrónico</label>
            <div className="auth-control">
              <input
                id="login-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ejemplo@correo.com"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="login-password">Contraseña</label>
            <div className="auth-control auth-control-eye">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Ingresa tu contraseña"
                autoComplete="current-password"
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
          </div>

          <div className="auth-row">
            <label className="auth-remember">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Recordarme
            </label>
            <Link className="auth-forgot" href="/contacto" title="Recupera tu contraseña escribiéndonos">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {status === "error" && error && (
            <p className="auth-error" role="alert">{error}</p>
          )}
          {notice && <p className="auth-notice">{notice}</p>}

          <button className="auth-submit" type="submit" disabled={status === "loading"} aria-busy={status === "loading"}>
            {status === "loading" ? "INGRESANDO…" : "INICIAR SESIÓN"}
          </button>

          <div className="auth-divider"><span>Continuar con</span></div>

          <div className="auth-social">
            <button
              type="button"
              className="auth-social-btn"
              onClick={() => setNotice("Iniciar sesión con Google estará disponible muy pronto.")}
            >
              <GoogleIcon /> CONTINUAR CON GOOGLE
            </button>
            <button
              type="button"
              className="auth-social-btn"
              onClick={() => setNotice("Iniciar sesión con Apple estará disponible muy pronto.")}
            >
              <AppleIcon /> CONTINUAR CON APPLE
            </button>
          </div>

          <p className="auth-switch">
            ¿No tienes una cuenta? <Link href="/registro">Regístrate</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
