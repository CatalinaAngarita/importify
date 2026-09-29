import { BestSellersCarousel } from "@/components/BestSellersCarousel";
import { FeaturedProductsShowcase } from "@/components/FeaturedProductsShowcase";

export default function ProductosPage() {
  return (
    <main className="products-page">
      <FeaturedProductsShowcase showMore={false} />
      <BestSellersCarousel />
    </main>
  );
}
