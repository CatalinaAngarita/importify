const WHY_FEATURES = [
  {
    title: "COMPRA SEGURA",
    text: "Tus productos están protegidos ante robos o pérdida.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2Zm-6-4.5c1.38 0 2.5 1.12 2.5 2.5v2h-5V6c0-1.38 1.12-2.5 2.5-2.5Z" />
        <path d="M13 11 9.5 16.2h2.4L10.9 21l3.9-5.2h-2.4L13 11Z" fill="#e9ecff" />
      </svg>
    ),
  },
  {
    title: "ENVÍOS CONFIABLES",
    text: "Trabajamos con socios aliados logísticos internacionales y locales.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4ZM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5Zm13.5-9L19.46 12H17V9.5h2.5Zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5Z" />
      </svg>
    ),
  },
  {
    title: "PRODUCTOS ORIGINALES",
    text: "Directos desde China con garantía de calidad.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27Z" />
      </svg>
    ),
  },
  {
    title: "ATENCIÓN PERSONALIZADA",
    text: "Estamos contigo en cada paso del proceso.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 3h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9.4L5 17.2V14H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
        <path d="M20 7h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-1v3.2L15.6 18H12a2 2 0 0 1-1.7-1H17a3 3 0 0 0 3-3V7Z" opacity=".6" />
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero" aria-labelledby="about-title">
        <div className="about-copy">
          <h1 id="about-title">
            <span className="about-title-sign">¿</span>QUIÉNES SOMOS<span className="about-title-sign">?</span>
          </h1>
          <div className="about-text">
            <p>
              Conectamos tus necesidades de compra con proveedores y productos de China,
              facilitando el proceso de importación de principio a fin.
            </p>
            <p>
              Te ayudamos a encontrar productos, gestionar tus pedidos y coordinar el envío
              hasta que tu mercancía llegue a destino.
            </p>
            <p>
              Trabajamos para que importar sea un proceso más claro, organizado y accesible.
            </p>
            <p>
            </p>
            <p className="about-slogan">
              <span className="about-title-sign">¡</span>TU PEDIDO NOS IMPORTA<span className="about-title-sign">!</span>
            </p>
          </div>
        </div>

        <div
          className="about-visual"
          role="img"
          aria-label="Espacio para la imagen de una asesora de Importify con paquetes"
        >
          <div className="about-visual-mark" aria-hidden="true">i</div>
          <span className="about-star about-star-1" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M12 2l2.4 7.2H22l-6 4.5 2.3 7.3-6.3-4.5-6.3 4.5L8 13.7l-6-4.5h7.6L12 2z" /></svg>
          </span>
          <span className="about-star about-star-2" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M12 2l2.4 7.2H22l-6 4.5 2.3 7.3-6.3-4.5-6.3 4.5L8 13.7l-6-4.5h7.6L12 2z" /></svg>
          </span>
          <span className="about-star about-star-3" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M12 2l2.4 7.2H22l-6 4.5 2.3 7.3-6.3-4.5-6.3 4.5L8 13.7l-6-4.5h7.6L12 2z" /></svg>
          </span>
          <span className="about-mark-line about-mark-line-1" aria-hidden="true">
            <svg viewBox="0 0 48 24"><path d="M2 4c14 2 30 8 42 18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /><path d="M44 22l-8 1 5-7" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <span className="about-mark-line about-mark-line-2" aria-hidden="true">
            <svg viewBox="0 0 48 16"><path d="M2 8h40" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /><path d="M40 2l7 6-7 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </span>
          <div className="about-image-slot" aria-hidden="true" />
        </div>
      </section>

      <section className="about-stats" aria-label="Importify en cifras">
        <div className="about-stat">
          <strong>+5</strong>
          <span>Años de Experiencia</span>
        </div>
        <div className="about-stat">
          <strong>+60</strong>
          <span>Casos de Éxito</span>
        </div>
        <div className="about-stat">
          <strong>+90</strong>
          <span>Clientes Satisfechos</span>
          <span
            className="about-stat-avatar"
            role="img"
            aria-label="Espacio para la foto de una clienta satisfecha"
          />
        </div>
      </section>

      <section className="about-why" aria-labelledby="about-why-title">
        <div className="about-why-card">
          <div className="about-why-copy">
            <h2 id="about-why-title">¿POR QUÉ ELEGIRNOS?</h2>
            <ul className="about-why-grid">
              {WHY_FEATURES.map((feature) => (
                <li key={feature.title} className="about-why-item">
                  <span className="about-why-icon" aria-hidden="true">{feature.icon}</span>
                  <div>
                    <h3>{feature.title}</h3>
                    <p>{feature.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="about-why-photo"
            role="img"
            aria-label="Espacio para la fotografía de la bodega de Importify"
          />
        </div>
      </section>

      <section className="about-ally" aria-labelledby="about-ally-title">
        <div className="about-ally-card">
          <div className="about-ally-copy">
            <h2 id="about-ally-title">MÁS QUE IMPORTACIONES,<br />SOMOS TU ALIADO</h2>
            <p>
              Cada pedido representa una historia,
              estamos aquí para que llegue a ti, sin
              complicaciones y con la mejor experiencia.
            </p>
          </div>
          <div
            className="about-ally-art"
            role="img"
            aria-label="Espacio para la ilustración de importaciones de Importify"
          />
        </div>
      </section>
    </main>
  );
}
