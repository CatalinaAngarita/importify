import { removeBackground } from '@imgly/background-removal';
import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join, extname, basename, dirname } from 'path';

const PRODUCTS_DIR = join(process.cwd(), 'public', 'images', 'products');
const OUTPUT_SUFFIX = '-nobg';

async function processImage(inputPath, outputPath) {
  try {
    const inputBuffer = await readFile(inputPath);
    const resultBlob = await removeBackground(inputBuffer, {
      model: 'isnet',
    });
    const outputBuffer = Buffer.from(await resultBlob.arrayBuffer());
    await writeFile(outputPath, outputBuffer);
    console.log(`✓ Procesado: ${inputPath} → ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`✗ Error procesando ${inputPath}:`, error.message);
    return false;
  }
}

async function findPngFiles(dir) {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findPngFiles(fullPath));
    } else if (entry.isFile() && extname(entry.name).toLowerCase() === '.png' && !entry.name.includes(OUTPUT_SUFFIX)) {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  console.log('🔍 Buscando imágenes PNG en:', PRODUCTS_DIR);
  const pngFiles = await findPngFiles(PRODUCTS_DIR);
  console.log(`📁 Encontradas ${pngFiles.length} imágenes PNG para procesar\n`);

  let success = 0;
  let failed = 0;

  for (const file of pngFiles) {
    const dir = dirname(file);
    const name = basename(file, '.png');
    const outputPath = join(dir, `${name}${OUTPUT_SUFFIX}.png`);
    
    const ok = await processImage(file, outputPath);
    if (ok) success++;
    else failed++;
  }

  console.log(`\n📊 Resumen: ${success} exitosas, ${failed} fallidas`);
}

main().catch(console.error);