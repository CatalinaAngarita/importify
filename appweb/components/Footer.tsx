import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer" id="contacto">
      <div className="footer-inner">
        <div>
          <h4>IMPORTIFY.</h4>
          <p className="muted" style={{ color: "#b9aee0" }}>
            Productos importados con entrega en Colombia y pagos seguros vía Wompi.
          </p>
        </div>
        <div>
          <h4>Tienda</h4>
          <Link href="/productos">Productos</Link>
          <Link href="/carrito">Carrito</Link>
          <Link href="/checkout">Checkout</Link>
        </div>
        <div>
          <h4>Cuenta</h4>
          <Link href="/login">Iniciar sesión</Link>
          <Link href="/registro">Registro</Link>
          <Link href="/mi-cuenta">Mi cuenta</Link>
        </div>
        <div id="nosotros">
          <h4>Contacto</h4>
          <p style={{ margin: 0, fontSize: "0.92rem" }}>
            hola@importify.co
            <br />
            Bogotá, Colombia
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        © 2026 IMPORTIFY — Diseño de demostración con datos mock.
      </div>
    </footer>
  );
}
