import Image from "next/image";

export function Footer() {
  return (
    <footer className="footer" id="contacto">
      <div className="footer-inner">
        <div className="footer-join">
          <h2>¿QUIERES EMPRENDER<br />CON NOSOTROS?</h2>
          <p>© 2026 IMPORTIFY TODOS LOS<br />DERECHOS RESERVADOS. DESIGN<br />BY NaniDesings</p>
        </div>

        <div className="footer-social">
          <h2>¡SÍGUENOS EN<br />NUESTRAS REDES!</h2>
          <div className="social-links" aria-label="Redes sociales de Importify">
            <a href="https://x.com" aria-label="X">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2.25h3.68l-8.04 9.19 9.46 10.31h-7.41l-5.8-7.57-6.63 7.57H.47l8.6-9.83L0 2.25h7.6l5.24 6.93 6.06-6.93Zm-1.29 17.3h2.04L6.49 4.34H4.3L17.61 19.55Z" /></svg>
            </a>
            <a href="https://www.tiktok.com" aria-label="TikTok">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.32 5.56a5.39 5.39 0 0 1-3.54-3.3h-3.1v13.2a2.78 2.78 0 1 1-2.78-2.78c.28 0 .55.04.8.12V9.66a6.02 6.02 0 1 0 5.09 5.95V8.92a8.38 8.38 0 0 0 4.9 1.57V7.4a5.35 5.35 0 0 1-1.37-.18Z" /></svg>
            </a>
            <a href="https://www.instagram.com" aria-label="Instagram">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.35 2.5h9.3a4.85 4.85 0 0 1 4.85 4.85v9.3a4.85 4.85 0 0 1-4.85 4.85h-9.3a4.85 4.85 0 0 1-4.85-4.85v-9.3A4.85 4.85 0 0 1 7.35 2.5Zm0 2A2.85 2.85 0 0 0 4.5 7.35v9.3a2.85 2.85 0 0 0 2.85 2.85h9.3a2.85 2.85 0 0 0 2.85-2.85v-9.3a2.85 2.85 0 0 0-2.85-2.85h-9.3ZM12 7.3a4.7 4.7 0 1 1 0 9.4 4.7 4.7 0 0 1 0-9.4Zm0 2a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4Zm5.35-3.5a1.13 1.13 0 1 1 0 2.26 1.13 1.13 0 0 1 0-2.26Z" /></svg>
            </a>
            <a href="https://www.facebook.com" aria-label="Facebook">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.5h3.05V9.4c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.69.24 2.69.24v2.97h-1.52c-1.5 0-1.97.94-1.97 1.9v2.27h3.36l-.54 3.5h-2.82V24C19.61 23.1 24 18.1 24 12.07Z" /></svg>
            </a>
            <a href="https://www.whatsapp.com" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.52 3.48A11.91 11.91 0 0 0 12.07 0C5.51 0 .17 5.34.17 11.9c0 2.1.55 4.15 1.6 5.95L.08 24l6.31-1.66a11.9 11.9 0 0 0 5.68 1.45h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.46-8.4ZM12.07 21.78a9.86 9.86 0 0 1-5.03-1.38l-.36-.21-3.75.99 1-3.66-.24-.38a9.86 9.86 0 1 1 8.38 4.64Zm5.4-7.4c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07a8.07 8.07 0 0 1-2.37-1.46 8.92 8.92 0 0 1-1.65-2.05c-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.57-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.47 0 1.46 1.07 2.87 1.22 3.07.15.2 2.1 3.2 5.08 4.49.7.3 1.25.48 1.68.61.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" /></svg>
            </a>
          </div>
          <a className="footer-handle" href="https://www.instagram.com/importify.co">@Importify.co</a>
        </div>

        <div className="footer-brand-area">
          <Image className="footer-brand-logo" src="/images/banners/logo-footer.svg" alt="Importify" width={320} height={30} />
          <nav className="footer-legal" aria-label="Enlaces legales">
            <a href="/terminos-y-condiciones">Términos y condiciones</a>
            <a href="/tratamiento-de-datos">Tratamiento de datos</a>
          </nav>
          <Image className="footer-banner-logo" src="/images/banners/logo-banner-inferior.svg" alt="Importify" width={200} height={60} />
        </div>
      </div>
    </footer>
  );
}
