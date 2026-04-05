import type { Metadata } from "next";

export const metadata: Metadata = { title: "개인정보처리방침" };

export default function PrivacyPage() {
  return (
    <div className="container-wide py-16 max-w-3xl mx-auto">
      <h1 className="text-2xl font-light tracking-wider mb-8">개인정보처리방침</h1>
      <div className="prose prose-sm max-w-none text-gray-600 space-y-8">
        <section>
          <h2 className="text-sm font-medium text-black mb-3">1. 개인정보의 수집 및 이용 목적</h2>
          <p>라이클리후드(LIKELIHOOD)(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>회원 가입 및 관리: 회원제 서비스 이용에 따른 본인 확인, 회원자격 유지·관리</li>
            <li>재화 또는 서비스 제공: 물품배송, 서비스 제공, 계약서·청구서 발송, 콘텐츠 제공</li>
            <li>마케팅 및 광고: 신규 서비스 개발, 이벤트 및 광고성 정보 제공</li>
          </ul>
        </section>
        <section>
          <h2 className="text-sm font-medium text-black mb-3">2. 수집하는 개인정보 항목</h2>
          <p><strong>필수항목:</strong> 이메일, 비밀번호, 이름, 연락처</p>
          <p><strong>선택항목:</strong> 주소, 생년월일</p>
          <p><strong>배송 시:</strong> 수령인명, 배송지 주소, 연락처</p>
        </section>
        <section>
          <h2 className="text-sm font-medium text-black mb-3">3. 개인정보의 보유 및 이용기간</h2>
          <p>회원 탈퇴 시까지. 단, 관계 법령에 의하여 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안 보관합니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
            <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
            <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
          </ul>
        </section>
        <section>
          <h2 className="text-sm font-medium text-black mb-3">4. 개인정보의 제3자 제공</h2>
          <p>회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다. 다만, 배송업무를 위해 택배사에 최소한의 정보(수령인명, 주소, 연락처)를 제공합니다.</p>
        </section>
        <section>
          <h2 className="text-sm font-medium text-black mb-3">5. 개인정보보호 책임자</h2>
          <p>성명: 박찬우 | 직책: 대표</p>
          <p>연락처: 070-7782-2805 | 이메일: info@likelihood.co.kr</p>
        </section>
        <p className="text-xs text-gray-400 pt-8 border-t">시행일자: 2026년 4월 1일</p>
      </div>
    </div>
  );
}
