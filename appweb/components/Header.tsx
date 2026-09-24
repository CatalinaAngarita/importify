"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CART_COUNT } from "@/services/catalog.mock";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/nosotros", label: "Quiénes somos" },
  { href: "/contacto", label: "Contacto" },
];

export function Header() {
  const [query, setQuery] = useState("");
  const pathname = usePathname();

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true">
            <span />
          </span>
          <span className="brand-name">IMPORTIFY</span>
        </Link>
        <form
          className="search"
          action="/productos"
          onSubmit={(e) => {
            if (!query.trim()) e.preventDefault();
          }}
        >
          <span className="search-icon" aria-hidden="true" />
          <input name="q" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Escribe el producto..." aria-label="Buscar productos" />
        </form>
        <nav className="nav">
          {LINKS.map((l) => (
            <Link key={l.label} href={l.href} className={pathname === l.href ? "active" : undefined}>
              {l.label}
            </Link>
          ))}
          <Link href="/login" className="login-link">Iniciar sesión</Link>
        </nav>
        <Link href="/carrito" className="cart-link" aria-label="Carrito">
          <span className="cart-icon" aria-hidden="true" />
          <span className="cart-count">{CART_COUNT}</span>
        </Link>
      </div>
    </header>
  );
}
