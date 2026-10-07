import re

# Update catalog.mock.ts
with open('services/catalog.mock.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Belleza product images
new_content = re.sub(
    r'(/images/products/Belleza/[^"\s]+\.png)',
    lambda m: m.group(1).replace('.png', '-nobg.png'),
    content
)

with open('services/catalog.mock.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print("catalog.mock.ts actualizado")