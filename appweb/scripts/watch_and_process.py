#!/usr/bin/env python3
"""
File watcher que detecta nuevas imágenes PNG en public/images/products/
y les quita el fondo automáticamente usando rembg.
"""

import os
import sys
import time
import threading
from pathlib import Path
from PIL import Image
from rembg import remove

PRODUCTS_DIR = Path(__file__).parent.parent / "public" / "images" / "products"
PROCESSED_SUFFIX = "-nobg"

# Track archivos ya procesados para no reprocesar
processed_files = set()

def is_valid_product_image(filepath: Path) -> bool:
    """Verifica si es una imagen de producto válida para procesar"""
    if not filepath.is_file():
        return False
    if filepath.suffix.lower() != '.png':
        return False
    if PROCESSED_SUFFIX in filepath.stem:
        return False
    if filepath.name.startswith('.'):
        return False
    return True

def process_image(input_path: Path) -> bool:
    """Procesa una imagen para quitar el fondo"""
    try:
        output_path = input_path.with_stem(input_path.stem + PROCESSED_SUFFIX)
        
        # Leer imagen original
        with open(input_path, 'rb') as f:
            input_data = f.read()
        
        # Remover fondo con rembg
        output_data = remove(input_data)
        
        # Guardar resultado
        with open(output_path, 'wb') as f:
            f.write(output_data)
        
        # Verificar que tiene transparencia real
        with Image.open(output_path) as img:
            if img.mode == 'RGBA':
                alpha = img.split()[-1]
                bbox = alpha.getbbox()
                if bbox:
                    print(f"  [OK] Procesado: {input_path.relative_to(PRODUCTS_DIR)} -> {output_path.name} (transparencia OK)")
                    return True
                else:
                    print(f"  [WARN] Procesado pero SIN transparencia: {input_path.name}")
                    return False
        
    except Exception as e:
        print(f"  [ERROR] Error procesando {input_path.name}: {e}")
        return False

def scan_and_process():
    """Escanea directorio y procesa imágenes nuevas"""
    count = 0
    for ext in ['.png', '.PNG']:
        for file in PRODUCTS_DIR.rglob(f"*{ext}"):
            if is_valid_product_image(file) and file not in processed_files:
                print(f"Nueva imagen detectada: {file.relative_to(PRODUCTS_DIR)}")
                if process_image(file):
                    processed_files.add(file)
                    count += 1
    return count

def process_all_existing():
    """Procesa TODAS las imágenes existentes que no tengan -nobg"""
    print("=== Procesando imágenes existentes ===")
    count = 0
    for ext in ['.png', '.PNG']:
        for file in PRODUCTS_DIR.rglob(f"*{ext}"):
            if file.is_file() and PROCESSED_SUFFIX not in file.stem:
                if process_image(file):
                    processed_files.add(file)
                    count += 1
    print(f"=== Completado: {count} imágenes procesadas ===")
    return count

def watch_loop():
    """Loop principal de vigilancia"""
    print(f"Vigilando: {PRODUCTS_DIR}")
    print("Presiona Ctrl+C para detener\n")
    
    # Procesar existentes al inicio
    process_all_existing()
    
    try:
        while True:
            new_count = scan_and_process()
            if new_count > 0:
                print(f"--- {new_count} imágenes nuevas procesadas ---\n")
            time.sleep(2)  # Check every 2 seconds
    except KeyboardInterrupt:
        print("\nVigilancia detenida.")

if __name__ == "__main__":
    watch_loop()