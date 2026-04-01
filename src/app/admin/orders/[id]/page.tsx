import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/format";
import { ORDER_STATUS_MAP } from "@/lib/constants";
import { OrderActions } from "./order-actions";

interface Props { params: Promise<{ id: string }> }

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: order } = await supabase.from("orders").select("*, items:order_items(*)").eq("id", id).single();
  if (!order) notFound();
  const statusInfo = ORDER_STATUS_MAP[order.status as keyof typeof ORDER_STATUS_MAP];

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-wider">{order.order_number}</h1>
          <p className="text-sm text-gray-400 mt-1">{formatDate(order.created_at)}</p>
        </div>
        <Badge className="text-sm">{statusInfo?.ko || order.status}</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle className="text-sm">배송 정보</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>{order.shipping_name} / {order.shipping_phone}</p>
            <p>[{order.shipping_postal_code}] {order.shipping_address_line1}</p>
            {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
            {order.shipping_memo && <p className="text-gray-400">메모: {order.shipping_memo}</p>}
            {order.tracking_number && <p className="mt-2">운송장: {order.shipping_carrier} {order.tracking_number}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">결제 정보</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between"><span className="text-gray-400">소계</span><span>{formatPrice(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">배송비</span><span>{formatPrice(order.shipping_fee)}</span></div>
            {order.discount_amount > 0 && <div className="flex justify-between"><span className="text-gray-400">할인</span><span>-{formatPrice(order.discount_amount)}</span></div>}
            <div className="flex justify-between font-medium pt-2 border-t"><span>합계</span><span>{formatPrice(order.total)}</span></div>
          </CardContent>
        </Card>
      </div>
      <Card className="mb-8">
        <CardHeader><CardTitle className="text-sm">주문 상품</CardTitle></CardHeader>
        <CardContent>
          {(order.items as any[])?.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div><p className="text-sm">{item.product_name_ko}</p><p className="text-xs text-gray-400">{item.variant_label} x {item.quantity}</p></div>
              <p className="text-sm">{formatPrice(item.subtotal)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <OrderActions orderId={order.id} currentStatus={order.status} />
    </div>
  );
}
