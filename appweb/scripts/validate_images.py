#!/usr/bin/env python3
"""
Validación completa del flujo de eliminación de fondo.
"""

from PIL import Image
import os
from pathlib import Path

PRODUCTS_DIR = Path("public/images/products")

samples = [
    ("Belleza", "cubre-pezon"),
    ("Belleza", "maquina-hair-clipper"),
    ("Belleza", "maquina-metalica"),
    ("perfumeria", "aqua-dubai"),
    ("perfumeria", "amber-oud"),
    ("tecnologia", "mini-parlante"),
    ("tecnologia", "proyector-android"),
    ("Eléctricos", "brothereta"),
    ("Eléctricos", "jorz"),
    ("banner", "grandes-productos"),
]

print("=" * 80)
print("VALIDACIÓN DE IMÁGENES: ORIGINAL vs -NOBG")
print("=" * 80)

all_ok = True

for folder, name in samples:
    orig = PRODUCTS_DIR / folder / f"{name}.png"
    nobg = PRODUCTS_DIR / folder / f"{name}-nobg.png"
    
    print(f"\n--- {folder}/{name} ---")
    
    for label, path in [("ORIGINAL", orig), ("NOBG", nobg)]:
        if path.exists():
            img = Image.open(path)
            print(f"  {label}: {path}")
            print(f"    Mode: {img.mode}, Size: {img.size}")
            if img.mode == "RGBA":
                alpha = img.split()[-1]
                bbox = alpha.getbbox()
                status = "TRANSPARENT" if bbox else "SOLID (NO TRANSPARENCY)"
                print(f"    Alpha bbox: {bbox} -> {status}")
                if label == "NOBG" and not bbox:
                    all_ok = False
            else:
                print(f"    No alpha channel")
                if label == "NOBG":
                    all_ok = False
        else:
            print(f"  {label}: NOT FOUND - {path}")
            all_ok = False

print("\n" + "=" * 80)
if all_ok:
    print("TODAS LAS IMÁGENES -NOBG TIENEN TRANSPARENCIA REAL")
else:
    print("PROBLEMA: Algunas imágenes -nobg NO tienen transparencia real")
print("=" * 80)