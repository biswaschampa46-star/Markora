import { notFound } from "next/navigation";
import { getProductsByCategorySlug } from "@/lib/queries";
import { ProductCard } from "@/components/site/ProductCard";
import { EmptyState } from "@/components/site/EmptyState";
import { Reveal } from "@/components/site/Reveal";
import { getCategoryIcon } from "@/lib/icon-map";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { category, items } = await getProductsByCategorySlug(slug);

  if (!category) {
    notFound();
  }

  const Icon = getCategoryIcon(category.icon);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="rise-item flex items-center gap-3">
        <span className="success-ring flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
          {/* eslint-disable-next-line react-hooks/static-components */}
          <Icon className="h-6 w-6" strokeWidth={1.7} />
        </span>
        <div>
          <h1 className="text-xl font-bold text-ink-900 sm:text-2xl">{category.nameBn}</h1>
          <p className="text-sm text-ink-500">{items.length} টি পণ্য</p>
        </div>
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
            title="এই ক্যাটাগরিতে কোনো পণ্য নেই"
            description="শীঘ্রই নতুন পণ্য যুক্ত করা হবে।"
          />
        </Reveal>
      )}
    </div>
  );
}
