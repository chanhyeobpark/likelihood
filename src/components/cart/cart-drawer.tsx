"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useUIStore } from "@/stores/ui-store";
import { useCartStore } from "@/stores/cart-store";
import { formatPrice } from "@/lib/format";
import { useEffect, useState } from "react";
import type { CartItem } from "@/stores/cart-store";

export function CartDrawer() {
  const { isCartOpen, setCartOpen } = useUIStore();
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

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-sm font-medium tracking-wider uppercase">
            장바구니 ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-400">장바구니가 비어있습니다</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-4">
                  <div className="w-20 h-24 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.productNameKo}
                        width={80}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.productNameKo}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.variantLabel}</p>
                    <p className="text-sm mt-1">{formatPrice(item.unitPrice)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() => removeItem(item.variantId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="border-t px-6 py-4 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">소계</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-gray-400">배송비는 결제 시 계산됩니다</p>
              <Link href="/checkout" onClick={() => setCartOpen(false)}>
                <Button className="w-full bg-black text-white hover:bg-gray-900 rounded-none h-12 text-sm tracking-wider uppercase">
                  결제하기
                </Button>
              </Link>
              <Link href="/cart" onClick={() => setCartOpen(false)}>
                <Button variant="outline" className="w-full rounded-none h-10 text-sm tracking-wider uppercase mt-2">
                  장바구니 보기
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
