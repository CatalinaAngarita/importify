"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { CATEGORIES, PRODUCTS } from "@/services/catalog.mock";
import { CATALOG } from "@/services/catalog.products";
import { cartService } from "@/services/cart.service";
import { formatCOP } from "@/services/format";
import type { Product } from "@/types/catalog";

// La maqueta muestra cuatro filas de tres artículos por página.
const PAGE_SIZE = 12;
const PRICE_CAP = 500000;

const SORTS = [
  { value: "relevantes", label: "Más relevantes" },
  { value: "vendidos", label: "Más vendidos" },
  { value: "precio-asc", label: "Menor precio" },
  { value: "precio-desc", label: "Mayor precio" },
] as const;

type SortValue = (typeof SORTS)[number]["value"];

const POOL: Product[] = [...PRODUCTS, ...Object.values(CATALOG).flat()];

// Algunos grupos de la interfaz reúnen los slugs históricos del catálogo.
const PILL_CATEGORY_GROUPS: Record<string, string[]> = {
  tecnologia: ["tecnologia", "technology"],
  electricos: ["electricos", "home"],
  belleza: ["belleza", "personal-care"],
  perfumeria: ["perfumeria"],
  mascotas: ["mascotas"],
};

// Slugs en inglés del mock que no están en CATEGORIES: se traducen para mostrarlos bien.
const EXTRA_CATEGORY_LABELS: Record<string, string> = {
  technology: "Tecnología",
  "personal-care": "Belleza",
  home: "Eléctricos",
  accessories: "Accesorios",
  automotive: "Autopartes",
};

function categoryLabel(slug: string): string {
  return (
    CATEGORIES.find((c) => c.slug === slug)?.name ??
    EXTRA_CATEGORY_LABELS[slug] ??
    slug.replace(/-/g, " ")
  );
}

function discountOf(p: Product): number | null {
  if (!p.oldPrice || p.oldPrice <= p.price) return null;
  return Math.round((1 - p.price / p.oldPrice) * 100);
}

