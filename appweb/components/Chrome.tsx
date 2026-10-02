"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const STANDALONE_PATHS = ["/login", "/registro"];

export function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const standalone = STANDALONE_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (standalone) return <>{children}</>;

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
