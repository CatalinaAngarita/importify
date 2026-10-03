import Image from "next/image";

const WHY_FEATURES = [
  {
    title: "COMPRA SEGURA",
    text: "Tus pedidos están protegidos en todo el proceso.",
    iconSrc: "/images/about/compra-segura-logo.svg",
  },
  {
    title: "ENVÍOS CONFIABLES",
    text: "Trabajamos con los mejores aliados logísticos internacionales y locales.",
    iconSrc: "/images/about/envios-confiables.svg",
  },
  {
    title: "PRODUCTOS ORIGINALES",
    text: "Directo desde China con garantía de calidad.",
    iconSrc: "/images/about/productos-originales.svg",
  },
  {
    title: "ATENCIÓN PERSONALIZADA",
    text: "Estamos contigo en cada paso de tu compra.",
    iconSrc: "/images/about/atencion-personalizada.svg",
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
            <p className="about-slogan">
              <span className="about-title-sign">¡</span>TU PEDIDO<br />
              NOS IMPORTA<span className="about-title-sign">!</span>
            </p>
          </div>
        </div>

        <div className="about-visual">
          <div className="about-visual-top">
            <Image
              src="/images/about/quienes-somos-top.svg"
              alt="Imagen Quiénes somos"
              fill
              style={{ objectFit: "contain", objectPosition: "center", transform: "scale(1.25)", transformOrigin: "center" }}
              priority
            />
          </div>
          <div className="about-visual-logo">
            <Image
              src="/images/about/logo-quienes-somos.svg"
              alt="Logo Quiénes somos Importify"
              fill
              style={{ objectFit: "contain", objectPosition: "center", transform: "scale(1.25)", transformOrigin: "center" }}
              priority
            />
          </div>
        </div>
      </section>

      <section className="about-why" aria-labelledby="about-why-title">
        <div className="about-why-card">
          <div className="about-why-copy">
            <h2 id="about-why-title">¿POR QUÉ ELEGIRNOS?</h2>
            <ul className="about-why-grid">
              {WHY_FEATURES.map((feature) => (
                <li key={feature.title} className="about-why-item">
                  <span className="about-why-icon" aria-hidden="true">
                    <Image
                      src={feature.iconSrc}
                      alt={feature.title}
                      fill
                      style={{ objectFit: "contain" }}
                    />
                  </span>
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
            <h2 id="about-ally-title">
              <span>MÁS QUE IMPORTACIONES,</span>
              <span>SOMOS TU ALIADO</span>
            </h2>
            <p>
              Cada pedido representa una historia,<br />
              estamos aquí para que llegue a ti, sin<br />
              complicaciones y con la mejor experiencia.
            </p>
          </div>
          <div className="about-ally-art" role="img" aria-label="Ilustración de importaciones de Importify">
            <Image
              src="/images/about/somos-tu-aliado.svg"
              alt="Ilustración aliados Importify"
              fill
              style={{ objectFit: "contain", objectPosition: "center" }}
              priority
            />
          </div>
        </div>
      </section>
    </main>
  );
}
