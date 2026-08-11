import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCategories, getProductByIdAdmin } from "@/lib/queries";
import { updateProduct } from "@/app/admin/(dashboard)/actions";
import { ProductForm } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId)) {
    notFound();
  }

  const [product, categories] = await Promise.all([
    getProductByIdAdmin(productId),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

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
        <h1 className="mt-2 text-xl font-bold text-ink-900">পণ্য সম্পাদনা</h1>
        <p className="text-sm text-ink-500">{product.name}</p>
      </div>

      <ProductForm
        categories={categories}
        action={(formData) => updateProduct(product.id, formData)}
        defaults={{
          name: product.name,
          description: product.description,
          price: product.price,
          oldPrice: product.oldPrice,
          stock: product.stock,
          categoryId: product.categoryId,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
          imageUrl: product.imageUrl,
        }}
        submitLabel="পরিবর্তন সংরক্ষণ করুন"
      />
    </div>
  );
}
