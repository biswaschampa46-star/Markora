import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageOff, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { formatTaka, toBanglaDigits } from "@/lib/format";
import { ProductActions } from "@/components/site/ProductActions";
import { ProductCard } from "@/components/site/ProductCard";
import { Reveal } from "@/components/site/Reveal";
import { AnimatedNumber } from "@/components/site/AnimatedNumber";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product.categoryId, product.id, 4);

  const price = Number(product.price);
  const oldPrice = product.oldPrice ? Number(product.oldPrice) : null;
  const discount =
    oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
      <nav className="mb-4 text-xs text-ink-500">
        <Link href="/" className="hover:text-brand-600">
          হোম
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink-700">{product.name}</span>
      </nav>

      <div className="rise-item grid grid-cols-1 gap-8 rounded-xl border border-cream-300 bg-white p-4 shadow-sm sm:p-6 lg:grid-cols-2">
        <div className="group relative aspect-square overflow-hidden rounded-lg bg-cream-100">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-300">
              <ImageOff className="h-14 w-14" strokeWidth={1.2} />
            </div>
          )}
          {discount && (
            <span className="absolute left-3 top-3 rounded-md bg-brand-500 px-2 py-1 text-xs font-bold text-white">
              {toBanglaDigits(discount)}% ছাড়
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h1 className="rise-item text-xl font-bold leading-snug text-ink-900 sm:text-2xl">
            {product.name}
          </h1>

          <div className="rise-item flex items-baseline gap-3" style={{ "--d": "90ms" } as React.CSSProperties}>
            <AnimatedNumber
              value={price}
              format="taka"
              className="text-2xl font-extrabold text-navy-900 tabular-nums"
            />
            {oldPrice && oldPrice > price && (
              <span className="text-base text-ink-300 line-through">{formatTaka(oldPrice)}</span>
            )}
          </div>

          <div
            className="rise-item rounded-lg bg-cream-100 p-3 text-sm leading-relaxed text-ink-700 whitespace-pre-line"
            style={{ "--d": "160ms" } as React.CSSProperties}
          >
            {product.description || "এই পণ্যের বিস্তারিত বিবরণ শীঘ্রই যুক্ত করা হবে।"}
          </div>

          <div className="rise-item" style={{ "--d": "240ms" } as React.CSSProperties}>
            <ProductActions
              product={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price,
                imageUrl: product.imageUrl,
                stock: product.stock,
              }}
            />
          </div>

          <div
            className="rise-item mt-2 grid grid-cols-1 gap-2.5 border-t border-cream-200 pt-4 sm:grid-cols-3"
            style={{ "--d": "320ms" } as React.CSSProperties}
          >
            <InfoRow icon={Truck} text="সারাদেশে হোম ডেলিভারি" />
            <InfoRow icon={ShieldCheck} text="নিরাপদ ও যাচাইকৃত পণ্য" />
            <InfoRow icon={Undo2} text="শর্তসাপেক্ষে রিটার্ন সুবিধা" />
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-10">
          <Reveal>
            <h2 className="text-lg font-bold text-ink-900">সম্পর্কিত পণ্য</h2>
          </Reveal>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {related.map((item, i) => (
              <Reveal key={item.id} variant="up" delay={Math.min(i * 60, 300)} className="h-full">
                <ProductCard product={item} />
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, text }: { icon: typeof Truck; text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-ink-600">
      <Icon className="h-4 w-4 text-teal-600" strokeWidth={1.8} />
      {text}
    </div>
  );
}
