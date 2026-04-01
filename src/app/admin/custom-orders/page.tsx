import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/format";
import { CUSTOM_ORDER_STATUS_MAP } from "@/lib/constants";

export const metadata = { title: "제작의뢰 관리" };

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  REVIEWING: "bg-blue-100 text-blue-800",
  QUOTED: "bg-purple-100 text-purple-800",
  ACCEPTED: "bg-green-100 text-green-800",
  IN_PRODUCTION: "bg-indigo-100 text-indigo-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export default async function AdminCustomOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("custom_orders")
    .select("*, user:profiles(full_name, email)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-light tracking-wider mb-8">제작의뢰 관리</h1>
      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left p-4">제목</th>
              <th className="text-left p-4">고객</th>
              <th className="text-center p-4">종류</th>
              <th className="text-center p-4">수량</th>
              <th className="text-center p-4">상태</th>
              <th className="text-right p-4">접수일</th>
              <th className="text-right p-4">관리</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order) => {
              const statusInfo = CUSTOM_ORDER_STATUS_MAP[order.status as keyof typeof CUSTOM_ORDER_STATUS_MAP];
              return (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-sm">{order.title}</td>
                  <td className="p-4 text-sm text-gray-500">{(order.user as any)?.full_name || (order.user as any)?.email}</td>
                  <td className="p-4 text-center text-xs">{order.category}</td>
                  <td className="p-4 text-center text-sm">{order.quantity}</td>
                  <td className="p-4 text-center">
                    <Badge className={`text-[10px] ${statusColors[order.status] || ""}`}>{statusInfo?.ko}</Badge>
                  </td>
                  <td className="p-4 text-xs text-gray-400 text-right">{formatDate(order.created_at)}</td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/custom-orders/${order.id}`} className="text-xs text-gray-400 hover:text-black underline">상세</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!orders || orders.length === 0) && <p className="text-sm text-gray-400 text-center py-12">제작의뢰가 없습니다</p>}
      </div>
    </div>
  );
}
