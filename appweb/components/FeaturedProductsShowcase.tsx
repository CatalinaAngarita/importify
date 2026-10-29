"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchFeaturedProducts } from "@/services/catalog.service";
import type { Product } from "@/types/catalog";

function accentClass(category: string): string {
  if (category === "electricos" || category === "repuestos-electricos") return "featured-product-electric";
  if (category === "belleza" || category === "perfumeria") return "featured-product-beauty";
  return "featured-product-tech";
}

export function FeaturedProductsShowcase({ showMore = true }: { showMore?: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let active = true;
    fetchFeaturedProducts(3)
      .then((items) => {
        if (active) setProducts(items);
      })
      .catch(() => {
        if (active) setProducts([]);
      });
    return () => {
      active = false;
    };
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="featured-products" aria-labelledby="featured-products-title">
      <div className="featured-products-heading">
        <h2 id="featured-products-title">CONOCE NUESTROS PRODUCTOS</h2>
        {showMore && <Link href="/productos" className="home-more">VER MÁS</Link>}
      </div>
      <div className="featured-products-grid">
        {products.slice(0, 3).map((product) => (
          <Link
            href={`/productos/${product.slug}`}
            className={`featured-product ${accentClass(product.category)}`}
            key={product.slug}
          >
            <div className="featured-product-image">
              <Image src={product.image} alt={product.name} fill sizes="(max-width: 720px) 100vw, 33vw" />
            </div>
            <h3>{product.name}</h3>
            <p>{product.description ?? product.categoryName ?? "Producto destacado Importify"}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
