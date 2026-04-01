import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Warehouse, Users, Tag, BarChart3, Settings } from "lucide-react";

const ADMIN_NAV = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/products", label: "상품관리", icon: Package },
  { href: "/admin/orders", label: "주문관리", icon: ShoppingCart },
  { href: "/admin/inventory", label: "재고관리", icon: Warehouse },
  { href: "/admin/members", label: "회원관리", icon: Users },
  { href: "/admin/promotions", label: "프로모션", icon: Tag },
  { href: "/admin/analytics", label: "분석", icon: BarChart3 },
  { href: "/admin/settings", label: "설정", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b h-14 flex items-center px-6 sticky top-0 z-50">
        <Link href="/admin" className="text-sm font-light tracking-[0.2em] uppercase">
          likelihood <span className="text-gray-400 ml-2">Admin</span>
        </Link>
        <div className="ml-auto">
          <Link href="/" className="text-xs text-gray-400 hover:text-black">사이트 보기</Link>
        </div>
      </header>
      <div className="flex">
        <aside className="w-56 bg-white border-r min-h-[calc(100vh-56px)] p-4 hidden md:block">
          <nav className="space-y-1">
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-6 max-w-7xl">{children}</main>
      </div>
    </div>
  );
}
