import { Hero } from "@/components/home/Hero";
import { Categories } from "@/components/home/Categories";
import { Featured } from "@/components/home/Featured";
import { Advantages } from "@/components/home/Advantages";
import { Testimonials } from "@/components/home/Testimonials";
import { CTA } from "@/components/home/CTA";
import { getFeaturedProducts } from "@/lib/data/products";

export default function HomePage() {
  const featured = getFeaturedProducts();
  return (
    <>
      <Hero />
      <Categories />
      <Featured products={featured} />
      <Advantages />
      <Testimonials />
      <CTA />
    </>
  );
}
