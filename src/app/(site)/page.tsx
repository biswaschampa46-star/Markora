import Link from "next/link";
import { ArrowRight, Banknote, Headset, ShieldCheck, Truck } from "lucide-react";
import { getCategories, getFeaturedProducts, getLatestProducts } from "@/lib/queries";
import { CategoryGrid } from "@/components/site/CategoryGrid";
import { ProductCard } from "@/components/site/ProductCard";
import { EmptyState } from "@/components/site/EmptyState";
import { Reveal } from "@/components/site/Reveal";
import { HeroSection } from "@/components/site/HeroSection";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured, latest] = await Promise.all([
    getCategories(),
    getFeaturedProducts(8),
    getLatestProducts(12),
  ]);

  return (
    <div>
      {/* Hero */}
      <HeroSection />

      {/* Trust features */}
      <section className="border-b border-cream-300 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-5 px-4 py-6 sm:grid-cols-4 lg:px-8">
          <Reveal variant="up" delay={0}>
            <Feature icon={Truck} title="দ্রুত ডেলিভারি" desc="সারাদেশে পৌঁছে যাবে অর্ডার" />
          </Reveal>
          <Reveal variant="up" delay={80}>
            <Feature icon={Banknote} title="ক্যাশ অন ডেলিভারি" desc="হাতে পেয়ে মূল্য পরিশোধ" />
          </Reveal>
          <Reveal variant="up" delay={160}>
            <Feature icon={ShieldCheck} title="নিরাপদ চেকআউট" desc="তথ্য থাকে সুরক্ষিত" />
          </Reveal>
          <Reveal variant="up" delay={240}>
            <Feature icon={Headset} title="গ্রাহক সহায়তা" desc="প্রশ্নে পাশে থাকি আমরা" />
          </Reveal>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <Reveal>
          <SectionHeading title="ক্যাটাগরি অনুযায়ী কেনাকাটা করুন" />
        </Reveal>
        <div className="mt-4">
          <CategoryGrid categories={categories} />
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <Reveal>
            <SectionHeading title="জনপ্রিয় পণ্য" href="/products" />
          </Reveal>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
            {featured.map((product, i) => (
              <Reveal key={product.id} variant="up" delay={Math.min(i * 60, 420)} className="h-full">
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Latest products */}
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <Reveal>
          <SectionHeading title="নতুন সংযোজন" href="/products" />
        </Reveal>
        {latest.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
            {latest.map((product, i) => (
              <Reveal key={product.id} variant="up" delay={Math.min(i * 60, 420)} className="h-full">
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal>
            <EmptyState
              title="এখনো কোনো পণ্য যুক্ত করা হয়নি"
              description="অ্যাডমিন প্যানেল থেকে পণ্য যুক্ত করার পর এখানে প্রদর্শিত হবে।"
            />
          </Reveal>
        )}
      </section>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Truck;
  title: string;
  desc: string;
}) {
  return (
    <div className="group flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-50 group-hover:text-brand-600">
        <Icon
          className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5"
          strokeWidth={1.7}
        />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink-900">{title}</p>
        <p className="text-xs text-ink-500">{desc}</p>
      </div>
    </div>
  );
}

function SectionHeading({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-bold text-ink-900 sm:text-xl">{title}</h2>
      {href && (
        <Link
          href={href}
          className="group flex items-center gap-1 text-sm font-medium text-brand-600 transition-colors hover:text-brand-700"
        >
          সব দেখুন
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            strokeWidth={2}
          />
        </Link>
      )}
    </div>
  );
}
