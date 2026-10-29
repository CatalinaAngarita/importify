"use client";

import { FormEvent, useState } from "react";

const FAQS = [
  {
    question: "¿Qué es y cómo funciona Importify?",
    answer: "Importify es una herramienta de automatización y software de comercio electrónico diseñada para simplificar el proceso de importación de productos desde múltiples proveedores globales directamente a tu tienda online.",
  },
  { question: "¿Desde qué proveedores puedo importar productos?", answer: "Trabajamos con proveedores internacionales verificados y te acompañamos para encontrar la alternativa adecuada para tu negocio." },
  { question: "¿Cómo se gestionan los reembolsos o devoluciones?", answer: "Nuestro equipo te orienta durante el proceso y revisa cada caso según las condiciones de compra y del proveedor." },
  { question: "¿Necesito tarjeta de crédito para empezar a usar la plataforma?", answer: "Ofrecemos distintos medios de pago para que elijas el que mejor se ajuste a tu operación." },
  { question: "¿Tengo una tienda online o catálogo propio, cómo podemos colaborar?", answer: "Escríbenos con los detalles de tu catálogo y te ayudaremos a definir una forma de trabajo." },
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState(0);
  const [sent, setSent] = useState(false);

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <main className="contact-page">
      <section className="contact-hero" aria-labelledby="contact-title">
        <div className="contact-content">
          <div className="contact-heading">
            <h1 id="contact-title">¿TIENES ALGUNA DUDA?</h1>
            <p>CONTÁCTANOS</p>
          </div>

          <form className="contact-form" onSubmit={submitForm}>
            <label><span className="field-icon">◉</span><input name="subject" placeholder="Asunto" required /></label>
            <label><span className="field-icon">♙</span><input name="name" placeholder="Nombre Completo" required /></label>
            <label><span className="field-icon">⌕</span><input name="phone" type="tel" placeholder="Teléfono" required /></label>
            <label><span className="field-icon">✉</span><input name="email" type="email" placeholder="Correo Electrónico" required /></label>
            <label className="contact-message"><span className="field-icon">▣</span><textarea name="message" placeholder="Mensaje" required /></label>
            <label className="contact-consent"><input type="checkbox" required /><span>He leído y acepto los términos y condiciones</span></label>
            <div className="contact-form-actions">
              <span className="captcha-code">FA85B</span>
              <input aria-label="Código de verificación" placeholder="Ingresa El Código" required />
              <button className="captcha-refresh" type="button" aria-label="Actualizar código">↻</button>
            </div>
            <button className="contact-submit" type="submit">ENVIAR</button>
            {sent && <p className="contact-success" role="status">¡Gracias! Recibimos tu mensaje y te responderemos pronto.</p>}
          </form>
        </div>
        <div className="contact-person" role="img" aria-label="Espacio para la imagen de un asesor de Importify con un paquete" />
      </section>

      <section className="faq-section" aria-labelledby="faq-title">
        <h2 id="faq-title">PREGUNTAS FRECUENTES</h2>
        <div className="faq-list">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <article className={`faq-item ${isOpen ? "open" : ""}`} key={faq.question}>
                <button type="button" aria-expanded={isOpen} onClick={() => setOpenFaq(isOpen ? -1 : index)}>
                  <span>{faq.question}</span><i aria-hidden="true">{isOpen ? "−" : "+"}</i>
                </button>
                {isOpen && <p>{faq.answer}</p>}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
