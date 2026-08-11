import { randomUUID } from "node:crypto";

export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0980-\u09FF]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const suffix = randomUUID().slice(0, 6);
  return base ? `${base}-${suffix}` : `product-${suffix}`;
}
