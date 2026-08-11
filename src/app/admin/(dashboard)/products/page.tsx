import Link from "next/link";
import Image from "next/image";
import { ImageOff, Pencil, Plus, Trash2 } from "lucide-react";
import { getAllProductsAdmin } from "@/lib/queries";
import { formatTaka, toBanglaDigits } from "@/lib/format";
import { deleteProduct } from "@/app/admin/(dashboard)/actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getAllProductsAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink-900">পণ্য সমূহ</h1>
          <p className="text-sm text-ink-500">সব পণ্য পরিচালনা করুন</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-600"
        >
          <Plus className="h-4 w-4" />
          নতুন পণ্য
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-xl border border-cream-300 bg-white p-10 text-center text-sm text-ink-500">
          এখনো কোনো পণ্য যুক্ত করা হয়নি।
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-cream-300 bg-white">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-cream-200 text-xs uppercase text-ink-500">
                <th className="px-4 py-3">ছবি</th>
                <th className="px-4 py-3">নাম</th>
                <th className="px-4 py-3">ক্যাটাগরি</th>
                <th className="px-4 py-3">মূল্য</th>
                <th className="px-4 py-3">স্টক</th>
                <th className="px-4 py-3">স্ট্যাটাস</th>
                <th className="px-4 py-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  data-row
                  className="border-b border-cream-100 transition last:border-0 hover:bg-cream-50"
                >
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-cream-100">
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-ink-300">
                          <ImageOff className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="max-w-[240px] px-4 py-3 font-medium text-ink-900">
                    <span className="line-clamp-1">{p.name}</span>
                  </td>
                  <td className="px-4 py-3 text-ink-700">{p.categoryName ?? "—"}</td>
                  <td className="px-4 py-3 font-semibold text-navy-900">{formatTaka(p.price)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        p.stock > 0 ? "bg-teal-50 text-teal-700" : "bg-red-50 text-red-700"
                      }`}
                    >
                      {toBanglaDigits(p.stock)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        p.isActive ? "bg-green-50 text-green-700" : "bg-cream-100 text-ink-500"
                      }`}
                    >
                      {p.isActive ? "সক্রিয়" : "নিষ্ক্রিয়"}
                    </span>
                    {p.isFeatured && (
                      <span className="ml-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        জনপ্রিয়
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="flex items-center gap-1 rounded-lg border border-cream-300 px-2.5 py-1.5 text-xs font-medium text-ink-700 transition hover:bg-cream-100"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        সম্পাদনা
                      </Link>
                      <ConfirmButton
                        action={deleteProduct.bind(null, p.id)}
                        confirmText={`"${p.name}" মুছে ফেলবেন? এই কাজটি ফেরানো যাবে না।`}
                        className="flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        মুছুন
                      </ConfirmButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
