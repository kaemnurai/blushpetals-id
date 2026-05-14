import { Hero } from "@/components/home/Hero";
import { Categories } from "@/components/home/Categories";
import { Featured } from "@/components/home/Featured";
import { Advantages } from "@/components/home/Advantages";
import { Testimonials } from "@/components/home/Testimonials";
import { CTA } from "@/components/home/CTA";
import { getFeaturedProducts, getHeroProduct, getCategoryCovers } from "@/lib/supabase/queries";

// Revalidate every 5 minutes — product changes appear promptly
export const revalidate = 300;

export default async function HomePage() {
  const [featured, heroProduct, categoryCovers] = await Promise.all([
    getFeaturedProducts(),
    getHeroProduct(),
    getCategoryCovers(),
  ]);

  return (
    <>
      {/* Hero receives the is_hero_product flagged product.
          The Hero component currently shows a static image; this prop is
          available for future dynamic hero content without UI changes. */}
      <Hero heroProduct={heroProduct ?? undefined} />
      <Categories covers={categoryCovers} />
      <Featured products={featured} />
      <Advantages />
      <Testimonials />
      <CTA />
    </>
  );
}
