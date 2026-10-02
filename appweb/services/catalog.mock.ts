import type { Category, Product, Testimonial } from "@/types/catalog";

export const CATEGORIES: Category[] = [
  { slug: "perfumeria", name: "Perfumería", emoji: "🌸", blurb: "Perfumes y fragancias importadas", image: "/images/categories/perfumeria.svg" },
  { slug: "televentas", name: "Televentas", emoji: "📺", blurb: "Los productos que ves en TV", image: "/images/categories/televentas.svg" },
  { slug: "sokany", name: "Sokany", emoji: "🔊", blurb: "Línea Sokany original", image: "/images/categories/sokany.svg" },
  { slug: "belleza", name: "Belleza", emoji: "💄", blurb: "Cuidado y belleza", image: "/images/categories/belleza.svg" },
  { slug: "tecnologia", name: "Tecnología", emoji: "💻", blurb: "Gadgets y audio importado", image: "/images/categories/tecnologia.svg" },
  { slug: "electricos", name: "Eléctricos", emoji: "🔌", blurb: "Electrodomésticos para tu hogar", image: "/images/categories/electricos.svg" },
  { slug: "repuestos-electricos", name: "Repuestos Eléctricos", emoji: "⚡", blurb: "Repuestos y accesorios eléctricos", image: "/images/categories/repuestos-electricos.svg" },
  { slug: "jugueteria", name: "Juguetería", emoji: "🧸", blurb: "Juguetes para todas las edades", image: "/images/categories/jugueteria.svg" },
  { slug: "herramientas", name: "Herramientas", emoji: "🛠️", blurb: "Herramientas y taller", image: "/images/categories/herramientas.svg" },
  { slug: "mascotas", name: "Mascotas", emoji: "🐾", blurb: "Todo para tu peludito", image: "/images/categories/mascotas.svg" },
];

// Pool único: cada producto aparece una sola vez; las secciones usan slices.
export const PRODUCTS: Product[] = [
  { slug: "audifonos-pro", name: "Audífonos Pro importados", category: "technology", price: 189900, oldPrice: 239900, emoji: "🎧", image: "/images/products/technology/audifonos-pro.svg", rating: 4.8, sold: 320 },
  { slug: "smartwatch-x2", name: "Smartwatch X2", category: "technology", price: 249900, emoji: "⌚", image: "/images/products/technology/smartwatch-x2.svg", rating: 4.7, sold: 210 },
  { slug: "parlante-360", name: "Parlante 360°", category: "technology", price: 159900, emoji: "🔊", image: "/images/products/technology/parlante-360.svg", rating: 4.6, sold: 180 },
  { slug: "kit-auto-premium", name: "Kit cuidado auto premium", category: "automotive", price: 94900, emoji: "🧽", image: "/images/products/automotive/kit-auto-premium.svg", rating: 4.9, sold: 410 },
  { slug: "aspiradora-auto", name: "Aspiradora portátil auto", category: "automotive", price: 119900, emoji: "🚙", image: "/images/products/automotive/aspiradora-auto.svg", rating: 4.5, sold: 150 },
  { slug: "soporte-celular-auto", name: "Soporte magnético auto", category: "automotive", price: 39900, emoji: "🧲", image: "/images/products/automotive/soporte-magnetico-auto.svg", rating: 4.4, sold: 260 },
  { slug: "mochila-urbana", name: "Mochila urbana", category: "accessories", price: 129900, emoji: "🎒", image: "/images/products/accessories/mochila-urbana.svg", rating: 4.8, sold: 380 },
  { slug: "billetera-rfid", name: "Billetera RFID", category: "accessories", price: 59900, emoji: "👛", image: "/images/products/accessories/billetera-rfid.svg", rating: 4.6, sold: 290 },
  { slug: "gafas-sol-polarizadas", name: "Gafas de sol polarizadas", category: "accessories", price: 79900, emoji: "🕶️", image: "/images/products/accessories/gafas-sol-polarizadas.svg", rating: 4.5, sold: 170 },
  { slug: "set-facial-coreano", name: "Set facial coreano", category: "personal-care", price: 74900, emoji: "🧴", image: "/images/products/personal-care/set-facial-coreano.svg", rating: 4.9, sold: 450 },
  { slug: "secador-profesional", name: "Secador profesional", category: "personal-care", price: 139900, emoji: "💨", image: "/images/products/personal-care/secador-profesional.svg", rating: 4.7, sold: 230 },
  { slug: "kit-afeitado", name: "Kit afeitado clásico", category: "personal-care", price: 64900, emoji: "🪒", image: "/images/products/personal-care/kit-afeitado-clasico.svg", rating: 4.6, sold: 140 },
];

export const FEATURED_PRODUCTS = PRODUCTS.slice(0, 4);
export const BEST_SELLERS = [...PRODUCTS].sort((a, b) => b.sold - a.sold).slice(0, 4);

export const TESTIMONIALS: Testimonial[] = [
  { name: "Carlos M. (Bogotá)", text: "Pedí mi nueva laptop y un smartwatch con Importify y la verdad tenía algo de nervios al principio, ¡pero llegaron súper rápido y sellados! El ahorro fue brutal comparado con las tiendas de aquí. 100% recomendados.", rating: 4, avatar: "/images/testimonials/carlos-m.png" },
  { name: "Ana P. (Medellín)", text: "Conseguí unas autopartes y gadgets tecnológicos para mi carro que estaban agotadísimos. Importify se encargó de traérmelos directo hasta la puerta de mi casa sin enredos. ¡Súper profesionales!", rating: 4, avatar: "/images/testimonials/ana-p.png" },
  { name: "Javier L. (Cúcuta)", text: "Estaba buscando unos dispositivos de cuidado personal que no se consiguen fácil en Colombia y el equipo de Importify me ayudó con todo el proceso. ¡Llegaron en perfecto estado y la atención es excelente!", rating: 4, avatar: "/images/testimonials/javier-l.png" },
  { name: "Sofia R. (Cali)", text: "Buscaba dispositivos de cuidado personal difíciles de conseguir. Me ayudaron con todo y llegaron perfectos.", rating: 4, avatar: "/images/testimonials/sofia-r.png" },
];

export const BENEFITS = [
  { icon: "🚚", title: "Envío a toda Colombia", text: "Despacho rápido y rastreable a las principales ciudades." },
  { icon: "🔒", title: "Pago seguro Wompi", text: "PSE, tarjetas y Nequi con protección antifraude." },
  { icon: "✅", title: "Productos originales", text: "Importación directa con garantía de autenticidad." },
  { icon: "💬", title: "Soporte local", text: "Acompañamiento en español antes y después de comprar." },
];

export const MOCK_CART = [
  { product: PRODUCTS[0], qty: 1 },
  { product: PRODUCTS[6], qty: 2 },
];

export const CART_COUNT = MOCK_CART.reduce((n, i) => n + i.qty, 0);

export const MOCK_ORDERS = [
  { id: "IMP-1024", date: "2026-09-10", status: "Entregado", total: 319800 },
  { id: "IMP-1031", date: "2026-09-18", status: "En camino", total: 94900 },
];
