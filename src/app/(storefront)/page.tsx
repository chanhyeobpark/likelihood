import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimateOnScroll, StaggerContainer, StaggerItem } from "@/components/shared/animate-on-scroll";
import { Marquee } from "@/components/shared/marquee";
import { HeroSection } from "./hero-section";
import { createClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/product/product-card";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: featuredProducts } = await supabase
    .from("products")
    .select("slug, name_ko, name_en, base_price, compare_at_price, is_new, images:product_images(url, is_primary), variants:product_variants(stock_quantity)")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(8);
  return (
    <div>
      {/* Hero */}
      <HeroSection />

      {/* Marquee Banner */}
      <div className="py-4 border-y border-gray-100">
        <Marquee speed={25} className="text-xs tracking-[0.3em] uppercase text-gray-400">
          <span>Free Shipping</span>
          <span className="text-gray-200">·</span>
          <span>New Arrivals</span>
          <span className="text-gray-200">·</span>
          <span>Likelihood</span>
          <span className="text-gray-200">·</span>
          <span>Contemporary Fashion</span>
          <span className="text-gray-200">·</span>
          <span>Custom Orders</span>
          <span className="text-gray-200">·</span>
          <span>제작의뢰</span>
          <span className="text-gray-200">·</span>
          <span>Free Shipping</span>
          <span className="text-gray-200">·</span>
          <span>New Arrivals</span>
          <span className="text-gray-200">·</span>
          <span>Likelihood</span>
          <span className="text-gray-200">·</span>
          <span>Contemporary Fashion</span>
          <span className="text-gray-200">·</span>
          <span>Custom Orders</span>
          <span className="text-gray-200">·</span>
          <span>제작의뢰</span>
        </Marquee>
      </div>

      {/* Categories */}
      <section className="container-wide py-20">
        <AnimateOnScroll>
          <h2 className="text-center text-xs font-medium tracking-[0.3em] uppercase mb-12">
            Categories
          </h2>
        </AnimateOnScroll>
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[
            { name: "아우터", en: "Outer", slug: "outer" },
            { name: "상의", en: "Tops", slug: "tops" },
            { name: "하의", en: "Bottoms", slug: "bottoms" },
            { name: "원피스", en: "Dresses", slug: "dresses" },
            { name: "액세서리", en: "Accessories", slug: "accessories" },
            { name: "가방", en: "Bags", slug: "bags" },
          ].map((category) => (
            <StaggerItem key={category.slug}>
              <Link
                href={`/categories/${category.slug}`}
                className="group relative aspect-[3/4] bg-gray-100 overflow-hidden block"
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 z-10" />
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-white text-sm tracking-wider">{category.name}</h3>
                  <p className="text-white/60 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">{category.en}</p>
                </div>
                <div className="w-full h-full bg-gradient-to-b from-gray-200 to-gray-400 group-hover:scale-110 transition-transform duration-700" />
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Featured Products */}
      <section className="container-wide py-20">
        <AnimateOnScroll>
          <div className="text-center mb-12">
            <h2 className="text-xs font-medium tracking-[0.3em] uppercase mb-2">Featured</h2>
            <p className="text-sm text-gray-400">이번 시즌 추천 아이템</p>
          </div>
        </AnimateOnScroll>
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {(featuredProducts && featuredProducts.length > 0 ? featuredProducts : Array.from({ length: 8 }, (_, i) => ({ slug: `sample-${i+1}`, name_ko: `Sample Product ${i+1}`, name_en: "", base_price: 59000, compare_at_price: null, is_new: false, images: [], variants: [] }))).map((product: any, i: number) => {
            const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0];
            return (
              <StaggerItem key={product.slug || i}>
                <ProductCard
                  slug={product.slug}
                  nameKo={product.name_ko}
                  nameEn={product.name_en || ""}
                  price={product.base_price}
                  compareAtPrice={product.compare_at_price}
                  imageUrl={primaryImage?.url}
                  isNew={product.is_new}
                  isSoldOut={(product.variants?.reduce((s: number, v: any) => s + v.stock_quantity, 0) || 0) === 0}
                />
              </StaggerItem>
            );
          })}
        </StaggerContainer>
        <AnimateOnScroll delay={0.3}>
          <div className="text-center mt-12">
            <Link href="/products">
              <Button variant="outline" className="rounded-none h-10 px-8 text-xs tracking-widest uppercase hover:bg-black hover:text-white transition-colors duration-300">
                View All
              </Button>
            </Link>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Custom Order CTA */}
      <section className="bg-black text-white py-20">
        <div className="container-wide">
          <AnimateOnScroll>
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-xs font-medium tracking-[0.3em] uppercase mb-4 text-gray-400">
                Custom Order
              </h2>
              <p className="text-2xl md:text-3xl font-light tracking-wider mb-4">
                원하는 디자인을 현실로
              </p>
              <p className="text-sm text-gray-400 leading-relaxed mb-8">
                likelihood만의 노하우로 당신만의 특별한 의류를 제작해 드립니다.
                소량 주문부터 단체복까지, 원하시는 디자인을 알려주세요.
              </p>
              <Link href="/custom-order">
                <Button
                  variant="outline"
                  className="rounded-none border-white text-white hover:bg-white hover:text-black h-12 px-10 text-sm tracking-widest uppercase bg-transparent transition-colors duration-300"
                >
                  제작 의뢰하기
                </Button>
              </Link>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20">
        <div className="container-wide text-center max-w-2xl mx-auto">
          <AnimateOnScroll>
            <h2 className="text-2xl md:text-3xl font-light tracking-wider mb-6">
              Timeless Design,<br />Everyday Comfort
            </h2>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.2}>
            <p className="text-sm text-gray-500 leading-relaxed mb-8">
              likelihood는 시간이 지나도 변하지 않는 가치를 추구합니다.
              미니멀한 디자인과 뛰어난 소재로 일상의 스타일을 완성합니다.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll delay={0.3}>
            <Link href="/about">
              <Button variant="link" className="text-xs tracking-widest uppercase underline underline-offset-4">
                Our Story
              </Button>
            </Link>
          </AnimateOnScroll>
        </div>
      </section>
    </div>
  );
}
