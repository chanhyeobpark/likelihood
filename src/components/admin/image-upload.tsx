"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Star, GripVertical } from "lucide-react";

interface ImageItem {
  id?: string;
  url: string;
  file?: File;
  isNew?: boolean;
  isPrimary?: boolean;
  sortOrder: number;
}

interface ImageUploadProps {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
  maxImages?: number;
}

export function ImageUpload({ images, onChange, maxImages = 10 }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const newImages: ImageItem[] = [];
      const remaining = maxImages - images.length;
      const filesToAdd = Array.from(files).slice(0, remaining);

      for (const file of filesToAdd) {
        if (!file.type.startsWith("image/")) continue;
        const url = URL.createObjectURL(file);
        newImages.push({
          url,
          file,
          isNew: true,
          isPrimary: images.length === 0 && newImages.length === 0,
          sortOrder: images.length + newImages.length,
        });
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
      }
    },
    [images, maxImages, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (images[index]?.isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    onChange(updated.map((img, i) => ({ ...img, sortOrder: i })));
  };

  const setPrimary = (index: number) => {
    onChange(
      images.map((img, i) => ({ ...img, isPrimary: i === index }))
    );
  };

  const handleReorderDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleReorderDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const reordered = [...images];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(index, 0, moved);
    onChange(reordered.map((img, i) => ({ ...img, sortOrder: i })));
    setDragIndex(index);
  };

  const handleReorderDragEnd = () => {
    setDragIndex(null);
  };

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-black bg-gray-50"
            : "border-gray-200 hover:border-gray-400"
        }`}
      >
        <ImagePlus className="h-8 w-8 mx-auto text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">
          클릭하거나 이미지를 드래그하여 업로드
        </p>
        <p className="text-xs text-gray-400 mt-1">
          최대 {maxImages}장 / JPG, PNG, WebP
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-5 gap-3">
          {images.map((img, i) => (
            <div
              key={img.url}
              draggable
              onDragStart={() => handleReorderDragStart(i)}
              onDragOver={(e) => handleReorderDragOver(e, i)}
              onDragEnd={handleReorderDragEnd}
              className={`relative group aspect-square rounded-md overflow-hidden border ${
                img.isPrimary ? "ring-2 ring-black" : "border-gray-200"
              } ${dragIndex === i ? "opacity-50" : ""}`}
            >
              <Image
                src={img.url}
                alt={`상품 이미지 ${i + 1}`}
                fill
                className="object-cover"
                sizes="120px"
              />
              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                <GripVertical className="absolute top-1 left-1 h-4 w-4 text-white cursor-grab" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 bg-white/80 hover:bg-white"
                  onClick={() => setPrimary(i)}
                  title="대표 이미지로 설정"
                >
                  <Star
                    className={`h-3.5 w-3.5 ${
                      img.isPrimary ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                    }`}
                  />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 bg-white/80 hover:bg-white"
                  onClick={() => removeImage(i)}
                >
                  <X className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </div>
              {img.isPrimary && (
                <span className="absolute bottom-1 left-1 text-[9px] bg-black text-white px-1.5 py-0.5 rounded">
                  대표
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
