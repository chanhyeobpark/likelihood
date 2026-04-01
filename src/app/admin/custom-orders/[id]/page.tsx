import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/format";
import { CUSTOM_ORDER_STATUS_MAP, CUSTOM_ORDER_CATEGORIES } from "@/lib/constants";
import { AdminCustomOrderActions } from "./actions";

interface Props { params: Promise<{ id: string }> }

export default async function AdminCustomOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("custom_orders")
    .select("*, user:profiles(full_name, email, phone)")
    .eq("id", id)
    .single();

  if (!order) notFound();

  const statusInfo = CUSTOM_ORDER_STATUS_MAP[order.status as keyof typeof CUSTOM_ORDER_STATUS_MAP];
  const categoryInfo = CUSTOM_ORDER_CATEGORIES.find((c) => c.value === order.category);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-wider">{order.title}</h1>
          <p className="text-sm text-gray-400 mt-1">{formatDate(order.created_at)}</p>
        </div>
        <Badge className="text-sm">{statusInfo?.ko || order.status}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-sm">고객 정보</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>{(order.user as any)?.full_name || "-"}</p>
            <p className="text-gray-400">{(order.user as any)?.email}</p>
            {(order.user as any)?.phone && <p className="text-gray-400">{(order.user as any)?.phone}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">의뢰 요약</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between"><span className="text-gray-400">종류</span><span>{categoryInfo?.labelKo}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">수량</span><span>{order.quantity}개</span></div>
            {order.budget_min && order.budget_max && (
              <div className="flex justify-between"><span className="text-gray-400">예산</span><span>{formatPrice(order.budget_min)} ~ {formatPrice(order.budget_max)}</span></div>
            )}
            {order.desired_date && (
              <div className="flex justify-between"><span className="text-gray-400">납기</span><span>{order.desired_date}</span></div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader><CardTitle className="text-sm">상세 설명</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 whitespace-pre-line">{order.description}</p>
          {order.size_info && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-400 mb-1">사이즈</p>
              <p className="text-sm">{order.size_info}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AdminCustomOrderActions
        orderId={order.id}
        currentStatus={order.status}
        currentReply={order.admin_reply || ""}
        currentQuote={order.quoted_price || 0}
      />
    </div>
  );
}
