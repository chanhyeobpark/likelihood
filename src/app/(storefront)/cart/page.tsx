"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore, type CartItem } from "@/stores/cart-store";
import { formatPrice } from "@/lib/format";
import { FREE_SHIPPING_THRESHOLD, DEFAULT_SHIPPING_FEE } from "@/lib/constants";


export default function CartPage() {
  const cartItems = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const [items, setItems] = useState<CartItem[]>([]);
  const [subtotal, setSubtotal] = useState(0);

  useEffect(() => {
    setItems(cartItems);
    setSubtotal(getSubtotal());
  }, [cartItems, getSubtotal]);

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE;
  const total = subtotal + shippingFee;

  return (
    <div className="container-wide py-12">
      <h1 className="text-2xl font-light tracking-wider mb-8">장바구니</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-gray-400 mb-6">장바구니가 비어있습니다</p>
          <Link href="/products">
            <Button variant="outline" className="rounded-none h-10 px-8 text-xs tracking-widest uppercase">
              쇼핑 계속하기
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
          {/* Cart Items */}
          <div>
            <div className="hidden md:grid grid-cols-[1fr_120px_120px_40px] gap-4 pb-4 border-b text-xs text-gray-400 tracking-wider uppercase">
              <span>상품정보</span>
              <span className="text-center">수량</span>
              <span className="text-right">금액</span>
              <span />
            </div>

            <div className="divide-y">
              {items.map((item) => (
                <div key={item.variantId} className="py-6 grid grid-cols-1 md:grid-cols-[1fr_120px_120px_40px] gap-4 items-center">
                  <div className="flex gap-4">
                    <div className="w-20 h-24 bg-gray-100 flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.productNameKo} width={80} height={96} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-100" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm">{item.productNameKo}</p>
                      <p className="text-xs text-gray-400 mt-1">{item.variantLabel}</p>
                      <p className="text-sm mt-1 md:hidden">{formatPrice(item.unitPrice)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <button className="w-8 h-8 border text-sm hover:bg-gray-50" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>-</button>
                    <span className="text-sm w-8 text-center">{item.quantity}</span>
                    <button className="w-8 h-8 border text-sm hover:bg-gray-50" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>+</button>
                  </div>
                  <p className="text-sm text-right hidden md:block">{formatPrice(item.unitPrice * item.quantity)}</p>
                  <button onClick={() => removeItem(item.variantId)} className="justify-self-end hover:opacity-60">
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:sticky lg:top-32 h-fit">
            <div className="bg-gray-50 p-6">
              <h2 className="text-xs font-medium tracking-wider uppercase mb-6">주문 요약</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">소계</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between">
                  <span className="text-gray-500">배송비</span>
                  <span>{shippingFee === 0 ? "무료" : formatPrice(shippingFee)}</span>
                </div>
                {shippingFee > 0 && (
                  <p className="text-xs text-gray-400">
                    {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} 더 구매 시 무료배송
                  </p>
                )}
                <Separator />
                <div className="flex justify-between text-base font-medium">
                  <span>합계</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Link href="/checkout" className="block mt-6">
                <Button className="w-full bg-black text-white hover:bg-gray-900 rounded-none h-12 text-sm tracking-wider uppercase">
                  결제하기 <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
