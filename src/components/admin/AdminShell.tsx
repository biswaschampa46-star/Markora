"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Mail,
  Menu,
  Package,
  ShoppingCart,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SiteLogo } from "@/components/site/SiteLogo";

const NAV_ITEMS = [
  { href: "/admin", label: "ড্যাশবোর্ড", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "পণ্য সমূহ", icon: Package },
  { href: "/admin/categories", label: "ক্যাটাগরি", icon: LayoutGrid },
  { href: "/admin/orders", label: "অর্ডার সমূহ", icon: ShoppingCart },
  { href: "/admin/messages", label: "বার্তা সমূহ", icon: Mail },
];

export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/admin/login");
    router.refresh();
  }

  const navContent = (
    <>
      <div className="flex items-center gap-3 border-b border-navy-800 px-4 py-4">
        <SiteLogo className="h-9" />
        <span className="text-sm font-bold text-white">অ্যাডমিন প্যানেল</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? "bg-brand-500 text-white" : "text-cream-200 hover:bg-navy-800 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={1.8} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-navy-800 px-4 py-4">
        <p className="truncate text-xs text-cream-300/70">{email}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-cream-200 transition hover:bg-navy-800 hover:text-white"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.8} />
          লগআউট
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-cream-100">
      {/* Desktop sidebar */}
      <aside className="scrollbar-dark hidden w-64 shrink-0 flex-col overflow-y-auto bg-navy-950 lg:flex">
        {navContent}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="scrollbar-dark flex w-64 flex-col overflow-y-auto bg-navy-950">
            {navContent}
          </div>
          <button
            aria-label="মেনু বন্ধ করুন"
            className="flex-1 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-cream-300 bg-white px-4 py-3 lg:hidden">
          <button
            aria-label="মেনু খুলুন"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-1.5 text-ink-700 hover:bg-cream-100"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <SiteLogo className="h-7" chip={false} />
          <span className="text-base font-extrabold text-navy-900">অ্যাডমিন</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
