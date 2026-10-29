"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { authService, type SendOtpResponse } from "@/services/auth.service";
import { Days_One } from "next/font/google";

const daysOne = Days_One({ weight: "400", subsets: ["latin"], display: "swap", variable: "--font-days-one" });

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"></rect>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  );
}

export default function AdminLoginPage() {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [sentEmail, setSentEmail] = useState("");
  const [demoCode, setDemoCode] = useState<string | null>(null);

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value.trim());
  };

  const handleCodeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
  };

  const startCountdown = () => {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const normalized = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      setError("Ingresa un correo válido");
      return;
    }

    setLoading(true);
    try {
      const res: SendOtpResponse = await authService.sendOtp(normalized);
      setSuccess(res.message || "Código enviado correctamente");
      setDemoCode(res.code ?? null);
      setSentEmail(normalized);
      setStep("code");
      startCountdown();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar código");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (code.length !== 6) {
      setError("Ingresa el código de 6 dígitos");
      return;
    }

    setLoading(true);
    try {
      await authService.verifyOtp(sentEmail, code);
      window.location.href = "/admin/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código inválido o expirado");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("email");
    setCode("");
    setError(null);
    setSuccess(null);
    setDemoCode(null);
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const res: SendOtpResponse = await authService.sendOtp(sentEmail);
      setSuccess(res.message || "Código reenviado correctamente");
      setDemoCode(res.code ?? null);
      startCountdown();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al reenviar código");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`admin-login-page ${daysOne.variable}`}>
      <div className="login-container">
        <div className="login-card">
          {step === "email" ? (
            <form onSubmit={handleSendOtp} className="login-form" noValidate>
              <div className="form-header">
                <h2>Panel Administrador</h2>
                <p>Ingresa tu correo para recibir un código de verificación</p>
              </div>

              {error && <div className="alert alert-error" role="alert"><AlertIcon /><span>{error}</span></div>}
              {success && <div className="alert alert-success" role="status"><CheckIcon /><span>{success}</span></div>}

              <div className="form-field">
                <label htmlFor="email" className="field-label">
                  <span>Correo electrónico</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="admin@importify.com"
                  className="field-input"
                  required
                  autoComplete="email"
                  disabled={loading}
                  aria-describedby="email-hint"
                />
                <p id="email-hint" className="field-hint">Te enviaremos un código de 6 dígitos a tu correo</p>
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar código"}
                <ArrowRightIcon className="btn-icon" aria-hidden="true" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="login-form" noValidate>
              <div className="form-header">
                <h2>Verificar código</h2>
                <p>Hemos enviado un código de 6 dígitos a <strong>{sentEmail}</strong></p>
              </div>

              {error && <div className="alert alert-error" role="alert"><AlertIcon /><span>{error}</span></div>}
              {success && <div className="alert alert-success" role="status"><CheckIcon /><span>{success}</span></div>}
              {demoCode && (
                <div className="alert alert-success" role="status">
                  <CheckIcon />
                  <span>Modo demo: usa el código <strong>{demoCode}</strong></span>
                </div>
              )}

              <div className="code-inputs" role="group" aria-label="Código de verificación de 6 dígitos">
                {[...Array(6)].map((_, i) => (
                  <input
                    key={i}
                    type="text"
                    maxLength={1}
                    value={code[i] || ""}
                    onChange={(e) => {
                      const newCode = code.split("");
                      newCode[i] = e.target.value;
                      setCode(newCode.join(""));
                      if (e.target.value && i < 5) {
                        (e.target.nextElementSibling as HTMLInputElement)?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      const target = e.target as HTMLInputElement;
                      if (e.key === "Backspace" && !target.value && i > 0) {
                        (target.previousElementSibling as HTMLInputElement)?.focus();
                      }
                    }}
                    className="code-input"
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    disabled={loading}
                    aria-label={`Dígito ${i + 1}`}
                  />
                ))}
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={handleBack} disabled={loading}>
                  ← Cambiar correo
                </button>
                <button type="button" className="btn btn-outline" onClick={handleResend} disabled={loading || countdown > 0}>
                  {countdown > 0 ? `Reenviar en ${countdown}s` : "Reenviar código"}
                </button>
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading || code.length !== 6}>
                {loading ? "Verificando..." : "Verificar e ingresar"}
                <ArrowRightIcon className="btn-icon" aria-hidden="true" />
              </button>

              <p className="login-note">
                <small>El código expira en 10 minutos. Nunca compartas tu código con nadie.</small>
              </p>
            </form>
          )}
        </div>

        <div className="login-footer">
          <p>¿No tienes acceso? Contacta al administrador del sistema.</p>
          <a href="/" className="back-link">
            <ArrowRightIcon className="back-icon" aria-hidden="true" />
            <span>Volver a la tienda</span>
          </a>
        </div>
      </div>
    </div>
  );
}