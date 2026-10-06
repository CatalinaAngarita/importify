import Image from "next/image";
import Link from "next/link";
import { CATALOG } from "@/services/catalog.products";

const PRODUCTS = [
  { title: "Aro de Luz I8", description: "Aro de luz profesional para fotos y videos.", image: "/images/products/Tecnologicos/aro-luz-I8.png", className: "featured-product-tech" },
  { title: "Audífonos Personales", description: "Audio nítido y comodidad todo el día.", image: "/images/products/Tecnologicos/audifonos-personales.png", className: "featured-product-tech" },
  { title: "Malumeta v2", description: "Potente herramienta eléctrica versátil.", image: "/images/products/Eléctricos/Malumeta-v2.png", className: "featured-product-electric" },
  { title: "Maumeta 3D", description: "Impresora 3D de alta precisión.", image: "/images/products/Eléctricos/Maumeta-3D.png", className: "featured-product-electric" },
  { title: "Brocha y arancela de maquillaje", description: "Set profesional para maquillaje.", image: "/images/products/Belleza/Brocha y arancela de maquillaje.png", className: "featured-product-beauty" },
  { title: "Depilador de dama", description: "Depilación suave y duradera.", image: "/images/products/Belleza/Depilador-de-dama.png", className: "featured-product-beauty" },
];

export function FeaturedProductsShowcase({ showMore = true }: { showMore?: boolean }) {
  return (
    <section className="featured-products" aria-labelledby="featured-products-title">
      <div className="featured-products-heading">
        <h2 id="featured-products-title">CONOCE NUESTROS PRODUCTOS</h2>
        {showMore && <Link href="/productos" className="home-more">VER MÁS</Link>}
      </div>
      <div className="featured-products-grid">
        {PRODUCTS.slice(0, 3).map((product) => (
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
