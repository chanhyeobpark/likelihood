"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const STATUSES = [
  { value: "PENDING", label: "접수대기" },
  { value: "REVIEWING", label: "검토중" },
  { value: "QUOTED", label: "견적완료" },
  { value: "ACCEPTED", label: "수락됨" },
  { value: "IN_PRODUCTION", label: "제작중" },
  { value: "COMPLETED", label: "제작완료" },
  { value: "CANCELLED", label: "취소" },
];

interface Props {
  orderId: string;
  currentStatus: string;
  currentReply: string;
  currentQuote: number;
}

export function AdminCustomOrderActions({ orderId, currentStatus, currentReply, currentQuote }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [reply, setReply] = useState(currentReply);
  const [quote, setQuote] = useState(currentQuote ? String(currentQuote) : "");

  const handleSave = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("custom_orders")
      .update({
        status: status as any,
        admin_reply: reply || null,
        quoted_price: quote ? parseInt(quote) : null,
      })
      .eq("id", orderId);

    if (error) toast.error("저장 실패");
    else { toast.success("저장되었습니다"); router.refresh(); }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader><CardTitle className="text-sm">관리자 처리</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-xs">상태 변경</Label>
          <Select value={status} onValueChange={(v) => v && setStatus(v)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">견적 금액 (원)</Label>
          <Input type="number" value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="견적 금액 입력" className="mt-1" />
        </div>
        <div>
          <Label className="text-xs">답변 내용</Label>
          <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="고객에게 전달할 내용을 작성하세요" rows={4} className="mt-1" />
        </div>
        <Button onClick={handleSave} disabled={loading} className="bg-black text-white hover:bg-gray-900 text-sm">
          {loading ? "저장 중..." : "저장"}
        </Button>
      </CardContent>
    </Card>
  );
}
