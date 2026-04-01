"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const STATUS_TRANSITIONS: Record<string, { value: string; label: string; variant?: "destructive" }[]> = {
  PAID: [{ value: "PREPARING", label: "준비완료" }, { value: "CANCELLED", label: "주문취소", variant: "destructive" }],
  PREPARING: [{ value: "SHIPPED", label: "배송시작" }, { value: "CANCELLED", label: "주문취소", variant: "destructive" }],
  SHIPPED: [{ value: "DELIVERED", label: "배송완료" }],
  DELIVERED: [{ value: "REFUND_REQUESTED", label: "환불요청" }],
  REFUND_REQUESTED: [{ value: "REFUNDED", label: "환불처리" }],
};

const CARRIERS = ["CJ대한통운", "롯데택배", "한진택배", "로젠택배", "우체국택배"];

export function OrderActions({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [carrier, setCarrier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const transitions = STATUS_TRANSITIONS[currentStatus] || [];

  if (transitions.length === 0) return null;

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    const supabase = createClient();
    const updates: Record<string, string> = { status: newStatus };
    if (newStatus === "SHIPPED" && carrier && trackingNumber) {
      updates.shipping_carrier = carrier;
      updates.tracking_number = trackingNumber;
    }
    const { error } = await supabase.from("orders").update(updates).eq("id", orderId);
    if (error) toast.error("상태 변경 실패");
    else { toast.success("주문 상태가 변경되었습니다"); router.refresh(); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">주문 처리</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {currentStatus === "PREPARING" && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">택배사</Label>
              <Select value={carrier} onValueChange={(v) => setCarrier(v ?? "")}><SelectTrigger className="mt-1"><SelectValue placeholder="선택" /></SelectTrigger>
                <SelectContent>{CARRIERS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs">운송장 번호</Label><Input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="mt-1" /></div>
          </div>
        )}
        <div className="flex gap-3">
          {transitions.map((t) => (
            <Button key={t.value} onClick={() => updateStatus(t.value)} disabled={loading}
              variant={t.variant === "destructive" ? "outline" : "default"}
              className={t.variant !== "destructive" ? "bg-black text-white hover:bg-gray-900 text-sm" : "text-red-500 border-red-200 text-sm"}>
              {t.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
