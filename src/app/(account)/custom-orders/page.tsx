import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDate } from "@/lib/format";
import { CUSTOM_ORDER_STATUS_MAP } from "@/lib/constants";
import { Plus } from "lucide-react";

export const metadata = { title: "내 제작의뢰" };

export default async function MyCustomOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/custom-orders");

  const { data: orders } = await supabase
    .from("custom_orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light tracking-wider">제작의뢰</h1>
        <Link href="/custom-orders/new">
          <Button className="bg-black text-white hover:bg-gray-900 rounded-none h-9 text-sm">
            <Plus className="h-4 w-4 mr-2" /> 새 의뢰
          </Button>
        </Link>
      </div>

      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = CUSTOM_ORDER_STATUS_MAP[order.status as keyof typeof CUSTOM_ORDER_STATUS_MAP];
            return (
              <Link
                key={order.id}
                href={`/custom-orders/${order.id}`}
                className="block border p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium">{order.title}</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      {order.category} · 수량 {order.quantity}개 · {formatDate(order.created_at)}
                    </p>
                    {order.quoted_price && (
                      <p className="text-sm mt-2">견적: {formatPrice(order.quoted_price)}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="rounded-none text-xs">
                    {statusInfo?.ko || order.status}
                  </Badge>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-sm text-gray-400 mb-6">제작의뢰 내역이 없습니다</p>
          <Link href="/custom-orders/new">
            <Button variant="outline" className="rounded-none h-10 px-6 text-sm">첫 의뢰 작성하기</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
