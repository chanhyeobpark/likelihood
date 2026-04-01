"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingBag, User, Menu, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { useCartStore } from "@/stores/cart-store";
import { motion, useScroll, useTransform } from "framer-motion";

export function Header() {
  const { setSearchOpen, setMobileMenuOpen, setCartOpen } = useUIStore();
  const getItemCount = useCartStore((s) => s.getItemCount);
  const [itemCount, setItemCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const { scrollY } = useScroll();

  useEffect(() => {
    setItemCount(getItemCount());
    return useCartStore.subscribe(() => {
      setItemCount(useCartStore.getState().getItemCount());
    });
  }, [getItemCount]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-black text-white text-center text-xs py-2 px-4 relative z-50">
        <p>전 상품 무료배송 | FREE SHIPPING ON ALL ORDERS OVER ₩100,000</p>
      </div>

      <motion.header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
            : "bg-white border-b border-gray-100"
        }`}
      >
        <div className="container-wide">
          <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? "h-14" : "h-16"}`}>
            {/* Mobile Menu */}
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo */}
            <Link href="/" className={`font-light tracking-[0.3em] uppercase transition-all duration-300 ${scrolled ? "text-lg" : "text-xl"}`}>
              likelihood
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8 text-sm tracking-wide">
              {[
                { href: "/products", label: "전체상품" },
                { href: "/categories/outer", label: "아우터" },
                { href: "/categories/tops", label: "상의" },
                { href: "/categories/bottoms", label: "하의" },
                { href: "/categories/dresses", label: "원피스" },
                { href: "/categories/accessories", label: "액세서리" },
                { href: "/custom-order", label: "제작의뢰" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative group py-1"
                >
                  <span className="hover:opacity-60 transition-opacity">{item.label}</span>
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-black group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="hover:bg-transparent hover:opacity-60">
                <Search className="h-5 w-5" />
              </Button>
              <Link href="/wishlist">
                <Button variant="ghost" size="icon" className="hover:bg-transparent hover:opacity-60 hidden sm:inline-flex">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/mypage">
                <Button variant="ghost" size="icon" className="hover:bg-transparent hover:opacity-60">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="hover:bg-transparent hover:opacity-60 relative" onClick={() => setCartOpen(true)}>
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-black text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center"
                  >
                    {itemCount}
                  </motion.span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>
    </>
  );
}
