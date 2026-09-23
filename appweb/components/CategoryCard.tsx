import type { Category } from "@/types/catalog";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <article className="card">
      <h3>{category.name}</h3>
      <p className="muted">{category.slug}</p>
    </article>
  );
}
