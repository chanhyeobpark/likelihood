import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, FileSpreadsheet, Search } from "lucide-react";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "상품관리" };

interface Props {
  searchParams: Promise<{ q?: string; status?: string; category?: string; page?: string }>;
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q || "";
  const status = params.status || "all";
  const page = parseInt(params.page || "1");
  const perPage = 24;

  const supabase = await createClient();

  // Get categories for filter
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name_ko, slug")
    .eq("is_active", true)
    .order("sort_order");

  // Build product query
  let productQuery = supabase
    .from("products")
    .select("*, category:categories(name_ko), variants:product_variants(stock_quantity), images:product_images(url, is_primary)", { count: "exact" });

  if (query) {
    productQuery = productQuery.or(`name_ko.ilike.%${query}%,sku_prefix.ilike.%${query}%,name_en.ilike.%${query}%`);
  }
  if (status === "active") productQuery = productQuery.eq("is_active", true);
  if (status === "inactive") productQuery = productQuery.eq("is_active", false);
  if (params.category) productQuery = productQuery.eq("category_id", params.category);

  productQuery = productQuery.order("created_at", { ascending: false });
  const from = (page - 1) * perPage;
  productQuery = productQuery.range(from, from + perPage - 1);

  const { data: products, count: totalCount } = await productQuery;
  const totalPages = Math.ceil((totalCount || 0) / perPage);

  // Build filter URL helper
  const filterUrl = (overrides: Record<string, string>) => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    if (status !== "all") p.set("status", status);
    if (params.category) p.set("category", params.category);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v) p.set(k, v); else p.delete(k);
    });
    p.delete("page"); // Reset page on filter change
    const qs = p.toString();
    return `/admin/products${qs ? `?${qs}` : ""}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-light tracking-wider">상품관리</h1>
        <div className="flex gap-2">
          <Link href="/admin/products/bulk">
            <Button variant="outline" className="rounded-md h-9 text-sm">
              <FileSpreadsheet className="h-4 w-4 mr-2" /> 대량 등록
            </Button>
          </Link>
          <Link href="/admin/products/new">
            <Button className="bg-black text-white hover:bg-gray-900 rounded-md h-9 text-sm">
              <Plus className="h-4 w-4 mr-2" /> 상품 등록
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-4">
        <form className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input name="q" defaultValue={query} placeholder="상품명, SKU 검색..." className="pl-9 h-9" />
          </div>
          <div className="flex gap-2">
            {["all", "active", "inactive"].map((s) => (
              <Link
                key={s}
                href={filterUrl({ status: s === "all" ? "" : s })}
                className={`px-3 py-1.5 text-xs rounded-md border ${status === s ? "bg-black text-white border-black" : "hover:bg-gray-50"}`}
              >
                {s === "all" ? "전체" : s === "active" ? "판매중" : "비활성"}
              </Link>
            ))}
          </div>
          <Button type="submit" variant="outline" size="sm" className="h-9">검색</Button>
        </form>
      </div>

      {/* Count */}
      <p className="text-xs text-gray-400 mb-3">총 {totalCount || 0}개 상품</p>

      {/* Table */}
      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left p-4 w-12"><input type="checkbox" className="rounded" /></th>
              <th className="text-left p-4">상품</th>
              <th className="text-left p-4">카테고리</th>
              <th className="text-right p-4">가격</th>
              <th className="text-right p-4">재고</th>
              <th className="text-center p-4">상태</th>
              <th className="text-right p-4">관리</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => {
              const totalStock = product.variants?.reduce((sum: number, v: any) => sum + v.stock_quantity, 0) || 0;
              const primaryImage = product.images?.find((img: any) => img.is_primary) || product.images?.[0];
              return (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-4"><input type="checkbox" className="rounded" /></td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-gray-100 flex-shrink-0 rounded overflow-hidden">
                        {primaryImage?.url ? (
                          <Image src={primaryImage.url} alt="" width={40} height={48} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm">{product.name_ko}</p>
                        <p className="text-xs text-gray-400 font-mono">{product.sku_prefix}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{(product.category as any)?.name_ko}</td>
                  <td className="p-4 text-sm text-right">{formatPrice(product.base_price)}</td>
                  <td className="p-4 text-sm text-right">
                    <span className={totalStock <= 5 ? "text-red-500 font-medium" : ""}>{totalStock}</span>
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant={product.is_active ? "default" : "secondary"} className="text-[10px]">
                      {product.is_active ? "판매중" : "비활성"}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/products/${product.id}/edit`} className="text-xs text-gray-400 hover:text-black underline">수정</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!products || products.length === 0) && (
          <p className="text-sm text-gray-400 text-center py-12">상품이 없습니다</p>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {page > 1 && (
            <Link href={`/admin/products?page=${page - 1}${query ? `&q=${query}` : ""}${status !== "all" ? `&status=${status}` : ""}`}
              className="px-3 py-1.5 border text-sm hover:bg-gray-50 rounded">이전</Link>
          )}
          <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={`/admin/products?page=${page + 1}${query ? `&q=${query}` : ""}${status !== "all" ? `&status=${status}` : ""}`}
              className="px-3 py-1.5 border text-sm hover:bg-gray-50 rounded">다음</Link>
          )}
        </div>
      )}
    </div>
  );
}
