import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/format";
import { ORDER_STATUS_MAP } from "@/lib/constants";

export const metadata = { title: "주문내역" };

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/orders");

  const { data: orders } = await supabase
    .from("orders")
    .select(`
      *,
      items:order_items(id, product_name_ko, variant_label, quantity, unit_price, product_image_url)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-light tracking-wider mb-8">주문내역</h1>

      {orders && orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = ORDER_STATUS_MAP[order.status as keyof typeof ORDER_STATUS_MAP];
            return (
              <div key={order.id} className="border">
                <div className="flex items-center justify-between p-4 bg-gray-50">
                  <div>
                    <p className="text-sm font-medium">{order.order_number}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(order.created_at)}</p>
                  </div>
                  <Badge variant="outline" className="rounded-none text-xs">
                    {statusInfo?.ko || order.status}
                  </Badge>
                </div>
                <div className="p-4 space-y-3">
                  {(order.items as any[])?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-16 h-20 bg-gray-100 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm">{item.product_name_ko}</p>
                        <p className="text-xs text-gray-400">{item.variant_label} x {item.quantity}</p>
                      </div>
                      <p className="text-sm">{formatPrice(item.unit_price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-sm font-medium">합계: {formatPrice(order.total)}</p>
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-xs text-gray-400 hover:text-black underline underline-offset-4"
                  >
                    상세보기
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-400 py-16 text-center">주문 내역이 없습니다</p>
      )}
    </div>
  );
}
