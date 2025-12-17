"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package, Clock } from "lucide-react";

// Mock data for global item database
const GAME_ITEMS = [
  { id: 101, name: "오래된 검", category: "무기", basicPrice: 1000 },
  { id: 102, name: "빨간 포션", category: "소비", basicPrice: 50 },
  { id: 103, name: "파란 포션", category: "소비", basicPrice: 100 },
  { id: 104, name: "민첩함의 크리스탈", category: "소품", basicPrice: 50000 },
  { id: 105, name: "주황버섯의 갓", category: "기타", basicPrice: 10 },
  { id: 106, name: "청동", category: "기타", basicPrice: 500 },
  { id: 107, name: "강철", category: "기타", basicPrice: 1000 },
  { id: 108, name: "미스릴", category: "기타", basicPrice: 1500 },
  { id: 109, name: "오리할콘", category: "기타", basicPrice: 2000 },
  { id: 110, name: "아담antium", category: "기타", basicPrice: 3000 },
];

import { Item } from "@/lib/types";

interface SellTabProps {
  onRegister: (item: Item) => void;
}

export function SellTab({ onRegister }: SellTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<(typeof GAME_ITEMS)[0] | null>(null);
  const [price, setPrice] = useState("");

  const filteredItems = GAME_ITEMS.filter((item) =>
    item.name.includes(searchTerm)
  );

  const handleRegister = () => {
    if (!selectedItem || !price) return;

    const newItem: Item = {
      id: Date.now(), // Generate unique ID
      name: selectedItem.name,
      category: selectedItem.category,
      price: Number(price),
      basicPrice: selectedItem.basicPrice,
      count: 1,
      timeLeft: "24시간 00분",
      isNew: true,
      seller: "나",
      status: "판매중",
      image: "/placeholder-new.png"
    };

    onRegister(newItem);
    alert(`${selectedItem.name}이(가) ${Number(price).toLocaleString()} 메소에 24시간 동안 등록되었습니다.`);
    setSelectedItem(null);
    setPrice("");
    setSearchTerm("");
  };

  return (
    <div className="flex flex-1 gap-4 p-4 bg-[#222] text-white overflow-hidden">
      {/* Search Panel (Left) */}
      <div className="w-[300px] flex flex-col gap-4 border-r border-[#3d3d3d] pr-4">
        <h2 className="text-lg font-bold text-yellow-500">판매할 아이템 선택</h2>

        <div className="relative">
          <Input
            placeholder="아이템 검색..."
            className="bg-white text-black pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        </div>

        <div className="flex-1 overflow-y-auto bg-[#1a1a1a] border border-[#3d3d3d] rounded">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`
                p-3 flex items-center gap-3 cursor-pointer hover:bg-[#333] border-b border-[#2a2a2a]
                ${selectedItem?.id === item.id ? "bg-[#2a3f4a] border-l-4 border-l-[oklch(0.6_0.15_240)]" : ""}
              `}
            >
              <div className="w-8 h-8 bg-[#2a2a2a] rounded flex items-center justify-center border border-[#444]">
                <Package className="h-4 w-4 text-gray-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold">{item.name}</span>
                <span className="text-xs text-gray-400">{item.category}</span>
              </div>
            </div>
          ))}
          {filteredItems.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* Registration Form (Right) */}
      <div className="flex-1 flex flex-col gap-6 pl-4 max-w-2xl">
        <h2 className="text-lg font-bold text-yellow-500">판매 정보 입력</h2>

        <div className="bg-[#1a1a1a] p-6 rounded border border-[#3d3d3d] flex flex-col gap-6">
          <div className="flex gap-4 items-start">
            <div className="w-24 h-24 bg-[#2a2a2a] border border-[#444] flex items-center justify-center rounded">
              {selectedItem ? (
                <Package className="h-10 w-10 text-white" />
              ) : (
                <span className="text-gray-600 text-xs">선택안함</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xl font-bold">{selectedItem ? selectedItem.name : "아이템을 선택해주세요"}</span>
              <span className="text-gray-400 text-sm">{selectedItem ? selectedItem.category : "-"}</span>
            </div>
          </div>

          <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
            <label className="text-gray-400 font-bold">판매 가격</label>
            <div className="relative">
              <Input
                type="number"
                className="bg-white text-black text-right pr-8 font-bold"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={!selectedItem}
              />
              <span className="absolute right-3 top-2.5 text-black text-sm">메소</span>
            </div>

            <label className="text-gray-400 font-bold">등록 시간</label>
            <div className="flex items-center gap-2 text-white font-bold bg-[#333] px-3 py-2 rounded">
              <Clock className="h-4 w-4 text-gray-400" />
              24시간 00분
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#3d3d3d]">
            <Button
              className="w-32 bg-[oklch(0.6_0.15_240)] hover:bg-[oklch(0.55_0.15_240)] text-white font-bold"
              disabled={!selectedItem || !price}
              onClick={handleRegister}
            >
              판매 등록
            </Button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-[#2a2a2a] p-4 text-xs text-gray-400 rounded">
          <ul className="list-disc pl-4 space-y-1">
            <li>아이템은 등록 후 24시간 동안 판매됩니다.</li>
            <li>판매 완료 시 수수료 5%가 차감된 금액을 수령할 수 있습니다.</li>
            <li>등록된 아이템은 언제든지 취소할 수 있습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
