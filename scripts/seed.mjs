import "dotenv/config";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const CATEGORIES = [
  { slug: "electronics", nameBn: "ইলেকট্রনিক্স", icon: "smartphone", sortOrder: 1 },
  { slug: "fashion", nameBn: "ফ্যাশন", icon: "shirt", sortOrder: 2 },
  { slug: "home-living", nameBn: "হোম ও লিভিং", icon: "sofa", sortOrder: 3 },
  { slug: "beauty", nameBn: "বিউটি ও কেয়ার", icon: "sparkles", sortOrder: 4 },
  { slug: "sports", nameBn: "খেলাধুলা ও ফিটনেস", icon: "dumbbell", sortOrder: 5 },
  { slug: "books", nameBn: "বই ও শিক্ষা", icon: "book-open", sortOrder: 6 },
  { slug: "baby", nameBn: "বেবি কেয়ার", icon: "baby", sortOrder: 7 },
];

const PRODUCTS = [
  {
    name: "স্মার্ট ওয়্যারলেস ইয়ারবাডস",
    slug: "smart-wireless-earbuds",
    description:
      "সুন্দর সাউন্ড কোয়ালিটি, লং ব্যাটারি লাইফ এবং আরামদায়ক ফিট — দৈনন্দিন ব্যবহারের জন্য উপযুক্ত।",
    price: "1290",
    oldPrice: "1690",
    imageUrl: "/images/products/electronics.svg",
    stock: 25,
    category: "electronics",
    isFeatured: true,
  },
  {
    name: "পোর্টেবল পাওয়ার ব্যাংক ১০০০০mAh",
    slug: "portable-power-bank-10000",
    description: "দ্রুত চার্জিং সাপোর্টসহ বড় ক্যাপাসিটির পাওয়ার ব্যাংক, সাথে ডুয়াল USB পোর্ট।",
    price: "1850",
    oldPrice: null,
    imageUrl: "/images/products/electronics.svg",
    stock: 18,
    category: "electronics",
    isFeatured: true,
  },
  {
    name: "কটন প্রিমিয়াম পাঞ্জাবি",
    slug: "cotton-premium-panjabi",
    description: "আরামদায়ক সুতি কাপড়ে তৈরি প্রিমিয়াম কোয়ালিটির পাঞ্জাবি — ঈদ ও বিশেষ অনুষ্ঠানে উপযুক্ত।",
    price: "1450",
    oldPrice: "1750",
    imageUrl: "/images/products/fashion.svg",
    stock: 30,
    category: "fashion",
    isFeatured: true,
  },
  {
    name: "কমফোর্ট থ্রি-সিটার সোফা",
    slug: "comfort-three-seater-sofa",
    description: "মজবুত ফ্রেম এবং নরম কুশনসহ তিন জনের বসার জন্য প্রশস্ত সোফা।",
    price: "18500",
    oldPrice: "21500",
    imageUrl: "/images/products/home.svg",
    stock: 5,
    category: "home-living",
    isFeatured: false,
  },
  {
    name: "ফেস ওয়াশ অ্যাকনে ক্লিয়ার ১০০মিলি",
    slug: "face-wash-acne-clear",
    description: "ত্বক পরিষ্কার ও উজ্জ্বল রাখতে কার্যকর ফেস ওয়াশ — প্রতিদিনের স্কিনকেয়ার রুটিনের সঙ্গী।",
    price: "320",
    oldPrice: null,
    imageUrl: "/images/products/beauty.svg",
    stock: 40,
    category: "beauty",
    isFeatured: false,
  },
  {
    name: "অ্যাডজাস্টেবল ডাম্বেল সেট ৫ কেজি",
    slug: "adjustable-dumbbell-set",
    description: "বাড়িতে ব্যায়ামের জন্য অ্যাডজাস্টেবল ওজনসহ মানসম্মত ডাম্বেল সেট।",
    price: "2400",
    oldPrice: "2800",
    imageUrl: "/images/products/sports.svg",
    stock: 12,
    category: "sports",
    isFeatured: false,
  },
  {
    name: "বাংলা উপন্যাস সিরিজ (সেট)",
    slug: "bengali-novel-series",
    description: "জনপ্রিয় লেখকদের নির্বাচিত বাংলা উপন্যাসের সংগ্রহ — বইপ্রেমীদের জন্য চমৎকার পছন্দ।",
    price: "950",
    oldPrice: "1200",
    imageUrl: "/images/products/books.svg",
    stock: 20,
    category: "books",
    isFeatured: false,
  },
  {
    name: "বেবি কেয়ার স্টার্টার কিট",
    slug: "baby-care-starter-kit",
    description: "নবজাতকের যত্নে প্রয়োজনীয় প্রয়োজনীয় সামগ্রী একসাথে — নিরাপদ ও মৃদু উপাদানে তৈরি।",
    price: "1750",
    oldPrice: null,
    imageUrl: "/images/products/baby.svg",
    stock: 15,
    category: "baby",
    isFeatured: false,
  },
];

async function main() {
  // Idempotent: only rows whose slug is missing are inserted, so the script
  // can be re-run safely at any time.
  let insertedCategories = 0;
  for (const c of CATEGORIES) {
    const res = await pool.query(
      "insert into categories (slug, name_bn, icon, sort_order) values ($1, $2, $3, $4) on conflict (slug) do nothing",
      [c.slug, c.nameBn, c.icon, c.sortOrder],
    );
    insertedCategories += res.rowCount;
  }
  console.log(`Categories: ${insertedCategories} inserted, ${CATEGORIES.length} total definitions.`);

  let insertedProducts = 0;
  for (const p of PRODUCTS) {
    const cat = await pool.query("select id from categories where slug = $1", [p.category]);
    const categoryId = cat.rows[0]?.id ?? null;
    const res = await pool.query(
      `insert into products
        (name, slug, description, price, old_price, image_url, stock, category_id, is_featured, is_active)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
       on conflict (slug) do nothing`,
      [
        p.name,
        p.slug,
        p.description,
        p.price,
        p.oldPrice,
        p.imageUrl,
        p.stock,
        categoryId,
        p.isFeatured,
      ],
    );
    insertedProducts += res.rowCount;
  }
  console.log(`Products: ${insertedProducts} inserted, ${PRODUCTS.length} total definitions.`);

  await pool.end();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
