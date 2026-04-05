import type { Metadata } from "next";

export const metadata: Metadata = { title: "배송 안내" };

export default function ShippingPage() {
  return (
    <div className="container-wide py-16 max-w-3xl mx-auto">
      <h1 className="text-2xl font-light tracking-wider mb-8">배송 안내</h1>
      <div className="space-y-8 text-sm text-gray-600">
        <section>
          <h2 className="text-sm font-medium text-black mb-3">배송비</h2>
          <ul className="space-y-2">
            <li>• 기본 배송비: <strong>3,000원</strong></li>
            <li>• <strong>100,000원 이상</strong> 구매 시 무료배송</li>
            <li>• 도서산간 지역은 추가 배송비가 발생할 수 있습니다</li>
          </ul>
        </section>
        <section>
          <h2 className="text-sm font-medium text-black mb-3">배송 기간</h2>
          <ul className="space-y-2">
            <li>• 결제 완료 후 <strong>1~2 영업일</strong> 이내 발송</li>
            <li>• 발송 후 <strong>1~3일</strong> 이내 수령 (영업일 기준)</li>
            <li>• 주문 폭주, 천재지변 등의 사유로 배송이 지연될 수 있습니다</li>
          </ul>
        </section>
        <section>
          <h2 className="text-sm font-medium text-black mb-3">배송 조회</h2>
          <p>발송 완료 후 마이페이지 → 주문내역에서 운송장 번호를 확인하실 수 있습니다.</p>
        </section>
        <section>
          <h2 className="text-sm font-medium text-black mb-3">택배사</h2>
          <p>CJ대한통운, 롯데택배, 한진택배 등을 이용합니다.</p>
        </section>
      </div>
    </div>
  );
}
