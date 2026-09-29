"use client";

import Image from "next/image";
import { useState } from "react";

const ITEMS = [
  { name: "BUJÍAS", description: "Encendido eficiente y rendimiento confiable para tu motor.", image: "/images/best-sellers/bujias.png" },
  { name: "IPHONE 17 PRO MAX", description: "Tecnología avanzada, diseño elegante y rendimiento excepcional en tus manos.", image: "/images/best-sellers/iphone-17-pro-max.png" },
  { name: "ACEITE DIÉSEL", description: "Protección y lubricación para un mejor rendimiento del motor.", image: "/images/best-sellers/aceite-diesel.png" },
  { name: "FILTRO DE ACEITE", description: "Protección y lubricación para un mejor rendimiento del motor.", image: "/images/best-sellers/filtro-de-aceite.png" },
  { name: "IPAD MINI 6° GENERACIÓN", description: "Potencia, versatilidad y diseño para estudiar, crear y trabajar desde cualquier lugar.", image: "/images/best-sellers/ipad-mini-6.png" },
];

export function BestSellersCarousel() {
  const [firstItem, setFirstItem] = useState(0);
  const visibleItems = [...ITEMS.slice(firstItem), ...ITEMS.slice(0, firstItem)];

  function move(direction: 1 | -1) {
    setFirstItem((current) => (current + direction + ITEMS.length) % ITEMS.length);
  }

  return (
    <section className="best-sellers" aria-labelledby="best-sellers-title">
      <h2 id="best-sellers-title">PRODUCTOS MÁS VENDIDOS</h2>
      <div className="best-sellers-carousel">
        <button className="carousel-arrow carousel-arrow-prev" type="button" onClick={() => move(-1)} aria-label="Ver productos anteriores">‹</button>
        <div className="best-sellers-track">
          {visibleItems.map((item) => (
            <article className="best-seller-card" key={`${firstItem}-${item.name}`}>
              <h3>{item.name}</h3>
              <div className="best-seller-image">
                <Image src={item.image} alt={item.name} fill sizes="(max-width: 720px) 75vw, 20vw" />
              </div>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
        <button className="carousel-arrow carousel-arrow-next" type="button" onClick={() => move(1)} aria-label="Ver productos siguientes">›</button>
      </div>
    </section>
  );
}
