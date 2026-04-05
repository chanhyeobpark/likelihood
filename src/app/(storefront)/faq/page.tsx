import type { Metadata } from "next";

export const metadata: Metadata = { title: "자주 묻는 질문" };

const FAQS = [
  { q: "주문 후 얼마나 걸리나요?", a: "주문 확인 후 1~2 영업일 내에 발송되며, 발송 후 1~3일 내에 수령하실 수 있습니다." },
  { q: "교환/반품은 어떻게 하나요?", a: "수령 후 7일 이내 고객센터(070-7782-2805)로 연락해 주시면 안내해 드립니다. 상품 하자의 경우 배송비는 회사가 부담합니다." },
  { q: "결제 방법은 무엇이 있나요?", a: "신용카드, 계좌이체, 간편결제(카카오페이, 네이버페이 등)를 지원합니다." },
  { q: "회원 등급은 어떻게 올라가나요?", a: "누적 구매 금액에 따라 자동으로 등급이 올라갑니다. STANDARD → SILVER (30만원) → GOLD (100만원) → VIP (300만원)" },
  { q: "포인트는 어떻게 사용하나요?", a: "주문 시 포인트를 사용하여 결제 금액을 차감할 수 있습니다. 1포인트 = 1원입니다." },
  { q: "제작의뢰는 어떻게 하나요?", a: "로그인 후 '제작의뢰' 메뉴에서 원하시는 디자인, 수량, 예산 등을 작성하시면 검토 후 견적을 안내해 드립니다." },
  { q: "사이즈가 맞지 않으면 어떻게 하나요?", a: "상품 페이지의 사이즈 가이드를 참고해 주세요. 사이즈 교환은 무료로 1회 가능합니다." },
  { q: "해외 배송이 가능한가요?", a: "현재 국내 배송만 가능합니다. 해외 배송은 추후 지원 예정입니다." },
];

export default function FAQPage() {
  return (
    <div className="container-wide py-16 max-w-3xl mx-auto">
      <h1 className="text-2xl font-light tracking-wider mb-8">자주 묻는 질문</h1>
      <div className="divide-y">
        {FAQS.map((faq, i) => (
          <div key={i} className="py-6">
            <h3 className="text-sm font-medium mb-2">Q. {faq.q}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">A. {faq.a}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 p-6 bg-gray-50 rounded text-center">
        <p className="text-sm text-gray-500 mb-2">원하시는 답변을 찾지 못하셨나요?</p>
        <p className="text-sm">고객센터: <strong>070-7782-2805</strong> | 이메일: info@likelihood.co.kr</p>
      </div>
    </div>
  );
}
