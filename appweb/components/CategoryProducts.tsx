import Image from "next/image";
import { CATALOG } from "@/services/catalog.products";
import { CATEGORIES } from "@/services/catalog.mock";
import { formatCOP } from "@/services/format";

export function CategoryProducts() {
  const withProducts = CATEGORIES.filter((c) => CATALOG[c.slug]?.length);

  if (withProducts.length === 0) return null;

  return (
    <>
      {withProducts.map((category) => (
        <section className="catalog-section" key={category.slug} aria-labelledby={`cat-${category.slug}`}>
          <div className="featured-products-heading">
            <h2 id={`cat-${category.slug}`}>{category.name.toUpperCase()}</h2>
          </div>
          <div className="catalog-grid">
            {CATALOG[category.slug].map((product) => (
              <article className="catalog-card" key={product.slug}>
                <div className="catalog-image">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 720px) 45vw, 220px"
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <h3>{product.name}</h3>
                <p className="catalog-price">{formatCOP(product.price)}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
