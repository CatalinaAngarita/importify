import re

# Update catalog.products.ts
with open('services/catalog.products.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace perfumeria product images
new_content = re.sub(
    r'(/images/products/perfumeria/[^"\s]+\.png)',
    lambda m: m.group(1).replace('.png', '-nobg.png'),
    content
)

# Replace tecnologia product images
new_content = re.sub(
    r'(/images/products/tecnologia/[^"\s]+\.png)',
    lambda m: m.group(1).replace('.png', '-nobg.png'),
    new_content
)

# Replace electricos product images (note: folder name has accent)
new_content = re.sub(
    r'(/images/products/El[^"\s]*/[^"\s]+\.png)',
    lambda m: m.group(1).replace('.png', '-nobg.png'),
    new_content
)

with open('services/catalog.products.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("catalog.products.ts actualizado")