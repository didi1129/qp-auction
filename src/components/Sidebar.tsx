"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, RotateCcw } from "lucide-react";
import { CATEGORIES, Category } from "@/lib/constants";

export function Sidebar() {
  const [selectedCategory, setSelectedCategory] = useState<Category | "전체">("전체");

  return (
    <div className="w-[320px] bg-[#222] border-r border-[#3d3d3d] flex flex-col h-[calc(100vh-100px)]">
      {/* Top Filter Panel */}
      <div className="p-3 space-y-3 bg-[#2a2a2a] m-2 rounded border border-[#3d3d3d]">
        <div className="bg-[oklch(0.6_0.15_240)] text-white p-2 text-center font-bold text-sm rounded-sm">
          방어구
        </div>

        {/* Categories */}
        <div className="space-y-2">
          <Label>아이템분류</Label>
          <div className="grid grid-cols-1 gap-2">
            <Select>
              <SelectTrigger className="h-8 bg-[#333] border-[#444] text-white">
                <SelectValue placeholder="전체" />
              </SelectTrigger>
              <SelectContent className="bg-[#333] border-[#444] text-white">
                <SelectItem value="all">전체</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-2">
              <Select>
                <SelectTrigger className="h-8 bg-[#333] border-[#444] text-white">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent className="bg-[#333] text-white border-[#444]"><SelectItem value="all">전체</SelectItem></SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="h-8 bg-[#333] border-[#444] text-white">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent className="bg-[#333] text-white border-[#444]"><SelectItem value="all">전체</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Item Name */}
        <div className="space-y-1">
          <Label>아이템명</Label>
          <div className="relative">
            <Input className="h-8 bg-white text-black pr-8" />
            <Search className="absolute right-2 top-2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Ranges */}
        <div className="space-y-2">
          <RangeInput label="레벨범위" />
          <RangeInput label="가격" />
          <RangeInput label="스타포스" />
        </div>

        {/* Detailed Search */}
        <div className="space-y-2 pt-2 border-t border-[#444]">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs font-bold">세부검색</span>
            <div className="flex items-center gap-1">
              <Checkbox id="and" className="border-gray-500 data-[state=checked]:bg-[oklch(0.6_0.15_240)] w-4 h-4" />
              <label htmlFor="and" className="text-xs text-gray-400">AND</label>
            </div>
            <div className="flex items-center gap-1">
              <Checkbox id="or" className="border-gray-500 w-4 h-4" />
              <label htmlFor="or" className="text-xs text-gray-400">OR</label>
            </div>
            <span className="text-gray-400 text-xs ml-auto">최소 수치</span>
          </div>
          <div className="space-y-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="grid grid-cols-[1fr_60px] gap-2">
                <Select>
                  <SelectTrigger className="h-7 bg-[#333] border-[#444] text-gray-400 text-xs">
                    <SelectValue placeholder="선택 안 함" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#333] border-[#444] text-white">
                    <SelectItem value="none">선택 안 함</SelectItem>
                  </SelectContent>
                </Select>
                <Input className="h-7 bg-white text-black text-right" />
              </div>
            ))}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-2 pt-2">
          <div className="flex items-center gap-2 rounded bg-[#333] border border-[#444] px-2 py-1">
            <Checkbox id="mem" className="border-gray-500 w-3 h-3" />
            <label htmlFor="mem" className="text-xs text-gray-400 whitespace-nowrap">필터 기억</label>
          </div>
          <Button variant="secondary" size="sm" className="bg-[#444] hover:bg-[#555] text-white h-auto py-1 px-3 text-xs">
            초기화
          </Button>
          <Button className="flex-1 bg-[oklch(0.6_0.2_140)] hover:bg-[oklch(0.55_0.2_140)] text-white h-auto py-1 text-sm font-bold shadow-[0_-2px_0_rgba(0,0,0,0.2)_inset]">
            검색시작
          </Button>
        </div>
      </div>

      {/* Category List (Bottom) */}
      <div className="flex-1 overflow-y-auto mt-2 px-2 pb-2">
        <div className="flex flex-col gap-[1px]">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`
                text-left px-4 py-2 text-sm font-bold rounded-sm border-l-4 transition-all
                ${selectedCategory === cat
                  ? "bg-[#2a2a2a] text-white border-[oklch(0.6_0.15_240)]"
                  : "bg-gradient-to-b from-[#2a2a2a] to-[#222] text-gray-400 border-transparent hover:text-white"}
              `}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-bold text-gray-300 mb-1">{children}</div>;
}

function RangeInput({ label }: { label: string }) {
  return (
    <div className="grid grid-cols-[60px_1fr_auto_1fr] gap-1 items-center">
      <Label>{label}</Label>
      <Input className="h-6 bg-white text-black text-right px-1" />
      <span className="text-gray-500">-</span>
      <Input className="h-6 bg-white text-black text-right px-1" />
    </div>
  );
}
