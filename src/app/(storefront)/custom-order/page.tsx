import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "제작의뢰",
  description: "likelihood에서 원하는 디자인의 의류를 제작해 드립니다.",
};

const STEPS = [
  { num: "01", title: "의뢰 접수", desc: "원하시는 디자인, 수량, 예산을 알려주세요" },
  { num: "02", title: "검토 & 견적", desc: "디자인 검토 후 견적을 안내해 드립니다" },
  { num: "03", title: "견적 수락", desc: "견적을 확인하시고 제작을 진행합니다" },
  { num: "04", title: "제작 진행", desc: "숙련된 장인이 정성껏 제작합니다" },
  { num: "05", title: "완성 & 배송", desc: "품질 검수 후 안전하게 배송해 드립니다" },
];

export default function CustomOrderPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-black text-white py-24 md:py-32">
        <div className="container-wide text-center max-w-3xl mx-auto">
          <p className="text-xs tracking-[0.4em] uppercase text-gray-400 mb-6">Custom Order</p>
          <h1 className="text-3xl md:text-5xl font-extralight tracking-wider mb-6">
            원하는 디자인을<br />현실로 만들어 드립니다
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed mb-10">
            likelihood의 노하우로 당신만의 특별한 의류를 제작합니다.
            소량 주문부터 단체복, 유니폼까지 다양한 제작이 가능합니다.
          </p>
          <Link href="/custom-orders/new">
            <Button variant="outline" className="rounded-none border-white text-white hover:bg-white hover:text-black h-12 px-10 text-sm tracking-widest uppercase bg-transparent">
              제작 의뢰하기
            </Button>
          </Link>
        </div>
      </section>

      {/* Process */}
      <section className="container-wide py-20">
        <h2 className="text-center text-xs font-medium tracking-[0.3em] uppercase mb-16">Process</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {STEPS.map((step, i) => (
            <div key={step.num} className="text-center">
              <p className="text-3xl font-extralight text-gray-200 mb-4">{step.num}</p>
              <h3 className="text-sm font-medium mb-2">{step.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              {i < STEPS.length - 1 && (
                <div className="hidden md:block mt-6 mx-auto w-full h-px bg-gray-200" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* What we make */}
      <section className="bg-gray-50 py-20">
        <div className="container-wide">
          <h2 className="text-center text-xs font-medium tracking-[0.3em] uppercase mb-12">What We Make</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: "👖", name: "팬츠" },
              { icon: "🧥", name: "재킷 & 코트" },
              { icon: "👔", name: "셔츠" },
              { icon: "👗", name: "원피스" },
              { icon: "🧶", name: "니트웨어" },
              { icon: "👕", name: "티셔츠" },
              { icon: "🎽", name: "단체복 & 유니폼" },
              { icon: "✨", name: "기타 맞춤" },
            ].map((item) => (
              <div key={item.name} className="bg-white p-6 text-center">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-sm mt-3">{item.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-wide py-20 text-center">
        <h2 className="text-2xl font-light tracking-wider mb-4">시작해 볼까요?</h2>
        <p className="text-sm text-gray-500 mb-8">로그인 후 제작 의뢰서를 작성해 주세요</p>
        <Link href="/custom-orders/new">
          <Button className="bg-black text-white hover:bg-gray-900 rounded-none h-12 px-10 text-sm tracking-widest uppercase">
            제작 의뢰하기
          </Button>
        </Link>
      </section>
    </div>
  );
}
