import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUS_MAP } from "@/lib/constants";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";

export const metadata = { title: "관리자 대시보드" };

export default async function AdminDashboard() {
  const supabase = await createClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  const [ordersToday, totalMembers, activeProducts] = await Promise.all([
    supabase.from("orders").select("total", { count: "exact" }).gte("created_at", todayISO).neq("status", "CANCELLED"),
    supabase.from("profiles").select("id", { count: "exact" }),
    supabase.from("products").select("id", { count: "exact" }).eq("is_active", true),
  ]);

  const todayRevenue = ordersToday.data?.reduce((sum, o) => sum + o.total, 0) || 0;

  const { count: pendingCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .in("status", ["PAID", "PREPARING"]);

  const { data: lowStock } = await supabase
    .from("product_variants")
    .select("id, sku, size, color_name_ko, stock_quantity, product:products(name_ko)")
    .lte("stock_quantity", 5)
    .gt("stock_quantity", 0)
    .eq("is_active", true)
    .order("stock_quantity", { ascending: true })
    .limit(10);

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, order_number, status, total, shipping_name, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div>
      <h1 className="text-2xl font-light tracking-wider mb-8">대시보드</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/admin/orders">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-gray-500">오늘 매출</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-light">{formatPrice(todayRevenue)}</p>
              <p className="text-xs text-gray-400 mt-1">{ordersToday.count || 0}건</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/orders">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-gray-500">처리 대기</CardTitle>
              <ShoppingCart className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-light">{pendingCount || 0}건</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/members">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-gray-500">총 회원</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-light">{totalMembers.count || 0}명</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/products">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-gray-500">활성 상품</CardTitle>
              <Package className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-light">{activeProducts.count || 0}개</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">최근 주문</CardTitle></CardHeader>
          <CardContent>
            {recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-mono text-xs">{order.order_number}</p>
                      <p className="text-xs text-gray-400">{order.shipping_name}</p>
                    </div>
                    <div className="text-right">
                      <p>{formatPrice(order.total)}</p>
                      <p className="text-xs text-gray-400">{ORDER_STATUS_MAP[order.status as keyof typeof ORDER_STATUS_MAP]?.ko || order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">주문이 없습니다</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-medium">재고 부족 알림</CardTitle></CardHeader>
          <CardContent>
            {lowStock && lowStock.length > 0 ? (
              <div className="space-y-3">
                {lowStock.map((v) => (
                  <div key={v.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p>{(v.product as any)?.name_ko}</p>
                      <p className="text-xs text-gray-400">{v.color_name_ko} / {v.size}</p>
                    </div>
                    <span className={`text-xs font-medium ${v.stock_quantity <= 2 ? "text-red-500" : "text-orange-500"}`}>
                      {v.stock_quantity}개 남음
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">재고 부족 상품 없음</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
