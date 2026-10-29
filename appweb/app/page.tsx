import Link from "next/link";
import { BestSellersCarousel } from "@/components/BestSellersCarousel";
import { FeaturedProductsShowcase } from "@/components/FeaturedProductsShowcase";
import { TestimonialCard } from "@/components/TestimonialCard";
import { TESTIMONIALS } from "@/services/catalog.mock";

const BENEFITS = [
  { icon: "/images/home/benefits/envios-disponibles.svg", text: "Envíos disponibles\na toda Colombia" },
  { icon: "/images/home/benefits/excelente-calidad.svg", text: "Excelente calidad\nde productos" },
  { icon: "/images/home/benefits/Todos-medios-pago.svg", text: "Todos los medios\nde pago" },
  { icon: "/images/home/benefits/venta-mayor-detal.svg", text: "Venta al por\nMayor y Detal" },
  { icon: "/images/home/benefits/Atencion-directa.svg", text: "Atención Directa Y\nCompra Segura" },
];

export default function HomePage() {
  return (
    <main className="home-page">
      <div className="home-upper">
        <section className="home-showcase" aria-label="Categorías de Importify">
          <Link href="/productos?category=belleza" className="showcase-card showcase-care" style={{ textDecoration: 'none' }}>
            <div className="showcase-copy"><h1>BELLEZA</h1></div>
            <div className="showcase-image" aria-hidden="true" />
          </Link>
          <Link href="/productos?category=tecnologia" className="showcase-card showcase-auto" style={{ textDecoration: 'none' }}>
            <div className="showcase-copy"><h2>TECNOLÓGICOS</h2></div>
            <div className="showcase-image" aria-hidden="true" />
          </Link>
          <Link href="/productos?category=electricos" className="showcase-card showcase-accessories" style={{ textDecoration: 'none' }}>
            <div className="showcase-copy"><h2>ELÉCTRICOS</h2></div>
            <div className="showcase-image" aria-hidden="true" />
          </Link>
        </section>

        <div className="home-marquee" aria-label="Beneficios principales">
          <div className="home-marquee-track">
            <span>GARANTÍA 15 DÍAS</span><b>•</b><span>ENVÍOS A TODA COLOMBIA</span><b>•</b><span>IMPORTADORES DIRECTOS</span><b>•</b>
            <span aria-hidden="true">GARANTÍA 15 DÍAS</span><b aria-hidden="true">•</b><span aria-hidden="true">ENVÍOS A TODA COLOMBIA</span><b aria-hidden="true">•</b><span aria-hidden="true">IMPORTADORES DIRECTOS</span><b aria-hidden="true">•</b>
          </div>
          <div className="home-marquee-track" aria-hidden="true">
            <span>GARANTÍA 15 DÍAS</span><b>•</b><span>ENVÍOS A TODA COLOMBIA</span><b>•</b><span>IMPORTADORES DIRECTOS</span><b>•</b>
            <span>GARANTÍA 15 DÍAS</span><b>•</b><span>ENVÍOS A TODA COLOMBIA</span><b>•</b><span>IMPORTADORES DIRECTOS</span><b>•</b>
          </div>
        </div>
      </div>

      <div className="home-lower">
        <section className="home-benefits" aria-label="Ventajas de comprar en Importify">
          {BENEFITS.map((benefit) => (
            <article className="home-benefit" key={benefit.icon}>
              <img src={benefit.icon} alt="" className="home-benefit-logo" />
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
      </div>
    </main>
  );
}
