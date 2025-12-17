import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function Sidebar() {
  return (
    <div className="w-[320px] bg-[#222] border-r border-[#3d3d3d] flex flex-col h-[calc(100vh-60px)] overflow-hidden">
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
              <AccordionTrigger className="px-3 py-2 text-sm font-bold text-gray-300 hover:text-white hover:no-underline data-[state=open]:text-white data-[state=open]:bg-[#333] rounded-t">
                {cat}
              </AccordionTrigger>
              <AccordionContent className="p-3 bg-[#1a1a1a] border-t border-[#3d3d3d] rounded-b space-y-4">

                {/* Item Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400">아이템명</label>
                  <div className="relative">
                    <Input
                      className="h-8 bg-white text-black pr-8 text-xs"
                      placeholder={`${cat} 이름 검색`}
                    />
                    <Search className="absolute right-2 top-2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400">가격</label>
                  <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
                    <Input className="h-8 bg-white text-black text-right text-xs px-2" placeholder="최소" />
                    <span className="text-gray-500">~</span>
                    <Input className="h-8 bg-white text-black text-right text-xs px-2" placeholder="최대" />
                  </div>
                </div>

                {/* Search Button */}
                <Button className="w-full bg-[oklch(0.6_0.2_140)] hover:bg-[oklch(0.55_0.2_140)] text-white font-bold h-8 text-xs">
                  검색시작
                </Button>

              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}


