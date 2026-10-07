#!/usr/bin/env python3
"""
Script para registrar las imágenes -nobg existentes en la base de datos.
Relaciona las imágenes procesadas con sus productos por slug.
"""

import os
import sys
from pathlib import Path

# Agregar el directorio del proyecto al path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Configuración de la base de datos
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://importify:importify@localhost:5432/importify")

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)

PRODUCTS_DIR = Path(__file__).parent.parent / "appweb" / "public" / "images" / "products"

def find_nobg_images():
    """Encuentra todas las imágenes -nobg y las relaciona por slug"""
    images = []
    for ext in ['.png']:
        for file in PRODUCTS_DIR.rglob(f"*{ext}"):
            if '-nobg' in file.stem:
                # Extraer el slug del nombre del archivo
                slug = file.stem.replace('-nobg', '')
                # Normalizar el slug (reemplazar espacios con guiones, etc.)
                slug = slug.lower().replace(' ', '-').replace('á', 'a').replace('é', 'e').replace('í', 'i').replace('ó', 'o').replace('ú', 'u').replace('ñ', 'n')
                rel_path = file.relative_to(PRODUCTS_DIR.parent.parent)  # relative to public/
                images.append({
                    'slug': slug,
                    'original_name': file.stem,
                    'path': f"/{rel_path.as_posix()}",
                    'folder': file.parent.name
                })
    return images

def main():
    print("Buscando imágenes -nobg...")
    nobg_images = find_nobg_images()
    print(f"Encontradas {len(nobg_images)} imágenes -nobg")
    
    for img in nobg_images:
        print(f"  {img['slug']} -> {img['path']} (carpeta: {img['folder']})")
    
    print("\nConectando a la base de datos...")
    session = Session()
    
    try:
        # Obtener todos los productos de la BD
        result = session.execute(text("SELECT id, slug, name FROM products"))
        products = {row.slug: row.id for row in result}
        print(f"Productos en BD: {len(products)}")
        
        # Insertar imágenes
        inserted = 0
        skipped = 0
        for img in nobg_images:
            if img['slug'] in products:
                product_id = products[img['slug']]
                # Verificar si ya existe
                existing = session.execute(
                    text("SELECT id FROM product_images WHERE product_id = :pid AND image = :img"),
                    {"pid": product_id, "img": img['path']}
                ).fetchone()
                
                if not existing:
                    session.execute(text("""
                        INSERT INTO product_images (product_id, image, processed_image, alt_text, is_primary, processing_status)
                        VALUES (:pid, :original, :processed, :alt, true, 'completed')
                    """), {
                        "pid": product_id,
                        "original": img['path'].replace('-nobg.png', '.png'),
                        "processed": img['path'],
                        "alt": img['original_name']
                    })
                    inserted += 1
                    print(f"  ✓ Insertado: {img['slug']} ({img['path']})")
                else:
                    skipped += 1
                    print(f"  - Ya existe: {img['slug']}")
            else:
                print(f"  ⚠ Producto no encontrado en BD: {img['slug']}")
        
        session.commit()
        print(f"\nResumen: {inserted} insertadas, {skipped} ya existían")
        
    except Exception as e:
        session.rollback()
        print(f"Error: {e}")
        raise
    finally:
        session.close()

if __name__ == "__main__":
    main()