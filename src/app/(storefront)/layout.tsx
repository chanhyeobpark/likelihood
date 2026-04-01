import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SearchModal } from "@/components/search/search-modal";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <MobileNav />
      <CartDrawer />
      <SearchModal />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
    </>
  );
}
