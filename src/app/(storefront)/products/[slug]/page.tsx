import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductDetailClient } from "./product-detail-client";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/format";
import { ProductReviews } from "@/components/product/product-reviews";
import { SizeGuide } from "@/components/product/size-guide";
import type { Metadata } from "next";

export const revalidate = 60; // Revalidate every 60 seconds

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select("name_ko, meta_title_ko, meta_description_ko, base_price")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) return { title: "상품을 찾을 수 없습니다" };

  return {
    title: product.meta_title_ko || product.name_ko,
    description: product.meta_description_ko || `${product.name_ko} - ${formatPrice(product.base_price)}`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(name_ko, slug),
      images:product_images(id, url, alt_text_ko, sort_order, is_primary),
      variants:product_variants(id, sku, size, color_name_ko, color_name_en, color_hex, price_override, stock_quantity, is_active)
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const sortedImages = (product.images || []).sort(
    (a: any, b: any) => a.sort_order - b.sort_order
  );

  return (
    <div className="container-wide py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-400 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-black transition-colors">홈</Link>
        <span>/</span>
        <Link href={`/categories/${(product.category as any)?.slug}`} className="hover:text-black transition-colors">
          {(product.category as any)?.name_ko}
        </Link>
        <span>/</span>
        <span className="text-black">{product.name_ko}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
        {/* Gallery */}
        <ProductGallery
          images={sortedImages.map((img: any) => ({
            url: img.url,
            altKo: img.alt_text_ko,
          }))}
        />

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-xl md:text-2xl font-light tracking-wider mb-2">
              {product.name_ko}
            </h1>
            <p className="text-sm text-gray-400">{product.name_en}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-lg">{formatPrice(product.base_price)}</span>
            {product.compare_at_price && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            )}
          </div>

          <div className="flex justify-end">
            <SizeGuide categorySlug={(product.category as any)?.slug} />
          </div>

          <Separator />

          {/* Client-side variant selector + add to cart */}
          <ProductDetailClient
            productId={product.id}
            productNameKo={product.name_ko}
            productNameEn={product.name_en}
            basePrice={product.base_price}
            variants={product.variants || []}
            primaryImageUrl={sortedImages[0]?.url || null}
          />

          <Separator />

          {/* Description */}
          {product.description_ko && (
            <div>
              <h3 className="text-xs font-medium tracking-wider uppercase mb-3">
                Description
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description_ko}
              </p>
            </div>
          )}

          {/* Material */}
          {product.material_ko && (
            <div>
              <h3 className="text-xs font-medium tracking-wider uppercase mb-3">
                Material
              </h3>
              <p className="text-sm text-gray-600">{product.material_ko}</p>
            </div>
          )}

          {/* Care */}
          {product.care_instructions_ko && (
            <div>
              <h3 className="text-xs font-medium tracking-wider uppercase mb-3">
                Care
              </h3>
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {product.care_instructions_ko}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <section className="container-wide py-16 border-t mt-16">
        <h2 className="text-xs font-medium tracking-[0.3em] uppercase mb-8">Reviews</h2>
        <ProductReviews productId={product.id} />
      </section>
    </div>
  );
}
