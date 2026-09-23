import { Container } from "@/components/Container";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryCard } from "@/components/CategoryCard";
import { ProductCard } from "@/components/ProductCard";
import { CATEGORIES, FEATURED_PRODUCTS } from "@/services/catalog.mock";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Container>
          <section className="hero">
            <h1>Productos importados, compra local</h1>
            <p className="muted">
              Tecnología, automotriz, accesorios y cuidado personal con pago seguro vía Wompi.
            </p>
          </section>
          <section>
            <h2>Categorías</h2>
            <div className="grid">
              {CATEGORIES.map((c) => (
                <CategoryCard key={c.slug} category={c} />
              ))}
            </div>
          </section>
          <section>
            <h2>Destacados</h2>
            <div className="grid">
              {FEATURED_PRODUCTS.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        </Container>
      </main>
      <Footer />
    </>
  );
}
