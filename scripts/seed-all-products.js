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

const BASE = "https://likelihood.co.kr/wp-content/uploads";

// All products from the existing site (excluding already registered ones)
const PRODUCTS = [
  // Floppy Pants (유니섹스 버전) - 10 colors
  { slug: "floppy-pants-blue", name: "Floppy Pants – Blue", price: 38000, img: "/2020/06/s36.jpg", cat: "bottoms", stock: true, gender: "U" },
  { slug: "floppy-pants-charcoal", name: "Floppy Pants – Charcoal", price: 38000, img: "/2020/06/s34.jpg", cat: "bottoms", stock: true, gender: "U" },
  { slug: "floppy-pants-yellow", name: "Floppy Pants – Yellow", price: 38000, img: "/2018/09/s30.jpg", cat: "bottoms", stock: true, gender: "U" },
  { slug: "floppy-pants-pink", name: "Floppy Pants – Pink", price: 38000, img: "/2018/09/s29.jpg", cat: "bottoms", stock: true, gender: "U" },
  { slug: "floppy-pants-apricot", name: "Floppy Pants – Apricot", price: 38000, img: "/2020/06/s37.jpg", cat: "bottoms", stock: true, gender: "U" },
  { slug: "floppy-pants-khaki", name: "Floppy Pants – Khaki", price: 38000, img: "/2018/09/s32.jpg", cat: "bottoms", stock: true, gender: "U" },
  { slug: "floppy-pants-red", name: "Floppy Pants – Red", price: 38000, img: "/2018/09/s33.jpg", cat: "bottoms", stock: true, gender: "U" },
  { slug: "floppy-pants-mint", name: "Floppy Pants – Mint", price: 38000, img: "/2018/09/s31.jpg", cat: "bottoms", stock: true, gender: "U" },
  { slug: "floppy-pants-dark-mint", name: "Floppy Pants – Dark Mint", price: 38000, img: "/2020/06/s35.jpg", cat: "bottoms", stock: false, gender: "U" },
  { slug: "floppy-pants-metal-olive", name: "Floppy Pants – Metal Olive", price: 38000, img: "/2020/06/s39.jpg", cat: "bottoms", stock: false, gender: "U" },

  // Corduroy Floppy Pants
  { slug: "floppy-pants-corduroy-emerald", name: "Floppy Pants Corduroy – Emerald Green", price: 38000, img: "/2020/07/s44.jpg", cat: "bottoms", stock: true, gender: "U" },
  { slug: "floppy-pants-corduroy-orange", name: "Floppy Pants Corduroy – Orange", price: 38000, img: "/2020/07/s42.jpg", cat: "bottoms", stock: false, gender: "U" },
  { slug: "floppy-pants-corduroy-purple", name: "Floppy Pants Corduroy – Purple", price: 38000, img: "/2020/07/s43.jpg", cat: "bottoms", stock: false, gender: "U" },

  // Jeju Edition
  { slug: "floppy-pants-jeju-gray", name: "Floppy Pants – Jeju Gray", price: 36000, img: "/2020/06/s41.jpg", cat: "bottoms", stock: true, gender: "U" },
  { slug: "floppy-pants-jeju-white", name: "Floppy Pants – Jeju White", price: 36000, img: "/2020/06/s40.jpg", cat: "bottoms", stock: false, gender: "U" },

  // Island of Cap
  { slug: "island-of-cap-white", name: "Island of Cap – White", price: 32000, img: "/2020/11/s46.jpg", cat: "accessories", stock: false, gender: "U" },
  { slug: "island-of-cap-gray", name: "Island of Cap – Gray", price: 32000, img: "/2020/11/s45.jpg", cat: "accessories", stock: false, gender: "U" },

  // Roomy Pants
  { slug: "chino-roomy-pants-navy", name: "Chino Roomy Pants – Navy", price: 49000, img: "/2020/01/roomy_ny.jpg", cat: "bottoms", stock: false, gender: "U" },
  { slug: "corduroy-roomy-pants-olive", name: "Corduroy Roomy Pants – Olive", price: 49000, img: "/2020/01/roomy_kh.jpg", cat: "bottoms", stock: false, gender: "U" },
  { slug: "corduroy-roomy-pants-beige", name: "Corduroy Roomy Pants – Beige", price: 49000, img: "/2020/01/roomy_cbe.jpg", cat: "bottoms", stock: true, gender: "U" },
  { slug: "corduroy-roomy-pants-brown", name: "Corduroy Roomy Pants – Brown", price: 49000, img: "/2020/01/roomy_cbr.jpg", cat: "bottoms", stock: true, gender: "U" },
  { slug: "npc-roomy-pants-beige", name: "NPC Roomy Pants – Beige", price: 49000, img: "/2020/01/roomy_be-2.jpg", cat: "bottoms", stock: false, gender: "U" },
  { slug: "npc-roomy-pants-black", name: "NPC Roomy Pants – Black", price: 49000, img: "/2020/01/roomy_bk.jpg", cat: "bottoms", stock: false, gender: "U" },

  // Short Pants
  { slug: "short-pants-black", name: "Short Pants – Black", price: 39000, img: "/2018/09/short-black-800x800.jpg", cat: "bottoms", stock: true, gender: "U" },
  { slug: "short-pants-navy", name: "Short Pants – Navy", price: 39000, img: "/2018/09/short-navy-800x800.jpg", cat: "bottoms", stock: true, gender: "U" },

  // Tees
  { slug: "blue-072c-tee-white", name: "Blue 072c Tee – White", price: 29000, img: "/2019/08/lkhd_02_01-1-1000x1000.jpg", cat: "tops", stock: false, gender: "U" },
  { slug: "cycloid-tee-white", name: "Cycloid Tee – White", price: 29000, img: "/2019/08/lkhd_03_01-1-1000x1000.jpg", cat: "tops", stock: false, gender: "U" },
  { slug: "lkhd-logo-tee-khaki", name: "LKHD Logo Tee – Khaki", price: 29000, img: "/2019/08/lkhd_01-02_01-1000x1000.jpg", cat: "tops", stock: false, gender: "U" },
  { slug: "lkhd-logo-tee-luminous", name: "LKHD Logo Tee – Luminous", price: 29000, img: "/2019/08/lkhd_01-03_01-1-1000x1000.jpg", cat: "tops", stock: false, gender: "U" },
  { slug: "lkhd-logo-tee-white", name: "LKHD Logo Tee – White", price: 29000, img: "/2019/08/lkhd_01-01_01-1000x1000.jpg", cat: "tops", stock: false, gender: "U" },
  { slug: "great-tee-black", name: "Great Tee – Black", price: 29000, img: "/2018/09/3-copy-800x800.jpg", cat: "tops", stock: true, gender: "U" },
  { slug: "great-tee-gray", name: "Great Tee – Gray", price: 29000, img: "/2018/09/1-copy-800x800.jpg", cat: "tops", stock: true, gender: "U" },
  { slug: "great-tee-violet", name: "Great Tee – Violet", price: 29000, img: "/2018/11/1-800x800.jpg", cat: "tops", stock: false, gender: "U" },
  { slug: "great-tee-white", name: "Great Tee – White", price: 29000, img: "/2018/09/2-copy-800x800.jpg", cat: "tops", stock: true, gender: "U" },
  { slug: "logo-tee-black", name: "Logo Tee – Black", price: 29000, img: "/2018/11/6-800x800.jpg", cat: "tops", stock: true, gender: "U" },
  { slug: "logo-tee-white", name: "Logo Tee – White", price: 29000, img: "/2018/11/7-800x800.jpg", cat: "tops", stock: true, gender: "U" },
  { slug: "track-tee-black", name: "Track Tee – Black", price: 29000, img: "/2018/11/2-800x800.jpg", cat: "tops", stock: true, gender: "U" },
  { slug: "track-tee-white", name: "Track Tee – White", price: 29000, img: "/2018/11/4-800x800.jpg", cat: "tops", stock: true, gender: "U" },
  { slug: "track-tee-gray", name: "Track Tee – Gray", price: 29000, img: "/2018/11/3-800x800.jpg", cat: "tops", stock: true, gender: "U" },
];

