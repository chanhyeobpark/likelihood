"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Ruler } from "lucide-react";

const SIZE_DATA: Record<string, { label: string; chest: string; waist: string; hip: string; length: string }[]> = {
  tops: [
    { label: "XS", chest: "84", waist: "66", hip: "-", length: "62" },
    { label: "S", chest: "88", waist: "70", hip: "-", length: "64" },
    { label: "M", chest: "92", waist: "74", hip: "-", length: "66" },
    { label: "L", chest: "96", waist: "78", hip: "-", length: "68" },
    { label: "XL", chest: "100", waist: "82", hip: "-", length: "70" },
  ],
  bottoms: [
    { label: "XS", chest: "-", waist: "66", hip: "88", length: "100" },
    { label: "S", chest: "-", waist: "70", hip: "92", length: "102" },
    { label: "M", chest: "-", waist: "74", hip: "96", length: "104" },
    { label: "L", chest: "-", waist: "78", hip: "100", length: "106" },
    { label: "XL", chest: "-", waist: "82", hip: "104", length: "108" },
  ],
  default: [
    { label: "XS", chest: "84", waist: "66", hip: "88", length: "- " },
    { label: "S", chest: "88", waist: "70", hip: "92", length: "-" },
    { label: "M", chest: "92", waist: "74", hip: "96", length: "-" },
    { label: "L", chest: "96", waist: "78", hip: "100", length: "-" },
    { label: "XL", chest: "100", waist: "82", hip: "104", length: "-" },
  ],
};

interface SizeGuideProps {
  categorySlug?: string;
}

export function SizeGuide({ categorySlug }: SizeGuideProps) {
  const sizes = SIZE_DATA[categorySlug || "default"] || SIZE_DATA.default;

  return (
    <Dialog>
      <DialogTrigger>
        <span className="inline-flex items-center text-xs text-gray-400 underline underline-offset-4 hover:text-black transition-colors cursor-pointer">
          <Ruler className="h-3 w-3 mr-1" />
          사이즈 가이드
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm font-medium tracking-wider">사이즈 가이드 (cm)</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-gray-500">
                <th className="text-left py-2 font-medium">사이즈</th>
                <th className="text-center py-2 font-medium">가슴</th>
                <th className="text-center py-2 font-medium">허리</th>
                <th className="text-center py-2 font-medium">엉덩이</th>
                <th className="text-center py-2 font-medium">총장</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((row) => (
                <tr key={row.label} className="border-b">
                  <td className="py-2.5 font-medium">{row.label}</td>
                  <td className="py-2.5 text-center text-gray-600">{row.chest}</td>
                  <td className="py-2.5 text-center text-gray-600">{row.waist}</td>
                  <td className="py-2.5 text-center text-gray-600">{row.hip}</td>
                  <td className="py-2.5 text-center text-gray-600">{row.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-gray-400 mt-4 leading-relaxed">
            * 측정 방법에 따라 1~3cm 오차가 발생할 수 있습니다.<br />
            * 모니터 해상도에 따라 색상이 다소 다르게 보일 수 있습니다.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
