"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, FileSpreadsheet, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";

interface UploadResult {
  row: number;
  name: string;
  status: "success" | "error";
  message: string;
}

const CSV_TEMPLATE = `name_ko,name_en,slug,sku_prefix,category_slug,base_price,compare_at_price,gender,season,description_ko,material_ko,care_instructions_ko,size,color_name_ko,color_name_en,color_hex,stock_quantity
와이드 플로피 팬츠,Wide Floppy Pants,wide-floppy-pants,LK-PT-001,pants,38000,,U,25SS,편안한 핏의 와이드 팬츠,면 100%,세탁기 사용 가능,M,블랙,Black,#000000,50
와이드 플로피 팬츠,Wide Floppy Pants,wide-floppy-pants,LK-PT-001,pants,38000,,U,25SS,편안한 핏의 와이드 팬츠,면 100%,세탁기 사용 가능,L,블랙,Black,#000000,30`;

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || "";
    });
    return row;
  });
}

export default function BulkUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<UploadResult[]>([]);
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "likelihood_product_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("CSV 파일만 업로드 가능합니다");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const parsed = parseCSV(text);
      setCsvData(parsed);
      setResults([]);
      toast.success(`${parsed.length}행의 데이터를 불러왔습니다`);
    };
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (csvData.length === 0) return;
    setLoading(true);
    const uploadResults: UploadResult[] = [];
    const supabase = createClient();

    // Group rows by slug (same product, different variants)
    const productGroups = new Map<string, Record<string, string>[]>();
    csvData.forEach((row) => {
      const key = row.slug || row.name_ko;
      if (!productGroups.has(key)) productGroups.set(key, []);
      productGroups.get(key)!.push(row);
    });

    let rowNum = 2; // CSV row 2 onwards
    for (const [slug, rows] of productGroups) {
      const firstRow = rows[0];
      try {
        // Find category
        const { data: category } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", firstRow.category_slug)
          .single();

        if (!category) {
          rows.forEach((_, i) => {
            uploadResults.push({ row: rowNum + i, name: firstRow.name_ko, status: "error", message: `카테고리 '${firstRow.category_slug}' 없음` });
          });
          rowNum += rows.length;
          continue;
        }

        // Check if product already exists
        const { data: existing } = await supabase
          .from("products")
          .select("id")
          .eq("slug", firstRow.slug)
          .single();

        let productId: string;

        if (existing) {
          productId = existing.id;
          uploadResults.push({ row: rowNum, name: firstRow.name_ko, status: "success", message: "기존 상품에 옵션 추가" });
        } else {
          // Create product
          const { data: product, error } = await supabase.from("products").insert({
            name_ko: firstRow.name_ko,
            name_en: firstRow.name_en || firstRow.name_ko,
            slug: firstRow.slug,
            sku_prefix: firstRow.sku_prefix,
            category_id: category.id,
            base_price: parseInt(firstRow.base_price) || 0,
            compare_at_price: firstRow.compare_at_price ? parseInt(firstRow.compare_at_price) : null,
            gender: (firstRow.gender as "M" | "F" | "U") || "U",
            season: firstRow.season || null,
            description_ko: firstRow.description_ko || null,
            material_ko: firstRow.material_ko || null,
            care_instructions_ko: firstRow.care_instructions_ko || null,
            is_active: true,
            is_new: true,
          }).select().single();

          if (error || !product) {
            rows.forEach((_, i) => {
              uploadResults.push({ row: rowNum + i, name: firstRow.name_ko, status: "error", message: error?.message || "등록 실패" });
            });
            rowNum += rows.length;
            continue;
          }
          productId = product.id;
          uploadResults.push({ row: rowNum, name: firstRow.name_ko, status: "success", message: "상품 생성 완료" });
        }

        // Create variants for each row
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (row.size && row.color_name_ko) {
            const { error: variantError } = await supabase.from("product_variants").insert({
              product_id: productId,
              sku: `${firstRow.sku_prefix}-${(row.color_name_en || row.color_name_ko).toUpperCase().slice(0, 3)}-${row.size}`,
              size: row.size,
              color_name_ko: row.color_name_ko,
              color_name_en: row.color_name_en || row.color_name_ko,
              color_hex: row.color_hex || "#000000",
              stock_quantity: parseInt(row.stock_quantity) || 0,
            });

            if (variantError) {
              uploadResults.push({ row: rowNum + i, name: `${firstRow.name_ko} ${row.color_name_ko}/${row.size}`, status: "error", message: variantError.message });
            } else if (i > 0 || existing) {
              uploadResults.push({ row: rowNum + i, name: `${firstRow.name_ko} ${row.color_name_ko}/${row.size}`, status: "success", message: "옵션 추가 완료" });
            }
          }
        }

        rowNum += rows.length;
      } catch (err) {
        rows.forEach((_, i) => {
          uploadResults.push({ row: rowNum + i, name: firstRow.name_ko, status: "error", message: "알 수 없는 오류" });
        });
        rowNum += rows.length;
      }
    }

    setResults(uploadResults);
    setLoading(false);

    const successCount = uploadResults.filter((r) => r.status === "success").length;
    const errorCount = uploadResults.filter((r) => r.status === "error").length;
    toast.success(`완료: 성공 ${successCount}건, 실패 ${errorCount}건`);
  };

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Button type="button" variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-light tracking-wider">대량 상품 등록</h1>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* Step 1: Template */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">1</span>
              CSV 템플릿 다운로드
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">
              아래 버튼을 클릭하여 상품 등록용 CSV 템플릿을 다운로드하세요.
              같은 slug를 가진 행은 하나의 상품의 다른 옵션(사이즈/컬러)으로 처리됩니다.
            </p>
            <Button variant="outline" onClick={downloadTemplate} className="text-sm">
              <Download className="h-4 w-4 mr-2" /> 템플릿 다운로드
            </Button>
          </CardContent>
        </Card>

        {/* Step 2: Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">2</span>
              CSV 파일 업로드
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <FileSpreadsheet className="h-8 w-8 mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">CSV 파일을 클릭하여 선택하세요</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {csvData.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <p className="text-sm font-medium">{csvData.length}개 행을 불러왔습니다</p>
                <p className="text-xs text-gray-400 mt-1">
                  상품: {new Set(csvData.map((r) => r.slug || r.name_ko)).size}개,
                  옵션: {csvData.length}개
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 3: Execute */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="bg-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">3</span>
              등록 실행
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleUpload}
              disabled={csvData.length === 0 || loading}
              className="bg-black text-white hover:bg-gray-900 text-sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              {loading ? "등록 중..." : `${csvData.length}개 행 등록하기`}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">등록 결과</CardTitle>
              <div className="flex gap-4 mt-2">
                <span className="text-xs text-green-600">성공: {successCount}건</span>
                <span className="text-xs text-red-600">실패: {errorCount}건</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {results.map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-3">
                      {r.status === "success" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm">{r.name}</p>
                        <p className="text-xs text-gray-400">행 {r.row}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{r.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
