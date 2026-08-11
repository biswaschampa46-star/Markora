import { NextRequest, NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/queries";

export const dynamic = "force-dynamic";

type WishlistProduct = {
  id: number;
  name: string;
  slug: string;
  price: string;
  oldPrice: string | null;
  imageUrl: string;
  stock: number;
};

export async function GET(request: NextRequest) {
  try {
    const raw = request.nextUrl.searchParams.get("ids") ?? "";
    // Cap the request to avoid oversized queries / param flooding.
    const ids = raw
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n > 0)
      .slice(0, 200);

    if (ids.length === 0) {
      return NextResponse.json({ products: [] as WishlistProduct[] });
    }

    const unique = [...new Set(ids)];
    const rows = await getProductsByIds(unique);

    // Preserve the order the visitor saved them in (most recent last).
    const order = new Map(unique.map((id, i) => [id, i]));
    const products: WishlistProduct[] = rows
      .map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        oldPrice: p.oldPrice,
        imageUrl: p.imageUrl,
        stock: p.stock,
      }))
      .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

    return NextResponse.json({ products });
  } catch (error) {
    console.error("[api/wishlist]", error);
    return NextResponse.json({ error: "পণ্য লোড করা যায়নি।" }, { status: 500 });
  }
}
