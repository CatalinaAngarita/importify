#!/usr/bin/env python3
"""
Script para eliminar fondo de imágenes PNG de productos usando rembg.
Genera versiones con sufijo '-nobg.png' manteniendo las originales.
"""

import os
import sys
from pathlib import Path
from rembg import remove
from PIL import Image

PRODUCTS_DIR = Path(__file__).parent.parent / "public" / "images" / "products"
OUTPUT_SUFFIX = "-nobg"

def find_png_files(directory):
    """Encuentra todos los archivos PNG que no tengan ya el sufijo -nobg"""
    png_files = []
    seen = set()
    for file in directory.rglob("*.png"):
        if file.name.lower().endswith('.png') and OUTPUT_SUFFIX not in file.stem:
            key = file.resolve()
            if key not in seen:
                seen.add(key)
                png_files.append(file)
    return png_files

def process_image(input_path, output_path):
    """Procesa una imagen para eliminar el fondo"""
    try:
        with open(input_path, 'rb') as f:
            input_data = f.read()
        
        output_data = remove(input_data)
        
        with open(output_path, 'wb') as f:
            f.write(output_data)
        
        # Verificar que se genero correctamente
        with Image.open(output_path) as img:
            if img.mode != 'RGBA':
                print(f"  Advertencia: {output_path.name} no tiene canal alfa")
        
        print(f"  OK: {input_path.relative_to(PRODUCTS_DIR)} -> {output_path.name}")
        return True
    except Exception as e:
        print(f"  Error procesando {input_path.name}: {e}")
        return False

def main():
    print(f"Buscando imagenes PNG en: {PRODUCTS_DIR}")
    png_files = find_png_files(PRODUCTS_DIR)
    print(f"Encontradas {len(png_files)} imagenes PNG para procesar\n")

    success = 0
    failed = 0

    for file in png_files:
        output_path = file.with_stem(file.stem + OUTPUT_SUFFIX)
        if process_image(file, output_path):
            success += 1
        else:
            failed += 1

    print(f"\nResumen: {success} exitosas, {failed} fallidas")
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())