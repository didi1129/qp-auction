"use client";

import { Item } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";
import { History, TrendingUp, AlertTriangle, Search, Filter, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  lastSoldAt?: string;
}

export function MarketPriceTab({ items }: MarketPriceTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 1. Filter sold items
  let filteredRawItems = items.filter(item => item.status === "판매완료");

  // 2. Apply search and gender filters
  if (searchTerm) {
    filteredRawItems = filteredRawItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // 3. Group by item name
  const groupedItems = filteredRawItems.reduce((acc, item) => {
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
      history: sortedHistory,
      lastSoldAt: sortedHistory[0].sold_at
    };
  });

  // Pagination Logic
  const totalPages = Math.ceil(marketStats.length / itemsPerPage);
  const currentStats = marketStats.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#222] text-white p-4 gap-4">
      <div className="flex items-center justify-between border-b border-[#3d3d3d] pb-4">
        <h2 className="text-xl font-bold text-yellow-500 flex items-center gap-2">
          <History className="h-6 w-6" /> 시세 조회
        </h2>
        <div className="text-xs text-gray-400 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          <span>큐플옥션에서의 거래 내역에 기반한 시세입니다.</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 bg-[#1a1a1a] p-3 rounded border border-[#3d3d3d]">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="아이템 이름으로 검색..."
            className="pl-9 bg-[#222] border-[#3d3d3d] text-white focus:ring-yellow-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Pagination Controls in Header */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400" onClick={() => handlePageChange(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-white text-sm font-bold bg-[#222] px-3 py-1 rounded border border-[#3d3d3d] min-w-[60px] text-center">
            {marketStats.length === 0 ? "0 / 0" : `${currentPage} / ${totalPages}`}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages || totalPages === 0}><ChevronsRight className="h-4 w-4" /></Button>
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
              <TableHead className="text-center text-gray-300 font-bold">최근 거래일</TableHead>
              <TableHead className="text-center text-gray-300 font-bold">누적 거래량</TableHead>
              <TableHead className="text-center text-gray-300 font-bold">추세</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentStats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-40 text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <History className="h-10 w-10 text-gray-600 mb-2" />
                    <span className="text-lg font-bold">
                      {searchTerm ? "검색 결과가 없습니다." : "거래 완료된 내역이 없습니다."}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentStats.map((stat) => (
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
                  <TableCell className="text-center text-gray-400 text-[10px] leading-tight">
                    {stat.lastSoldAt ? formatRelativeTime(stat.lastSoldAt) : "-"}
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
