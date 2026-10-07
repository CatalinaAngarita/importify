import type { Product } from "@/types/catalog";

// Datos extraídos del catálogo BCH PERFUMERÍA 2026 (Canva).
// Nombres y precios exactos del catálogo; imágenes recortadas de las páginas del mismo.
// Pendientes por extraer: Televentas, Sokany, Belleza, Tecnología, Eléctricos,
// Repuestos Eléctricos, Juguetería, Herramientas, Mascotas.
export const CATALOG: Record<string, Product[]> = {
  perfumeria: [
    { slug: "odyssey-litchi-lush", name: "Odyssey Litchi Lush", category: "perfumeria", price: 87500, emoji: "🌸", image: "/images/products/perfumeria/odyssey-litchi-lush-nobg.png", rating: 0, sold: 0 },
    { slug: "odyssey-mega", name: "Odyssey Mega", category: "perfumeria", price: 90000, emoji: "🌸", image: "/images/products/perfumeria/odyssey-mega-nobg.png", rating: 0, sold: 0 },
    { slug: "odyssey-homne", name: "Odyssey Homne", category: "perfumeria", price: 75000, emoji: "🌸", image: "/images/products/perfumeria/odyssey-homne-nobg.png", rating: 0, sold: 0 },
    { slug: "odyssey-tyrant", name: "Odyssey Tyrant", category: "perfumeria", price: 75000, emoji: "🌸", image: "/images/products/perfumeria/odyssey-tyrant-nobg.png", rating: 0, sold: 0 },
    { slug: "odyssey-spectra", name: "Odyssey Spectra", category: "perfumeria", price: 75000, emoji: "🌸", image: "/images/products/perfumeria/odyssey-spectra-nobg.png", rating: 0, sold: 0 },
    { slug: "odyssey-go-mango", name: "Odyssey Go Mango", category: "perfumeria", price: 87500, emoji: "🌸", image: "/images/products/perfumeria/odyssey-go-mango-nobg.png", rating: 0, sold: 0 },
    { slug: "odyssey-mandarin-sky", name: "Odyssey Mandarin Sky", category: "perfumeria", price: 87500, emoji: "🌸", image: "/images/products/perfumeria/odyssey-mandarin-sky-nobg.png", rating: 0, sold: 0 },
    { slug: "odyssey-limoni", name: "Odyssey Limoni", category: "perfumeria", price: 80000, emoji: "🌸", image: "/images/products/perfumeria/odyssey-limoni-nobg.png", rating: 0, sold: 0 },
    { slug: "corvus", name: "Corvus", category: "perfumeria", price: 45000, emoji: "🌸", image: "/images/products/perfumeria/corvus-nobg.png", rating: 0, sold: 0 },
    { slug: "pegasus", name: "Pegasus", category: "perfumeria", price: 50000, emoji: "🌸", image: "/images/products/perfumeria/pegasus-nobg.png", rating: 0, sold: 0 },
    { slug: "vega", name: "Vega", category: "perfumeria", price: 45000, emoji: "🌸", image: "/images/products/perfumeria/vega-nobg.png", rating: 0, sold: 0 },
    { slug: "aqua-dubai", name: "Aqua Dubai", category: "perfumeria", price: 85000, emoji: "🌸", image: "/images/products/perfumeria/aqua-dubai-nobg.png", rating: 0, sold: 0 },
    { slug: "amber-oud", name: "Amber Oud", category: "perfumeria", price: 50000, emoji: "🌸", image: "/images/products/perfumeria/amber-oud-nobg.png", rating: 0, sold: 0 },
    { slug: "ultra-violet", name: "Ultra Violet", category: "perfumeria", price: 90000, emoji: "🌸", image: "/images/products/perfumeria/ultra-violet-nobg.png", rating: 0, sold: 0 },
    { slug: "amber-oud-private", name: "Amber Oud Private", category: "perfumeria", price: 60000, emoji: "🌸", image: "/images/products/perfumeria/amber-oud-private-nobg.png", rating: 0, sold: 0 },
    { slug: "bharara-blue", name: "Bharara Blue", category: "perfumeria", price: 75000, emoji: "🌸", image: "/images/products/perfumeria/bharara-blue-nobg.png", rating: 0, sold: 0 },
    { slug: "bharara-king", name: "Bharara King", category: "perfumeria", price: 90000, emoji: "🌸", image: "/images/products/perfumeria/bharara-king-nobg.png", rating: 0, sold: 0 },
    { slug: "niche-femme", name: "Niche Femme", category: "perfumeria", price: 90000, emoji: "🌸", image: "/images/products/perfumeria/niche-femme-nobg.png", rating: 0, sold: 0 },
    { slug: "sckarlet", name: "Sckarlet", category: "perfumeria", price: 90000, emoji: "🌸", image: "/images/products/perfumeria/sckarlet-nobg.png", rating: 0, sold: 0 },
    { slug: "viking-dubai", name: "Viking Dubai", category: "perfumeria", price: 60000, emoji: "🌸", image: "/images/products/perfumeria/viking-dubai-nobg.png", rating: 0, sold: 0 },
  ],
  tecnologia: [
    { slug: "timbre-voz-inteligente", name: "Timbre Voz Inteligente", category: "tecnologia", price: 89900, emoji: "🔔", image: "/images/products/tecnologia/timbre-voz-inteligente-nobg.png", rating: 4.5, sold: 120 },
    { slug: "proyector-android", name: "Proyector Android", category: "tecnologia", price: 299900, emoji: "📽️", image: "/images/products/tecnologia/proyector-android-nobg.png", rating: 4.7, sold: 85 },
    { slug: "mini-parlante", name: "Mini Parlante", category: "tecnologia", price: 45900, emoji: "🔊", image: "/images/products/tecnologia/mini-parlante-nobg.png", rating: 4.6, sold: 210 },
    { slug: "combo-k28", name: "Combo K28", category: "tecnologia", price: 129900, emoji: "🎮", image: "/images/products/tecnologia/combo-k28-nobg.png", rating: 4.4, sold: 95 },
    { slug: "bolso-led", name: "Bolso LED", category: "tecnologia", price: 69900, emoji: "👜", image: "/images/products/tecnologia/bolso-led-nobg.png", rating: 4.3, sold: 150 },
    { slug: "audifonos-personales", name: "Audífonos Personales", category: "tecnologia", price: 79900, emoji: "🎧", image: "/images/products/tecnologia/audifonos-personales-nobg.png", rating: 4.6, sold: 180 },
    { slug: "audifonos-pantalla", name: "Audífonos con Pantalla", category: "tecnologia", price: 119900, emoji: "🎧", image: "/images/products/tecnologia/audifonos-pantalla-nobg.png", rating: 4.5, sold: 110 },
    { slug: "audifonos-caja-azul", name: "Audífonos Caja Azul", category: "tecnologia", price: 65900, emoji: "🎧", image: "/images/products/tecnologia/audifonos-caja-azul-nobg.png", rating: 4.4, sold: 140 },
    { slug: "aro-luz-i8", name: "Aro de Luz I8", category: "tecnologia", price: 59900, emoji: "💡", image: "/images/products/tecnologia/aro-luz-I8-nobg.png", rating: 4.7, sold: 200 },
    { slug: "aro-de-luz", name: "Aro de Luz", category: "tecnologia", price: 49900, emoji: "💡", image: "/images/products/tecnologia/aro-de-luz-nobg.png", rating: 4.6, sold: 175 },
  ],
  electricos: [
    { slug: "brothereta", name: "Brothereta", category: "electricos", price: 89900, emoji: "🔌", image: "/images/products/Eléctricos/Brothereta-nobg.png", rating: 4.5, sold: 120 },
    { slug: "jorz", name: "Jorz", category: "electricos", price: 129900, emoji: "⚡", image: "/images/products/Eléctricos/Jorz-nobg.png", rating: 4.6, sold: 95 },
    { slug: "malumeta-v2", name: "Malumeta v2", category: "electricos", price: 159900, emoji: "🔧", image: "/images/products/Eléctricos/Malumeta-v2-nobg.png", rating: 4.7, sold: 80 },
    { slug: "malumeta", name: "Malumeta", category: "electricos", price: 149900, emoji: "🔧", image: "/images/products/Eléctricos/Malumeta-nobg.png", rating: 4.6, sold: 85 },
    { slug: "maumeta-3d", name: "Maumeta 3D", category: "electricos", price: 179900, emoji: "🖨️", image: "/images/products/Eléctricos/Maumeta-3D-nobg.png", rating: 4.8, sold: 60 },
    { slug: "new-electrico", name: "New Eléctrico", category: "electricos", price: 99900, emoji: "🔌", image: "/images/products/Eléctricos/New-nobg.png", rating: 4.4, sold: 110 },
    { slug: "three-wheeler", name: "Three Wheeler", category: "electricos", price: 119900, emoji: "🛴", image: "/images/products/Eléctricos/Three-wheeler-nobg.png", rating: 4.5, sold: 100 },
    { slug: "xiam-pro", name: "Xiam Pro", category: "electricos", price: 139900, emoji: "🔌", image: "/images/products/Eléctricos/Xiam-pro-nobg.png", rating: 4.6, sold: 90 },
    { slug: "xiam", name: "Xiam", category: "electricos", price: 119900, emoji: "🔌", image: "/images/products/Eléctricos/Xiam-nobg.png", rating: 4.5, sold: 105 },
    { slug: "yiwu", name: "Yiwu", category: "electricos", price: 79900, emoji: "🔌", image: "/images/products/Eléctricos/Yiwu-nobg.png", rating: 4.4, sold: 130 },
  ],
};
