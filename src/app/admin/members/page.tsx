import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatDate } from "@/lib/format";

export const metadata = { title: "회원관리" };

export default async function AdminMembersPage() {
  const supabase = await createClient();
  const { data: members } = await supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100);

  return (
    <div>
      <h1 className="text-2xl font-light tracking-wider mb-8">회원관리</h1>
      <div className="bg-white rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b text-xs text-gray-500 uppercase tracking-wider">
              <th className="text-left p-4">이름</th>
              <th className="text-left p-4">이메일</th>
              <th className="text-center p-4">등급</th>
              <th className="text-right p-4">총 구매액</th>
              <th className="text-right p-4">포인트</th>
              <th className="text-right p-4">가입일</th>
            </tr>
          </thead>
          <tbody>
            {members?.map((m) => (
              <tr key={m.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-sm">{m.full_name || "-"}</td>
                <td className="p-4 text-sm text-gray-500">{m.email}</td>
                <td className="p-4 text-center"><Badge variant="outline" className="text-[10px]">{m.tier}</Badge></td>
                <td className="p-4 text-sm text-right">{formatPrice(m.total_spent)}</td>
                <td className="p-4 text-sm text-right">{m.points_balance.toLocaleString()}P</td>
                <td className="p-4 text-xs text-gray-400 text-right">{formatDate(m.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