function Catalogo() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();

  const [pill, setPill] = useState("todos");
  const [cats, setCats] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(PRICE_CAP);
  const [availability, setAvailability] = useState<string[]>([]);
  const [discount, setDiscount] = useState<string[]>([]);
  const [sort, setSort] = useState<SortValue>("relevantes");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  // Lista completa de categorías para filtros sidebar.
  const allCats = useMemo(
    () => CATEGORIES.map((c) => c.slug),
    []
  );

  // Categorías principales de la navegación horizontal de la maqueta.
  // Los slugs mantienen la compatibilidad con el catálogo ya existente.
  const pillCats = ["tecnologia", "electricos", "belleza", "perfumeria", "mascotas"];

  // Al cambiar cualquier criterio se vuelve a la primera página.
  useEffect(() => {
    setPage(1);
  }, [query, pill, cats, maxPrice, availability, discount, sort]);

  function toggle(list: string[], value: string, set: (v: string[]) => void) {
    set(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  }

  const filtered = useMemo(() => {
    let list = POOL.filter((p) => {
      if (query && !`${p.name} ${categoryLabel(p.category)}`.toLowerCase().includes(query)) return false;
      if (pill !== "todos" && !(PILL_CATEGORY_GROUPS[pill] ?? [pill]).includes(p.category)) return false;
      if (cats.length > 0 && !cats.includes(p.category)) return false;
      if (p.price > maxPrice) return false;
      if (availability.includes("bodega") && !(p.sold > 0 || p.price > 0)) return false;
      if (availability.includes("agotado") && p.price > 0) return false;
      const d = discountOf(p);
      if (discount.includes("con") && d === null) return false;
      if (discount.includes("sin") && d !== null) return false;
      return true;
    });
    if (sort === "precio-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "precio-desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "vendidos") list = [...list].sort((a, b) => b.sold - a.sold);
    return list;
  }, [query, pill, cats, maxPrice, availability, discount, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  async function addToCart(product: Product) {
    if (adding) return;
    setAdding(product.slug);
    try {
      const cart = await cartService.getOrCreate();
      await cartService.addItem(cart.id, product.slug, 1);
    } catch {
      // Sin backend disponible: se conserva localmente.
      try {
        const raw = window.localStorage.getItem("importify_local_cart");
        const local: { slug: string; qty: number }[] = raw ? JSON.parse(raw) : [];
        const found = local.find((i) => i.slug === product.slug);
        if (found) found.qty += 1;
        else local.push({ slug: product.slug, qty: 1 });
        window.localStorage.setItem("importify_local_cart", JSON.stringify(local));
      } catch {
        // Almacenamiento no disponible: no se interrumpe la navegación.
      }
    } finally {
      setAdding(null);
    }
  }

  return (
    <main className="products-page">
      <div className="shop-wrap">
        {/* 2. Banner promocional horizontal */}
        <section className="shop-banner" aria-label="Promoción destacada">
          <div className="shop-banner-figure" aria-hidden="true">
            <img
              src="/images/products/banner/grandes-productos.png"
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
          <div className="shop-banner-text">
            <p className="shop-banner-kicker">APROVECHA NUESTRAS</p>
            <h2>GRANDES OFERTAS</h2>
            <p className="shop-banner-sub">
              Descubre productos increíbles a precios especiales.<br />
              ¡Promociones exclusivas para compras mayoristas!
            </p>
          </div>
          <div className="shop-banner-decor" aria-hidden="true">
            <img
              src="/images/products/banner/paquete-grandes-productos.svg"
              alt=""
              style={{ height: "60%", objectFit: "contain" }}
            />
          </div>
        </section>

        {/* 3. Filtro de categorías (pills) */}
        <nav className="shop-pills" aria-label="Filtrar por categoría">
          {["todos", ...pillCats].map((slug) => (
            <button
              key={slug}
              type="button"
              className={pill === slug ? "shop-pill is-active" : "shop-pill"}
              onClick={() => {
                setPill(slug);
                if (slug === "todos") {
                  setCats([]);
                  setMaxPrice(PRICE_CAP);
                  setAvailability([]);
                  setDiscount([]);
                }
              }}
              aria-pressed={pill === slug}
            >
              {slug === "todos" ? "Todos" : categoryLabel(slug)}
            </button>
          ))}
        </nav>

        {/* 4. Información del listado + ordenamiento */}
        <div className="shop-meta">
          <p>
            Mostrando {visible.length} productos
            {query && (
              <>
                {" "}para “<strong>{searchParams.get("q")}</strong>”
              </>
            )}
          </p>
          <label className="shop-sort">
            Ordenar por:
            <span className="shop-sort-select">
              <select value={sort} onChange={(e) => setSort(e.target.value as SortValue)} aria-label="Ordenar productos">
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </span>
          </label>
        </div>

        {/* Botón de filtros solo visible en móvil */}
        <button
          type="button"
          className="shop-filters-toggle"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          Filtros{filtersOpen ? " ▲" : " ▼"}
        </button>

        {/* 5. Contenido principal: filtros + productos */}
        <div className="shop-layout">
          {/* 6. Panel de filtros */}
          <aside className={filtersOpen ? "shop-filters is-open" : "shop-filters"} aria-label="Filtros de productos">
            <h2 className="shop-filters-title">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 6h16M7 12h10M10 18h4" />
              </svg>
              FILTROS
            </h2>

            <div className="shop-filter-group">
              <h3>Categoría</h3>
              {allCats.map((slug) => (
                <label key={slug} className="shop-check">
                  <input
                    type="checkbox"
                    checked={cats.includes(slug)}
                    onChange={() => toggle(cats, slug, setCats)}
                  />
                  {categoryLabel(slug)}
                </label>
              ))}
            </div>

            <div className="shop-filter-group">
              <h3>Rango de Precio</h3>
              <input
                type="range"
                className="shop-range"
                min={0}
                max={PRICE_CAP}
                step={10000}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                aria-label="Precio máximo"
              />
              <div className="shop-range-labels">
                <span>$0</span>
                <span>{formatCOP(maxPrice)}+</span>
              </div>
            </div>

            <div className="shop-filter-group">
              <h3>Disponibilidad</h3>
              <label className="shop-check">
                <input
                  type="checkbox"
                  checked={availability.includes("bodega")}
                  onChange={() => toggle(availability, "bodega", setAvailability)}
                />
                En Bodega
              </label>
              <label className="shop-check">
                <input
                  type="checkbox"
                  checked={availability.includes("agotado")}
                  onChange={() => toggle(availability, "agotado", setAvailability)}
                />
                Agotado
              </label>
            </div>

            <div className="shop-filter-group">
              <h3>Descuentos</h3>
              <label className="shop-check">
                <input
                  type="checkbox"
                  checked={discount.includes("con")}
                  onChange={() => toggle(discount, "con", setDiscount)}
                />
                Con descuento
              </label>
              <label className="shop-check">
                <input
                  type="checkbox"
                  checked={discount.includes("sin")}
                  onChange={() => toggle(discount, "sin", setDiscount)}
                />
                Sin descuento
              </label>
            </div>

            <button type="button" className="shop-apply" onClick={() => { setPage(1); setFiltersOpen(false); }}>
              APLICAR FILTROS
            </button>
          </aside>

          {/* 7. Grid de productos */}
          <section className="shop-grid" aria-label="Listado de productos">
            {visible.map((p) => {
              const d = discountOf(p);
              return (
                <article className="shop-card" key={p.slug}>
                  <h3 className="shop-card-name">
                    <Link href={`/productos/${p.slug}`}>{p.name}</Link>
                  </h3>
                  <Link href={`/productos/${p.slug}`} className="shop-card-media" aria-label={p.name}>
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="(max-width: 720px) 45vw, (max-width: 1100px) 30vw, 300px"
                      style={{ objectFit: "contain" }}
                    />
                  </Link>
                  <div className="shop-card-foot">
                    <p className="shop-card-price">{formatCOP(p.price)}</p>
                    <button
                      type="button"
                      className="shop-card-add"
                      onClick={() => addToCart(p)}
                      disabled={adding === p.slug}
                      aria-label={`Agregar ${p.name} al carrito`}
                      title="Agregar al carrito"
                    >
                      +
                    </button>
                  </div>
                  <p className="shop-card-meta">
                    {d !== null && <span className="shop-card-discount">-{d}%</span>}
                    <span className="shop-card-units">1 Und</span>
                  </p>
                </article>
              );
            })}
            {visible.length === 0 && (
              <p className="shop-empty">No se encontraron productos con los filtros seleccionados.</p>
            )}
          </section>
        </div>

        {/* 11. Paginación */}
        {totalPages > 1 && (
          <nav className="shop-pagination" aria-label="Paginación de productos">
            <button
              type="button"
              className="shop-page-btn shop-page-arrow"
              onClick={() => setPage((v) => Math.max(1, v - 1))}
              disabled={current === 1}
              aria-label="Página anterior"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={n === current ? "shop-page-btn is-active" : "shop-page-btn"}
                onClick={() => setPage(n)}
                aria-current={n === current ? "page" : undefined}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              className="shop-page-btn shop-page-arrow"
              onClick={() => setPage((v) => Math.min(totalPages, v + 1))}
              disabled={current === totalPages}
              aria-label="Página siguiente"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </nav>
        )}
      </div>
    </main>
  );
}

export default function ProductosPage() {
  return (
    <Suspense>
      <Catalogo />
    </Suspense>
  );
}
