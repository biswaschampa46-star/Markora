import {
  Baby,
  BookOpen,
  Dumbbell,
  LayoutGrid,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sofa,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  shirt: Shirt,
  sofa: Sofa,
  sparkles: Sparkles,
  "shopping-basket": ShoppingBasket,
  dumbbell: Dumbbell,
  "book-open": BookOpen,
  baby: Baby,
  "layout-grid": LayoutGrid,
};

export function getCategoryIcon(icon: string): LucideIcon {
  return CATEGORY_ICONS[icon] ?? LayoutGrid;
}

export const CATEGORY_ICON_OPTIONS: { value: string; label: string }[] = [
  { value: "smartphone", label: "স্মার্টফোন / ইলেকট্রনিক্স" },
  { value: "shirt", label: "ফ্যাশন / পোশাক" },
  { value: "sofa", label: "হোম ও লিভিং" },
  { value: "sparkles", label: "বিউটি ও কেয়ার" },
  { value: "shopping-basket", label: "বাজার / মুদি" },
  { value: "dumbbell", label: "খেলাধুলা ও ফিটনেস" },
  { value: "book-open", label: "বই ও শিক্ষা" },
  { value: "baby", label: "বেবি কেয়ার" },
  { value: "layout-grid", label: "সাধারণ" },
];
