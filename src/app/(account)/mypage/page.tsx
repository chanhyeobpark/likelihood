import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { TIER_BENEFITS } from "@/lib/constants";

export const metadata = { title: "마이페이지" };

export default async function MyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/mypage");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, order_number, status, total, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const tier = profile?.tier || "STANDARD";
  const benefits = TIER_BENEFITS[tier as keyof typeof TIER_BENEFITS];

  return (
    <div>
      <h1 className="text-2xl font-light tracking-wider mb-8">마이페이지</h1>

      {/* Profile Summary */}
      <div className="bg-gray-50 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg">{profile?.full_name || "회원"}님</p>
            <p className="text-sm text-gray-500 mt-1">{profile?.email}</p>
          </div>
          <Badge variant="outline" className="rounded-none text-xs tracking-wider">
            {tier}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div>
            <p className="text-xs text-gray-400">포인트</p>
            <p className="text-lg mt-1">{(profile?.points_balance || 0).toLocaleString()}P</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">적립률</p>
            <p className="text-lg mt-1">{(benefits.pointsRate * 100).toFixed(0)}%</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { href: "/orders", label: "주문내역", icon: "📦" },
          { href: "/wishlist", label: "위시리스트", icon: "♡" },
          { href: "/points", label: "포인트", icon: "💰" },
          { href: "/settings", label: "회원정보", icon: "⚙" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="border p-4 text-center hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl">{item.icon}</span>
            <p className="text-xs mt-2">{item.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <h2 className="text-xs font-medium tracking-wider uppercase mb-4">최근 주문</h2>
      {recentOrders && recentOrders.length > 0 ? (
        <div className="space-y-3">
          {recentOrders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex items-center justify-between p-4 border hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="text-sm">{order.order_number}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(order.created_at).toLocaleDateString("ko-KR")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm">{formatPrice(order.total)}</p>
                <Badge variant="secondary" className="text-[10px] rounded-none mt-1">
                  {order.status}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 py-8 text-center">주문 내역이 없습니다</p>
      )}
    </div>
  );
}
