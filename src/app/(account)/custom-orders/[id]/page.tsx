import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/format";
import { CUSTOM_ORDER_STATUS_MAP, CUSTOM_ORDER_CATEGORIES } from "@/lib/constants";

interface Props { params: Promise<{ id: string }> }

export default async function CustomOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: order } = await supabase
    .from("custom_orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!order) notFound();

  const statusInfo = CUSTOM_ORDER_STATUS_MAP[order.status as keyof typeof CUSTOM_ORDER_STATUS_MAP];
  const categoryInfo = CUSTOM_ORDER_CATEGORIES.find((c) => c.value === order.category);

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    REVIEWING: "bg-blue-100 text-blue-800",
    QUOTED: "bg-purple-100 text-purple-800",
    ACCEPTED: "bg-green-100 text-green-800",
    IN_PRODUCTION: "bg-indigo-100 text-indigo-800",
    COMPLETED: "bg-emerald-100 text-emerald-800",
    CANCELLED: "bg-gray-100 text-gray-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-wider">{order.title}</h1>
          <p className="text-sm text-gray-400 mt-1">{formatDate(order.created_at)}</p>
        </div>
        <Badge className={`rounded-none text-xs ${statusColors[order.status] || ""}`}>
          {statusInfo?.ko || order.status}
        </Badge>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader><CardTitle className="text-sm">의뢰 내용</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">의류 종류</span><span>{categoryInfo?.labelKo || order.category}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">수량</span><span>{order.quantity}개</span></div>
            {order.budget_min && order.budget_max && (
              <div className="flex justify-between"><span className="text-gray-400">예산</span><span>{formatPrice(order.budget_min)} ~ {formatPrice(order.budget_max)}</span></div>
            )}
            {order.desired_date && (
              <div className="flex justify-between"><span className="text-gray-400">희망 납기일</span><span>{order.desired_date}</span></div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">상세 설명</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 whitespace-pre-line">{order.description}</p>
            {order.size_info && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-400 mb-1">사이즈 정보</p>
                <p className="text-sm text-gray-600">{order.size_info}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Admin Reply / Quote */}
        {(order.admin_reply || order.quoted_price) && (
          <Card className="border-black">
            <CardHeader><CardTitle className="text-sm">관리자 답변</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {order.quoted_price && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">견적 금액</span>
                  <span className="text-lg font-medium">{formatPrice(order.quoted_price)}</span>
                </div>
              )}
              {order.admin_reply && (
                <p className="text-sm text-gray-600 whitespace-pre-line">{order.admin_reply}</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
