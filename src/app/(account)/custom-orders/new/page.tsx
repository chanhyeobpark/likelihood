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
import { CUSTOM_ORDER_CATEGORIES } from "@/lib/constants";
import { toast } from "sonner";

export default function NewCustomOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    quantity: "1",
    budgetMin: "",
    budgetMax: "",
    desiredDate: "",
    sizeInfo: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.category) {
      toast.error("필수 항목을 모두 입력해주세요");
      return;
    }
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("로그인이 필요합니다"); router.push("/login"); return; }

    const { error } = await supabase.from("custom_orders").insert({
      user_id: user.id,
      title: form.title,
      description: form.description,
      category: form.category as any,
      quantity: parseInt(form.quantity) || 1,
      budget_min: form.budgetMin ? parseInt(form.budgetMin) : null,
      budget_max: form.budgetMax ? parseInt(form.budgetMax) : null,
      desired_date: form.desiredDate || null,
      size_info: form.sizeInfo || null,
    });

    if (error) {
      toast.error("의뢰 등록에 실패했습니다");
      setLoading(false);
      return;
    }

    toast.success("제작의뢰가 접수되었습니다");
    router.push("/custom-orders");
  };

  return (
    <div>
      <h1 className="text-2xl font-light tracking-wider mb-8">제작 의뢰하기</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader><CardTitle className="text-sm">기본 정보</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">의뢰 제목 *</Label>
              <Input value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} placeholder="예: 가을 단체 재킷 제작" required className="mt-1 rounded-none h-11" />
            </div>
            <div>
              <Label className="text-xs">의류 종류 *</Label>
              <Select value={form.category} onValueChange={(v) => v && setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="mt-1 rounded-none h-11"><SelectValue placeholder="선택해주세요" /></SelectTrigger>
                <SelectContent>
                  {CUSTOM_ORDER_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.labelKo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">수량</Label>
              <Input type="number" min="1" value={form.quantity} onChange={(e) => setForm(f => ({ ...f, quantity: e.target.value }))} className="mt-1 rounded-none h-11 w-32" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">상세 내용</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">상세 설명 *</Label>
              <Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="원하시는 디자인, 소재, 색상, 스타일 등을 상세히 적어주세요" rows={6} required className="mt-1 rounded-none" />
            </div>
            <div>
              <Label className="text-xs">사이즈 정보</Label>
              <Textarea value={form.sizeInfo} onChange={(e) => setForm(f => ({ ...f, sizeInfo: e.target.value }))} placeholder="필요한 사이즈를 적어주세요 (예: M사이즈 5벌, L사이즈 3벌)" rows={3} className="mt-1 rounded-none" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">예산 & 일정</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">최소 예산 (원)</Label>
                <Input type="number" value={form.budgetMin} onChange={(e) => setForm(f => ({ ...f, budgetMin: e.target.value }))} placeholder="예: 30000" className="mt-1 rounded-none h-11" />
              </div>
              <div>
                <Label className="text-xs">최대 예산 (원)</Label>
                <Input type="number" value={form.budgetMax} onChange={(e) => setForm(f => ({ ...f, budgetMax: e.target.value }))} placeholder="예: 50000" className="mt-1 rounded-none h-11" />
              </div>
            </div>
            <div>
              <Label className="text-xs">희망 납기일</Label>
              <Input type="date" value={form.desiredDate} onChange={(e) => setForm(f => ({ ...f, desiredDate: e.target.value }))} className="mt-1 rounded-none h-11 w-48" />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="bg-black text-white hover:bg-gray-900 rounded-none h-11 px-8 text-sm tracking-wider uppercase">
            {loading ? "접수 중..." : "의뢰 접수하기"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} className="rounded-none h-11 px-8 text-sm">
            취소
          </Button>
        </div>
      </form>
    </div>
  );
}
