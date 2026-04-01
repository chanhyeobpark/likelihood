"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function NewCouponPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: "", nameKo: "", nameEn: "", type: "PERCENTAGE" as string,
    value: "", minOrderAmount: "0", maxDiscountAmount: "",
    usageLimit: "", perUserLimit: "1",
    startsAt: new Date().toISOString().slice(0, 16),
    expiresAt: "", isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("coupons").insert({
      code: form.code.toUpperCase(),
      name_ko: form.nameKo, name_en: form.nameEn || form.nameKo,
      type: form.type as "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING",
      value: parseInt(form.value),
      min_order_amount: parseInt(form.minOrderAmount) || 0,
      max_discount_amount: form.maxDiscountAmount ? parseInt(form.maxDiscountAmount) : null,
      usage_limit: form.usageLimit ? parseInt(form.usageLimit) : null,
      per_user_limit: parseInt(form.perUserLimit) || 1,
      starts_at: new Date(form.startsAt).toISOString(),
      expires_at: new Date(form.expiresAt).toISOString(),
      is_active: form.isActive,
    });
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success("쿠폰이 생성되었습니다");
    router.push("/admin/promotions");
  };

  return (
    <div>
      <h1 className="text-2xl font-light tracking-wider mb-8">쿠폰 생성</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader><CardTitle className="text-sm">쿠폰 정보</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs">쿠폰 코드</Label><Input value={form.code} onChange={(e) => setForm(f => ({ ...f, code: e.target.value }))} placeholder="WELCOME10" required className="mt-1 uppercase" /></div>
              <div><Label className="text-xs">쿠폰명 (한국어)</Label><Input value={form.nameKo} onChange={(e) => setForm(f => ({ ...f, nameKo: e.target.value }))} required className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">할인 유형</Label>
                <Select value={form.type} onValueChange={(v) => v && setForm(f => ({ ...f, type: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">퍼센트 할인</SelectItem>
                    <SelectItem value="FIXED_AMOUNT">정액 할인</SelectItem>
                    <SelectItem value="FREE_SHIPPING">무료 배송</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">할인 값 {form.type === "PERCENTAGE" ? "(%)" : "(원)"}</Label><Input type="number" value={form.value} onChange={(e) => setForm(f => ({ ...f, value: e.target.value }))} required className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs">최소 주문액 (원)</Label><Input type="number" value={form.minOrderAmount} onChange={(e) => setForm(f => ({ ...f, minOrderAmount: e.target.value }))} className="mt-1" /></div>
              <div><Label className="text-xs">최대 할인액 (원)</Label><Input type="number" value={form.maxDiscountAmount} onChange={(e) => setForm(f => ({ ...f, maxDiscountAmount: e.target.value }))} placeholder="제한 없음" className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs">총 사용 제한</Label><Input type="number" value={form.usageLimit} onChange={(e) => setForm(f => ({ ...f, usageLimit: e.target.value }))} placeholder="무제한" className="mt-1" /></div>
              <div><Label className="text-xs">1인당 사용 제한</Label><Input type="number" value={form.perUserLimit} onChange={(e) => setForm(f => ({ ...f, perUserLimit: e.target.value }))} className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs">시작일</Label><Input type="datetime-local" value={form.startsAt} onChange={(e) => setForm(f => ({ ...f, startsAt: e.target.value }))} required className="mt-1" /></div>
              <div><Label className="text-xs">만료일</Label><Input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm(f => ({ ...f, expiresAt: e.target.value }))} required className="mt-1" /></div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <Label>활성화</Label>
              <Switch checked={form.isActive} onCheckedChange={(c) => setForm(f => ({ ...f, isActive: c }))} />
            </div>
          </CardContent>
        </Card>
        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="bg-black text-white hover:bg-gray-900 h-11 px-8 text-sm">{loading ? "생성 중..." : "쿠폰 생성"}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()} className="h-11 px-8 text-sm">취소</Button>
        </div>
      </form>
    </div>
  );
}
