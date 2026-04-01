"use client";

import Link from "next/link";
import { Search, ShoppingBag, User, Menu, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { useCartStore } from "@/stores/cart-store";
import { useEffect, useState } from "react";

export function Header() {
  const { setSearchOpen, setMobileMenuOpen, setCartOpen } = useUIStore();
  const getItemCount = useCartStore((s) => s.getItemCount);
  const [itemCount, setItemCount] = useState(0);

  useEffect(() => {
    setItemCount(getItemCount());
    return useCartStore.subscribe(() => {
      setItemCount(useCartStore.getState().getItemCount());
    });
  }, [getItemCount]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      {/* Announcement Bar */}
      <div className="bg-black text-white text-center text-xs py-2 px-4">
        <p>전 상품 무료배송 | FREE SHIPPING ON ALL ORDERS OVER ₩100,000</p>
      </div>

      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <Link href="/" className="text-xl font-light tracking-[0.3em] uppercase">
            likelihood
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-sm tracking-wide">
            <Link href="/products" className="hover:opacity-60 transition-opacity">
              전체상품
            </Link>
            <Link href="/categories/outer" className="hover:opacity-60 transition-opacity">
              아우터
            </Link>
            <Link href="/categories/tops" className="hover:opacity-60 transition-opacity">
              상의
            </Link>
            <Link href="/categories/bottoms" className="hover:opacity-60 transition-opacity">
              하의
            </Link>
            <Link href="/categories/dresses" className="hover:opacity-60 transition-opacity">
              원피스
            </Link>
            <Link href="/categories/accessories" className="hover:opacity-60 transition-opacity">
              액세서리
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="hover:bg-transparent hover:opacity-60"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Link href="/wishlist">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-transparent hover:opacity-60 hidden sm:inline-flex"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/mypage">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-transparent hover:opacity-60"
              >
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-transparent hover:opacity-60 relative"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
