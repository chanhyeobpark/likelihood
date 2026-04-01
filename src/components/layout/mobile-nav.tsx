"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useUIStore } from "@/stores/ui-store";
import { Separator } from "@/components/ui/separator";

const NAV_ITEMS = [
  { href: "/products", label: "전체상품" },
  { href: "/categories/outer", label: "아우터" },
  { href: "/categories/tops", label: "상의" },
  { href: "/categories/bottoms", label: "하의" },
  { href: "/categories/dresses", label: "원피스" },
  { href: "/categories/accessories", label: "액세서리" },
  { href: "/categories/bags", label: "가방" },
];

export function MobileNav() {
  const { isMobileMenuOpen, setMobileMenuOpen } = useUIStore();

  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetContent side="left" className="w-[300px] p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="text-lg font-light tracking-[0.3em] uppercase text-left">
            likelihood
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col p-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="py-3 text-sm tracking-wide hover:opacity-60 transition-opacity"
            >
              {item.label}
            </Link>
          ))}
          <Separator className="my-4" />
          <Link
            href="/mypage"
            onClick={() => setMobileMenuOpen(false)}
            className="py-3 text-sm tracking-wide text-gray-500 hover:text-black transition-colors"
          >
            마이페이지
          </Link>
          <Link
            href="/wishlist"
            onClick={() => setMobileMenuOpen(false)}
            className="py-3 text-sm tracking-wide text-gray-500 hover:text-black transition-colors"
          >
            위시리스트
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
