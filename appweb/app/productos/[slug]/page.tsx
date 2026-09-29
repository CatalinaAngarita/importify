import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { SectionTitle } from "@/components/SectionTitle";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS } from "@/services/catalog.mock";
import { formatCOP } from "@/services/format";

export default function ProductoDetalle({ params }: { params: { slug: string } }) {
  const product = PRODUCTS.find((p) => p.slug === params.slug);
  if (!product) notFound();
  const related = PRODUCTS.filter(
    (p) => p.category === product.category && p.slug !== product.slug,
  ).slice(0, 4);

  return (
    <main>
      <Container>
        <section className="section">
          <div className="detail">
            <div className="product-media" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 720px) 100vw, 500px"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
            <div>
              <span className="tag">{product.category}</span>
              <h1>{product.name}</h1>
              <p className="muted">
                ⭐ {product.rating} · {product.sold} vendidos
              </p>
              <p className="price" style={{ fontSize: "1.6rem" }}>
                {formatCOP(product.price)}
              </p>
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <Link href="/carrito" className="btn">
                  Agregar al carrito
                </Link>
                <Link href="/checkout" className="btn btn-ghost">
                  Comprar ahora
                </Link>
              </div>
            </div>
          </div>
        </section>
        {related.length > 0 && (
          <section className="section">
            <SectionTitle title="Relacionados" />
            <div className="grid">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </main>
  );
}
