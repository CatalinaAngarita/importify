import type { Testimonial } from "@/types/catalog";

export function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className="testimonial">
      <div className="testimonial-stars" aria-label={`${testimonial.rating} de 5 estrellas`}>
        {Array.from({ length: 5 }, (_, index) => (
          <span className={index < testimonial.rating ? "is-filled" : ""} key={index}>★</span>
        ))}
      </div>
      <h3>{testimonial.name}</h3>
      <p>{testimonial.text}</p>
    </article>
  );
}
