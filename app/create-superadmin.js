// Crea roles y un SUPERADMIN para el login del panel por código OTP al correo.
// Uso: node create-superadmin.js [correo@ejemplo.com] [contraseña]
require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const { randomUUID } = require("crypto");

const email = (process.argv[2] || process.env.SUPERADMIN_EMAIL || "superadmin@importify.com").toLowerCase();
const password = process.argv[3] || process.env.SUPERADMIN_PASSWORD || null;
const pool = process.env.DATABASE_URL
  ? mysql.createPool(process.env.DATABASE_URL)
  : mysql.createPool({
      host: "127.0.0.1",
      port: 3306,
      user: "importify",
      password: "importify",
      database: "importify",
      timezone: "Z",
    });

async function upsertRole(name) {
  const [existing] = await pool.query("SELECT id FROM roles WHERE name = ?", [name]);
  if (existing.length > 0) return existing[0].id;
  const id = randomUUID();
  await pool.query("INSERT INTO roles (id, name) VALUES (?, ?)", [id, name]);
  return id;
}

async function main() {
  const superadminRoleId = await upsertRole("SUPERADMIN");
  await upsertRole("ADMIN");
  await upsertRole("CUSTOMER");

  const plain = password || require("crypto").randomBytes(24).toString("hex");
  const passwordHash = await bcrypt.hash(plain, 12);
  const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
  if (existing.length > 0) {
    await pool.query(
      "UPDATE users SET password_hash = ?, role_id = ?, is_active = true WHERE email = ?",
      [passwordHash, superadminRoleId, email],
    );
    console.log(`updated: ${email} -> SUPERADMIN`);
  } else {
    await pool.query(
      "INSERT INTO users (id, email, password_hash, role_id, first_name, last_name, is_active) VALUES (?,?,?,?,?,?,true)",
      [randomUUID(), email, passwordHash, superadminRoleId, "Super", "Admin"],
    );
    console.log(`created: ${email} -> SUPERADMIN`);
  }
  await pool.end();
  console.log(`Listo. Email: ${email} | Contraseña: ${plain}`);
  console.log("Ingresa al panel con tu correo y el código de acceso (OTP).");
}
main().catch((err) => {
  console.error(err);
  process.exit(1);
});
