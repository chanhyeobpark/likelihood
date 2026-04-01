"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUpload } from "@/components/admin/image-upload";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";
import { toast } from "sonner";
import { Plus, Trash2, Save, ArrowLeft, Copy } from "lucide-react";

interface Props {
  product: any;
  categories: any[];
}

export function EditProductForm({ product, categories }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nameKo: product.name_ko || "",
    nameEn: product.name_en || "",
    slug: product.slug || "",
    skuPrefix: product.sku_prefix || "",
    descriptionKo: product.description_ko || "",
    descriptionEn: product.description_en || "",
    materialKo: product.material_ko || "",
    materialEn: product.material_en || "",
    careKo: product.care_instructions_ko || "",
    careEn: product.care_instructions_en || "",
    categoryId: product.category_id || "",
    basePrice: String(product.base_price || ""),
    compareAtPrice: product.compare_at_price ? String(product.compare_at_price) : "",
    gender: product.gender || "U",
    season: product.season || "",
    weightGrams: product.weight_grams ? String(product.weight_grams) : "",
    metaTitleKo: product.meta_title_ko || "",
    metaTitleEn: product.meta_title_en || "",
    metaDescriptionKo: product.meta_description_ko || "",
    metaDescriptionEn: product.meta_description_en || "",
    isActive: product.is_active ?? true,
    isNew: product.is_new ?? false,
    isFeatured: product.is_featured ?? false,
  });

  const [images, setImages] = useState(
    (product.images || [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((img: any) => ({
        id: img.id,
        url: img.url,
        isPrimary: img.is_primary,
        sortOrder: img.sort_order,
        isNew: false,
      }))
  );

  const [variants, setVariants] = useState(
    (product.variants || []).map((v: any) => ({
      id: v.id,
      size: v.size,
      colorNameKo: v.color_name_ko,
      colorNameEn: v.color_name_en,
      colorHex: v.color_hex || "#000000",
      sku: v.sku,
      stock: v.stock_quantity,
      priceOverride: v.price_override ? String(v.price_override) : "",
    }))
  );

  const discount = useMemo(() => {
    const base = parseInt(form.basePrice) || 0;
    const compare = parseInt(form.compareAtPrice) || 0;
    if (compare > base && base > 0) return Math.round(((compare - base) / compare) * 100);
    return 0;
  }, [form.basePrice, form.compareAtPrice]);

  const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
  const primaryImage = images.find((img: any) => img.isPrimary) || images[0];

  const addVariant = () => setVariants([...variants, { size: "M", colorNameKo: "", colorNameEn: "", colorHex: "#000000", sku: "", stock: 0, priceOverride: "" }]);
  const removeVariant = (i: number) => setVariants(variants.filter((_: any, idx: number) => idx !== i));
  const updateVariant = (i: number, field: string, value: any) => setVariants(variants.map((v: any, idx: number) => idx === i ? { ...v, [field]: value } : v));

  const handleDuplicate = async () => {
    const supabase = createClient();
    const { data: newProduct, error } = await supabase.from("products").insert({
      name_ko: form.nameKo + " (복사본)",
      name_en: form.nameEn,
      slug: form.slug + "-copy-" + Date.now().toString(36),
      sku_prefix: form.skuPrefix + "-COPY",
      description_ko: form.descriptionKo || null,
      description_en: form.descriptionEn || null,
      material_ko: form.materialKo || null,
      material_en: form.materialEn || null,
      care_instructions_ko: form.careKo || null,
      care_instructions_en: form.careEn || null,
      category_id: form.categoryId,
      base_price: parseInt(form.basePrice) || 0,
      compare_at_price: form.compareAtPrice ? parseInt(form.compareAtPrice) : null,
      gender: form.gender as any,
      season: form.season || null,
      weight_grams: form.weightGrams ? parseInt(form.weightGrams) : null,
      is_active: false,
      is_new: form.isNew,
      is_featured: false,
    }).select().single();

    if (error || !newProduct) { toast.error("복제 실패"); return; }

    // Copy variants
    if (variants.length > 0) {
      await supabase.from("product_variants").insert(
        variants.filter((v: any) => v.colorNameKo).map((v: any) => ({
          product_id: newProduct.id,
          sku: v.sku + "-COPY",
          size: v.size,
          color_name_ko: v.colorNameKo,
          color_name_en: v.colorNameEn,
          color_hex: v.colorHex,
          stock_quantity: 0,
          price_override: v.priceOverride ? parseInt(v.priceOverride) : null,
        }))
      );
    }

    toast.success("상품이 복제되었습니다");
    router.push(`/admin/products/${newProduct.id}/edit`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      // Upload new images
      for (const img of images) {
        if (img.file && img.isNew) {
          const formData = new FormData();
          formData.append("file", img.file);
          formData.append("productId", product.id);
          const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
          const data = await res.json();
          if (data.url) {
            img.url = data.url;
            img.isNew = false;
          }
        }
      }

      // Update product
      const { error } = await supabase.from("products").update({
        name_ko: form.nameKo,
        name_en: form.nameEn || form.nameKo,
        slug: form.slug,
        sku_prefix: form.skuPrefix,
        description_ko: form.descriptionKo || null,
        description_en: form.descriptionEn || null,
        material_ko: form.materialKo || null,
        material_en: form.materialEn || null,
        care_instructions_ko: form.careKo || null,
        care_instructions_en: form.careEn || null,
        category_id: form.categoryId,
        base_price: parseInt(form.basePrice),
        compare_at_price: form.compareAtPrice ? parseInt(form.compareAtPrice) : null,
        gender: form.gender as any,
        season: form.season || null,
        weight_grams: form.weightGrams ? parseInt(form.weightGrams) : null,
        meta_title_ko: form.metaTitleKo || null,
        meta_title_en: form.metaTitleEn || null,
        meta_description_ko: form.metaDescriptionKo || null,
        meta_description_en: form.metaDescriptionEn || null,
        is_active: form.isActive,
        is_new: form.isNew,
        is_featured: form.isFeatured,
      }).eq("id", product.id);

      if (error) { toast.error(error.message); setLoading(false); return; }

      // Sync images: delete removed, insert new
      const existingImageIds = (product.images || []).map((img: any) => img.id);
      const currentImageIds = images.filter((img: any) => img.id).map((img: any) => img.id);
      const deletedImageIds = existingImageIds.filter((id: string) => !currentImageIds.includes(id));

      if (deletedImageIds.length > 0) {
        await supabase.from("product_images").delete().in("id", deletedImageIds);
      }

      // Update existing images (sort order, primary) and insert new ones
      for (const img of images) {
        if (img.id) {
          await supabase.from("product_images").update({
            is_primary: img.isPrimary || false,
            sort_order: img.sortOrder,
          }).eq("id", img.id);
        } else if (img.url) {
          await supabase.from("product_images").insert({
            product_id: product.id,
            url: img.url,
            is_primary: img.isPrimary || false,
            sort_order: img.sortOrder,
          });
        }
      }

      // Sync variants (delete all, re-insert)
      await supabase.from("product_variants").delete().eq("product_id", product.id);
      if (variants.length > 0 && variants.some((v: any) => v.colorNameKo)) {
        await supabase.from("product_variants").insert(
          variants.filter((v: any) => v.colorNameKo).map((v: any) => ({
            product_id: product.id,
            sku: v.sku || `${form.skuPrefix}-${v.colorNameEn?.toUpperCase().slice(0, 3) || "DEF"}-${v.size}`,
            size: v.size,
            color_name_ko: v.colorNameKo,
            color_name_en: v.colorNameEn || v.colorNameKo,
            color_hex: v.colorHex,
            stock_quantity: v.stock,
            price_override: v.priceOverride ? parseInt(v.priceOverride) : null,
          }))
        );
      }

      toast.success("상품이 수정되었습니다");
      router.push("/admin/products");
      router.refresh();
    } catch {
      toast.error("오류가 발생했습니다");
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button type="button" variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-light tracking-wider">상품 수정</h1>
        </div>
        <Button type="button" variant="outline" onClick={handleDuplicate} className="text-sm">
          <Copy className="h-4 w-4 mr-2" /> 상품 복제
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader><CardTitle className="text-sm">기본 정보</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-xs">상품명 (한국어) *</Label><Input value={form.nameKo} onChange={(e) => setForm(f => ({ ...f, nameKo: e.target.value }))} required className="mt-1" /></div>
                  <div><Label className="text-xs">상품명 (영어)</Label><Input value={form.nameEn} onChange={(e) => setForm(f => ({ ...f, nameEn: e.target.value }))} className="mt-1" /></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label className="text-xs">슬러그</Label><Input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} className="mt-1" /></div>
                  <div><Label className="text-xs">SKU 접두사</Label><Input value={form.skuPrefix} onChange={(e) => setForm(f => ({ ...f, skuPrefix: e.target.value }))} className="mt-1" /></div>
                  <div><Label className="text-xs">시즌</Label><Input value={form.season} onChange={(e) => setForm(f => ({ ...f, season: e.target.value }))} className="mt-1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">카테고리 *</Label>
                    <Select value={form.categoryId} onValueChange={(v) => v && setForm(f => ({ ...f, categoryId: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name_ko}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">성별</Label>
                    <Select value={form.gender} onValueChange={(v) => v && setForm(f => ({ ...f, gender: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="U">유니섹스</SelectItem><SelectItem value="M">남성</SelectItem><SelectItem value="F">여성</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader><CardTitle className="text-sm">상품 이미지</CardTitle></CardHeader>
              <CardContent><ImageUpload images={images} onChange={setImages} maxImages={10} /></CardContent>
            </Card>

            {/* Price */}
            <Card>
              <CardHeader><CardTitle className="text-sm">가격</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div><Label className="text-xs">판매가 *</Label><Input type="number" value={form.basePrice} onChange={(e) => setForm(f => ({ ...f, basePrice: e.target.value }))} required className="mt-1" /></div>
                  <div><Label className="text-xs">비교가</Label><Input type="number" value={form.compareAtPrice} onChange={(e) => setForm(f => ({ ...f, compareAtPrice: e.target.value }))} className="mt-1" /></div>
                  <div><Label className="text-xs">할인율</Label><div className="mt-1 h-9 flex items-center px-3 bg-gray-50 border rounded-md text-sm">{discount > 0 ? <span className="text-red-500 font-medium">{discount}%</span> : "-"}</div></div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader><CardTitle className="text-sm">상세 설명</CardTitle></CardHeader>
              <CardContent>
                <Tabs defaultValue="ko">
                  <TabsList><TabsTrigger value="ko">한국어</TabsTrigger><TabsTrigger value="en">English</TabsTrigger></TabsList>
                  <TabsContent value="ko" className="mt-3"><RichTextEditor content={form.descriptionKo} onChange={(html) => setForm(f => ({ ...f, descriptionKo: html }))} /></TabsContent>
                  <TabsContent value="en" className="mt-3"><Textarea value={form.descriptionEn} onChange={(e) => setForm(f => ({ ...f, descriptionEn: e.target.value }))} rows={6} /></TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Material & Care */}
            <Card>
              <CardHeader><CardTitle className="text-sm">소재 & 케어</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-xs">소재 (한)</Label><Input value={form.materialKo} onChange={(e) => setForm(f => ({ ...f, materialKo: e.target.value }))} className="mt-1" /></div>
                  <div><Label className="text-xs">소재 (영)</Label><Input value={form.materialEn} onChange={(e) => setForm(f => ({ ...f, materialEn: e.target.value }))} className="mt-1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-xs">케어 (한)</Label><Textarea value={form.careKo} onChange={(e) => setForm(f => ({ ...f, careKo: e.target.value }))} rows={2} className="mt-1" /></div>
                  <div><Label className="text-xs">케어 (영)</Label><Textarea value={form.careEn} onChange={(e) => setForm(f => ({ ...f, careEn: e.target.value }))} rows={2} className="mt-1" /></div>
                </div>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader><CardTitle className="text-sm">SEO</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-xs">메타 제목 (한)</Label><Input value={form.metaTitleKo} onChange={(e) => setForm(f => ({ ...f, metaTitleKo: e.target.value }))} className="mt-1" /></div>
                  <div><Label className="text-xs">메타 제목 (영)</Label><Input value={form.metaTitleEn} onChange={(e) => setForm(f => ({ ...f, metaTitleEn: e.target.value }))} className="mt-1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-xs">메타 설명 (한)</Label><Textarea value={form.metaDescriptionKo} onChange={(e) => setForm(f => ({ ...f, metaDescriptionKo: e.target.value }))} rows={2} className="mt-1" /></div>
                  <div><Label className="text-xs">메타 설명 (영)</Label><Textarea value={form.metaDescriptionEn} onChange={(e) => setForm(f => ({ ...f, metaDescriptionEn: e.target.value }))} rows={2} className="mt-1" /></div>
                </div>
              </CardContent>
            </Card>

            {/* Variants */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div><CardTitle className="text-sm">옵션</CardTitle><p className="text-xs text-gray-400 mt-1">총 재고: {totalStock}개</p></div>
                <Button type="button" variant="outline" size="sm" onClick={addVariant}><Plus className="h-3 w-3 mr-1" /> 추가</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="hidden md:grid grid-cols-8 gap-2 text-[10px] text-gray-400 uppercase tracking-wider px-1">
                    <span>사이즈</span><span>컬러(한)</span><span>컬러(영)</span><span>색상</span><span>재고</span><span>개별가</span><span>SKU</span><span></span>
                  </div>
                  {variants.map((v: any, i: number) => (
                    <div key={i} className="grid grid-cols-4 md:grid-cols-8 gap-2 items-center">
                      <Select value={v.size} onValueChange={(val) => val && updateVariant(i, "size", val)}>
                        <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>{["XS","S","M","L","XL","XXL","FREE"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input value={v.colorNameKo} onChange={(e) => updateVariant(i, "colorNameKo", e.target.value)} className="h-9 text-xs" />
                      <Input value={v.colorNameEn} onChange={(e) => updateVariant(i, "colorNameEn", e.target.value)} className="h-9 text-xs" />
                      <Input type="color" value={v.colorHex} onChange={(e) => updateVariant(i, "colorHex", e.target.value)} className="h-9" />
                      <Input type="number" value={v.stock} onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value) || 0)} className="h-9 text-xs" />
                      <Input type="number" value={v.priceOverride} onChange={(e) => updateVariant(i, "priceOverride", e.target.value)} placeholder="기본가" className="h-9 text-xs" />
                      <Input value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} className="h-9 text-xs" />
                      <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => removeVariant(i)}><Trash2 className="h-4 w-4 text-red-400" /></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping */}
            <Card>
              <CardHeader><CardTitle className="text-sm">배송</CardTitle></CardHeader>
              <CardContent>
                <div><Label className="text-xs">무게 (g)</Label><Input type="number" value={form.weightGrams} onChange={(e) => setForm(f => ({ ...f, weightGrams: e.target.value }))} className="mt-1 w-48" /></div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-20">
              <CardHeader><CardTitle className="text-sm">상태</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between"><Label className="text-sm">활성</Label><Switch checked={form.isActive} onCheckedChange={(c) => setForm(f => ({ ...f, isActive: c }))} /></div>
                <div className="flex items-center justify-between"><Label className="text-sm">신상품</Label><Switch checked={form.isNew} onCheckedChange={(c) => setForm(f => ({ ...f, isNew: c }))} /></div>
                <div className="flex items-center justify-between"><Label className="text-sm">추천</Label><Switch checked={form.isFeatured} onCheckedChange={(c) => setForm(f => ({ ...f, isFeatured: c }))} /></div>
                <Separator />
                {/* Preview */}
                <div className="border rounded overflow-hidden">
                  <div className="aspect-[3/4] bg-gray-100 relative">
                    {primaryImage ? <Image src={primaryImage.url} alt="" fill className="object-cover" sizes="300px" /> : <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">이미지 없음</div>}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {form.isNew && <Badge className="bg-black text-white text-[10px] rounded-none">NEW</Badge>}
                      {discount > 0 && <Badge className="bg-red-500 text-white text-[10px] rounded-none">-{discount}%</Badge>}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm truncate">{form.nameKo || "상품명"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-medium">{form.basePrice ? formatPrice(parseInt(form.basePrice)) : "₩0"}</span>
                      {form.compareAtPrice && <span className="text-xs text-gray-400 line-through">{formatPrice(parseInt(form.compareAtPrice))}</span>}
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Button type="submit" disabled={loading} className="w-full bg-black text-white hover:bg-gray-900 h-11 text-sm">
                    <Save className="h-4 w-4 mr-2" /> {loading ? "저장 중..." : "변경사항 저장"}
                  </Button>
                  <Button type="button" variant="outline" className="w-full h-10 text-sm" onClick={() => router.back()}>취소</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
