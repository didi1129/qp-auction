"use client";

import { useState, useRef } from "react";
import { Item } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CheckCircle, Upload, AlertCircle } from "lucide-react";
import Image from "next/image";

interface CompleteTabProps {
  item: Item | null;
  onComplete: (itemId: number) => void;
  onNavigateToMyItems?: () => void;
}

export function CompleteTab({ item, onComplete, onNavigateToMyItems }: CompleteTabProps) {
  const [hasScreenshot, setHasScreenshot] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setHasScreenshot(true);
    }
  };

  const handleComplete = () => {
    if (!item) return;
    onComplete(item.id);
  };

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-[#222]">
        <AlertCircle className="h-10 w-10 mb-4" />
        <p>선택된 거래 완료 대상 아이템이 없습니다.</p>
        <p className="text-sm">알림에서 &apos;거래완료하기&apos;를 통해 진입해 주세요.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#222] p-6 text-white items-center justify-center">
      <div className="w-full max-w-lg bg-[#1a1a1a] border border-[#3d3d3d] rounded p-6 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-yellow-500 flex items-center gap-2">
          <CheckCircle className="h-6 w-6" /> 거래 완료 처리
        </h2>

        {/* Item Info */}
        <div className="flex gap-4 p-4 bg-[#2a2a2a] rounded border border-[#333]">
          <div className="w-16 h-16 bg-[#1a1a1a] border border-[#444] rounded flex items-center justify-center">
            {item.image ? (
              <Image src={item.image} alt={item.name} width={64} height={74} />
            ) : (
              <span className="text-xs">IMG</span>
            )}
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-bold text-lg">{item.name}</span>
            <span className="text-gray-400 text-sm">판매자: {item.seller} <span className="text-xs text-gray-500">({item.seller_discord_id || "ID 없음"})</span></span>
            <span className="text-gray-300 text-sm">구매자: {item.buyer || "(구매 요청자)"} <span className="text-xs text-gray-500">({item.buyer_discord_id || "-"})</span></span>
            <span className="text-yellow-500 font-bold">{item.price.toLocaleString()} 원</span>
            <p className="text-xs text-gray-500"><AlertCircle className="inline-block h-4 w-4" /> 가격을 흥정했을 경우 <Button variant='link' onClick={(e) => { e.preventDefault(); onNavigateToMyItems?.(); }} className="text-blue-500 hover:underline px-0 text-xs">[내 아이템]</Button>에서 가격을 수정한 뒤 진행해주세요.</p>
          </div>
        </div>

        {/* Screenshot Upload (Optional) */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-300">거래 인증샷 첨부 (선택)</label>
          <div
            className={`
                    border-2 border-dashed border-[#444] rounded p-6 
                    flex flex-col items-center justify-center cursor-pointer hover:bg-[#2a2a2a] transition-colors
                    ${hasScreenshot ? "border-green-500 bg-[#1a2e1a]" : ""}
                `}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className={`h-8 w-8 mb-2 ${hasScreenshot ? "text-green-500" : "text-gray-500"}`} />
            <span className={`text-sm ${hasScreenshot ? "text-green-500 font-bold" : "text-gray-500"}`}>
              {hasScreenshot ? "인증샷 첨부 완료!" : "클릭하여 이미지 업로드"}
            </span>
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
            />
          </div>
          {hasScreenshot && (
            <p className="text-xs text-green-500 text-center">
              * 인증샷을 첨부하여 신뢰도가 상승했습니다! (+10점)
            </p>
          )}
        </div>

        {/* Complete Button */}
        <Button
          className="w-full h-12 text-lg font-bold bg-[oklch(0.6_0.15_240)] hover:bg-[oklch(0.55_0.15_240)] text-white"
          onClick={handleComplete}
        >
          거래 완료 확정하기
        </Button>
      </div>
    </div>
  );
}
