import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "products");
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export async function saveProductImage(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("শুধুমাত্র JPG, PNG অথবা WEBP ছবি আপলোড করা যাবে।");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("ছবির সাইজ ৫MB এর বেশি হতে পারবে না।");
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const filename = `${randomUUID()}.${extension}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return `/uploads/products/${filename}`;
}

export async function deleteProductImage(imageUrl: string) {
  if (!imageUrl.startsWith("/uploads/products/")) return;
  try {
    const filePath = path.join(process.cwd(), "public", imageUrl);
    await unlink(filePath);
  } catch {
    // file might already be removed - ignore
  }
}
