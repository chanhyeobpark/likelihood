import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice, formatDate } from "@/lib/format";
import { ORDER_STATUS_MAP } from "@/lib/constants";
import { Search, Download } from "lucide-react";

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

const STATUS_TABS = [
  { value: "all", label: "전체" },
  { value: "PAID", label: "결제완료" },
  { value: "PREPARING", label: "배송준비" },
  { value: "SHIPPED", label: "배송중" },
  { value: "DELIVERED", label: "배송완료" },
  { value: "CANCELLED", label: "취소/환불" },
];

interface Props {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q || "";
  const statusFilter = params.status || "all";
  const page = parseInt(params.page || "1");
  const perPage = 20;

  const supabase = await createClient();

  let orderQuery = supabase
    .from("orders")
    .select("*", { count: "exact" });

  if (query) {
    orderQuery = orderQuery.or(`order_number.ilike.%${query}%,shipping_name.ilike.%${query}%`);
  }

  if (statusFilter !== "all") {
    if (statusFilter === "CANCELLED") {
      orderQuery = orderQuery.in("status", ["CANCELLED", "REFUND_REQUESTED", "REFUNDED"]);
    } else {
      orderQuery = orderQuery.eq("status", statusFilter as any);
    }
  }

  orderQuery = orderQuery.order("created_at", { ascending: false });
  const from = (page - 1) * perPage;
  orderQuery = orderQuery.range(from, from + perPage - 1);

  const { data: orders, count: totalCount } = await orderQuery;
  const totalPages = Math.ceil((totalCount || 0) / perPage);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-light tracking-wider">주문관리</h1>
        <Button variant="outline" className="h-9 text-sm">
          <Download className="h-4 w-4 mr-2" /> 엑셀 다운로드
        </Button>
      </div>

      {/* Search + Status Tabs */}
      <div className="bg-white rounded-lg border p-4 mb-4">
        <form className="flex gap-3 items-center mb-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input name="q" defaultValue={query} placeholder="주문번호, 고객명 검색..." className="pl-9 h-9" />
          </div>
          <Button type="submit" variant="outline" size="sm" className="h-9">검색</Button>
        </form>
        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.value}
              href={`/admin/orders?status=${tab.value === "all" ? "" : tab.value}${query ? `&q=${query}` : ""}`}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors ${
                (statusFilter === tab.value || (statusFilter === "all" && tab.value === "all"))
                  ? "bg-black text-white border-black"
                  : "hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-3">총 {totalCount || 0}건</p>

      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left p-4">주문번호</th>
              <th className="text-left p-4">고객명</th>
              <th className="text-right p-4">금액</th>
              <th className="text-center p-4">상태</th>
              <th className="text-center p-4">결제</th>
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
                  <td className="p-4 text-center text-xs text-gray-400">{order.payment_method || "-"}</td>
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

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {page > 1 && (
            <Link href={`/admin/orders?page=${page - 1}${query ? `&q=${query}` : ""}${statusFilter !== "all" ? `&status=${statusFilter}` : ""}`}
              className="px-3 py-1.5 border text-sm hover:bg-gray-50 rounded">이전</Link>
          )}
          <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {totalPages}</span>
          {page < totalPages && (
            <Link href={`/admin/orders?page=${page + 1}${query ? `&q=${query}` : ""}${statusFilter !== "all" ? `&status=${statusFilter}` : ""}`}
              className="px-3 py-1.5 border text-sm hover:bg-gray-50 rounded">다음</Link>
          )}
        </div>
      )}
    </div>
  );
}
