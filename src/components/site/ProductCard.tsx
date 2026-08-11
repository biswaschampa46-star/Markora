import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { formatTaka, toBanglaDigits } from "@/lib/format";
import { AddToCartButton } from "./AddToCartButton";
import { WishlistButton } from "./WishlistButton";

export type ProductCardData = {
  id: number;
  name: string;
  slug: string;
  price: string;
  oldPrice: string | null;
  imageUrl: string;
  stock: number;
};

export function ProductCard({
  product,
  onWishlistToggle,
}: {
  product: ProductCardData;
  onWishlistToggle?: (productId: number, wished: boolean) => void;
}) {
  const price = Number(product.price);
  const oldPrice = product.oldPrice ? Number(product.oldPrice) : null;
  const discount = oldPrice && oldPrice > price ? Math.round(((oldPrice - price) / oldPrice) * 100) : null;

  return (
    <div
      data-tilt
      className="group ripple-host flex h-full flex-col overflow-hidden rounded-xl border border-cream-300 bg-white shadow-sm transition-colors hover:border-cream-300/70 hover:shadow-xl hover:shadow-navy-950/10"
    >
      <Link
        href={`/product/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-cream-100"
      >
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover transition-transform duration-700 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
          />
        ) : (
          <div className="shimmer flex h-full w-full items-center justify-center text-ink-300">
            <ImageOff className="h-10 w-10" strokeWidth={1.3} />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {discount && (
          <span className="absolute left-2 top-2 rounded-md bg-brand-500 px-1.5 py-0.5 text-[11px] font-bold text-white shadow-sm">
            {toBanglaDigits(discount)}% ছাড়
          </span>
        )}
        {product.stock <= 0 && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-semibold text-ink-700 backdrop-blur-[1px]">
            স্টক নেই
          </span>
        )}
      </Link>
      <div className="absolute right-2 top-2 z-10">
        <WishlistButton productId={product.id} onToggle={onWishlistToggle} />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[2.6em] text-sm font-medium text-ink-900 transition-colors duration-300 hover:text-brand-600">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-navy-900 transition-colors duration-300 group-hover:text-brand-600">
            {formatTaka(price)}
          </span>
          {oldPrice && oldPrice > price && (
            <span className="text-xs text-ink-300 line-through">{formatTaka(oldPrice)}</span>
          )}
        </div>
        <div className="mt-auto pt-2">
          <AddToCartButton
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              price,
              imageUrl: product.imageUrl,
              stock: product.stock,
            }}
            compact
          />
        </div>
      </div>
    </div>
  );
}
