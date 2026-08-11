import Link from "next/link";
import { BadgeCheck, Lock, RotateCcw, Truck } from "lucide-react";
import { getCategories } from "@/lib/queries";
import { Reveal } from "./Reveal";
import { SiteLogo } from "./SiteLogo";

export async function Footer() {
  const categories = await getCategories();

  return (
    <footer className="mt-12 bg-navy-950 text-cream-100">
      {/* Feature strip */}
      <div className="border-b border-navy-800">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4 lg:px-8">
          <Reveal variant="up" delay={0} className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
            <Truck className="h-6 w-6 text-brand-400" strokeWidth={1.6} />
            <p className="text-sm font-semibold">দেশজুড়ে ডেলিভারি</p>
            <p className="text-xs text-cream-300/80">কুরিয়ারের মাধ্যমে পণ্য পৌঁছে যাবে ঠিকানায়</p>
          </Reveal>
          <Reveal variant="up" delay={70} className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
            <Lock className="h-6 w-6 text-brand-400" strokeWidth={1.6} />
            <p className="text-sm font-semibold">নিরাপদ চেকআউট</p>
            <p className="text-xs text-cream-300/80">তথ্য সবসময় সুরক্ষিত রাখা হয়</p>
          </Reveal>
          <Reveal variant="up" delay={140} className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
            <BadgeCheck className="h-6 w-6 text-brand-400" strokeWidth={1.6} />
            <p className="text-sm font-semibold">যাচাইকৃত পণ্য</p>
            <p className="text-xs text-cream-300/80">প্রতিটি পণ্য বিক্রয়ের আগে যাচাই করা হয়</p>
          </Reveal>
          <Reveal variant="up" delay={210} className="flex flex-col items-center gap-2 text-center sm:items-start sm:text-left">
            <RotateCcw className="h-6 w-6 text-brand-400" strokeWidth={1.6} />
            <p className="text-sm font-semibold">রিটার্ন সুবিধা</p>
            <p className="text-xs text-cream-300/80">শর্তসাপেক্ষে পণ্য ফেরতের সুযোগ</p>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 sm:grid-cols-4 lg:px-8">
        <Reveal variant="up" delay={0} className="col-span-2 sm:col-span-1">
          <SiteLogo className="h-10" />
          <p className="mt-3 text-sm leading-relaxed text-cream-300/80">
            Markora একটি বাংলাদেশ কেন্দ্রিক অনলাইন মার্কেটপ্লেস, যেখানে সহজে ও নিরাপদে পণ্য অর্ডার
            করা যায়।
          </p>
        </Reveal>

        <Reveal variant="up" delay={80}>
          <h3 className="text-sm font-semibold text-white">ক্যাটাগরি</h3>
          <ul className="mt-3 space-y-2 text-sm text-cream-300/80">
            {categories.slice(0, 6).map((category) => (
              <li key={category.slug}>
                <Link href={`/category/${category.slug}`} className="u-line hover:text-brand-400">
                  {category.nameBn}
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal variant="up" delay={160}>
          <h3 className="text-sm font-semibold text-white">সহায়তা</h3>
          <ul className="mt-3 space-y-2 text-sm text-cream-300/80">
            <li>
              <Link href="/about" className="u-line hover:text-brand-400">
                আমাদের সম্পর্কে
              </Link>
            </li>
            <li>
              <Link href="/contact" className="u-line hover:text-brand-400">
                যোগাযোগ করুন
              </Link>
            </li>
            <li>
              <Link href="/return-policy" className="u-line hover:text-brand-400">
                রিটার্ন নীতিমালা
              </Link>
            </li>
          </ul>
        </Reveal>

        <Reveal variant="up" delay={240}>
          <h3 className="text-sm font-semibold text-white">নীতিমালা</h3>
          <ul className="mt-3 space-y-2 text-sm text-cream-300/80">
            <li>
              <Link href="/terms" className="u-line hover:text-brand-400">
                ব্যবহারের শর্তাবলী
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="u-line hover:text-brand-400">
                প্রাইভেসি পলিসি
              </Link>
            </li>
          </ul>
        </Reveal>
      </div>

      <div className="border-t border-navy-800 px-4 py-4 text-center text-xs text-cream-300/70">
        <p>© {new Date().getFullYear()} Markora — সর্বস্বত্ব সংরক্ষিত।</p>
      </div>
    </footer>
  );
}
