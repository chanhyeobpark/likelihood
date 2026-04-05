import type { Metadata } from "next";

export const metadata: Metadata = { title: "이용약관" };

export default function TermsPage() {
  return (
    <div className="container-wide py-16 max-w-3xl mx-auto">
      <h1 className="text-2xl font-light tracking-wider mb-8">이용약관</h1>
      <div className="prose prose-sm max-w-none text-gray-600 space-y-8">
        <section>
          <h2 className="text-sm font-medium text-black mb-3">제1조 (목적)</h2>
          <p>이 약관은 라이클리후드(LIKELIHOOD)(이하 "회사")가 운영하는 온라인 쇼핑몰에서 제공하는 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
        </section>
        <section>
          <h2 className="text-sm font-medium text-black mb-3">제2조 (정의)</h2>
          <p>1. "쇼핑몰"이란 회사가 재화 또는 용역을 이용자에게 제공하기 위하여 컴퓨터 등 정보통신설비를 이용하여 재화 또는 용역을 거래할 수 있도록 설정한 가상의 영업장을 말합니다.</p>
          <p>2. "이용자"란 쇼핑몰에 접속하여 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</p>
        </section>
        <section>
          <h2 className="text-sm font-medium text-black mb-3">제3조 (약관의 게시와 개정)</h2>
          <p>1. 회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</p>
          <p>2. 회사는 관련법을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</p>
        </section>
        <section>
          <h2 className="text-sm font-medium text-black mb-3">제4조 (서비스의 제공 및 변경)</h2>
          <p>1. 회사는 다음과 같은 업무를 수행합니다.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>재화 또는 용역에 대한 정보 제공 및 구매계약의 체결</li>
            <li>구매계약이 체결된 재화 또는 용역의 배송</li>
            <li>기타 회사가 정하는 업무</li>
          </ul>
        </section>
        <section>
          <h2 className="text-sm font-medium text-black mb-3">제5조 (서비스의 중단)</h2>
          <p>회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</p>
        </section>
        <section>
          <h2 className="text-sm font-medium text-black mb-3">제6조 (회원가입)</h2>
          <p>1. 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.</p>
          <p>2. 회사는 전항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각호에 해당하지 않는 한 회원으로 등록합니다.</p>
        </section>
        <section>
          <h2 className="text-sm font-medium text-black mb-3">제7조 (개인정보보호)</h2>
          <p>회사는 이용자의 개인정보를 보호하기 위하여 개인정보처리방침을 수립하고 이를 준수합니다. 자세한 내용은 개인정보처리방침을 참조하여 주시기 바랍니다.</p>
        </section>
        <p className="text-xs text-gray-400 pt-8 border-t">시행일자: 2026년 4월 1일</p>
      </div>
    </div>
  );
}
