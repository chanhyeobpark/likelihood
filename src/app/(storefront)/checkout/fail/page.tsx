import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

export const metadata = { title: "결제 실패" };

export default function CheckoutFailPage() {
  return (
    <div className="container-wide py-20 text-center max-w-lg mx-auto">
      <XCircle className="h-16 w-16 mx-auto text-red-500 mb-6" />
      <h1 className="text-2xl font-light tracking-wider mb-4">결제에 실패했습니다</h1>
      <p className="text-sm text-gray-500 mb-8">
        결제 처리 중 문제가 발생했습니다. 다시 시도해주세요.
      </p>
      <div className="flex gap-4 justify-center">
        <Link href="/cart">
          <Button variant="outline" className="rounded-none h-11 px-6 text-sm tracking-wider">
            장바구니로 돌아가기
          </Button>
        </Link>
        <Link href="/products">
          <Button className="bg-black text-white hover:bg-gray-900 rounded-none h-11 px-6 text-sm tracking-wider">
            쇼핑 계속하기
          </Button>
        </Link>
      </div>
    </div>
  );
}
