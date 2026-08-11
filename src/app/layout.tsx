import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Hind_Siliguri } from "next/font/google";
import { Preloader } from "@/components/site/Preloader";
import "./globals.css";

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Markora — বাংলাদেশের নির্ভরযোগ্য অনলাইন শপ",
  description:
    "Markora তে পাবেন ইলেকট্রনিক্স, ফ্যাশন, হোম ও লিভিং সহ নানা পণ্য, নিরাপদ পেমেন্ট এবং ক্যাশ অন ডেলিভারি সুবিধায়।",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="bn" data-scroll-behavior="smooth" className={hindSiliguri.variable}>
      <body className="antialiased">
        <Preloader />
        {children}
      </body>
    </html>
  );
}
