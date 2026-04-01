"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GalleryImage {
  url: string;
  altKo?: string | null;
}

export function ProductGallery({ images }: { images: GalleryImage[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return (
      <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center">
        <p className="text-sm text-gray-400">이미지 없음</p>
      </div>
    );
  }

  const scrollToIndex = (index: number) => {
    setCurrentIndex(index);
    if (scrollRef.current) {
      const child = scrollRef.current.children[index] as HTMLElement;
      if (child) {
        child.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      }
    }
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const width = scrollRef.current.offsetWidth;
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < images.length) {
      setCurrentIndex(newIndex);
    }
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnail strip - desktop only */}
      {images.length > 1 && (
        <div className="hidden md:flex md:flex-col gap-2 md:w-20 md:max-h-[600px] overflow-y-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`flex-shrink-0 w-20 h-24 overflow-hidden border-2 transition-colors ${
                i === currentIndex ? "border-black" : "border-transparent hover:border-gray-300"
              }`}
            >
              <Image
                src={img.url}
                alt={img.altKo || `상품 이미지 ${i + 1}`}
                width={80}
                height={96}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Main image area */}
      <div className="relative flex-1">
        {/* Mobile: horizontal scroll snap */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex md:hidden overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
        >
          {images.map((img, i) => (
            <div key={i} className="w-full flex-shrink-0 snap-start aspect-[3/4] bg-gray-50 relative">
              <Image
                src={img.url}
                alt={img.altKo || `상품 이미지 ${i + 1}`}
                fill
                sizes="100vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        {/* Mobile dots indicator */}
        {images.length > 1 && (
          <div className="flex md:hidden justify-center gap-1.5 mt-3">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === currentIndex ? "bg-black" : "bg-gray-300"
                }`}
                aria-label={`이미지 ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Desktop: single image with arrows */}
        <div className="hidden md:block relative aspect-[3/4] bg-gray-50 overflow-hidden group">
          <Image
            src={images[currentIndex].url}
            alt={images[currentIndex].altKo || "상품 이미지"}
            fill
            sizes="50vw"
            className="object-cover"
            priority
          />

          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                onClick={() => setCurrentIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                aria-label="이전 이미지"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                onClick={() => setCurrentIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
                aria-label="다음 이미지"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
