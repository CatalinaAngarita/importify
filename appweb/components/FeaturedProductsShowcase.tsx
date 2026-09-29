import Image from "next/image";
import Link from "next/link";

const PRODUCTS = [
  { title: "MACBOOK PRO 14\"", description: "Laptop macbook pro 14” 2020.", image: "/images/featured-products/macbook-pro-14.png", className: "featured-product-laptop" },
  { title: "SMART WATCH", description: "Smart Watch 2026.", image: "/images/featured-products/smart-watch.png", className: "featured-product-watch" },
  { title: "BOCINA BAFLE", description: "Bafle integrado con IA 2026.", image: "/images/featured-products/bocina-bafle.png", className: "featured-product-speaker" },
];

export function FeaturedProductsShowcase({ showMore = true }: { showMore?: boolean }) {
  return (
    <section className="featured-products" aria-labelledby="featured-products-title">
      <div className="featured-products-heading">
        <h2 id="featured-products-title">CONOCE NUESTROS PRODUCTOS</h2>
        {showMore && <Link href="/productos" className="home-more">VER MÁS</Link>}
      </div>
      <div className="featured-products-grid">
        {PRODUCTS.map((product) => (
          <Link href="/productos" className={`featured-product ${product.className}`} key={product.title}>
            <div className="featured-product-image">
              <Image src={product.image} alt={product.title} fill sizes="(max-width: 720px) 100vw, 33vw" />
            </div>
            <h3>{product.title}</h3>
            <p>{product.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
