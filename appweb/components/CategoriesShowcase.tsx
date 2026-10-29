import { CATEGORIES } from "@/services/catalog.mock";

export function CategoriesShowcase() {
  return (
    <section className="products-categories" aria-labelledby="products-categories-title">
      <div className="featured-products-heading">
        <h2 id="products-categories-title">CATEGORÍAS</h2>
      </div>
      <div className="categories-grid">
        {CATEGORIES.map((category) => (
          <article
            className="category-tile"
            key={category.slug}
            title={category.blurb}
          >
            <span className="category-tile-icon" aria-hidden="true">{category.emoji}</span>
            <h3>{category.name}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}
