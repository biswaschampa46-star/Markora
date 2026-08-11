import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";

// Vercel's filesystem is read-only at runtime, so product images can't be
// written to /public like on a local machine. Instead we upload them to a
// Supabase Storage bucket called "product-images" (create it once in the
// Supabase dashboard under Storage, and mark it Public).
const BUCKET = "product-images";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export async function saveProductImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("শুধুমাত্র JPG, PNG অথবা WEBP ছবি আপলোড করা যাবে।");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("ছবির সাইজ ৫MB এর বেশি হতে পারবে না।");
  }

  const supabase = await createClient();
  if (!supabase) {
    throw new Error("Supabase কনফিগার করা নেই - ছবি আপলোড করা যাচ্ছে না।");
  }

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(BUCKET).upload(filename, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    throw new Error(`ছবি আপলোড ব্যর্থ হয়েছে: ${error.message}`);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

export async function deleteProductImage(imageUrl: string) {
  if (!imageUrl.includes(`/${BUCKET}/`)) return;
  try {
    const filename = imageUrl.split(`/${BUCKET}/`).pop();
    if (!filename) return;

    const supabase = await createClient();
    if (!supabase) return;

    await supabase.storage.from(BUCKET).remove([filename]);
  } catch {
    // file might already be removed - ignore
  }
}