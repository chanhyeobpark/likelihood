import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "재고관리" };

export default async function AdminInventoryPage() {
  const supabase = await createClient();
  const { data: variants } = await supabase
    .from("product_variants")
    .select("*, product:products(name_ko, sku_prefix)")
    .eq("is_active", true)
    .order("stock_quantity", { ascending: true });

  return (
    <div>
      <h1 className="text-2xl font-light tracking-wider mb-8">재고관리</h1>
      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left p-4">상품</th>
              <th className="text-left p-4">SKU</th>
              <th className="text-center p-4">사이즈</th>
              <th className="text-center p-4">컬러</th>
              <th className="text-right p-4">재고</th>
              <th className="text-center p-4">상태</th>
            </tr>
          </thead>
          <tbody>
            {variants?.map((v) => (
              <tr key={v.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-sm">{(v.product as any)?.name_ko}</td>
                <td className="p-4 text-xs font-mono text-gray-400">{v.sku}</td>
                <td className="p-4 text-sm text-center">{v.size}</td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: v.color_hex || "#ccc" }} />
                    <span className="text-sm">{v.color_name_ko}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-right font-medium">{v.stock_quantity}</td>
                <td className="p-4 text-center">
                  {v.stock_quantity === 0 ? <Badge variant="destructive" className="text-[10px]">품절</Badge>
                    : v.stock_quantity <= v.low_stock_threshold ? <Badge className="text-[10px] bg-orange-100 text-orange-800">부족</Badge>
                    : <Badge className="text-[10px] bg-green-100 text-green-800">정상</Badge>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
