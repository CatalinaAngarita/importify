const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '..', 'drizzle');
const destination = path.join(__dirname, '..', 'dist', 'drizzle');

if (!fs.existsSync(source)) {
  throw new Error(`No existe la carpeta de migraciones: ${source}`);
}

fs.rmSync(destination, { recursive: true, force: true });
fs.cpSync(source, destination, { recursive: true });
console.log(`migraciones copiadas a ${destination}`);
