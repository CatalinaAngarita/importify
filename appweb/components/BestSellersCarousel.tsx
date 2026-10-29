"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchBestSellers } from "@/services/catalog.service";
import type { Product } from "@/types/catalog";

export function BestSellersCarousel() {
  const [items, setItems] = useState<Product[]>([]);
  const [firstItem, setFirstItem] = useState(0);

  useEffect(() => {
    let active = true;
    fetchBestSellers(8)
      .then((products) => {
        if (active) setItems(products);
      })
      .catch(() => {
        if (active) setItems([]);
      });
    return () => {
      active = false;
    };
  }, []);

  if (items.length === 0) return null;

  const visibleItems = [...items.slice(firstItem), ...items.slice(0, firstItem)];

  function move(direction: 1 | -1) {
    setFirstItem((current) => (current + direction + items.length) % items.length);
  }

  return (
    <section className="best-sellers" aria-labelledby="best-sellers-title">
      <h2 id="best-sellers-title">PRODUCTOS MÁS VENDIDOS</h2>
      <div className="best-sellers-carousel">
        <button className="carousel-arrow carousel-arrow-prev" type="button" onClick={() => move(-1)} aria-label="Ver productos anteriores">‹</button>
        <div className="best-sellers-track">
          {visibleItems.map((item) => (
            <Link className="best-seller-card" href={`/productos/${item.slug}`} key={`${firstItem}-${item.slug}`}>
              <h3>{item.name}</h3>
              <div className="best-seller-image">
                <Image src={item.image} alt={item.name} fill sizes="(max-width: 720px) 75vw, 20vw" />
              </div>
              <p>{item.description ?? item.categoryName ?? "Producto favorito de nuestros clientes"}</p>
            </Link>
          ))}
        </div>
        <button className="carousel-arrow carousel-arrow-next" type="button" onClick={() => move(1)} aria-label="Ver productos siguientes">›</button>
      </div>
    </section>
  );
}
