export function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCOPWithSuffix(value: number) {
  const n = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
  return `$ ${n} COP`;
}
