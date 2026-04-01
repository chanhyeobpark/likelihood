import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FREE_SHIPPING_THRESHOLD, DEFAULT_SHIPPING_FEE, TIER_THRESHOLDS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "설정" };

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-light tracking-wider mb-8">설정</h1>
      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader><CardTitle className="text-sm">배송 설정</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-3">
            <div className="flex justify-between"><span className="text-gray-500">무료 배송 기준</span><span>{formatPrice(FREE_SHIPPING_THRESHOLD)} 이상</span></div>
            <div className="flex justify-between"><span className="text-gray-500">기본 배송비</span><span>{formatPrice(DEFAULT_SHIPPING_FEE)}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">회원 등급 기준</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-3">
            {Object.entries(TIER_THRESHOLDS).map(([tier, threshold]) => (
              <div key={tier} className="flex justify-between">
                <span className="text-gray-500">{tier}</span>
                <span>{threshold === 0 ? "기본" : `${formatPrice(threshold)} 이상`}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">환경 변수 상태</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            {["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_TOSS_CLIENT_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"].map((key) => (
              <div key={key} className="flex justify-between">
                <span className="text-gray-500 font-mono text-xs">{key}</span>
                <span className="text-xs">{process.env[key] ? "✅ 설정됨" : "❌ 미설정"}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
