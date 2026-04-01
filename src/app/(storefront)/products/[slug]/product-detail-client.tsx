"use client";

import { useState, useCallback } from "react";
import { ShoppingBag, Heart } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { VariantSelector } from "@/components/product/variant-selector";
import { useCartStore } from "@/stores/cart-store";
import { useUIStore } from "@/stores/ui-store";
import { toast } from "sonner";

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

interface Props {
  productId: string;
  productNameKo: string;
  productNameEn: string;
  basePrice: number;
  variants: Variant[];
  primaryImageUrl: string | null;
}

export function ProductDetailClient({
  productId,
  productNameKo,
  productNameEn,
  basePrice,
  variants,
  primaryImageUrl,
}: Props) {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const setCartOpen = useUIStore((s) => s.setCartOpen);

  const handleSelect = useCallback((variant: Variant | null) => {
    setSelectedVariant(variant);
    setQuantity(1);
  }, []);

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("옵션을 선택해주세요");
      return;
    }

    if (selectedVariant.stock_quantity === 0) {
      toast.error("품절된 상품입니다");
      return;
    }

    const price = selectedVariant.price_override ?? basePrice;

    addItem({
      variantId: selectedVariant.id,
      productId,
      productNameKo,
      productNameEn,
      variantLabel: `${selectedVariant.color_name_ko} / ${selectedVariant.size}`,
      size: selectedVariant.size,
      colorNameKo: selectedVariant.color_name_ko,
      colorNameEn: selectedVariant.color_name_en,
      quantity,
      unitPrice: price,
      imageUrl: primaryImageUrl,
      maxStock: selectedVariant.stock_quantity,
    });

    toast.success("장바구니에 추가되었습니다");
    setCartOpen(true);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <VariantSelector
        variants={variants}
        basePrice={basePrice}
        onSelect={handleSelect}
      />

      {/* Quantity */}
      {selectedVariant && (
        <div>
          <span className="text-xs tracking-wider uppercase text-gray-500 mb-3 block">
            Quantity
          </span>
          <div className="flex items-center gap-4">
            <button
              className="w-10 h-10 border text-sm hover:bg-gray-50"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              -
            </button>
            <span className="text-sm w-8 text-center">{quantity}</span>
            <button
              className="w-10 h-10 border text-sm hover:bg-gray-50"
              onClick={() =>
                setQuantity((q) =>
                  Math.min(selectedVariant.stock_quantity, q + 1)
                )
              }
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Add to Cart */}
      <div className="flex gap-3">
        <Button
          onClick={handleAddToCart}
          disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
          className="flex-1 bg-black text-white hover:bg-gray-900 rounded-none h-12 text-sm tracking-wider uppercase disabled:opacity-40"
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          {selectedVariant?.stock_quantity === 0 ? "품절" : "장바구니 담기"}
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-none border-gray-200"
        >
          <Heart className="h-5 w-5" />
        </Button>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden z-40">
        <Button
          onClick={handleAddToCart}
          disabled={!selectedVariant || selectedVariant.stock_quantity === 0}
          className="w-full bg-black text-white hover:bg-gray-900 rounded-none h-12 text-sm tracking-wider uppercase disabled:opacity-40"
        >
          <ShoppingBag className="h-4 w-4 mr-2" />
          {selectedVariant?.stock_quantity === 0 ? "품절" : selectedVariant ? `장바구니 담기 · ${formatPrice(selectedVariant.price_override ?? basePrice)}` : "옵션을 선택해주세요"}
        </Button>
      </div>
    </div>
  );
}
