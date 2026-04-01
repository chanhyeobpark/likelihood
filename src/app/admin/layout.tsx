import Link from "next/link";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

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
        <AdminSidebar />
        <main className="flex-1 p-6 max-w-7xl">{children}</main>
      </div>
    </div>
  );
}
