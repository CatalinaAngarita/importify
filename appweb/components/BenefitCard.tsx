export function BenefitCard({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <article className="card benefit">
      <div className="icon">{icon}</div>
      <h3>{title}</h3>
      <p className="muted">{text}</p>
    </article>
  );
}
