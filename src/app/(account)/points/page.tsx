import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/format";

export const metadata = { title: "포인트" };

export default async function PointsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/points");

  const { data: profile } = await supabase
    .from("profiles")
    .select("points_balance, tier")
    .eq("id", user.id)
    .single();

  const { data: transactions } = await supabase
    .from("points_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const TYPE_LABELS: Record<string, string> = {
    PURCHASE_EARN: "구매 적립",
    REVIEW_EARN: "리뷰 적립",
    SIGNUP_BONUS: "가입 축하",
    PURCHASE_SPEND: "포인트 사용",
    ADMIN_ADJUST: "관리자 조정",
    EXPIRED: "만료",
  };

  return (
    <div>
      <h1 className="text-2xl font-light tracking-wider mb-8">포인트</h1>

      <div className="bg-gray-50 p-6 mb-8">
        <p className="text-xs text-gray-400">보유 포인트</p>
        <p className="text-3xl font-light mt-2">
          {(profile?.points_balance || 0).toLocaleString()}
          <span className="text-lg ml-1">P</span>
        </p>
      </div>

      <h2 className="text-xs font-medium tracking-wider uppercase mb-4">포인트 내역</h2>

      {transactions && transactions.length > 0 ? (
        <div className="space-y-0">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between py-4 border-b">
              <div>
                <p className="text-sm">{TYPE_LABELS[tx.type] || tx.type}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDate(tx.created_at)}
                </p>
              </div>
              <p className={`text-sm font-medium ${tx.amount > 0 ? "text-blue-600" : "text-red-500"}`}>
                {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()}P
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 py-8 text-center">포인트 내역이 없습니다</p>
      )}
    </div>
  );
}
