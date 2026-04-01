"use client";

import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface ProductCardProps {
  slug: string;
  nameKo: string;
  nameEn: string;
  price: number;
  compareAtPrice?: number | null;
  imageUrl?: string | null;
  isNew?: boolean;
  isSoldOut?: boolean;
}

export function ProductCard({
  slug, nameKo, nameEn, price, compareAtPrice, imageUrl, isNew, isSoldOut,
}: ProductCardProps) {
  const discount = compareAtPrice
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  return (
    <Link href={`/products/${slug}`} className="group block">
      <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden mb-3">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={nameKo}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-gray-100 to-gray-200 group-hover:scale-110 transition-transform duration-700" />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isNew && (
            <Badge variant="secondary" className="bg-black text-white text-[10px] rounded-none px-2">NEW</Badge>
          )}
          {discount > 0 && (
            <Badge variant="secondary" className="bg-red-500 text-white text-[10px] rounded-none px-2">-{discount}%</Badge>
          )}
          {isSoldOut && (
            <Badge variant="secondary" className="bg-gray-500 text-white text-[10px] rounded-none px-2">SOLD OUT</Badge>
          )}
        </div>

        {/* Quick View on hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <div className="bg-white/90 backdrop-blur-sm text-center py-2.5 text-xs tracking-wider uppercase">
            Quick View
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <h3 className="text-sm truncate group-hover:opacity-70 transition-opacity duration-300">{nameKo}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{formatPrice(price)}</span>
          {compareAtPrice && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(compareAtPrice)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
