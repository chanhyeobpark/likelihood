"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

interface Variant {
  id: string;
  sku: string;
  size: string;
  color_name_ko: string;
  color_name_en: string;
  color_hex: string | null;
  price_override: number | null;
  stock_quantity: number;
  is_active: boolean;
}

interface VariantSelectorProps {
  variants: Variant[];
  basePrice: number;
  onSelect: (variant: Variant | null) => void;
}

export function VariantSelector({ variants, basePrice, onSelect }: VariantSelectorProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const colors = useMemo(() => {
    const colorMap = new Map<string, { nameKo: string; hex: string | null }>();
    variants.forEach((v) => {
      if (!colorMap.has(v.color_name_ko)) {
        colorMap.set(v.color_name_ko, { nameKo: v.color_name_ko, hex: v.color_hex });
      }
    });
    return Array.from(colorMap.entries()).map(([key, val]) => ({ key, ...val }));
  }, [variants]);

  const sizes = useMemo(() => {
    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'FREE'];
    const sizeSet = new Set(variants.map((v) => v.size));
    return sizeOrder.filter((s) => sizeSet.has(s));
  }, [variants]);

  const selectedVariant = useMemo(() => {
    if (!selectedColor || !selectedSize) return null;
    return variants.find(
      (v) => v.color_name_ko === selectedColor && v.size === selectedSize && v.is_active
    ) || null;
  }, [variants, selectedColor, selectedSize]);

  const getVariantForSize = (size: string) => {
    if (!selectedColor) return null;
    return variants.find((v) => v.color_name_ko === selectedColor && v.size === size);
  };

  // Notify parent
  useEffect(() => {
    onSelect(selectedVariant);
  }, [selectedVariant, onSelect]);

  return (
    <div className="space-y-6">
      {/* Color Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs tracking-wider uppercase text-gray-500">
            Color
          </span>
          {selectedColor && (
            <span className="text-xs text-gray-500">{selectedColor}</span>
          )}
        </div>
        <div className="flex gap-2">
          {colors.map((color) => (
            <button
              key={color.key}
              onClick={() => {
                setSelectedColor(color.key);
                setSelectedSize(null);
              }}
              className={`w-8 h-8 rounded-full border-2 transition-colors ${
                selectedColor === color.key
                  ? "border-black"
                  : "border-gray-200 hover:border-gray-400"
              }`}
              style={{
                backgroundColor: color.hex || "#ccc",
              }}
              title={color.nameKo}
            />
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs tracking-wider uppercase text-gray-500">
            Size
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => {
            const variant = getVariantForSize(size);
            const isOutOfStock = variant ? variant.stock_quantity === 0 : false;
            const isDisabled = !selectedColor || isOutOfStock;

            return (
              <button
                key={size}
                onClick={() => !isDisabled && setSelectedSize(size)}
                disabled={isDisabled}
                className={`min-w-[48px] h-10 px-3 text-sm border transition-colors ${
                  selectedSize === size
                    ? "border-black bg-black text-white"
                    : isDisabled
                    ? "border-gray-100 text-gray-300 cursor-not-allowed"
                    : "border-gray-200 hover:border-black"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
        {selectedVariant && selectedVariant.stock_quantity <= 5 && selectedVariant.stock_quantity > 0 && (
          <p className="text-xs text-red-500 mt-2">
            {selectedVariant.stock_quantity}개 남음
          </p>
        )}
      </div>
    </div>
  );
}
