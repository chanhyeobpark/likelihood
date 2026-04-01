import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="text-center">
        <h1 className="text-6xl font-light tracking-wider mb-4">404</h1>
        <p className="text-sm text-gray-400 mb-8">페이지를 찾을 수 없습니다</p>
        <Link href="/">
          <Button variant="outline" className="rounded-none h-10 px-8 text-xs tracking-widest uppercase">
            홈으로 돌아가기
          </Button>
        </Link>
      </div>
    </div>
  );
}
