"use client";

import Image from "next/image";
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
        <Link href="/" className="brand" aria-label="Importify - inicio">
          <Image src="/images/brand/logo-header.svg" alt="Importify" width={72} height={72} priority />
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
