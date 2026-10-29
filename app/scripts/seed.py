#!/usr/bin/env python3
"""
Script de seed simple para registrar productos e imágenes -nobg
"""

import os
import sys
import psycopg2
from pathlib import Path

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://importify:importify@importify-db:5432/importify")

PRODUCTS_DIR = Path("/app/public/images/products")

MOCK_PRODUCTS = [
    # Belleza
    {"slug": "brocha-arancela-maquillaje", "name": "Brocha y arancela de maquillaje", "category": "belleza", "price": 45900, "old_price": 59900, "stock": 50},
    {"slug": "cubre-pezon", "name": "Cubre pezón", "category": "belleza", "price": 18900, "old_price": 25900, "stock": 100},
    {"slug": "depilador-dama", "name": "Depilador de dama", "category": "belleza", "price": 89900, "old_price": 119900, "stock": 30},
    {"slug": "maquina-hair-clipper", "name": "Máquina Hair Clipper", "category": "belleza", "price": 129900, "old_price": 169900, "stock": 20},
    {"slug": "maquina-metalica", "name": "Máquina metálica", "category": "belleza", "price": 109900, "old_price": 139900, "stock": 25},
    {"slug": "maquina-umate", "name": "Máquina Umate", "category": "belleza", "price": 149900, "old_price": 189900, "stock": 15},
    {"slug": "masajeador-facial", "name": "Masajeador facial", "category": "belleza", "price": 69900, "old_price": 89900, "stock": 40},
    {"slug": "pulidora-drill", "name": "Pulidora drill", "category": "belleza", "price": 59900, "old_price": 79900, "stock": 35},
    {"slug": "quita-callo-portatil", "name": "Quita callo portátil", "category": "belleza", "price": 35900, "old_price": 45900, "stock": 60},
    {"slug": "removedor-electrico-facial", "name": "Removedor eléctrico facial", "category": "belleza", "price": 79900, "old_price": 99900, "stock": 25},
    # Perfumería
    {"slug": "odyssey-litchi-lush", "name": "Odyssey Litchi Lush", "category": "perfumeria", "price": 87500, "old_price": None, "stock": 20},
    {"slug": "odyssey-mega", "name": "Odyssey Mega", "category": "perfumeria", "price": 90000, "old_price": None, "stock": 20},
    {"slug": "odyssey-homne", "name": "Odyssey Homne", "category": "perfumeria", "price": 75000, "old_price": None, "stock": 25},
    {"slug": "odyssey-tyrant", "name": "Odyssey Tyrant", "category": "perfumeria", "price": 75000, "old_price": None, "stock": 25},
    {"slug": "odyssey-spectra", "name": "Odyssey Spectra", "category": "perfumeria", "price": 75000, "old_price": None, "stock": 20},
    {"slug": "odyssey-go-mango", "name": "Odyssey Go Mango", "category": "perfumeria", "price": 87500, "old_price": None, "stock": 20},
    {"slug": "odyssey-mandarin-sky", "name": "Odyssey Mandarin Sky", "category": "perfumeria", "price": 87500, "old_price": None, "stock": 20},
    {"slug": "odyssey-limoni", "name": "Odyssey Limoni", "category": "perfumeria", "price": 80000, "old_price": None, "stock": 20},
    {"slug": "corvus", "name": "Corvus", "category": "perfumeria", "price": 45000, "old_price": None, "stock": 30},
    {"slug": "pegasus", "name": "Pegasus", "category": "perfumeria", "price": 50000, "old_price": None, "stock": 30},
    {"slug": "vega", "name": "Vega", "category": "perfumeria", "price": 45000, "old_price": None, "stock": 30},
    {"slug": "aqua-dubai", "name": "Aqua Dubai", "category": "perfumeria", "price": 85000, "old_price": None, "stock": 20},
    {"slug": "amber-oud", "name": "Amber Oud", "category": "perfumeria", "price": 50000, "old_price": None, "stock": 30},
    {"slug": "ultra-violet", "name": "Ultra Violet", "category": "perfumeria", "price": 90000, "old_price": None, "stock": 15},
    {"slug": "amber-oud-private", "name": "Amber Oud Private", "category": "perfumeria", "price": 60000, "old_price": None, "stock": 20},
    {"slug": "bharara-blue", "name": "Bharara Blue", "category": "perfumeria", "price": 75000, "old_price": None, "stock": 25},
    {"slug": "bharara-king", "name": "Bharara King", "category": "perfumeria", "price": 90000, "old_price": None, "stock": 15},
    {"slug": "niche-femme", "name": "Niche Femme", "category": "perfumeria", "price": 90000, "old_price": None, "stock": 15},
    {"slug": "sckarlet", "name": "Sckarlet", "category": "perfumeria", "price": 90000, "old_price": None, "stock": 15},
    {"slug": "viking-dubai", "name": "Viking Dubai", "category": "perfumeria", "price": 60000, "old_price": None, "stock": 20},
    # Tecnología
    {"slug": "timbre-voz-inteligente", "name": "Timbre Voz Inteligente", "category": "tecnologia", "price": 89900, "old_price": None, "stock": 20},
    {"slug": "proyector-android", "name": "Proyector Android", "category": "tecnologia", "price": 299900, "old_price": None, "stock": 10},
    {"slug": "mini-parlante", "name": "Mini Parlante", "category": "tecnologia", "price": 45900, "old_price": None, "stock": 50},
    {"slug": "combo-k28", "name": "Combo K28", "category": "tecnologia", "price": 129900, "old_price": None, "stock": 20},
    {"slug": "bolso-led", "name": "Bolso LED", "category": "tecnologia", "price": 69900, "old_price": None, "stock": 30},
    {"slug": "audifonos-personales", "name": "Audífonos Personales", "category": "tecnologia", "price": 79900, "old_price": None, "stock": 40},
    {"slug": "audifonos-pantalla", "name": "Audífonos con Pantalla", "category": "tecnologia", "price": 119900, "old_price": None, "stock": 20},
    {"slug": "audifonos-caja-azul", "name": "Audífonos Caja Azul", "category": "tecnologia", "price": 65900, "old_price": None, "stock": 30},
    {"slug": "aro-luz-i8", "name": "Aro de Luz I8", "category": "tecnologia", "price": 59900, "old_price": None, "stock": 30},
    {"slug": "aro-de-luz", "name": "Aro de Luz", "category": "tecnologia", "price": 49900, "old_price": None, "stock": 40},
    # Eléctricos
    {"slug": "brothereta", "name": "Brothereta", "category": "electricos", "price": 89900, "old_price": None, "stock": 20},
    {"slug": "jorz", "name": "Jorz", "category": "electricos", "price": 129900, "old_price": None, "stock": 15},
    {"slug": "malumeta-v2", "name": "Malumeta v2", "category": "electricos", "price": 159900, "old_price": None, "stock": 10},
    {"slug": "malumeta", "name": "Malumeta", "category": "electricos", "price": 149900, "old_price": None, "stock": 15},
    {"slug": "maumeta-3d", "name": "Maumeta 3D", "category": "electricos", "price": 179900, "old_price": None, "stock": 5},
    {"slug": "new-electrico", "name": "New Eléctrico", "category": "electricos", "price": 99900, "old_price": None, "stock": 20},
    {"slug": "three-wheeler", "name": "Three Wheeler", "category": "electricos", "price": 119900, "old_price": None, "stock": 15},
    {"slug": "xiam-pro", "name": "Xiam Pro", "category": "electricos", "price": 139900, "old_price": None, "stock": 10},
    {"slug": "xiam", "name": "Xiam", "category": "electricos", "price": 119900, "old_price": None, "stock": 15},
    {"slug": "yiwu", "name": "Yiwu", "category": "electricos", "price": 79900, "old_price": None, "stock": 25},
]

