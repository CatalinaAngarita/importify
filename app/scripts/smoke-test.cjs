const baseUrl = (process.argv[2] || process.env.API_URL || "http://localhost:3001").replace(/\/$/, "");

async function getJson(path) {
  const response = await fetch(`${baseUrl}${path}`);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`${path} -> HTTP ${response.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

async function main() {
  const health = await getJson("/api/health");
  console.log(`health: ${JSON.stringify(health)}`);

  const products = await getJson("/api/products?limit=1");
  console.log(`products: ${products.meta?.total ?? "sin meta"}`);

  const categories = await getJson("/api/categories");
  console.log(`categories: ${categories.meta?.total ?? "sin meta"}`);

  if (process.env.SMOKE_ADMIN_EMAIL && process.env.SMOKE_ADMIN_PASSWORD) {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.SMOKE_ADMIN_EMAIL,
        password: process.env.SMOKE_ADMIN_PASSWORD,
      }),
    });
    if (!response.ok) {
      throw new Error(`login admin -> HTTP ${response.status}`);
    }
    const login = await response.json();
    console.log(`login: ${login.user?.roleName ?? "sin rol"}`);
  }

  console.log(`smoke test OK: ${baseUrl}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
