export default function Feature({ icon, title, text }) {
  return (
    <article className="feature-card">
      <span className="feature-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
