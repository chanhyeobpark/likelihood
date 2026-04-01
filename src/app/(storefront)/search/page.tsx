import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/product/product-grid";
import type { Metadata } from "next";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `"${q}" 검색 결과` : "검색" };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;

  if (!q) {
    return (
      <div className="container-wide py-20 text-center">
        <p className="text-sm text-gray-400">검색어를 입력해주세요</p>
      </div>
    );
  }

  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select(`
      *,
      images:product_images(url, is_primary),
      variants:product_variants(stock_quantity)
    `)
    .eq("is_active", true)
    .or(`name_ko.ilike.%${q}%,name_en.ilike.%${q}%,description_ko.ilike.%${q}%`)
    .order("created_at", { ascending: false })
    .limit(48);

  return (
    <div className="container-wide py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-light tracking-wider mb-2">
          &ldquo;{q}&rdquo; 검색 결과
        </h1>
        <p className="text-sm text-gray-400">{products?.length || 0}개의 상품</p>
      </div>

      <ProductGrid products={products || []} />
    </div>
  );
}
