import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCategoryByIdAdmin } from "@/lib/queries";
import { updateCategory } from "@/app/admin/(dashboard)/actions";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categoryId = Number(id);

  if (!Number.isInteger(categoryId)) {
    notFound();
  }

  const category = await getCategoryByIdAdmin(categoryId);

  if (!category) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 transition hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" />
          ক্যাটাগরি তালিকায় ফিরুন
        </Link>
        <h1 className="mt-2 text-xl font-bold text-ink-900">ক্যাটাগরি সম্পাদনা</h1>
        <p className="text-sm text-ink-500">{category.nameBn}</p>
      </div>

      <div className="rounded-xl border border-cream-300 bg-white p-5">
        <CategoryForm
          action={updateCategory.bind(null, category.id)}
          defaults={{
            nameBn: category.nameBn,
            slug: category.slug,
            icon: category.icon,
            sortOrder: category.sortOrder,
          }}
          submitLabel="পরিবর্তন সংরক্ষণ করুন"
        />
      </div>
    </div>
  );
}
