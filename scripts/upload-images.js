const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const supabase = createClient(
  "https://nvobmxhtjcekgajmmusp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52b2JteGh0amNla2dham1tdXNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA4MzMzMywiZXhwIjoyMDkwNjU5MzMzfQ.vO2FLS5KzI7goLHf2h2jMaBePPyV2hDMzQkAPElJMbw"
);

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;
    client.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadFile(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

const IMAGES = [
  { url: "https://likelihood.co.kr/wp-content/uploads/2021/06/S63.jpg", slug: "woman-floppy-pants", color: "Violet", order: 0 },
  { url: "https://likelihood.co.kr/wp-content/uploads/2021/06/s59.jpg", slug: "woman-floppy-pants", color: "Yellow", order: 1 },
  { url: "https://likelihood.co.kr/wp-content/uploads/2021/06/s61.jpg", slug: "woman-floppy-pants", color: "Mint", order: 2 },
  { url: "https://likelihood.co.kr/wp-content/uploads/2021/06/s57.jpg", slug: "woman-floppy-pants", color: "Red", order: 3 },
  { url: "https://likelihood.co.kr/wp-content/uploads/2021/06/s60.jpg", slug: "woman-floppy-pants", color: "Khaki", order: 4 },
  { url: "https://likelihood.co.kr/wp-content/uploads/2021/06/S64.jpg", slug: "woman-floppy-pants", color: "Black", order: 5 },
  { url: "https://likelihood.co.kr/wp-content/uploads/2021/06/S62.jpg", slug: "woman-floppy-pants", color: "Blue", order: 6 },
  { url: "https://likelihood.co.kr/wp-content/uploads/2021/06/s58.jpg", slug: "woman-floppy-pants", color: "Apricot", order: 7 },
  { url: "https://likelihood.co.kr/wp-content/uploads/2021/05/s66.jpg", slug: "half-pants", color: "Beige", order: 0 },
  { url: "https://likelihood.co.kr/wp-content/uploads/2021/05/s65.jpg", slug: "half-pants", color: "Black", order: 1 },
];

async function run() {
  for (const img of IMAGES) {
    try {
      console.log(`Downloading: ${img.color} (${img.slug})...`);
      const buffer = await downloadFile(img.url);

      const fileName = `${img.slug}/${img.color.toLowerCase()}.jpg`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("product-images")
        .upload(fileName, buffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (error) {
        console.log(`  Upload error: ${error.message}`);
        continue;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(fileName);

      console.log(`  Uploaded: ${publicUrl}`);

      // Get product ID
      const { data: product } = await supabase
        .from("products")
        .select("id")
        .eq("slug", img.slug)
        .single();

      if (!product) {
        console.log(`  Product not found: ${img.slug}`);
        continue;
      }

      // Insert product_image record
      const { error: imgError } = await supabase.from("product_images").insert({
        product_id: product.id,
        url: publicUrl,
        alt_text_ko: `${img.slug} ${img.color}`,
        sort_order: img.order,
        is_primary: img.order === 0,
      });

      if (imgError) {
        console.log(`  DB error: ${imgError.message}`);
      } else {
        console.log(`  DB linked! (primary: ${img.order === 0})`);
      }
    } catch (err) {
      console.log(`  Failed: ${err.message}`);
    }
  }

  console.log("\n=== DONE! All images uploaded ===");
}

run();
