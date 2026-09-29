import { BestSellersCarousel } from "@/components/BestSellersCarousel";
import { FeaturedProductsShowcase } from "@/components/FeaturedProductsShowcase";
import { TestimonialCard } from "@/components/TestimonialCard";
import { TESTIMONIALS } from "@/services/catalog.mock";

const BENEFITS = [
  { icon: "truck", text: "Envíos disponibles\na toda Colombia" },
  { icon: "box", text: "Excelente calidad\nde productos" },
  { icon: "card", text: "Todos los medios\nde pago" },
  { icon: "network", text: "Venta al por\nMayor y Detal" },
  { icon: "message", text: "Atención Directa Y\nCompra Segura" },
];

function BenefitIcon({ name }: { name: string }) {
  return <span className={`home-benefit-icon ${name}`} aria-hidden="true" />;
}

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="home-showcase" aria-label="Categorías de Importify">
        <article className="showcase-card showcase-care">
          <div className="showcase-copy"><h1>CUIDADOS PARA TU PIEL</h1></div>
          <div className="showcase-image" aria-hidden="true" />
        </article>
        <article className="showcase-card showcase-auto">
          <div className="showcase-copy"><h2>VARIEDAD DE<br />AUTOPARTES</h2></div>
          <div className="showcase-image" aria-hidden="true" />
        </article>
        <article className="showcase-card showcase-accessories">
          <div className="showcase-copy"><h2>VARIEDAD DE<br />ACCESORIOS</h2></div>
          <div className="showcase-image" aria-hidden="true" />
        </article>
      </section>

      <div className="home-marquee" aria-label="Beneficios principales">
        <span>GARANTÍA 15 DÍAS</span><b>•</b><span>ENVÍOS A TODA COLOMBIA</span><b>•</b><span>IMPORTADORES DIRECTOS</span>
      </div>

      <section className="home-benefits" aria-label="Ventajas de comprar en Importify">
        {BENEFITS.map((benefit) => (
          <article className="home-benefit" key={benefit.icon}>
            <BenefitIcon name={benefit.icon} />
            <p>{benefit.text.split("\n").map((line) => <span key={line}>{line}</span>)}</p>
          </article>
        ))}
      </section>

      <FeaturedProductsShowcase />

      <BestSellersCarousel />

      <section className="home-testimonials">
        <h2>CLIENTES FELICES</h2>
        <div className="grid-3">
          {TESTIMONIALS.map((testimonial) => <TestimonialCard key={testimonial.name} testimonial={testimonial} />)}
        </div>
      </section>
    </main>
  );
}
