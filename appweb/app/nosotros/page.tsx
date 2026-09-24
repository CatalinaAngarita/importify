export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero" aria-labelledby="about-title">
        <div className="about-copy">
          <h1 id="about-title">¿QUIÉNES SOMOS?</h1>
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
          </div>
        </div>

        <div
          className="about-visual"
          role="img"
          aria-label="Espacio para la imagen de una asesora de Importify con paquetes"
        >
          <div className="about-visual-mark" aria-hidden="true">I</div>
          <div className="about-image-slot" aria-hidden="true" />
        </div>
      </section>
    </main>
  );
}
