import { getCategories, getLatestProducts, getProductsByCategorySlug } from "@/lib/queries";
import { ProductCard } from "@/components/site/ProductCard";
import { EmptyState } from "@/components/site/EmptyState";
import { Reveal } from "@/components/site/Reveal";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const categories = await getCategories();

  const items = category
    ? (await getProductsByCategorySlug(category)).items
    : await getLatestProducts(60);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">সকল পণ্য</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/products"
          className={`chip rounded-full border px-3.5 py-1.5 text-xs font-medium ${
            !category
              ? "border-brand-500 bg-brand-500 text-white shadow-sm"
              : "border-cream-300 bg-white text-ink-700 hover:border-brand-400"
          }`}
        >
          সব
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/products?category=${c.slug}`}
            className={`chip rounded-full border px-3.5 py-1.5 text-xs font-medium ${
              category === c.slug
                ? "border-brand-500 bg-brand-500 text-white shadow-sm"
                : "border-cream-300 bg-white text-ink-700 hover:border-brand-400"
            }`}
          >
            {c.nameBn}
          </Link>
        ))}
      </div>

      {items.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((product, i) => (
            <Reveal key={product.id} variant="up" delay={Math.min(i * 50, 400)} className="h-full">
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal className="mt-6">
          <EmptyState
            title="কোনো পণ্য পাওয়া যায়নি"
            description="এই ক্যাটাগরিতে এখনো কোনো পণ্য যুক্ত করা হয়নি।"
          />
        </Reveal>
      )}
    </div>
  );
}
