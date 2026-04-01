import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "분석" };

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders").select("total, created_at, status")
    .neq("status", "CANCELLED").neq("status", "REFUNDED")
    .order("created_at", { ascending: false }).limit(1000);

  const totalRevenue = orders?.reduce((sum, o) => sum + o.total, 0) || 0;
  const orderCount = orders?.length || 0;
  const avgOrderValue = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0;

  const { data: topItems } = await supabase.from("order_items").select("product_name_ko, quantity").order("quantity", { ascending: false }).limit(10);
  const { data: tierData } = await supabase.from("profiles").select("tier");
  const tierCounts: Record<string, number> = {};
  tierData?.forEach((p) => { tierCounts[p.tier] = (tierCounts[p.tier] || 0) + 1; });

  return (
    <div>
      <h1 className="text-2xl font-light tracking-wider mb-8">분석</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-gray-500">총 매출</CardTitle></CardHeader><CardContent><p className="text-2xl font-light">{formatPrice(totalRevenue)}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-gray-500">총 주문 수</CardTitle></CardHeader><CardContent><p className="text-2xl font-light">{orderCount}건</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-gray-500">평균 주문액</CardTitle></CardHeader><CardContent><p className="text-2xl font-light">{formatPrice(avgOrderValue)}</p></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader><CardTitle className="text-sm">인기 상품</CardTitle></CardHeader>
          <CardContent>
            {topItems && topItems.length > 0 ? (
              <div className="space-y-3">{topItems.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3"><span className="text-xs text-gray-400 w-6">{i + 1}</span><span className="text-sm">{item.product_name_ko}</span></div>
                  <span className="text-sm text-gray-500">{item.quantity}개</span>
                </div>
              ))}</div>
            ) : <p className="text-sm text-gray-400 text-center py-8">데이터 없음</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">회원 등급 분포</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {["STANDARD", "SILVER", "GOLD", "VIP"].map((tier) => {
                const count = tierCounts[tier] || 0;
                const total = tierData?.length || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={tier}>
                    <div className="flex justify-between text-sm mb-1"><span>{tier}</span><span className="text-gray-400">{count}명 ({pct}%)</span></div>
                    <div className="w-full bg-gray-100 h-2 rounded"><div className="bg-black h-2 rounded" style={{ width: `${pct}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
