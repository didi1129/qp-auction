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

  // Adjust pagination when items change
  const totalPages = Math.ceil(items.length / itemsPerPage);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [items, totalPages, currentPage]);
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
          <span className="font-bold text-white border-l-4 border-[oklch(0.6_0.15_240)] pl-2 text-sm md:text-base">검색결과</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hidden sm:flex" onClick={() => handlePageChange(1)} disabled={currentPage === 1}><ChevronsLeft className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-white text-[11px] md:text-sm font-bold bg-[#1a1a1a] px-2 md:px-3 py-0.5 rounded border border-[#3d3d3d]">
            {items.length === 0 ? "0 / 0" : `${currentPage} / ${totalPages}`}
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hidden sm:flex" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages || totalPages === 0}><ChevronsRight className="h-4 w-4" /></Button>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[oklch(0.6_0.15_240)]"></div>
          <span className="text-xs text-gray-400">선택됨</span>
        </div>
      </div>

      {/* Table Area - Desktop */}
      <div className="flex-1 overflow-auto hidden md:block">
        <Table>
          <TableHeader className="bg-[#1a1a1a] sticky top-0 z-10">
            <TableRow className="border-[#3d3d3d] hover:bg-[#1a1a1a]">
              <TableHead className="text-center text-gray-300 font-bold h-8 w-[50px]"></TableHead>
              <TableHead className="text-gray-300 font-bold h-8 w-[250px] text-left">아이템 이름</TableHead>
              <TableHead className="text-center text-gray-300 font-bold h-8 w-[150px]">가격</TableHead>
              <TableHead className="text-center text-gray-300 font-bold h-8 w-[100px]">거래채널</TableHead>
              <TableHead className="text-center text-gray-300 font-bold h-8 w-[100px]">방번호</TableHead>
              <TableHead className="text-center text-gray-300 font-bold h-8 w-[120px]">남은시간</TableHead>
              <TableHead className="text-center text-gray-300 font-bold h-8 w-[100px]">판매자</TableHead>
              <TableHead className="text-center text-gray-300 font-bold h-8 w-[100px]">구매자</TableHead>
              <TableHead className="text-center text-gray-300 font-bold h-8 w-[80px]">상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: itemsPerPage }).map((_, i) => (
                <TableRow key={`skeleton-desktop-${i}`} className="border-[#333] h-[50px] pointer-events-none">
                  <TableCell className="p-1 w-[50px]"><Skeleton className="h-10 w-5 mx-auto rounded" /></TableCell>
                  <TableCell className="w-[250px]"><Skeleton className="h-4 w-3/4" /></TableCell>
                  <TableCell><div className="flex flex-col items-center gap-1"><Skeleton className="h-4 w-20" /><Skeleton className="h-3 w-12" /></div></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-12 mx-auto rounded" /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow className="h-[400px] border-[#333] hover:bg-transparent">
                <TableCell colSpan={9} className="text-center text-gray-500">
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
                      <TableCell className="p-1 w-[50px] text-center relative">
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
                          {item.image && <div className="hidden absolute inset-0 flex items-center justify-center text-xs text-gray-600 bg-[#1a1a1a]">IMG</div>}
                          {item.isNew && (
                            <span className="absolute top-0 left-0 bg-[#65a30d] text-[8px] text-white px-0.5 leading-none">N</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-white font-medium max-w-[250px] pl-0">
                        <div
                          className="flex items-center gap-2 cursor-pointer hover:underline hover:text-yellow-500 transition-colors w-fit"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/items/${item.id}`);
                          }}
                        >
                          {item.name}
                          {item.item_gender && (
                            <span className="text-gray-400 text-sm font-normal ml-1">
                              ({(() => {
                                const g = item.item_gender?.toLowerCase();
                                if (g === 'female') return '여';
                                if (g === 'male') return '남';
                                if (g === 'unisex') return '공용';
                                return item.item_gender;
                              })()})
                            </span>
                          )}
                          {item.count && item.count > 1 && <span className="text-gray-400 text-xs text-no-underline ml-1">({item.count})</span>}
                          {item.seller_user_id !== currentUserId && item.status !== "판매완료" && (
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
                                  <MessageSquare className="h-3 w-3" /> 판매 메시지
                                </div>
                                {item.trade_message}
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-white font-bold">{formatNumber(item.price)}</span>
                          <span className="text-gray-500 text-xs">{formatKoreanPrice(item.price)}</span>
                        </div>
                      </TableCell>

                      <TableCell className="text-center text-gray-300 text-sm">
                        {item.trade_channel || "-"}
                      </TableCell>

                      <TableCell className="text-center text-gray-300 text-sm">
                        {item.room_number || "-"}
                      </TableCell>

                      <TableCell className="text-center text-white text-sm">
                        {item.timeLeft}
                      </TableCell>

                      <TableCell
                        className="text-center text-gray-300 text-sm cursor-pointer hover:text-yellow-500 hover:underline transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.seller_user_id) {
                            router.push(`/users/${item.seller_user_id}`);
                          }
                        }}
                      >
                        {item.seller || item.seller_discord_id ? formatUserWithId(item.seller, item.seller_discord_id) : "-"}
                      </TableCell>

                      <TableCell className="text-center text-gray-300 text-sm">
                        {item.status === "판매완료" && (item.buyer || item.buyer_discord_id) ? formatUserWithId(item.buyer, item.buyer_discord_id) : "-"}
                      </TableCell>

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
                {Array.from({ length: Math.max(0, 10 - currentItems.length) }).map((_, i) => (
                  <TableRow key={`empty-${i}`} className="border-[#333] h-[50px] hover:bg-transparent pointer-events-none">
                    <TableCell colSpan={9} className="p-0"></TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Card UI Area - Mobile */}
      <div className="flex-1 overflow-auto md:hidden p-2 space-y-2">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={`skeleton-mobile-${i}`} className="bg-[#2a2a2a] border border-[#3d3d3d] rounded-lg p-3 space-y-3">
              <div className="flex gap-3">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[200px] text-gray-500 gap-2">
            <AlertCircle className="h-8 w-8 text-gray-600" />
            <span className="font-bold">검색 결과가 없습니다.</span>
          </div>
        ) : (
          currentItems.map((item) => {
            const isSelling = item.status === "판매중";
            return (
              <div
                key={item.id}
                onClick={() => isSelling && setSelectedId(item.id)}
                className={`
                  bg-[#2a2a2a] border rounded-lg p-3 transition-colors active:bg-[#333]
                  ${selectedId === item.id ? "border-[oklch(0.6_0.15_240)] bg-[#2a3f4a]" : "border-[#3d3d3d]"}
                  ${!isSelling ? "opacity-60" : ""}
                `}
              >
                <div className="flex gap-3 items-start mb-2">
                  <div className="w-12 h-12 bg-[#1a1a1a] border border-[#444] rounded flex items-center justify-center shrink-0 overflow-hidden relative">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                    ) : (
                      <Package className="h-6 w-6 text-gray-600" />
                    )}
                    {item.isNew && <span className="absolute top-0 left-0 bg-[#65a30d] text-[8px] text-white px-0.5">N</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-white font-bold truncate text-sm">{item.name}</span>
                      <span className={`
                        shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold
                         ${item.status === "판매중" ? "bg-green-900/30 text-green-500 border border-green-900/50" : ""}
                        ${item.status === "거래대기중" ? "bg-yellow-900/30 text-yellow-500 border border-yellow-900/50" : ""}
                        ${item.status === "거래중" ? "bg-blue-900/30 text-blue-500 border border-blue-900/50" : ""}
                        ${item.status === "판매완료" ? "bg-red-900/30 text-red-500 border border-red-900/50" : ""}
                      `}>
                        {item.status}
                      </span>
                    </div>
                    <div className="text-yellow-500 font-bold text-sm mt-0.5">
                      {formatNumber(item.price)} <span className="text-gray-500 text-[10px] font-normal">{formatKoreanPrice(item.price)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-2 text-[11px] border-t border-[#3d3d3d] pt-2 mt-2">
                  <div className="flex flex-col">
                    <span className="text-gray-500">거래 위치</span>
                    <span className="text-gray-300">{item.trade_channel || "-"} {item.room_number ? `/ ${item.room_number}번` : ""}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-gray-500">남은 시간</span>
                    <span className="text-white">{item.timeLeft}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500">판매자</span>
                    <span className="text-gray-300 truncate">{item.seller || "-"}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-gray-500">구매자</span>
                    <span className="text-gray-300 truncate">{item.buyer || "-"}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#3d3d3d]">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[11px] text-gray-400 p-0"
                    onClick={(e) => { e.stopPropagation(); router.push(`/items/${item.id}`); }}
                  >
                    상세보기
                  </Button>
                  <div className="flex gap-2">
                    {item.trade_message && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-yellow-500" onClick={(e) => e.stopPropagation()}>
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="bg-[#2a2a2a] border-[#444] text-white p-3 text-xs w-[200px] shadow-xl z-[100]">
                          <div className="font-bold text-yellow-500 mb-1">판매 메시지</div>
                          {item.trade_message}
                        </PopoverContent>
                      </Popover>
                    )}
                    {item.seller_user_id !== currentUserId && item.status !== "판매완료" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 ${wishlistIds.includes(item.id) ? "text-red-500" : "text-gray-400"}`}
                        onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(item.id); }}
                      >
                        <Heart className={`h-4 w-4 ${wishlistIds.includes(item.id) ? "fill-current" : ""}`} />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Footer Panel */}
      <div className="min-h-[80px] md:h-[100px] bg-[#222] border-t border-[#3d3d3d] p-3 md:p-4 flex items-center justify-center">
        {isLoading ? (
          <div className="flex items-center gap-4 w-full">
            <Skeleton className="w-12 h-12 md:w-16 md:h-16 rounded" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-32 md:h-5 md:w-40" />
              <Skeleton className="h-3 w-20 md:h-4 md:w-24" />
            </div>
          </div>
        ) : selectedItem ? (
          <div className="flex items-center gap-3 md:gap-4 w-full max-w-4xl">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-[#1a1a1a] border border-[#444] flex items-center justify-center shrink-0">
              {
                selectedItem.image ? (<Image src={selectedItem.image} alt={selectedItem.name} width={64} height={74} className="w-full h-full object-contain" />)
                  :
                  <Package className="text-gray-600 h-6 w-6" />
              }
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-white font-bold text-sm md:text-lg truncate">{selectedItem.name}</span>
              <span className="text-gray-400 text-[10px] md:text-sm truncate">
                {isMyItem ? "본인의 아이템입니다." : "아이템을 구매하시겠습니까?"}
              </span>
            </div>
            <div className="shrink-0">
              <Button
                className={`text-white text-xs md:text-sm h-8 md:h-10 px-3 md:px-6 ${isMyItem || selectedItem.status !== "판매중" ? "bg-gray-600 cursor-not-allowed" : "bg-[oklch(0.6_0.15_240)] hover:bg-[oklch(0.55_0.15_240)]"}`}
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
            <AlertCircle className="h-4 w-4 md:h-5 md:w-5" />
            <div className="flex flex-col">
              <span className="font-bold text-white text-xs md:text-base">선택된 아이템이 없습니다.</span>
              <span className="text-[10px] md:text-sm">목록에서 아이템을 선택해 주세요.</span>
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

