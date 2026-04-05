const { createClient } = require("@supabase/supabase-js");
const https = require("https");

const supabase = createClient(
  "https://nvobmxhtjcekgajmmusp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52b2JteGh0amNla2dham1tdXNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA4MzMzMywiZXhwIjoyMDkwNjU5MzMzfQ.vO2FLS5KzI7goLHf2h2jMaBePPyV2hDMzQkAPElJMbw"
);

function download(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) return download(res.headers.location).then(resolve).catch(reject);
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

// Unsplash free commercial-use images for empty categories
const DEFAULTS = [
  {
    slug: "outer",
    name: "Outer Default",
    price: 89000,
    gender: "U",
    imgUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
    desc: "스타일리시한 아우터 컬렉션",
  },
  {
    slug: "dresses",
    name: "Dress Default",
    price: 65000,
    gender: "F",
    imgUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
    desc: "엘레강스한 원피스 컬렉션",
  },
  {
    slug: "bags",
    name: "Bag Default",
    price: 45000,
    gender: "U",
    imgUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
    desc: "데일리 백 컬렉션",
  },
];

async function run() {
  for (const item of DEFAULTS) {
    // Get category ID
    const { data: cat } = await supabase.from("categories").select("id").eq("slug", item.slug).single();
    if (!cat) { console.log(`Category not found: ${item.slug}`); continue; }

    // Check if product already exists in this category
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("category_id", cat.id)
      .eq("is_active", true)
      .limit(1);

    if (existing && existing.length > 0) {
      console.log(`${item.slug}: already has products, skipping`);
      continue;
    }

    // Create placeholder product
    const { data: product, error } = await supabase.from("products").insert({
      slug: `${item.slug}-collection`,
      sku_prefix: `LK-${item.slug.toUpperCase().slice(0,3)}-DEF`,
      name_ko: `${item.slug === "outer" ? "아우터" : item.slug === "dresses" ? "원피스" : "가방"} 컬렉션`,
      name_en: `${item.name}`,
      description_ko: item.desc,
      category_id: cat.id,
      base_price: item.price,
      is_active: true,
      is_new: true,
      is_featured: true,
      gender: item.gender,
      season: "25SS",
    }).select().single();

    if (error) { console.log(`Product error (${item.slug}): ${error.message}`); continue; }
    console.log(`Created product: ${product.name_ko}`);

    // Create variants
    const sizes = ["S", "M", "L", "XL"];
    await supabase.from("product_variants").insert(
      sizes.map((s) => ({
        product_id: product.id,
        sku: `LK-${item.slug.toUpperCase().slice(0,3)}-DEF-${s}`,
        size: s,
        color_name_ko: "기본",
        color_name_en: "Default",
        color_hex: "#888888",
        stock_quantity: Math.floor(Math.random() * 10) + 5,
      }))
    );

    // Download and upload image
    try {
      console.log(`  Downloading image...`);
      const buffer = await download(item.imgUrl);
      const fileName = `${item.slug}-collection/main.jpg`;
      await supabase.storage.from("product-images").upload(fileName, buffer, { contentType: "image/jpeg", upsert: true });
      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(fileName);
      await supabase.from("product_images").insert({
        product_id: product.id,
        url: publicUrl,
        alt_text_ko: product.name_ko,
        sort_order: 0,
        is_primary: true,
      });
      console.log(`  Image uploaded: ${publicUrl}`);
    } catch (e) {
      console.log(`  Image failed: ${e.message}`);
    }
  }
  console.log("\n=== DONE ===");
}

run();
