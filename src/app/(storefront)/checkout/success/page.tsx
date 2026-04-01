import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export const metadata = { title: "주문 완료" };

interface Props {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { orderId } = await searchParams;

  return (
    <div className="container-wide py-20 text-center max-w-lg mx-auto">
      <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-6" />
      <h1 className="text-2xl font-light tracking-wider mb-4">주문이 완료되었습니다</h1>
      <p className="text-sm text-gray-500 mb-8">
        주문 확인 이메일이 발송됩니다. 마이페이지에서 주문 상태를 확인할 수 있습니다.
      </p>
      <div className="flex gap-4 justify-center">
        {orderId && (
          <Link href={`/orders/${orderId}`}>
            <Button variant="outline" className="rounded-none h-11 px-6 text-sm tracking-wider">
              주문 상세보기
            </Button>
          </Link>
        )}
        <Link href="/products">
          <Button className="bg-black text-white hover:bg-gray-900 rounded-none h-11 px-6 text-sm tracking-wider">
            쇼핑 계속하기
          </Button>
        </Link>
      </div>
    </div>
  );
}
