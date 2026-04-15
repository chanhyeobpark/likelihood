import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductGrid } from "@/components/product/product-grid";
import { SORT_OPTIONS } from "@/lib/constants";
import Link from "next/link";
import type { Metadata } from "next";

export const revalidate = 60; // Revalidate every 60 seconds

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("categories")
    .select("name_ko, description_ko")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!category) return { title: "카테고리를 찾을 수 없습니다" };
  return {
    title: category.name_ko,
    description: category.description_ko || `${category.name_ko} 카테고리 상품`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sort = "newest", page: pageStr = "1" } = await searchParams;
  const page = parseInt(pageStr);
  const perPage = 24;

  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id, name_ko, name_en, description_ko")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (!category) notFound();

  // Get subcategories too
  const { data: subCategories } = await supabase
    .from("categories")
    .select("id")
    .eq("parent_id", category.id)
    .eq("is_active", true);

  const categoryIds = [category.id, ...(subCategories?.map((c) => c.id) || [])];

  let query = supabase
    .from("products")
    .select(`
      *,
      images:product_images(url, is_primary),
      variants:product_variants(stock_quantity)
    `)
    .eq("is_active", true)
    .in("category_id", categoryIds);

  switch (sort) {
    case "price_asc":
      query = query.order("base_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("base_price", { ascending: false });
      break;
    case "popular":
      query = query.order("is_featured", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * perPage;
  query = query.range(from, from + perPage - 1);

  const { data: products } = await query;

  return (
    <div className="container-wide py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-light tracking-wider mb-2">{category.name_ko}</h1>
        <p className="text-sm text-gray-400">{category.name_en}</p>
      </div>

      <div className="flex items-center justify-between mb-8">
        <p className="text-xs text-gray-400">
          {products?.length || 0}개의 상품
        </p>
        <div className="flex gap-4">
          {SORT_OPTIONS.map((opt) => (
            <Link
              key={opt.value}
              href={`/categories/${slug}?sort=${opt.value}`}
              className={`text-xs ${
                sort === opt.value ? "text-black font-medium" : "text-gray-400 hover:text-black"
              } transition-colors`}
            >
              {opt.labelKo}
            </Link>
          ))}
        </div>
      </div>

      <ProductGrid products={products || []} />
    </div>
  );
}