CATEGORY_MAP = {
    "belleza": "belleza",
    "perfumeria": "perfumeria",
    "tecnologia": "tecnologia",
    "electricos": "electricos",
}

def find_nobg_image(slug):
    """Busca la imagen -nobg para un slug"""
    for ext in ['.png']:
        for file in PRODUCTS_DIR.rglob(f"*{ext}"):
            if '-nobg' in file.stem:
                file_slug = file.stem.replace('-nobg', '').lower()
                file_slug = file_slug.replace(' ', '-').replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u').replace('ñ', 'n')
                if file_slug == slug.lower():
                    rel_path = file.relative_to(PRODUCTS_DIR.parent.parent)
                    return f"/{rel_path.as_posix()}"
    return None

def main():
    print("=== Seed de productos e imágenes ===\n")
    
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = False
    cur = conn.cursor()
    
    try:
        # Verificar/crear categorías
        print("Verificando categorías...")
        for cat_slug in CATEGORY_MAP.values():
            cur.execute("SELECT id FROM categories WHERE slug = %s", (cat_slug,))
            if not cur.fetchone():
                cur.execute("INSERT INTO categories (slug, name, is_active) VALUES (%s, %s, true)", (cat_slug, cat_slug.capitalize()))
                print(f"  ✓ Categoría creada: {cat_slug}")
            else:
                print(f"  - Categoría existe: {cat_slug}")
        
        # Obtener IDs de categorías
        cur.execute("SELECT id, slug FROM categories")
        cat_ids = {row[1]: row[0] for row in cur.fetchall()}
        
        # Crear productos
        print("\nCreando productos...")
        created = 0
        skipped = 0
        
        for p in MOCK_PRODUCTS:
            cur.execute("SELECT id FROM products WHERE slug = %s", (p["slug"],))
            existing = cur.fetchone()
            
            if existing:
                product_id = existing[0]
                skipped += 1
            else:
                cat_id = cat_ids.get(CATEGORY_MAP.get(p["category"]))
                if not cat_id:
                    print(f"  ⚠ Categoría no encontrada para {p['slug']}: {p['category']}")
                    continue
                
                cur.execute("""
                    INSERT INTO products (sku, name, slug, price, compare_at_price, stock, category_id, is_active)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, true)
                    RETURNING id
                """, (
                    f"SKU-{p['slug'].upper()}",
                    p["name"],
                    p["slug"],
                    str(p["price"]),
                    str(p["old_price"]) if p["old_price"] else None,
                    p["stock"],
                    cat_id
                ))
                product_id = cur.fetchone()[0]
                created += 1
                print(f"  ✓ Producto creado: {p['slug']} (ID: {product_id})")
            
            # Registrar imagen -nobg
            nobg_path = find_nobg_image(p["slug"])
            if nobg_path:
                original_path = nobg_path.replace('-nobg.png', '.png')
                cur.execute(
                    "SELECT id FROM product_images WHERE product_id = %s AND image = %s",
                    (product_id, original_path)
                )
                if not cur.fetchone():
                    cur.execute("""
                        INSERT INTO product_images (product_id, image, processed_image, alt_text, is_primary, processing_status)
                        VALUES (%s, %s, %s, %s, true, 'completed')
                    """, (product_id, original_path, nobg_path, p["name"]))
                    print(f"    → Imagen registrada: {nobg_path}")
                else:
                    print(f"    → Imagen ya existe para: {p['slug']}")
            else:
                print(f"    ⚠ No se encontró imagen -nobg para: {p['slug']}")
        
        conn.commit()
        print(f"\n=== Resumen ===")
        print(f"Productos creados: {created}")
        print(f"Productos ya existentes: {skipped}")
        
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
        raise
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    main()