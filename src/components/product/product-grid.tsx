import { ProductCard } from "./product-card";

interface ProductGridItem {
  slug: string;
  name_ko: string;
  name_en: string;
  base_price: number;
  compare_at_price?: number | null;
  is_new?: boolean;
  images?: { url: string; is_primary: boolean }[];
  variants?: { stock_quantity: number }[];
}

interface ProductGridProps {
  products: ProductGridItem[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-gray-400">상품이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => {
        const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
        const totalStock = product.variants?.reduce((sum, v) => sum + v.stock_quantity, 0) ?? 0;

        return (
          <ProductCard
            key={product.slug}
            slug={product.slug}
            nameKo={product.name_ko}
            nameEn={product.name_en}
            price={product.base_price}
            compareAtPrice={product.compare_at_price}
            imageUrl={primaryImage?.url}
            isNew={product.is_new}
            isSoldOut={totalStock === 0}
          />
        );
      })}
    </div>
  );
}
