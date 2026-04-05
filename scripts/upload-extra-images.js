const { createClient } = require("@supabase/supabase-js");
const https = require("https");
const http = require("http");

const supabase = createClient(
  "https://nvobmxhtjcekgajmmusp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52b2JteGh0amNla2dham1tdXNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA4MzMzMywiZXhwIjoyMDkwNjU5MzMzfQ.vO2FLS5KzI7goLHf2h2jMaBePPyV2hDMzQkAPElJMbw"
);

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303) {
        return downloadFile(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

// Free commercial-use images from Unsplash (direct download URLs)
const EXTRA_IMAGES = [
  // Linen shirt images
  { url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80", slug: "linen-oversized-shirt", name: "white", order: 0 },
  { url: "https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=800&q=80", slug: "linen-oversized-shirt", name: "beige", order: 1 },
  { url: "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=800&q=80", slug: "linen-oversized-shirt", name: "detail", order: 2 },
  // Cargo pants images
  { url: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80", slug: "wide-cargo-pants", name: "black", order: 0 },
  { url: "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=800&q=80", slug: "wide-cargo-pants", name: "khaki", order: 1 },
];

async function run() {
  for (const img of EXTRA_IMAGES) {
    try {
      console.log(`Downloading: ${img.slug}/${img.name}...`);
      const buffer = await downloadFile(img.url);
      console.log(`  Downloaded: ${buffer.length} bytes`);

      const fileName = `${img.slug}/${img.name}.jpg`;

      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(fileName, buffer, { contentType: "image/jpeg", upsert: true });

      if (error) {
        console.log(`  Upload error: ${error.message}`);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      console.log(`  Uploaded: ${publicUrl}`);

      const { data: product } = await supabase
        .from("products")
        .select("id")
        .eq("slug", img.slug)
        .single();

      if (!product) {
        console.log(`  Product not found: ${img.slug}`);
        continue;
      }

      const { error: imgError } = await supabase.from("product_images").insert({
        product_id: product.id,
        url: publicUrl,
        alt_text_ko: `${img.slug} ${img.name}`,
        sort_order: img.order,
        is_primary: img.order === 0,
      });

      if (imgError) console.log(`  DB error: ${imgError.message}`);
      else console.log(`  DB linked! (primary: ${img.order === 0})`);
    } catch (err) {
      console.log(`  Failed: ${err.message}`);
    }
  }
  console.log("\n=== DONE ===");
}

run();
