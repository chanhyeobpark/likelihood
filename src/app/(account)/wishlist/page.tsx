import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProductGrid } from "@/components/product/product-grid";

export const metadata = { title: "위시리스트" };

export default async function WishlistPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/wishlist");

  const { data: wishlists } = await supabase
    .from("wishlists")
    .select(`
      product:products(
        *,
        images:product_images(url, is_primary),
        variants:product_variants(stock_quantity)
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const products = wishlists?.map((w) => w.product).filter(Boolean) || [];

  return (
    <div>
      <h1 className="text-2xl font-light tracking-wider mb-8">위시리스트</h1>
      {products.length > 0 ? (
        <ProductGrid products={products as any[]} />
      ) : (
        <p className="text-sm text-gray-400 py-16 text-center">
          위시리스트가 비어있습니다
        </p>
      )}
    </div>
  );
}
