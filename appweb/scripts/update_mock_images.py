#!/usr/bin/env python3
"""
Actualiza las rutas de imágenes en los archivos mock para usar versiones -nobg
"""

import re
from pathlib import Path

# Archivos a actualizar
FILES = [
    "services/catalog.mock.ts",
    "services/catalog.products.ts",
]

def update_file(filepath):
    path = Path(filepath)
    content = path.read_text(encoding='utf-8')
    
    # Patrón para encontrar rutas de imágenes PNG y reemplazarlas con -nobg
    # Solo afecta archivos .png, no .svg
    def replace_png(match):
        full_path = match.group(1)
        if full_path.endswith('.png') and '-nobg' not in full_path:
            # Reemplazar .png por -nobg.png
            return match.group(0).replace('.png', '-nobg.png')
        return match.group(0)
    
    # Buscar patrones como "/images/products/.../archivo.png"
    pattern = r'(["\']/images/products/[^"\']+\.png["\'])'
    new_content = re.sub(pattern, replace_png, content)
    
    if new_content != content:
        path.write_text(new_content, encoding='utf-8')
        print(f"✓ Actualizado: {filepath}")
    else:
        print(f"- Sin cambios: {filepath}")

for f in FILES:
    update_file(f)

print("Listo!")