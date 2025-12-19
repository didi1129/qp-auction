import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function Sidebar({ onSearch }: { onSearch: (category: string, keyword: string, minPrice?: number, maxPrice?: number) => void }) {
  const [keyword, setKeyword] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const handleSearch = (category: string) => {
    onSearch(category, keyword, minPrice ? Number(minPrice) : undefined, maxPrice ? Number(maxPrice) : undefined);
  };

  const handleReset = () => {
    setKeyword("");
    setMinPrice("");
    setMaxPrice("");
    onSearch("전체보기", "", undefined, undefined);
  };

  return (
    <div className="w-[320px] bg-[#222] border-r border-[#3d3d3d] flex flex-col h-full overflow-hidden">
      {/* Search Header */}
      <div className="p-3 bg-[#2a2a2a] border-b border-[#3d3d3d]">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Search className="h-4 w-4 text-[oklch(0.6_0.15_240)]" /> 상세 조건 검색
        </h2>
      </div>

      {/* Accordion List */}
      <div className="flex-1 overflow-y-auto p-2">
        <Accordion type="single" collapsible className="w-full space-y-1">
          {CATEGORIES.map((cat) => (
            <AccordionItem key={cat} value={cat} className="border border-[#3d3d3d] rounded bg-[#2a2a2a] px-0">
              <AccordionTrigger className="px-3 py-2 text-sm font-bold text-gray-300 hover:text-white hover:no-underline data-[state=open]:text-white data-[state=open]:bg-[oklch(0.6_0.15_240)] rounded-t">
                {cat}
              </AccordionTrigger>
              <AccordionContent className="p-3 bg-[#1a1a1a] border-t border-[#3d3d3d] rounded-b space-y-4">

                {/* Item Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400">아이템명</label>
                  <div className="relative">
                    <Input
                      className="h-8 bg-[#333] text-white border-[#444] pr-8 text-xs focus:ring-offset-0 focus:ring-1 focus:ring-[oklch(0.6_0.15_240)]"
                      placeholder={`${cat} 이름 검색`}
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch(cat)}
                    />
                    <Search className="absolute right-2 top-2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400">가격</label>
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                    <Input
                      className="h-8 bg-[#333] text-white border-[#444] text-right text-xs px-2 focus:ring-1 focus:ring-[oklch(0.6_0.15_240)]"
                      placeholder="최소"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value.replace(/[^0-9]/g, ""))}
                    />
                    <span className="text-gray-500">~</span>
                    <Input
                      className="h-8 bg-[#333] text-white border-[#444] text-right text-xs px-2 focus:ring-1 focus:ring-[oklch(0.6_0.15_240)]"
                      placeholder="최대"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value.replace(/[^0-9]/g, ""))}
                    />
                  </div>
                </div>

                {/* Search Button */}
                <Button
                  className="w-full bg-[oklch(0.6_0.2_140)] hover:bg-[oklch(0.55_0.2_140)] text-white font-bold h-8 text-xs"
                  onClick={() => handleSearch(cat)}
                >
                  검색시작
                </Button>

              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Reset Button at bottom */}
      <div className="p-4 bg-[#2a2a2a] border-t border-[#3d3d3d]">
        <Button
          variant="outline"
          className="w-full border-[#444] text-gray-400 hover:text-white hover:bg-[#333] text-xs font-bold h-9"
          onClick={handleReset}
        >
          필터 초기화
        </Button>
      </div>
    </div>
  );
}


