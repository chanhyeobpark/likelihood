import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/format";
import { ORDER_STATUS_MAP } from "@/lib/constants";

export const metadata = { title: "주문관리" };

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: "bg-yellow-100 text-yellow-800",
  PAID: "bg-blue-100 text-blue-800",
  PREPARING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-800",
  REFUND_REQUESTED: "bg-orange-100 text-orange-800",
  REFUNDED: "bg-red-100 text-red-800",
};

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100);

  return (
    <div>
      <h1 className="text-2xl font-light tracking-wider mb-8">주문관리</h1>
      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left p-4">주문번호</th>
              <th className="text-left p-4">고객명</th>
              <th className="text-right p-4">금액</th>
              <th className="text-center p-4">상태</th>
              <th className="text-right p-4">주문일</th>
              <th className="text-right p-4">관리</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => {
              const statusInfo = ORDER_STATUS_MAP[order.status as keyof typeof ORDER_STATUS_MAP];
              return (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-mono text-xs">{order.order_number}</td>
                  <td className="p-4 text-sm">{order.shipping_name}</td>
                  <td className="p-4 text-sm text-right">{formatPrice(order.total)}</td>
                  <td className="p-4 text-center">
                    <Badge className={`text-[10px] ${statusColors[order.status] || ""}`}>{statusInfo?.ko || order.status}</Badge>
                  </td>
                  <td className="p-4 text-xs text-gray-400 text-right">{formatDate(order.created_at)}</td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/orders/${order.id}`} className="text-xs text-gray-400 hover:text-black underline">상세</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!orders || orders.length === 0) && <p className="text-sm text-gray-400 text-center py-12">주문이 없습니다</p>}
      </div>
    </div>
  );
}
