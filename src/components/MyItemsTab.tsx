"use client";

import { Item } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle } from "lucide-react";

interface MyItemsTabProps {
  items: Item[];
  onAcceptTrade: (itemId: number) => void;
}

export function MyItemsTab({ items, onAcceptTrade }: MyItemsTabProps) {
  // Filter items where I am the buyer (requested)
  // For demo: items with status '거래대기중' (simulating I requested them) OR items explicitly marked as buyer='나'
  // Let's assume for this demo, any item I 'Buy' in ItemTable gets status '거래대기중'.
  // But wait, if *I* bought it, I want to see it here.
  // And if *I* am selling it, and someone else bought it, I also see it here?
  // Let's split into "구매 진행 중" (Buying) and "판매 진행 중" (Selling).

  // For the demo purpose:
  // "Buying": Items with status '거래대기중' or '거래중' or '판매완료' (if buyer is me).
  // "Selling": Items where seller is '나' (added via SellTab).

  const myRequests = items.filter(i => i.status === "거래대기중" || i.status === "거래중" || i.status === "판매완료");
  // In a real app, we'd check i.buyer === 'me'.

  const mySales = items.filter(i => i.seller === "나"); // Items added by me

  return (
    <div className="flex flex-1 gap-4 p-4 bg-[#222] text-white overflow-hidden h-full">

      {/* My Purchase Requests */}
      <div className="flex-1 flex flex-col gap-4 border-r border-[#3d3d3d] pr-4">
        <h2 className="text-lg font-bold text-yellow-500 flex items-center gap-2">
          <Package className="h-5 w-5" /> 내 구매 요청 목록
          <span className="text-sm text-gray-400 font-normal">(Status: 거래대기중/거래중)</span>
        </h2>
        <div className="flex-1 overflow-y-auto bg-[#1a1a1a] border border-[#3d3d3d] rounded p-2">
          {myRequests.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">구매 요청한 아이템이 없습니다.</div>
          ) : (
            myRequests.map(item => (
              <div key={item.id} className="bg-[#2a2a2a] p-3 mb-2 rounded border border-[#333] flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#1a1a1a] rounded border border-[#444] flex items-center justify-center">
                    <Package className="text-gray-600 h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white">{item.name}</span>
                    <span className="text-xs text-gray-400">{item.category} | {item.seller}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-bold ${item.status === '거래중' ? 'text-blue-500' : 'text-yellow-500'}`}>
                    {item.status}
                  </span>

                  {/* DEMO BUTTON TO SIMULATE SELLER ACCEPTING */}
                  {item.status === "거래대기중" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs border-green-700 text-green-500 hover:bg-green-900"
                      onClick={() => onAcceptTrade(item.id)}
                    >
                      (TEST) 판매자 수락 시뮬레이션
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* My Sales (Just for context, optional based on prompt but good to have) */}
      <div className="w-[350px] flex flex-col gap-4">
        <h2 className="text-lg font-bold text-yellow-500 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" /> 내 판매 내역
        </h2>
        <div className="flex-1 overflow-y-auto bg-[#1a1a1a] border border-[#3d3d3d] rounded p-2">
          {mySales.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">판매 등록한 아이템이 없습니다.</div>
          ) : (
            mySales.map(item => (
              <div key={item.id} className="bg-[#2a2a2a] p-3 mb-2 rounded border border-[#333] flex justify-between items-center">
                <div className="flex items-col">
                  <span className="font-bold">{item.name}</span>
                  <span className="text-xs text-gray-400">{Number(item.price).toLocaleString()} 메소</span>
                </div>
                <span className="text-xs bg-[#333] px-2 py-1 rounded">{item.status}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
