"use client";

import { useState } from "react";
import { PaginationControls } from "@/components/PaginationControls";

import { Item } from "@/lib/types";
import { Heart, Trash2, AlertCircle, ShoppingCart, Clock, User, MessageSquare } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface WishlistTabProps {
  items: Item[];
  wishlistIds: number[];
  onToggleWishlist: (itemId: number) => void;
  onPurchaseRequest: (itemId: number) => void;
}

export function WishlistTab({ items, wishlistIds, onToggleWishlist, onPurchaseRequest }: WishlistTabProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const wishlistedItems = items.filter(item => wishlistIds.includes(item.id));
  const totalPages = Math.ceil(wishlistedItems.length / ITEMS_PER_PAGE);
  const currentWishlist = wishlistedItems.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);


  return (
    <div className="flex flex-col flex-1 bg-[#222] text-white p-4 gap-4 overflow-hidden min-h-0">
      <div className="flex items-center justify-between border-b border-[#3d3d3d] pb-4">
        <div>
          <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
            <Heart className="h-6 w-6 fill-current" /> 찜 목록
            <span className="text-sm text-gray-500 font-normal">({wishlistedItems.length})</span>
          </h2>
          <div className="text-sm text-gray-400 mt-1">
            관심 있는 매물을 모아볼 수 있습니다. (최대 24시간 유지)
          </div>
        </div>
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <div className="flex-1 overflow-auto bg-[#1a1a1a] rounded border border-[#3d3d3d] min-h-0">
        <Table>
          <TableHeader className="bg-[#2a2a2a] sticky top-0">
            <TableRow className="border-[#3d3d3d]">
              <TableHead className="text-gray-300 font-bold">아이템</TableHead>
              <TableHead className="text-center text-gray-300 font-bold">판매자</TableHead>
              <TableHead className="text-right text-gray-300 font-bold">가격</TableHead>
              <TableHead className="text-center text-gray-300 font-bold">남은 시간</TableHead>
              <TableHead className="text-center text-gray-300 font-bold">상태</TableHead>
              <TableHead className="text-center text-gray-300 font-bold">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wishlistedItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-gray-500">
                  찜한 아이템이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              currentWishlist.map((item) => {
                const isSold = item.status === "판매완료";
                const isExpired = item.timeLeft === "만료됨" || item.timeLeft === "0분";
                const isDisabled = isSold || isExpired;

                return (
                  <TableRow key={item.id} className={`border-[#333] hover:bg-[#2a2a2a] ${isDisabled ? "opacity-40 grayscale" : ""}`}>
                    <TableCell className="font-bold">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#222] rounded border border-[#444] flex items-center justify-center relative">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                          ) : (
                            <ShoppingCart className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span>{item.name}</span>
                            {item.trade_message && (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <button
                                    className="p-1 hover:bg-[#333] rounded text-yellow-500 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MessageSquare className="h-3 w-3" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="bg-[#2a2a2a] border-[#444] text-white p-3 text-sm max-w-[250px] break-words shadow-xl z-[100]">
                                  <div className="font-bold text-yellow-500 mb-1 flex items-center gap-1 text-xs">
                                    <MessageSquare className="h-3 w-3" /> 판매 메시지
                                  </div>
                                  <div className="text-xs">{item.trade_message}</div>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                          {isDisabled && (
                            <span className="text-[10px] text-red-400 flex items-center gap-1">
                              <AlertCircle className="h-2.5 w-2.5" />
                              {isSold ? "판매가 완료된 아이템입니다." : "기간이 만료된 아이템입니다."}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-gray-400">
                      <div className="flex items-center justify-center gap-1">
                        <User className="h-3 w-3" />
                        {item.seller}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-yellow-500">
                      {item.price.toLocaleString()} 원
                    </TableCell>
                    <TableCell className="text-center text-gray-400 text-xs">
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.timeLeft}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={isDisabled ? "secondary" : "default"}
                        className={!isDisabled ? (item.status === '판매중' ? "bg-green-600" : "bg-blue-600") : "bg-gray-700"}
                      >
                        {isDisabled ? (isSold ? "판매완료" : "만료") : item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        {!isDisabled && (
                          <Button
                            size="sm"
                            className="bg-[oklch(0.6_0.15_240)] hover:bg-[oklch(0.55_0.15_240)] text-white text-xs"
                            onClick={() => onPurchaseRequest(item.id)}
                          >
                            구매요청
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-500/10"
                          onClick={() => onToggleWishlist(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
