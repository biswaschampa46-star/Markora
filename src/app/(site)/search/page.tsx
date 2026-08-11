import { searchProducts } from "@/lib/queries";
import { ProductCard } from "@/components/site/ProductCard";
import { EmptyState } from "@/components/site/EmptyState";
import { SearchBar } from "@/components/site/SearchBar";
import { Reveal } from "@/components/site/Reveal";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const results = q ? await searchProducts(q) : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="max-w-md">
        <SearchBar defaultValue={q} />
      </div>

      <h1 className="mt-5 text-lg font-bold text-ink-900">
        {q ? `"${q}" এর জন্য ফলাফল (${results.length} টি)` : "খুঁজতে উপরে লিখুন"}
      </h1>

      {results.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {results.map((product, i) => (
            <Reveal key={product.id} variant="up" delay={Math.min(i * 55, 380)} className="h-full">
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      ) : q ? (
        <Reveal className="mt-5">
          <EmptyState
            title="কোনো পণ্য পাওয়া যায়নি"
            description="ভিন্ন কিছু দিয়ে আবার খুঁজে দেখুন।"
          />
        </Reveal>
      ) : null}
    </div>
  );
}
