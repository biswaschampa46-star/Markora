import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCategories } from "@/lib/queries";
import { createProduct } from "@/app/admin/(dashboard)/actions";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategories();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          পণ্য তালিকায় ফিরুন
        </Link>
        <h1 className="mt-2 text-xl font-bold text-ink-900">নতুন পণ্য</h1>
        <p className="text-sm text-ink-500">নতুন পণ্যের তথ্য পূরণ করুন</p>
      </div>

      <ProductForm categories={categories} action={createProduct} submitLabel="পণ্য তৈরি করুন" />
    </div>
  );
}