async function run() {
  const { data: cats } = await supabase.from("categories").select("id, slug");
  const catMap = {};
  for (const c of cats) catMap[c.slug] = c.id;
  // Map parent categories
  catMap["bottoms"] = catMap["bottoms"] || catMap["pants"];
  catMap["tops"] = catMap["tops"] || catMap["t-shirts"];
  catMap["accessories"] = catMap["accessories"];

  console.log("Categories:", Object.keys(catMap).join(", "));

  let created = 0, skipped = 0, imgOk = 0, imgFail = 0;

  for (const p of PRODUCTS) {
    const categoryId = catMap[p.cat] || catMap["bottoms"];
    if (!categoryId) { console.log(`No category for ${p.cat}`); continue; }

    // Check if already exists
    const { data: existing } = await supabase.from("products").select("id").eq("slug", p.slug).single();
    if (existing) { skipped++; continue; }

    // Create product
    const skuNum = String(created + 10).padStart(3, "0");
    const { data: product, error } = await supabase.from("products").insert({
      slug: p.slug,
      sku_prefix: `LK-${p.slug.slice(0, 6).toUpperCase()}-${skuNum}`,
      name_ko: p.name,
      name_en: p.name,
      category_id: categoryId,
      base_price: p.price,
      is_active: true,
      is_new: false,
      is_featured: p.stock,
      gender: p.gender,
    }).select().single();

    if (error) { console.log(`ERR ${p.name}: ${error.message}`); continue; }
    created++;

    // Create a default variant
    const sizes = ["S", "M", "L", "XL"];
    const variants = sizes.map((s) => ({
      product_id: product.id,
      sku: `${product.sku_prefix}-${s}`,
      size: s,
      color_name_ko: p.name.split("–")[1]?.trim() || "기본",
      color_name_en: p.name.split("–")[1]?.trim() || "Default",
      color_hex: "#888888",
      stock_quantity: p.stock ? Math.floor(Math.random() * 15) + 3 : 0,
    }));
    await supabase.from("product_variants").insert(variants);

    // Download and upload image
    try {
      const imgUrl = BASE + p.img;
      const buffer = await download(imgUrl);
      const fileName = `${p.slug}/main.jpg`;
      await supabase.storage.from("product-images").upload(fileName, buffer, { contentType: "image/jpeg", upsert: true });
      const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(fileName);
      await supabase.from("product_images").insert({
        product_id: product.id, url: publicUrl,
        alt_text_ko: p.name, sort_order: 0, is_primary: true,
      });
      imgOk++;
      process.stdout.write(".");
    } catch (e) {
      imgFail++;
      process.stdout.write("x");
    }
  }

  console.log(`\n\nDone! Created: ${created}, Skipped: ${skipped}, Images OK: ${imgOk}, Images Failed: ${imgFail}`);
}

run();
