"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Warehouse, Users, Tag, Paintbrush, BarChart3, Settings } from "lucide-react";

const ADMIN_NAV = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/products", label: "상품관리", icon: Package },
  { href: "/admin/orders", label: "주문관리", icon: ShoppingCart },
  { href: "/admin/inventory", label: "재고관리", icon: Warehouse },
  { href: "/admin/members", label: "회원관리", icon: Users },
  { href: "/admin/promotions", label: "프로모션", icon: Tag },
  { href: "/admin/custom-orders", label: "제작의뢰", icon: Paintbrush },
  { href: "/admin/analytics", label: "분석", icon: BarChart3 },
  { href: "/admin/settings", label: "설정", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 bg-white border-r min-h-[calc(100vh-56px)] p-4 hidden md:block">
      <nav className="space-y-1">
        {ADMIN_NAV.map((item) => {
          const isActive = item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-colors ${
                isActive
                  ? "bg-gray-100 text-black font-medium"
                  : "text-gray-600 hover:text-black hover:bg-gray-50"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
