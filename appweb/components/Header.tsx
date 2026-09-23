import Link from "next/link";

export function Header() {
  return (
    <header className="header">
      <Link href="/" className="brand">IMPORTIFY</Link>
      <nav className="nav">
        <Link href="/">Inicio</Link>
        <Link href="/catalogo">Catálogo</Link>
        <Link href="/carrito">Carrito</Link>
      </nav>
    </header>
  );
}
