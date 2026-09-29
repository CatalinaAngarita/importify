import Image from "next/image";
import type { Testimonial } from "@/types/catalog";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className="card testimonial">
      <p>“{testimonial.text}”</p>
      <strong style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <Image
          src={testimonial.avatar}
          alt={testimonial.name}
          width={36}
          height={36}
          style={{ borderRadius: "50%" }}
        />
        {"⭐".repeat(testimonial.rating)} {testimonial.name}
      </strong>
    </article>
  );
}
