import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[80vh] bg-gray-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white z-10">
            <h1 className="text-4xl md:text-6xl font-light tracking-[0.2em] uppercase mb-6">
              25 S/S Collection
            </h1>
            <p className="text-sm md:text-base tracking-wider mb-8 opacity-80">
              Essential pieces for the modern wardrobe
            </p>
            <Link href="/products">
              <Button
                variant="outline"
                className="rounded-none border-white text-white hover:bg-white hover:text-black h-12 px-10 text-sm tracking-widest uppercase bg-transparent"
              >
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
        {/* Placeholder gradient background */}
        <div className="w-full h-full bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900" />
      </section>

      {/* Categories Grid */}
      <section className="container-wide py-20">
        <h2 className="text-center text-xs font-medium tracking-[0.3em] uppercase mb-12">
          Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {[
            { name: "아우터", slug: "outer" },
            { name: "상의", slug: "tops" },
            { name: "하의", slug: "bottoms" },
            { name: "원피스", slug: "dresses" },
            { name: "액세서리", slug: "accessories" },
            { name: "가방", slug: "bags" },
          ].map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group relative aspect-[3/4] bg-gray-100 overflow-hidden"
            >
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors z-10" />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <h3 className="text-white text-sm tracking-wider">{category.name}</h3>
              </div>
              <div className="w-full h-full bg-gradient-to-b from-gray-200 to-gray-400 group-hover:scale-105 transition-transform duration-500" />
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container-wide py-20">
        <div className="text-center mb-12">
          <h2 className="text-xs font-medium tracking-[0.3em] uppercase mb-2">
            Featured
          </h2>
          <p className="text-sm text-gray-400">이번 시즌 추천 아이템</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Link key={i} href={`/products/sample-${i + 1}`} className="group">
              <div className="aspect-[3/4] bg-gray-100 mb-3 overflow-hidden">
                <div className="w-full h-full bg-gradient-to-b from-gray-100 to-gray-200 group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h3 className="text-sm">Sample Product {i + 1}</h3>
              <p className="text-sm text-gray-500 mt-1">59,000원</p>
            </Link>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/products">
            <Button variant="outline" className="rounded-none h-10 px-8 text-xs tracking-widest uppercase">
              View All
            </Button>
          </Link>
        </div>
      </section>

      {/* Brand Story Banner */}
      <section className="bg-gray-50 py-20">
        <div className="container-wide text-center max-w-2xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-light tracking-wider mb-6">
            Timeless Design,<br />Everyday Comfort
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-8">
            likelihood는 시간이 지나도 변하지 않는 가치를 추구합니다.
            미니멀한 디자인과 뛰어난 소재로 일상의 스타일을 완성합니다.
          </p>
          <Link href="/about">
            <Button variant="link" className="text-xs tracking-widest uppercase underline underline-offset-4">
              Our Story
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
