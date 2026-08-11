import type { ReactNode } from "react";
import { CartProvider } from "@/lib/cart-context";
import { ToastProvider } from "@/lib/toast-context";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { PageTransition } from "@/components/site/PageTransition";
import { CartDrawer } from "@/components/site/CartDrawer";
import { BackToTop } from "@/components/site/BackToTop";
import { MotionSetup } from "@/components/site/MotionSetup";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <CartProvider>
        <MotionSetup />
        <div className="flex min-h-screen flex-col bg-cream-100">
          <Header />
          <main className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </div>
        <CartDrawer />
        <BackToTop />
      </CartProvider>
    </ToastProvider>
  );
}
