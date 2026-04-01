import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditProductForm } from "./edit-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      images:product_images(id, url, alt_text_ko, is_primary, sort_order),
      variants:product_variants(id, sku, size, color_name_ko, color_name_en, color_hex, stock_quantity, price_override, is_active)
    `)
    .eq("id", id)
    .single();

  if (!product) notFound();

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name_ko, slug")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <EditProductForm
      product={product}
      categories={categories || []}
    />
  );
}
