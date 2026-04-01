"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface VariantRow {
  size: string;
  colorNameKo: string;
  colorNameEn: string;
  colorHex: string;
  sku: string;
  stock: number;
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    nameKo: "", nameEn: "", slug: "", skuPrefix: "",
    descriptionKo: "", materialKo: "", careKo: "",
    categoryId: "", basePrice: "", compareAtPrice: "",
    gender: "U", season: "", isActive: true, isNew: false, isFeatured: false,
  });
  const [variants, setVariants] = useState<VariantRow[]>([
    { size: "M", colorNameKo: "", colorNameEn: "", colorHex: "#000000", sku: "", stock: 0 },
  ]);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("categories").select("id, name_ko").eq("is_active", true).order("sort_order");
      if (data) setCategories(data);
    };
    load();
  }, []);

  const addVariant = () => setVariants([...variants, { size: "M", colorNameKo: "", colorNameEn: "", colorHex: "#000000", sku: "", stock: 0 }]);
  const removeVariant = (i: number) => setVariants(variants.filter((_, idx) => idx !== i));
  const updateVariant = (i: number, field: keyof VariantRow, value: string | number) => setVariants(variants.map((v, idx) => idx === i ? { ...v, [field]: value } : v));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: product, error } = await supabase.from("products").insert({
        name_ko: form.nameKo, name_en: form.nameEn, slug: form.slug, sku_prefix: form.skuPrefix,
        description_ko: form.descriptionKo || null, material_ko: form.materialKo || null, care_instructions_ko: form.careKo || null,
        category_id: form.categoryId, base_price: parseInt(form.basePrice),
        compare_at_price: form.compareAtPrice ? parseInt(form.compareAtPrice) : null,
        gender: form.gender as "M" | "F" | "U", season: form.season || null,
        is_active: form.isActive, is_new: form.isNew, is_featured: form.isFeatured,
      }).select().single();
      if (error || !product) { toast.error(error?.message || "등록 실패"); setLoading(false); return; }

      if (variants.length > 0) {
        await supabase.from("product_variants").insert(variants.map((v) => ({
          product_id: product.id,
          sku: v.sku || `${form.skuPrefix}-${v.colorNameEn?.toUpperCase().slice(0, 3)}-${v.size}`,
          size: v.size, color_name_ko: v.colorNameKo, color_name_en: v.colorNameEn,
          color_hex: v.colorHex, stock_quantity: v.stock,
        })));
      }
      toast.success("상품이 등록되었습니다");
      router.push("/admin/products");
    } catch { toast.error("오류가 발생했습니다"); setLoading(false); }
  };

  return (
    <div>
      <h1 className="text-2xl font-light tracking-wider mb-8">상품 등록</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <Card>
          <CardHeader><CardTitle className="text-sm">기본 정보</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs">상품명 (한국어)</Label><Input value={form.nameKo} onChange={(e) => setForm(f => ({ ...f, nameKo: e.target.value }))} required className="mt-1" /></div>
              <div><Label className="text-xs">상품명 (영어)</Label><Input value={form.nameEn} onChange={(e) => setForm(f => ({ ...f, nameEn: e.target.value }))} required className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">슬러그 (URL)</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} required />
                  <Button type="button" variant="outline" size="sm" onClick={() => setForm(f => ({ ...f, slug: f.nameEn.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }))}>생성</Button>
                </div>
              </div>
              <div><Label className="text-xs">SKU 접두사</Label><Input value={form.skuPrefix} onChange={(e) => setForm(f => ({ ...f, skuPrefix: e.target.value }))} placeholder="LK-TP-001" required className="mt-1" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs">카테고리</Label>
                <Select value={form.categoryId} onValueChange={(v) => v && setForm(f => ({ ...f, categoryId: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="선택" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name_ko}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">성별</Label>
                <Select value={form.gender} onValueChange={(v) => v && setForm(f => ({ ...f, gender: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="U">유니섹스</SelectItem><SelectItem value="M">남성</SelectItem><SelectItem value="F">여성</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">시즌</Label><Input value={form.season} onChange={(e) => setForm(f => ({ ...f, season: e.target.value }))} placeholder="25SS" className="mt-1" /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">가격</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div><Label className="text-xs">판매가 (KRW)</Label><Input type="number" value={form.basePrice} onChange={(e) => setForm(f => ({ ...f, basePrice: e.target.value }))} required className="mt-1" /></div>
            <div><Label className="text-xs">비교가 (할인 전)</Label><Input type="number" value={form.compareAtPrice} onChange={(e) => setForm(f => ({ ...f, compareAtPrice: e.target.value }))} className="mt-1" /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">상세 설명</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label className="text-xs">설명</Label><Textarea value={form.descriptionKo} onChange={(e) => setForm(f => ({ ...f, descriptionKo: e.target.value }))} rows={4} className="mt-1" /></div>
            <div><Label className="text-xs">소재</Label><Input value={form.materialKo} onChange={(e) => setForm(f => ({ ...f, materialKo: e.target.value }))} className="mt-1" /></div>
            <div><Label className="text-xs">케어 방법</Label><Textarea value={form.careKo} onChange={(e) => setForm(f => ({ ...f, careKo: e.target.value }))} rows={2} className="mt-1" /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">옵션 (사이즈/컬러)</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}><Plus className="h-3 w-3 mr-1" /> 추가</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-7 gap-2 items-end">
                  <div>
                    <Label className="text-[10px]">사이즈</Label>
                    <Select value={v.size} onValueChange={(val) => val && updateVariant(i, "size", val)}>
                      <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>{["XS","S","M","L","XL","XXL","FREE"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-[10px]">컬러 (한)</Label><Input value={v.colorNameKo} onChange={(e) => updateVariant(i, "colorNameKo", e.target.value)} className="mt-1 h-9" /></div>
                  <div><Label className="text-[10px]">컬러 (영)</Label><Input value={v.colorNameEn} onChange={(e) => updateVariant(i, "colorNameEn", e.target.value)} className="mt-1 h-9" /></div>
                  <div><Label className="text-[10px]">색상</Label><Input type="color" value={v.colorHex} onChange={(e) => updateVariant(i, "colorHex", e.target.value)} className="mt-1 h-9" /></div>
                  <div><Label className="text-[10px]">재고</Label><Input type="number" value={v.stock} onChange={(e) => updateVariant(i, "stock", parseInt(e.target.value) || 0)} className="mt-1 h-9" /></div>
                  <div><Label className="text-[10px]">SKU</Label><Input value={v.sku} onChange={(e) => updateVariant(i, "sku", e.target.value)} placeholder="자동" className="mt-1 h-9" /></div>
                  <Button type="button" variant="ghost" size="icon" className="h-9 w-9" onClick={() => removeVariant(i)}><Trash2 className="h-4 w-4 text-red-400" /></Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">상태</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between"><Label>활성 (판매중)</Label><Switch checked={form.isActive} onCheckedChange={(c) => setForm(f => ({ ...f, isActive: c }))} /></div>
            <div className="flex items-center justify-between"><Label>신상품 표시</Label><Switch checked={form.isNew} onCheckedChange={(c) => setForm(f => ({ ...f, isNew: c }))} /></div>
            <div className="flex items-center justify-between"><Label>추천 상품</Label><Switch checked={form.isFeatured} onCheckedChange={(c) => setForm(f => ({ ...f, isFeatured: c }))} /></div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="bg-black text-white hover:bg-gray-900 h-11 px-8 text-sm">{loading ? "저장 중..." : "상품 등록"}</Button>
          <Button type="button" variant="outline" onClick={() => router.back()} className="h-11 px-8 text-sm">취소</Button>
        </div>
      </form>
    </div>
  );
}
