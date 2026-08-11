import Link from "next/link";
import { LogIn, Truck, UserRound } from "lucide-react";
import { getCategories } from "@/lib/queries";
import { getCategoryIcon } from "@/lib/icon-map";
import { getUser } from "@/lib/supabase/server";
import { getUserDisplayName } from "@/lib/user-display";
import { CartBadge } from "./CartBadge";
import { WishlistBadge } from "./WishlistBadge";
import { SearchBar } from "./SearchBar";
import { MobileMenu } from "./MobileMenu";
import { AccountMenu } from "./AccountMenu";
import { SiteLogo } from "./SiteLogo";

export async function Header() {
  const [categories, user] = await Promise.all([getCategories(), getUser()]);
  const displayName = user ? getUserDisplayName(user) : "";

  return (
    <header className="sticky top-0 z-40 shadow-sm">
      {/* Top utility bar */}
      <div className="hidden bg-navy-950 text-xs text-cream-200 sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 lg:px-8">
          <p className="flex items-center gap-1.5">
            <Truck className="h-3.5 w-3.5" strokeWidth={2} />
            সারাদেশে হোম ডেলিভারি সুবিধা
          </p>
          <div className="flex items-center gap-4">
            {user ? (
              <span className="flex items-center gap-1.5 font-medium text-cream-100">
                <UserRound className="h-3.5 w-3.5 text-brand-400" strokeWidth={2} />
                স্বাগতম, {displayName}
              </span>
            ) : (
              <Link
                href="/login"
                className="group flex items-center gap-1.5 font-medium transition-colors hover:text-brand-400"
              >
                <LogIn className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" strokeWidth={2} />
                লগইন / সাইন আপ
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-navy-900">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:gap-6 lg:px-8">
          <MobileMenu categories={categories} user={user} />

          <Link href="/" className="group shrink-0" aria-label="Markora হোম">
            <span className="block transition-transform duration-300 group-hover:scale-[1.03]">
              <SiteLogo className="h-9" priority />
            </span>
          </Link>

          <div className="hidden flex-1 lg:block">
            <SearchBar />
          </div>

          <div className="ml-auto flex items-center gap-1">
            <AccountMenu user={user} />
            <WishlistBadge />
            <CartBadge />
          </div>
        </div>

        <div className="px-4 pb-3 lg:hidden">
          <SearchBar />
        </div>
      </div>

      {/* Category nav */}
      <nav className="scrollbar-dark hidden overflow-x-auto border-t border-navy-800 bg-navy-800 lg:block">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-8 py-2.5 text-sm">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.icon);
            return (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="group u-line flex items-center gap-1.5 whitespace-nowrap text-cream-100 transition-colors duration-300 hover:text-brand-400"
              >
                <Icon
                  className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5"
                  strokeWidth={1.8}
                />
                {category.nameBn}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
