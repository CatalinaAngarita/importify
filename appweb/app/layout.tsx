import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IMPORTIFY — Productos importados",
  description: "E-commerce de productos importados con pagos Wompi para Colombia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
