import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, PRODUCTS } from "@/services/catalog.mock";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

interface Row {
  id: string;
  name: string;
  slug: string;
  price: string;
  categorySlug?: string | null;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: { q?: string; cat?: string };
}) {
  const q = searchParams.q ?? "";
  const cat = searchParams.cat ?? "";

  const [cats, prods] = await Promise.all([
    fetchJson<{ data: { name: string; slug: string }[] }>(`${API_URL}/categories?limit=50`),
    fetchJson<{ data: Row[] }>(
      `${API_URL}/products?limit=24${q ? `&q=${encodeURIComponent(q)}` : ""}${
        cat ? `&categorySlug=${encodeURIComponent(cat)}` : ""
      }`,
    ),
  ]);

  // Fallback a mocks si la API no está en línea.
  if (!prods) {
    const list = PRODUCTS.filter(
      (p) =>
        (!cat || p.category === cat) &&
        (!q || p.name.toLowerCase().includes(q.toLowerCase())),
    );
    return (
      <main>
        <Container>
          <section className="section">
            <SectionTitle title="Productos" sub={`${list.length} resultados (mock — API sin conexión)`} />
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
              <a className={!cat ? "btn" : "btn btn-ghost"} href="/productos">Todas</a>
              {CATEGORIES.map((c) => (
                <a key={c.slug} className={cat === c.slug ? "btn" : "btn btn-ghost"} href={`/productos?cat=${c.slug}`}>
                  {c.emoji} {c.name}
                </a>
              ))}
            </div>
            <div className="grid">
              {list.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
            {list.length === 0 && <p className="muted">Sin resultados para tu búsqueda.</p>}
          </section>
        </Container>
      </main>
    );
  }

  const categories = cats?.data ?? [];
  return (
    <main>
      <Container>
        <section className="section">
          <SectionTitle title="Productos" sub={`${prods.data.length} resultados`} />
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            <a className={!cat ? "btn" : "btn btn-ghost"} href="/productos">Todas</a>
            {categories.map((c) => (
              <a
                key={c.slug}
                className={cat === c.slug ? "btn" : "btn btn-ghost"}
                href={`/productos?cat=${c.slug}`}
              >
                {c.name}
              </a>
            ))}
          </div>
          <div className="grid">
            {prods.data.map((p) => (
              <ProductCard
                key={p.slug}
                product={{
                  slug: p.slug,
                  name: p.name,
                  category: "technology",
                  price: Number(p.price),
                  emoji: "📦",
                  image: "",
                  rating: 5,
                  sold: 0,
                }}
              />
            ))}
          </div>
          {prods.data.length === 0 && <p className="muted">Sin resultados para tu búsqueda.</p>}
        </section>
      </Container>
    </main>
  );
}
