import Image from "next/image";
import type { Category } from "@/types/catalog";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <article className="card">
      <div className="category-media" style={{ padding: 0, overflow: "hidden", position: "relative" }}>
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="(max-width: 720px) 100vw, 300px"
          style={{ objectFit: "cover" }}
        />
      </div>
      <h3>{category.name}</h3>
      <p className="muted">{category.blurb}</p>
    </article>
  );
}
