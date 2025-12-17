"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, AlertCircle, Package } from "lucide-react";
import { MOCK_ITEMS } from "@/lib/constants";

export function ItemTable() {
  const [items, setItems] = useState(MOCK_ITEMS);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);

  const selectedItem = items.find(i => i.id === selectedId);

  // Format number with commas
  const formatNumber = (num: number) => num.toLocaleString();

  // Convert number to Korean readable format (e.g. 1억 2000만)
  const formatKoreanPrice = (price: number) => {
    if (price >= 100000000) {
      const eok = Math.floor(price / 100000000);
      const man = Math.floor((price % 100000000) / 10000);
      return `(${eok}억 ${man > 0 ? `${man}만` : ""} ${price % 10000 > 0 ? `${price % 10000}` : ""})`;
    } else if (price >= 10000) {
      const man = Math.floor(price / 10000);
      return `(${man}만 ${price % 10000})`;
    }
    return `(${price})`;
  };

  const handlePurchaseRequest = () => {
    if (selectedId) {
      setItems(prev => prev.map(item =>
        item.id === selectedId ? { ...item, status: "거래대기중" } : item
      ));
      setIsPurchaseDialogOpen(false);
      setSelectedId(null);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-[#222]">
      {/* Search Results Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#2a2a2a] border-b border-[#3d3d3d]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white border-l-4 border-[oklch(0.6_0.15_240)] pl-2">검색결과</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400"><ChevronsLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400"><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-white text-sm font-bold bg-[#1a1a1a] px-3 py-0.5 rounded border border-[#3d3d3d]">1 / 12</span>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400"><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400"><ChevronsRight className="h-4 w-4" /></Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[oklch(0.6_0.15_240)]"></div>
          <span className="text-xs text-gray-400">선택된 아이템</span>
        </div>
      </div>

      {/* Table Area */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-[#1a1a1a] sticky top-0 z-10">
            <TableRow className="border-[#3d3d3d] hover:bg-[#1a1a1a]">
              <TableHead className="text-center text-gray-300 font-bold h-8 w-[60px]"></TableHead>
              <TableHead className="text-center text-gray-300 font-bold h-8">아이템 이름</TableHead>
              <TableHead className="text-center text-gray-300 font-bold h-8 w-[150px]">가격</TableHead>
              <TableHead className="text-center text-gray-300 font-bold h-8 w-[150px]">개당 가격</TableHead>
              <TableHead className="text-center text-gray-300 font-bold h-8 w-[120px]">남은시간</TableHead>
              <TableHead className="text-center text-gray-300 font-bold h-8 w-[100px]">판매자</TableHead>
              <TableHead className="text-center text-gray-300 font-bold h-8 w-[80px]">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const isSelling = item.status === "판매중";
              return (
                <TableRow
                  key={item.id}
                  className={`
                    border-[#333] transition-colors h-[50px]
                    ${!isSelling ? "opacity-50 pointer-events-none bg-[#1a1a1a]" : "cursor-pointer hover:bg-[#333]"}
                    ${selectedId === item.id ? "bg-[#2a3f4a] hover:bg-[#2a3f4a] border-l-2 border-l-[oklch(0.6_0.15_240)]" : ""}
                `}
                  onClick={() => isSelling && setSelectedId(item.id)}
                >
                  {/* Image Column */}
                  <TableCell className="p-1 text-center relative">
                    <div className="w-10 h-10 bg-[#1a1a1a] border border-[#444] rounded mx-auto flex items-center justify-center relative overflow-hidden group">
                      <div className="text-xs text-gray-600">IMG</div>
                      {item.isNew && (
                        <span className="absolute top-0 left-0 bg-[#65a30d] text-[8px] text-white px-0.5 leading-none">W</span>
                      )}
                      {item.level > 0 && (
                        <span className="absolute bottom-0 right-0 text-[9px] text-yellow-500 font-bold drop-shadow-md">Lv.{item.level}</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Name Column */}
                  <TableCell className="text-white font-medium">
                    <div className="flex items-center gap-2">
                      {item.name}
                      {item.count && item.count > 1 && <span className="text-gray-400 text-xs">({item.count})</span>}
                    </div>
                  </TableCell>

                  {/* Price Column */}
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-white font-bold">{formatNumber(item.price)}</span>
                      <span className="text-gray-500 text-xs">{formatKoreanPrice(item.price)}</span>
                    </div>
                  </TableCell>

                  {/* Per Unit Price */}
                  <TableCell className="text-right">
                    {item.perItemPrice ? (
                      <div className="flex flex-col items-end">
                        <span className="text-white font-bold">{formatNumber(item.perItemPrice)}</span>
                        <span className="text-gray-500 text-xs">{formatKoreanPrice(item.perItemPrice)}</span>
                      </div>
                    ) : (
                      <span className="text-gray-600">-</span>
                    )}
                  </TableCell>

                  {/* Time Left */}
                  <TableCell className="text-center text-white text-sm">
                    {item.timeLeft}
                  </TableCell>

                  {/* Seller */}
                  <TableCell className="text-center text-gray-300 text-sm">
                    {item.seller}
                  </TableCell>

                  {/* Status */}
                  <TableCell className="text-center text-sm">
                    <span className={`
                      px-2 py-0.5 rounded text-xs font-bold
                      ${item.status === "판매중" ? "bg-[#333] text-green-500 border border-green-900" : ""}
                      ${item.status === "거래대기중" ? "bg-[#333] text-yellow-500 border border-yellow-900" : ""}
                      ${item.status === "거래중" ? "bg-[#333] text-blue-500 border border-blue-900" : ""}
                      ${item.status === "판매완료" ? "bg-[#333] text-red-500 border border-red-900" : ""}
                    `}>
                      {item.status}
                    </span>
                  </TableCell>
                </TableRow>
              )
            })}
            {/* Fill empty rows to maintain height look */}
            {Array.from({ length: Math.max(0, 12 - items.length) }).map((_, i) => (
              <TableRow key={`empty-${i}`} className="border-[#333] h-[50px] hover:bg-transparent pointer-events-none">
                <TableCell colSpan={7} className="p-0"></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Detail Footer Panel */}
      <div className="h-[100px] bg-[#222] border-t border-[#3d3d3d] p-4 flex items-center justify-center">
        {selectedItem ? (
          <div className="flex items-center gap-4 w-full">
            <div className="w-16 h-16 bg-[#1a1a1a] border border-[#444] flex items-center justify-center">
              <Package className="text-gray-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg">{selectedItem.name}</span>
              <span className="text-gray-400 text-sm">아이템을 구매하시겠습니까?</span>
            </div>
            <div className="ml-auto flex gap-2">
              <Button
                className="bg-[oklch(0.6_0.15_240)] hover:bg-[oklch(0.55_0.15_240)] text-white"
                onClick={() => setIsPurchaseDialogOpen(true)}
              >
                구매하기
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-400">
            <AlertCircle className="h-5 w-5" />
            <div className="flex flex-col">
              <span className="font-bold text-white">선택된 아이템이 없습니다.</span>
              <span className="text-sm">목록에서 아이템을 선택해 주세요.</span>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <AlertDialogContent className="bg-[#222] border-[#3d3d3d] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>구매 요청</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {selectedItem?.name} 아이템에 구매 요청을 보내시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#333] border-[#444] text-white hover:bg-[#444] hover:text-white">취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePurchaseRequest}
              className="bg-[oklch(0.6_0.15_240)] text-white hover:bg-[oklch(0.55_0.15_240)]"
            >
              구매 요청
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
