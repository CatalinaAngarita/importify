"use client";

import Image from "next/image";
import { useState } from "react";

const ITEMS = [
  { name: "Aro de Luz I8", description: "Aro de luz profesional para fotos y videos.", image: "/images/products/tecnologia/aro-luz-I8-nobg.png" },
  { name: "Proyector Android", description: "Cine en casa con Android integrado.", image: "/images/products/tecnologia/proyector-android-nobg.png" },
  { name: "Audífonos Personales", description: "Audio nítido y comodidad todo el día.", image: "/images/products/tecnologia/audifonos-personales-nobg.png" },
  { name: "Malumeta", description: "Herramienta eléctrica profesional.", image: "/images/products/Eléctricos/Malumeta-nobg.png" },
  { name: "Xiam Pro", description: "Potencia y precisión en tus manos.", image: "/images/products/Eléctricos/Xiam-pro-nobg.png" },
  { name: "Brocha y arancela de maquillaje", description: "Set para maquillaje perfecto.", image: "/images/products/Belleza/Brocha y arancela de maquillaje-nobg.png" },
  { name: "Depilador de dama", description: "Depilación suave, rápida y duradera.", image: "/images/products/Belleza/Depilador-de-dama-nobg.png" },
  { name: "Maquina Hair Clipper", description: "Corte profesional en casa.", image: "/images/products/Belleza/Maquina-Hair-Clipper-nobg.png" },
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
