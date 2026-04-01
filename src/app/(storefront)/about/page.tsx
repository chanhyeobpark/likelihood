import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "브랜드 소개",
  description: "likelihood - 시간이 지나도 변하지 않는 가치를 추구하는 컨템포러리 패션 브랜드",
};

export default function AboutPage() {
  return (
    <div className="container-wide py-20">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-light tracking-wider mb-8">Our Story</h1>
        <div className="space-y-6 text-sm text-gray-600 leading-relaxed">
          <p>
            likelihood는 시간이 지나도 변하지 않는 가치를 추구합니다.
            미니멀한 디자인과 뛰어난 소재, 정교한 패턴으로 일상의 스타일을 완성합니다.
          </p>
          <p>
            우리는 트렌드를 쫓기보다, 본질적인 아름다움에 집중합니다.
            매 시즌 선보이는 컬렉션은 현대적이면서도 클래식한 감성을 담고 있습니다.
          </p>
          <p>
            지속 가능한 패션을 위해 환경을 고려한 소재 선택과 생산 과정을 고민하며,
            오래 입을 수 있는 옷을 만들기 위해 노력합니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20 max-w-4xl mx-auto">
        {[
          { title: "Quality", desc: "최상의 원단과 정교한 봉제로 오래도록 입을 수 있는 품질을 추구합니다." },
          { title: "Design", desc: "불필요한 요소를 덜어내고, 본질적인 아름다움에 집중합니다." },
          { title: "Sustainability", desc: "환경을 생각하는 소재 선택과 책임감 있는 생산을 실천합니다." },
        ].map((item) => (
          <div key={item.title} className="text-center">
            <h3 className="text-xs font-medium tracking-[0.2em] uppercase mb-4">{item.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
