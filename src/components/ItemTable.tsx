"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, AlertCircle, Package, MessageSquare, Heart } from "lucide-react";
import { Item } from "@/lib/types";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { Skeleton } from "@/components/ui/skeleton";

interface ItemTableProps {
  items: Item[];
  onPurchaseRequest: (id: number, message?: string) => void;
  isLoading?: boolean;
  currentUserDiscordId?: string;
  currentUserId?: string;
  wishlistIds?: number[];
  onToggleWishlist?: (itemId: number) => void;
}

export function ItemTable({ items, onPurchaseRequest, isLoading = false, currentUserDiscordId, currentUserId, wishlistIds = [], onToggleWishlist }: ItemTableProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [buyerMessage, setBuyerMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const router = useRouter();

  // Reset pagination when items change (e.g., search filter applied)
  useEffect(() => {
    setCurrentPage(1);
    setSelectedId(null);
  }, [items]);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const formatUserWithId = (name: string | null | undefined, id?: string | null) => {
    if (!name) return "-";
    if (!id) return name;
    return (
      <div className="flex flex-col items-center">
        <span>{name}</span>
        <span className="text-[10px] text-gray-500">
          ({id.length > 6 ? id.substring(0, 6) + "..." : id})
        </span>
      </div>
    );
  };

  const currentItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setSelectedId(null); // Clear selection on page change
    }
  };

  const selectedItem = items.find(i => i.id === selectedId);
  const isMyItem = Boolean(
    (currentUserId && selectedItem?.seller_user_id === currentUserId) ||
    (currentUserDiscordId && selectedItem?.seller_discord_id === currentUserDiscordId)
  );

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
      onPurchaseRequest(selectedId, buyerMessage);
      setIsPurchaseDialogOpen(false);
      setSelectedId(null);
      setBuyerMessage("");
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
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400" onClick={() => handlePageChange(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-white text-sm font-bold bg-[#1a1a1a] px-3 py-0.5 rounded border border-[#3d3d3d]">
            {items.length === 0 ? "0 / 0" : `${currentPage} / ${totalPages}`}
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages || totalPages === 0}><ChevronsRight className="h-4 w-4" /></Button>
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
              <TableHead className="text-center text-gray-300 font-bold h-8 w-[100px]">구매자</TableHead>
              <TableHead className="text-center text-gray-300 font-bold h-8 w-[80px]">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton Rows
              Array.from({ length: itemsPerPage }).map((_, i) => (
                <TableRow key={`skeleton-${i}`} className="border-[#333] h-[50px] pointer-events-none">
                  <TableCell className="p-1"><Skeleton className="h-10 w-10 mx-auto rounded" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-3/4" /></TableCell>
                  <TableCell><div className="flex flex-col items-end gap-1"><Skeleton className="h-4 w-20" /><Skeleton className="h-3 w-12" /></div></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12 mx-auto rounded" /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              // No Results State
              <TableRow className="h-[400px] border-[#333] hover:bg-transparent">
                <TableCell colSpan={8} className="text-center text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="h-10 w-10 text-gray-600 mb-2" />
                    <span className="text-lg font-bold">검색 결과가 없습니다.</span>
                    <span className="text-sm">다른 검색어나 카테고리를 선택해 보세요.</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {currentItems.map((item) => {
                  const isSelling = item.status === "판매중";
                  return (
                    <TableRow
                      key={item.id}
                      className={`
                          border-[#333] transition-colors h-[50px]
                          ${!isSelling ? "opacity-50 bg-[#1a1a1a]" : "cursor-pointer hover:bg-[#333]"}
                          ${selectedId === item.id ? "bg-[#2a3f4a] hover:bg-[#2a3f4a] border-l-2 border-l-[oklch(0.6_0.15_240)]" : ""}
                      `}
                      onClick={() => isSelling && setSelectedId(item.id)}
                    >
                      {/* Image Column */}
                      <TableCell className="p-1 text-center relative">
                        <div className="w-10 h-10 bg-[#1a1a1a] border border-[#444] rounded mx-auto flex items-center justify-center relative overflow-hidden group">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-contain rounded-md"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : (
                            <div className="text-xs text-gray-600">IMG</div>
                          )}

                          {/* Fallback Text if image fails to load (hidden by default if image exists) */}
                          {item.image && <div className="hidden absolute inset-0 flex items-center justify-center text-xs text-gray-600 bg-[#1a1a1a]">IMG</div>}

                          {item.isNew && (
                            <span className="absolute top-0 left-0 bg-[#65a30d] text-[8px] text-white px-0.5 leading-none">N</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Name Column */}
                      <TableCell className="text-white font-medium">
                        <div
                          className="flex items-center gap-2 cursor-pointer hover:underline hover:text-yellow-500 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/items/${item.id}`);
                          }}
                        >
                          {item.name}
                          {item.count && item.count > 1 && <span className="text-gray-400 text-xs text-no-underline">({item.count})</span>}
                          {/* Wishlist Toggle Button - Hide for own items */}
                          {item.seller_user_id !== currentUserId && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-6 w-6 p-0 hover:bg-transparent ml-1 ${wishlistIds.includes(item.id) ? "text-red-500" : "text-gray-500 hover:text-red-400"}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleWishlist?.(item.id);
                              }}
                            >
                              <Heart className={`h-4 w-4 ${wishlistIds.includes(item.id) ? "fill-current" : ""}`} />
                            </Button>
                          )}
                          {item.trade_message && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  className="p-1 hover:bg-[#444] rounded text-yellow-500 transition-colors"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MessageSquare className="h-4 w-4" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="bg-[#2a2a2a] border-[#444] text-white p-3 text-sm max-w-[250px] break-words shadow-xl z-[100]">
                                <div className="font-bold text-yellow-500 mb-1 flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3" /> 거래 메시지
                                </div>
                                {item.trade_message}
                              </PopoverContent>
                            </Popover>
                          )}
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
                        {item.seller || item.seller_discord_id ? formatUserWithId(item.seller, item.seller_discord_id) : "-"}
                      </TableCell>

                      {/* Buyer */}
                      <TableCell className="text-center text-gray-300 text-sm">
                        {item.status === "판매완료" && (item.buyer || item.buyer_discord_id) ? formatUserWithId(item.buyer, item.buyer_discord_id) : "-"}
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
                {Array.from({ length: Math.max(0, 10 - currentItems.length) }).map((_, i) => (
                  <TableRow key={`empty-${i}`} className="border-[#333] h-[50px] hover:bg-transparent pointer-events-none">
                    <TableCell colSpan={8} className="p-0"></TableCell>
                  </TableRow>
                ))}
              </>
            )}

          </TableBody>
        </Table>
      </div>

      {/* Detail Footer Panel */}
      <div className="h-[100px] bg-[#222] border-t border-[#3d3d3d] p-4 flex items-center justify-center">
        {isLoading ? (
          <div className="flex items-center gap-4 w-full">
            <Skeleton className="w-16 h-16 rounded" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ) : selectedItem ? (
          <div className="flex items-center gap-4 w-full">
            <div className="w-16 h-16 bg-[#1a1a1a] border border-[#444] flex items-center justify-center">
              {
                selectedItem.image ? (<Image src={selectedItem.image} alt={selectedItem.name} width={64} height={74} />)
                  :
                  <Package className="text-gray-600" />
              }
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg">{selectedItem.name}</span>
              <span className="text-gray-400 text-sm">
                {isMyItem ? "본인의 아이템입니다." : "아이템을 구매하시겠습니까?"}
              </span>
            </div>
            <div className="ml-auto flex gap-2">
              <Button
                className={`text-white ${isMyItem || selectedItem.status !== "판매중" ? "bg-gray-600 cursor-not-allowed" : "bg-[oklch(0.6_0.15_240)] hover:bg-[oklch(0.55_0.15_240)]"}`}
                onClick={() => {
                  if (!currentUserId) {
                    alert("로그인이 필요합니다.");
                    return;
                  }
                  setIsPurchaseDialogOpen(true);
                }}
                disabled={isMyItem || selectedItem.status !== "판매중"}
              >
                {isMyItem ? "판매 중" : selectedItem.status === "판매중" ? "구매하기" : selectedItem.status}
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
              구매 요청을 보내시겠습니까?
            </AlertDialogDescription>
            <textarea
              className="w-full bg-[#333] border border-[#444] text-white p-2 rounded mt-4 h-24 resize-none focus:outline-none focus:border-[oklch(0.6_0.15_240)] placeholder-gray-500"
              placeholder="판매자에게 보낼 메시지를 입력하세요 (선택사항)"
              value={buyerMessage}
              onChange={(e) => setBuyerMessage(e.target.value)}
            />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#333] border-[#444] text-white hover:bg-[#444] hover:text-white" onClick={() => setBuyerMessage("")}>취소</AlertDialogCancel>
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

