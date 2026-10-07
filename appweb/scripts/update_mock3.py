import re

# Update catalog.mock.ts - fix the one with spaces
with open('services/catalog.mock.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the one with spaces
new_content = content.replace(
    '/images/products/Belleza/Brocha y arancela de maquillaje.png',
    '/images/products/Belleza/Brocha y arancela de maquillaje-nobg.png'
)

with open('services/catalog.mock.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("catalog.mock.ts - Brocha actualizado")