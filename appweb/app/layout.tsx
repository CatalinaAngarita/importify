import type { Metadata } from "next";
import { Chrome } from "@/components/Chrome";
import "./globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IMPORTIFY",
  description: "E-commerce de productos importados con pagos Wompi para Colombia.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={plusJakarta.variable}>
      <body>
        <Chrome>{children}</Chrome>
      </body>
    </html>
  );
}
