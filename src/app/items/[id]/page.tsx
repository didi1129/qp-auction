"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import { Item } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, Info, Shield, Star, Clock, User, Sword } from "lucide-react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
// Note: We might need a separate Header or reuse the one from page.tsx but strictly speaking 
// reusing Header in a sub-page might require prop drilling or context unless we simplified Header. 
// For now, I'll make a simplified header or just a back button header for the detail page 
// to avoid complex state coupling (notifications, tabs etc) which resides in the main page.
// Or better, I'll just put a minimal header.

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchItem = async () => {
      const { data, error } = await supabase
        .from('market_listings')
        .select('*')
        .eq('market_id', resolvedParams.id) // Query by market_id
        .single();

      if (error) {
        console.error("Error fetching item:", error);
      } else {
        // Map to Item type
        const mappedItem: Item = {
          id: data.market_id,
          name: data.name,
          price: data.price,
          level: 0,
          category: data.category,
          count: data.count,
          timeLeft: data.timeLeft,
          isNew: data.isNew,
          image: data.image,
          seller: data.seller,
          status: data.status,
          // Additional fields logic
        };
        setItem(mappedItem);
      }
      setLoading(false);
    };

    fetchItem();
  }, [resolvedParams.id]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#1a1a1a] text-white">Loading...</div>;
  }

  if (!item) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#1a1a1a] text-white gap-4">
        <p>아이템을 찾을 수 없습니다.</p>
        <Button onClick={() => router.back()}>돌아가기</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#1a1a1a] text-white">
      {/* Simple Header */}
      <div className="h-14 flex items-center px-4 border-b border-[#3d3d3d] bg-[#222]">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-gray-400 hover:text-white mr-2">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-lg font-bold">아이템 상세 정보</h1>
      </div>

      <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
          {/* Image Section */}
          <div className="flex flex-col gap-4">
            <div className="aspect-square bg-[#222] border border-[#444] rounded-lg flex items-center justify-center relative overflow-hidden">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="max-w-full max-h-full object-contain p-4"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : (
                <div className="text-4xl text-gray-600 font-bold">IMG</div>
              )}

              {/* Fallback Text if image fails to load */}
              {item.image && <div className="hidden absolute inset-0 flex items-center justify-center text-4xl text-gray-600 font-bold bg-[#222]">IMG</div>}

              {/* Level Requirement Badge */}
              {(item.level ?? 0) > 0 && (
                <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-yellow-500 font-bold border border-yellow-500/30">
                  Lv.{item.level}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#2a2a2a] p-3 rounded border border-[#333] flex flex-col items-center">
                <span className="text-xs text-gray-400">판매자</span>
                <span className="font-bold text-sm truncate w-full text-center">{item.seller}</span>
              </div>
              <div className="bg-[#2a2a2a] p-3 rounded border border-[#333] flex flex-col items-center">
                <span className="text-xs text-gray-400">남은 시간</span>
                <span className="font-bold text-sm text-yellow-500">{item.timeLeft || "24:00"}</span>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-gray-400 border-gray-600">{item.category}</Badge>
                {item.status === '판매완료' && <Badge variant="destructive">판매완료</Badge>}
                {item.status === '거래중' && <Badge className="bg-blue-600 hover:bg-blue-700">거래중</Badge>}
              </div>
              <h1 className="text-3xl font-bold mb-2">{item.name}</h1>
              <div className="text-2xl font-bold text-yellow-500 flex items-end gap-2">
                {item.price.toLocaleString()} <span className="text-sm font-normal text-gray-400 mb-1">메소</span>
              </div>
            </div>

            <div className="bg-[#222] border border-[#333] rounded-lg p-4 space-y-3">
              <h3 className="font-bold flex items-center gap-2 border-b border-[#333] pb-2 text-gray-200">
                <Info className="h-4 w-4 text-[oklch(0.6_0.15_240)]" /> 기본 정보
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">스타포스</span>
                  <span>0 ★</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">잠재옵션 등급</span>
                  <span className="text-gray-500">없음</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">가위 사용 가능 횟수</span>
                  <span>10회</span>
                </div>
              </div>
            </div>

            <div className="bg-[#222] border border-[#333] rounded-lg p-4 space-y-3">
              <h3 className="font-bold flex items-center gap-2 border-b border-[#333] pb-2 text-gray-200">
                <Sword className="h-4 w-4 text-red-500" /> 추가 옵션
              </h3>
              <p className="text-sm text-gray-500 text-center py-4">추가 옵션이 없습니다.</p>
            </div>

            <Button className="w-full h-12 text-lg font-bold bg-[oklch(0.6_0.15_240)] hover:bg-[oklch(0.55_0.15_240)] mt-auto">
              {item.status === '판매중' ? '구매하기' : '거래 불가'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
