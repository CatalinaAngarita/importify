"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { authService, type SendOtpResponse } from "@/services/auth.service";
import clsx from "clsx";

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 16L12 8l8 8-8 8"></path>
      <path d="M16 8v16"></path>
      <circle cx="24" cy="16" r="6"></circle>
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
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
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [sentPhone, setSentPhone] = useState("");

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    if (digits.length <= 10) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
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

    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length !== 10) {
      setError("Ingresa un número de celular válido (10 dígitos)");
      return;
    }

    setLoading(true);
    try {
      const res: SendOtpResponse = await authService.sendOtp(digitsOnly);
      setSuccess(res.message || "Código enviado correctamente");
      setSentPhone(phone);
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

    const digitsOnly = sentPhone.replace(/\D/g, "");
    if (code.length !== 6) {
      setError("Ingresa el código de 6 dígitos");
      return;
    }

    setLoading(true);
    try {
      await authService.verifyOtp(digitsOnly, code);
      window.location.href = "/admin/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código inválido o expirado");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("phone");
    setCode("");
    setError(null);
    setSuccess(null);
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const digitsOnly = sentPhone.replace(/\D/g, "");
      const res: SendOtpResponse = await authService.sendOtp(digitsOnly);
      setSuccess(res.message || "Código reenviado correctamente");
      startCountdown();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al reenviar código");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-brand">
          <LogoIcon className="login-logo" aria-hidden="true" />
          <h1>Importify Admin</h1>
          <p>Panel de administración</p>
        </div>

        <div className="login-card">
          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="login-form" noValidate>
              <div className="form-header">
                <h2>Iniciar sesión</h2>
                <p>Ingresa tu número de celular para recibir un código de verificación</p>
              </div>

              {error && <div className="alert alert-error" role="alert"><AlertIcon /><span>{error}</span></div>}
              {success && <div className="alert alert-success" role="status"><CheckIcon /><span>{success}</span></div>}

              <div className="form-field">
                <label htmlFor="phone" className="field-label">
                  <PhoneIcon className="field-icon" aria-hidden="true" />
                  <span>Número de celular</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="300 123 4567"
                  className="field-input"
                  required
                  autoComplete="tel"
                  disabled={loading}
                  aria-describedby="phone-hint"
                />
                <p id="phone-hint" className="field-hint">Te enviaremos un código de 6 dígitos por SMS</p>
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
                <p>Hemos enviado un código de 6 dígitos a <strong>{sentPhone}</strong></p>
              </div>

              {error && <div className="alert alert-error" role="alert"><AlertIcon /><span>{error}</span></div>}
              {success && <div className="alert alert-success" role="status"><CheckIcon /><span>{success}</span></div>}

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
                  ← Cambiar número
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

      <div className="login-bg" aria-hidden="true">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>
    </div>
  );
}