"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/stores/ui-store";

export function SearchModal() {
  const { isSearchOpen, setSearchOpen } = useUIStore();
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setSearchOpen(false);
        setQuery("");
      }
    },
    [query, router, setSearchOpen]
  );

  useEffect(() => {
    if (!isSearchOpen) setQuery("");
  }, [isSearchOpen]);

  return (
    <Dialog open={isSearchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="sm:max-w-2xl top-[20%] translate-y-0 p-0 gap-0 border-0 shadow-2xl">
        <form onSubmit={handleSearch} className="flex items-center px-6 h-16">
          <Search className="h-5 w-5 text-gray-400 mr-4 flex-shrink-0" />
          <input
            type="text"
            placeholder="검색어를 입력하세요..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 text-lg outline-none bg-transparent placeholder:text-gray-300"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 hover:opacity-60"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </form>
        {query.length > 0 && (
          <div className="border-t px-6 py-4">
            <p className="text-xs text-gray-400">
              Enter를 눌러 &quot;{query}&quot; 검색
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
