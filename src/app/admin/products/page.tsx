import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileSpreadsheet } from "lucide-react";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "상품관리" };

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(name_ko), variants:product_variants(stock_quantity), images:product_images(url, is_primary)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light tracking-wider">상품관리</h1>
        <div className="flex items-center gap-2">
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
      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b text-xs text-gray-500 uppercase tracking-wider">
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
              return (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-gray-100 flex-shrink-0" />
                      <div>
                        <p className="text-sm">{product.name_ko}</p>
                        <p className="text-xs text-gray-400 font-mono">{product.sku_prefix}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-500">{(product.category as any)?.name_ko}</td>
                  <td className="p-4 text-sm text-right">{formatPrice(product.base_price)}</td>
                  <td className="p-4 text-sm text-right">
                    <span className={totalStock <= 5 ? "text-red-500" : ""}>{totalStock}</span>
                  </td>
                  <td className="p-4 text-center">
                    <Badge variant={product.is_active ? "default" : "secondary"} className="text-[10px]">
                      {product.is_active ? "활성" : "비활성"}
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
          <p className="text-sm text-gray-400 text-center py-12">등록된 상품이 없습니다</p>
        )}
      </div>
    </div>
  );
}
