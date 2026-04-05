const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://nvobmxhtjcekgajmmusp.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52b2JteGh0amNla2dham1tdXNwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTA4MzMzMywiZXhwIjoyMDkwNjU5MzMzfQ.vO2FLS5KzI7goLHf2h2jMaBePPyV2hDMzQkAPElJMbw"
);

async function seed() {
  const { data: cats } = await supabase.from("categories").select("id, slug");
  const bottoms = cats.find((c) => c.slug === "pants") || cats.find((c) => c.slug === "bottoms");
  const tops = cats.find((c) => c.slug === "shirts") || cats.find((c) => c.slug === "tops");

  if (!bottoms) { console.log("No bottoms category!"); return; }
  console.log("Bottoms:", bottoms.id, "Tops:", tops?.id);

  // Product 1: Woman Floppy Pants
  const { data: p1 } = await supabase.from("products").insert({
    slug: "woman-floppy-pants", sku_prefix: "LK-FP-001",
    name_ko: "Woman Floppy Pants", name_en: "Woman Floppy Pants",
    description_ko: "편안한 핏의 와이드 플로피 팬츠. 부드러운 원단과 넉넉한 실루엣으로 데일리 착용에 최적화된 아이템입니다.",
    material_ko: "폴리에스터 95%, 스판덱스 5%",
    care_instructions_ko: "세탁기 사용 가능 (30도 이하)",
    category_id: bottoms.id, base_price: 38000,
    is_active: true, is_new: true, is_featured: true, gender: "F", season: "25SS",
  }).select().single();
  console.log("P1:", p1?.id || "FAILED");

  if (p1) {
    const colors = [
      { ko: "바이올렛", en: "Violet", hex: "#8B5CF6" },
      { ko: "옐로우", en: "Yellow", hex: "#EAB308" },
      { ko: "민트", en: "Mint", hex: "#6EE7B7" },
      { ko: "레드", en: "Red", hex: "#EF4444" },
      { ko: "카키", en: "Khaki", hex: "#A3A380" },
      { ko: "블랙", en: "Black", hex: "#000000" },
      { ko: "블루", en: "Blue", hex: "#3B82F6" },
      { ko: "앱리콧", en: "Apricot", hex: "#FDBA74" },
    ];
    const variants = [];
    for (const c of colors) {
      for (const s of ["S", "M", "L", "XL"]) {
        variants.push({
          product_id: p1.id, sku: `LK-FP-001-${c.en.slice(0,3).toUpperCase()}-${s}`,
          size: s, color_name_ko: c.ko, color_name_en: c.en, color_hex: c.hex,
          stock_quantity: Math.floor(Math.random() * 20) + 5,
        });
      }
    }
    await supabase.from("product_variants").insert(variants);
    console.log("P1 variants:", variants.length);
  }

  // Product 2: Half Pants (sold out)
  const { data: p2 } = await supabase.from("products").insert({
    slug: "half-pants", sku_prefix: "LK-HP-001",
    name_ko: "Half Pants", name_en: "Half Pants",
    description_ko: "깔끔한 실루엣의 하프 팬츠. 여름 데일리 아이템.",
    material_ko: "면 100%", category_id: bottoms.id, base_price: 29000,
    is_active: true, is_new: false, is_featured: true, gender: "F", season: "25SS",
  }).select().single();
  console.log("P2:", p2?.id || "FAILED");

  if (p2) {
    const variants = [];
    for (const c of [{ ko: "베이지", en: "Beige", hex: "#D4C5A9" }, { ko: "블랙", en: "Black", hex: "#000000" }]) {
      for (const s of ["S", "M", "L", "XL"]) {
        variants.push({
          product_id: p2.id, sku: `LK-HP-001-${c.en.slice(0,3).toUpperCase()}-${s}`,
          size: s, color_name_ko: c.ko, color_name_en: c.en, color_hex: c.hex,
          stock_quantity: 0,
        });
      }
    }
    await supabase.from("product_variants").insert(variants);
    console.log("P2 variants:", variants.length, "(sold out)");
  }

  // Product 3: Wide Cargo Pants
  const { data: p3 } = await supabase.from("products").insert({
    slug: "wide-cargo-pants", sku_prefix: "LK-CP-001",
    name_ko: "와이드 카고 팬츠", name_en: "Wide Cargo Pants",
    description_ko: "트렌디한 와이드 핏 카고 팬츠. 포켓 디테일이 포인트.",
    material_ko: "면 80%, 폴리에스터 20%", category_id: bottoms.id,
    base_price: 45000, compare_at_price: 58000,
    is_active: true, is_new: true, is_featured: true, gender: "U", season: "25SS",
  }).select().single();
  console.log("P3:", p3?.id || "FAILED");

  if (p3) {
    const variants = [];
    for (const c of [{ ko: "블랙", en: "Black", hex: "#000000" }, { ko: "카키", en: "Khaki", hex: "#A3A380" }, { ko: "네이비", en: "Navy", hex: "#1E3A5F" }]) {
      for (const s of ["S", "M", "L", "XL"]) {
        variants.push({
          product_id: p3.id, sku: `LK-CP-001-${c.en.slice(0,3).toUpperCase()}-${s}`,
          size: s, color_name_ko: c.ko, color_name_en: c.en, color_hex: c.hex,
          stock_quantity: Math.floor(Math.random() * 15) + 3,
        });
      }
    }
    await supabase.from("product_variants").insert(variants);
    console.log("P3 variants:", variants.length);
  }

  // Product 4: Linen Shirt
  const topsId = tops?.id || bottoms.id;
  const { data: p4 } = await supabase.from("products").insert({
    slug: "linen-oversized-shirt", sku_prefix: "LK-LS-001",
    name_ko: "린넨 오버사이즈 셔츠", name_en: "Linen Oversized Shirt",
    description_ko: "내추럴한 린넨 소재의 오버사이즈 셔츠. 시원한 착용감.",
    material_ko: "린넨 100%", category_id: topsId,
    base_price: 52000, is_active: true, is_new: true, is_featured: true, gender: "U", season: "25SS",
  }).select().single();
  console.log("P4:", p4?.id || "FAILED");

  if (p4) {
    const variants = [];
    for (const c of [{ ko: "화이트", en: "White", hex: "#FFFFFF" }, { ko: "베이지", en: "Beige", hex: "#D4C5A9" }, { ko: "스카이블루", en: "SkyBlue", hex: "#87CEEB" }]) {
      for (const s of ["S", "M", "L", "XL"]) {
        variants.push({
          product_id: p4.id, sku: `LK-LS-001-${c.en.slice(0,3).toUpperCase()}-${s}`,
          size: s, color_name_ko: c.ko, color_name_en: c.en, color_hex: c.hex,
          stock_quantity: Math.floor(Math.random() * 20) + 5,
        });
      }
    }
    await supabase.from("product_variants").insert(variants);
    console.log("P4 variants:", variants.length);
  }

  console.log("\n=== DONE! 4 products seeded ===");
}

seed().catch(console.error);
