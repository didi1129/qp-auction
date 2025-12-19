"use client";

import { Item } from "@/lib/types";
import { History, TrendingUp, AlertTriangle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface MarketPriceTabProps {
  items: Item[];
}

interface MarketItemStats {
  name: string;
  image?: string;
  category: string;
  averagePrice: number;
  recentPrice: number;
  totalTrades: number;
  trend: "up" | "down" | "stable";
  history: Item[];
}

export function MarketPriceTab({ items }: MarketPriceTabProps) {
  // 1. Filter sold items
  const soldItems = items.filter(item => item.status === "판매완료");

  // 2. Group by item name
  const groupedItems = soldItems.reduce((acc, item) => {
    if (!acc[item.name]) {
      acc[item.name] = [];
    }
    acc[item.name].push(item);
    return acc;
  }, {} as Record<string, Item[]>);

  // 3. Calculate statistics with anti-manipulation logic (Trimmed Mean)
  const marketStats: MarketItemStats[] = Object.entries(groupedItems).map(([name, history]) => {
    // Sort logic for history (by ID assuming larger ID = newer, or use timestamp if available)
    // Here we use ID descending for display, but price sorting for calc
    const sortedHistory = [...history].sort((a, b) => b.id - a.id);
    const recentPrice = sortedHistory[0].price;

    // Anti-manipulation: Remove outliers if we have enough data (e.g., > 3 items)
    let validPrices = history.map(h => h.price).sort((a, b) => a - b);

    if (validPrices.length >= 4) {
      // Trim top and bottom 20% (approx)
      const trimCount = Math.floor(validPrices.length * 0.2);
      validPrices = validPrices.slice(trimCount, validPrices.length - trimCount);
    }

    const sum = validPrices.reduce((a, b) => a + b, 0);
    const averagePrice = Math.floor(sum / validPrices.length);

    // Determine trend (Compare recent vs average)
    let trend: "up" | "down" | "stable" = "stable";
    if (recentPrice > averagePrice * 1.05) trend = "up";
    else if (recentPrice < averagePrice * 0.95) trend = "down";

    return {
      name,
      image: history[0].image,
      category: history[0].category,
      averagePrice,
      recentPrice,
      totalTrades: history.length,
      trend,
      history: sortedHistory
    };
  });

  return (
    <div className="flex flex-col h-full bg-[#222] text-white p-4 gap-4">
      <div className="flex items-center justify-between border-b border-[#3d3d3d] pb-4">
        <h2 className="text-xl font-bold text-yellow-500 flex items-center gap-2">
          <History className="h-6 w-6" /> 시세 조회
        </h2>
        <div className="text-sm text-gray-400 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <span>시세 조작 방지를 위해 상/하위 20%의 이상치는 평균 계산에서 제외됩니다.</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-[#1a1a1a] rounded border border-[#3d3d3d]">
        <Table>
          <TableHeader className="bg-[#2a2a2a] sticky top-0">
            <TableRow className="border-[#3d3d3d]">
              <TableHead className="text-gray-300 font-bold">아이템</TableHead>
              <TableHead className="text-center text-gray-300 font-bold">카테고리</TableHead>
              <TableHead className="text-right text-gray-300 font-bold">시장 평균가</TableHead>
              <TableHead className="text-right text-gray-300 font-bold">최근 거래가</TableHead>
              <TableHead className="text-center text-gray-300 font-bold">누적 거래량</TableHead>
              <TableHead className="text-center text-gray-300 font-bold">추세</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {marketStats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-gray-500">
                  거래 완료된 내역이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              marketStats.map((stat) => (
                <TableRow key={stat.name} className="border-[#333] hover:bg-[#2a2a2a]">
                  <TableCell className="font-bold flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#222] rounded border border-[#444] flex items-center justify-center overflow-hidden">
                      {stat.image ? (
                        <img src={stat.image} alt={stat.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="text-[10px] text-gray-500">IMG</div>
                      )}
                    </div>
                    {stat.name}
                  </TableCell>
                  <TableCell className="text-center text-gray-400">{stat.category}</TableCell>
                  <TableCell className="text-right font-bold text-yellow-500">
                    {stat.averagePrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {stat.recentPrice.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">{stat.totalTrades}회</TableCell>
                  <TableCell className="text-center">
                    {stat.trend === 'up' && <span className="text-red-500 flex items-center justify-center gap-1"><TrendingUp className="h-4 w-4" /> 상승</span>}
                    {stat.trend === 'down' && <span className="text-blue-500 flex items-center justify-center gap-1"><TrendingUp className="h-4 w-4 transform rotate-180" /> 하락</span>}
                    {stat.trend === 'stable' && <span className="text-gray-500 text-xs">-</span>}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
