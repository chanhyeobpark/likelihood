import type { Metadata } from "next";

export const metadata: Metadata = { title: "교환/반품" };

export default function ReturnsPage() {
  return (
    <div className="container-wide py-16 max-w-3xl mx-auto">
      <h1 className="text-2xl font-light tracking-wider mb-8">교환/반품</h1>
      <div className="space-y-8 text-sm text-gray-600">
        <section>
          <h2 className="text-sm font-medium text-black mb-3">교환/반품 신청</h2>
          <p>상품 수령 후 <strong>7일 이내</strong> 고객센터로 연락해 주세요.</p>
          <p className="mt-2">고객센터: <strong>070-7782-2805</strong> | 이메일: info@likelihood.co.kr</p>
        </section>
        <section>
          <h2 className="text-sm font-medium text-black mb-3">교환/반품이 가능한 경우</h2>
          <ul className="space-y-2">
            <li>• 상품이 표시·광고 내용과 다르거나 계약 내용과 다르게 이행된 경우</li>
            <li>• 배송 중 파손 또는 불량인 경우</li>
            <li>• 사이즈 교환 (1회 무료)</li>
          </ul>
        </section>
        <section>
          <h2 className="text-sm font-medium text-black mb-3">교환/반품이 불가한 경우</h2>
          <ul className="space-y-2">
            <li>• 고객의 사용 또는 일부 소비로 상품의 가치가 감소한 경우</li>
            <li>• 시간이 경과하여 재판매가 곤란할 정도로 상품의 가치가 감소한 경우</li>
            <li>• 세탁, 수선 등 고객의 행위로 원래 상태가 변경된 경우</li>
            <li>• 상품의 태그, 라벨 등이 제거된 경우</li>
          </ul>
        </section>
        <section>
          <h2 className="text-sm font-medium text-black mb-3">배송비 안내</h2>
          <ul className="space-y-2">
            <li>• 상품 하자/오배송: <strong>회사 부담</strong></li>
            <li>• 단순 변심: <strong>고객 부담</strong> (왕복 6,000원)</li>
            <li>• 사이즈 교환 1회: <strong>무료</strong></li>
          </ul>
        </section>
        <section>
          <h2 className="text-sm font-medium text-black mb-3">환불 안내</h2>
          <p>반품 상품 확인 후 <strong>3 영업일 이내</strong> 결제 수단으로 환불됩니다.</p>
        </section>
      </div>
    </div>
  );
}
