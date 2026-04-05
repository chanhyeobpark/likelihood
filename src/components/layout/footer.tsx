import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-20">
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-light tracking-[0.3em] uppercase mb-4">
              likelihood
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Contemporary fashion for the modern individual.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-medium tracking-wider uppercase mb-4">Shop</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link href="/products" className="hover:text-black transition-colors">전체상품</Link></li>
              <li><Link href="/categories/tops" className="hover:text-black transition-colors">상의</Link></li>
              <li><Link href="/categories/bottoms" className="hover:text-black transition-colors">하의</Link></li>
              <li><Link href="/categories/accessories" className="hover:text-black transition-colors">액세서리</Link></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-xs font-medium tracking-wider uppercase mb-4">Help</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link href="/about" className="hover:text-black transition-colors">브랜드 소개</Link></li>
              <li><Link href="/faq" className="hover:text-black transition-colors">자주 묻는 질문</Link></li>
              <li><Link href="/shipping" className="hover:text-black transition-colors">배송 안내</Link></li>
              <li><Link href="/returns" className="hover:text-black transition-colors">교환/반품</Link></li>
              <li><Link href="/contact" className="hover:text-black transition-colors">고객센터</Link></li>
            </ul>
          </div>

          {/* Policy */}
          <div>
            <h4 className="text-xs font-medium tracking-wider uppercase mb-4">Policy</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link href="/terms" className="hover:text-black transition-colors">이용약관</Link></li>
              <li><Link href="/privacy" className="hover:text-black transition-colors">개인정보처리방침</Link></li>
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Business Info (Korean law requirement) */}
        <div className="text-xs text-gray-400 space-y-1">
          <p className="font-medium text-gray-500 mb-2">사업자 정보</p>
          <p>상호: 라이클리후드(LIKELIHOOD) | 대표: 박찬우</p>
          <p>사업자등록번호: 105-22-28585 | 통신판매업 신고번호: 2022-제주애월-0286</p>
          <p>주소: 제주특별자치도 제주시 애월읍 신엄연대길 34-3</p>
          <p>고객센터: 070-7782-2805 | 이메일: info@likelihood.co.kr</p>
          <p className="mt-4">&copy; {new Date().getFullYear()} likelihood. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
