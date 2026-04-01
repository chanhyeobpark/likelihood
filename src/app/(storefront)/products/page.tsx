import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/product/product-grid";
import { SORT_OPTIONS } from "@/lib/constants";
import Link from "next/link";

export const metadata = {
  title: "전체상품",
  description: "likelihood 전체 상품을 확인하세요.",
};

interface Props {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    page?: string;
    gender?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const sort = params.sort || "newest";
  const page = parseInt(params.page || "1");
  const perPage = 24;

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(`
      *,
      images:product_images(url, is_primary),
      variants:product_variants(stock_quantity)
    `)
    .eq("is_active", true);

  if (params.category) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", params.category)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }

  if (params.gender) {
    query = query.eq("gender", params.gender as "M" | "F" | "U");
  }

  switch (sort) {
    case "price_asc":
      query = query.order("base_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("base_price", { ascending: false });
      break;
    case "popular":
      query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * perPage;
  query = query.range(from, from + perPage - 1);

  const { data: products, error } = await query;

  return (
    <div className="container-wide py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-light tracking-wider mb-2">전체상품</h1>
        <p className="text-sm text-gray-400">All Products</p>
      </div>

      {/* Sort */}
      <div className="flex items-center justify-between mb-8">
        <p className="text-xs text-gray-400">
          {products?.length || 0}개의 상품
        </p>
        <div className="flex gap-4">
          {SORT_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={`/products?sort=${opt.value}${params.category ? `&category=${params.category}` : ""}`}
              className={`text-xs ${
                sort === opt.value ? "text-black font-medium" : "text-gray-400 hover:text-black"
              } transition-colors`}
            >
              {opt.labelKo}
            </Link>
          ))}
        </div>
      </div>

      {/* Grid */}
      <ProductGrid products={products || []} />

      {/* Pagination placeholder */}
      {(products?.length || 0) >= perPage && (
        <div className="flex justify-center gap-2 mt-12">
          {page > 1 && (
            <Link
              href={`/products?page=${page - 1}&sort=${sort}`}
              className="px-4 py-2 border text-sm hover:bg-gray-50"
            >
              이전
            </Link>
          )}
          <Link
            href={`/products?page=${page + 1}&sort=${sort}`}
            className="px-4 py-2 border text-sm hover:bg-gray-50"
          >
            다음
          </Link>
        </div>
      )}
    </div>
  );
}
