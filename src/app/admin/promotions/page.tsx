import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { formatPrice, formatDate } from "@/lib/format";

export const metadata = { title: "프로모션" };

export default async function AdminPromotionsPage() {
  const supabase = await createClient();
  const { data: coupons } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-light tracking-wider">프로모션</h1>
        <Link href="/admin/promotions/new">
          <Button className="bg-black text-white hover:bg-gray-900 rounded-md h-9 text-sm"><Plus className="h-4 w-4 mr-2" /> 쿠폰 생성</Button>
        </Link>
      </div>
      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left p-4">쿠폰 코드</th>
              <th className="text-left p-4">이름</th>
              <th className="text-center p-4">유형</th>
              <th className="text-right p-4">할인</th>
              <th className="text-center p-4">사용</th>
              <th className="text-right p-4">만료일</th>
              <th className="text-center p-4">상태</th>
            </tr>
          </thead>
          <tbody>
            {coupons?.map((c) => {
              const isExpired = new Date(c.expires_at) < new Date();
              return (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-mono text-sm">{c.code}</td>
                  <td className="p-4 text-sm">{c.name_ko}</td>
                  <td className="p-4 text-center text-xs">{c.type === "PERCENTAGE" ? "%" : c.type === "FIXED_AMOUNT" ? "정액" : "무배"}</td>
                  <td className="p-4 text-sm text-right">{c.type === "PERCENTAGE" ? `${c.value}%` : formatPrice(c.value)}</td>
                  <td className="p-4 text-center text-sm">{c.usage_count}/{c.usage_limit || "∞"}</td>
                  <td className="p-4 text-xs text-gray-400 text-right">{formatDate(c.expires_at)}</td>
                  <td className="p-4 text-center">
                    <Badge className={`text-[10px] ${isExpired ? "bg-gray-100 text-gray-500" : c.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}`}>
                      {isExpired ? "만료" : c.is_active ? "활성" : "비활성"}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!coupons || coupons.length === 0) && <p className="text-sm text-gray-400 text-center py-12">쿠폰이 없습니다</p>}
      </div>
    </div>
  );
}
