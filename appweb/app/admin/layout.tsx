import { AdminGuard } from "@/components/AdminGuard";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Productos" },
  { href: "/admin/categories", label: "Categorías" },
  { href: "/admin/inventory", label: "Inventario" },
  { href: "/admin/orders", label: "Pedidos" },
  { href: "/admin/customers", label: "Clientes" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <main>
        <div className="section" style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: "160px" }}>
            <strong>Admin</strong>
            {LINKS.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
            <a href="/">← Tienda</a>
          </nav>
          <div style={{ flex: 1, minWidth: "280px" }}>{children}</div>
        </div>
      </main>
    </AdminGuard>
  );
}
