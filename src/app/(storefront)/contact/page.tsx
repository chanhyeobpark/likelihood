import type { Metadata } from "next";

export const metadata: Metadata = { title: "고객센터" };

export default function ContactPage() {
  return (
    <div className="container-wide py-16 max-w-3xl mx-auto">
      <h1 className="text-2xl font-light tracking-wider mb-8">고객센터</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-gray-50 p-8 text-center">
          <p className="text-xs tracking-wider uppercase text-gray-400 mb-4">전화 문의</p>
          <p className="text-2xl font-light mb-2">070-7782-2805</p>
          <p className="text-sm text-gray-500">평일 10:00 - 18:00 (점심 12:00 - 13:00)</p>
          <p className="text-sm text-gray-500">토/일/공휴일 휴무</p>
        </div>
        <div className="bg-gray-50 p-8 text-center">
          <p className="text-xs tracking-wider uppercase text-gray-400 mb-4">이메일 문의</p>
          <p className="text-2xl font-light mb-2">info@likelihood.co.kr</p>
          <p className="text-sm text-gray-500">영업일 기준 24시간 이내 답변</p>
        </div>
      </div>
      <div className="space-y-6 text-sm text-gray-600">
        <section>
          <h2 className="text-sm font-medium text-black mb-3">회사 정보</h2>
          <ul className="space-y-1">
            <li>상호: 라이클리후드(LIKELIHOOD)</li>
            <li>대표: 박찬우</li>
            <li>사업자등록번호: 105-22-28585</li>
            <li>통신판매업 신고번호: 2022-제주애월-0286</li>
            <li>주소: 제주특별자치도 제주시 애월읍 신엄연대길 34-3</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
