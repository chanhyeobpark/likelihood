import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SearchModal } from "@/components/search/search-modal";

const ACCOUNT_NAV = [
  { href: "/mypage", label: "마이페이지" },
  { href: "/orders", label: "주문내역" },
  { href: "/wishlist", label: "위시리스트" },
  { href: "/points", label: "포인트" },
  { href: "/reviews", label: "내 리뷰" },
  { href: "/custom-orders", label: "제작의뢰" },
  { href: "/settings", label: "회원정보" },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <MobileNav />
      <CartDrawer />
      <SearchModal />
      <div className="container-wide py-12">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-12">
          {/* Sidebar */}
          <aside className="hidden md:block">
            <h2 className="text-xs font-medium tracking-wider uppercase mb-6">My Account</h2>
            <nav className="space-y-3">
              {ACCOUNT_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-sm text-gray-500 hover:text-black transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main>{children}</main>
        </div>
      </div>
      <Footer />
    </>
  );
}
