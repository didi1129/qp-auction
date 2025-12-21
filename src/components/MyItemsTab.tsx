"use client";

import { PaginationControls } from "@/components/PaginationControls";



import { Item } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle, Pencil, Trash2, Heart } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface MyItemsTabProps {
  items: Item[];
  onAcceptTrade: (itemId: number) => void;
  currentUserDiscordId?: string;
  currentUserId?: string;
  onDelete?: (itemId: number) => void;
  onUpdate?: (itemId: number, updates: Partial<Item>) => void;
  onCancelPurchaseRequest?: (itemId: number) => void;
  // Wishlist integration
  wishlistIds?: number[];
  onToggleWishlist?: (itemId: number) => void;
  onPurchaseRequest?: (itemId: number, message?: string) => void;
}

export function MyItemsTab({
  items,
  onAcceptTrade,
  currentUserDiscordId,
  currentUserId,
  onDelete,
  onUpdate,
  onCancelPurchaseRequest,
  wishlistIds = [],
  onToggleWishlist,
  onPurchaseRequest
}: MyItemsTabProps) {
  const router = useRouter();
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [newTradeMessage, setNewTradeMessage] = useState("");
  const [cancelItemId, setCancelItemId] = useState<number | null>(null);
  // Purchase Request for Wishlist
  const [purchaseRequestItemId, setPurchaseRequestItemId] = useState<number | null>(null);
  const [purchaseRequestMessage, setPurchaseRequestMessage] = useState("");

  // Pagination State
  const [requestsPage, setRequestsPage] = useState(1);
  const [salesPage, setSalesPage] = useState(1);
  const [wishlistPage, setWishlistPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const handleUserClick = (userId: string) => {
    if (userId) {
      router.push(`/users/${userId}`);
    }
  };

  const handleEditClick = (item: Item) => {
    setEditingItem(item);
    setNewPrice(item.price.toString());
    setNewTradeMessage(item.trade_message || "");
  };

  const handleDeleteClick = (itemId: number) => {
    setDeleteItemId(itemId);
  };

  const handleUpdateConfirm = () => {
    if (editingItem && onUpdate) {
      onUpdate(editingItem.id, {
        price: Number(newPrice),
        trade_message: newTradeMessage
      });
      setEditingItem(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteItemId && onDelete) {
      onDelete(deleteItemId);
      setDeleteItemId(null);
    }
  };

  // Filter items where I am the buyer (requested)
  const myRequests = items.filter(i => {
    const isMySale = (currentUserId && i.seller_user_id === currentUserId) || (currentUserDiscordId && i.seller_discord_id === currentUserDiscordId);
    if (isMySale) return false;

    return i.status === "거래대기중" || i.status === "거래중" ||
      (i.status === "판매완료" && (i.buyer_user_id === currentUserId || i.buyer_discord_id === currentUserDiscordId));
  }).sort((a, b) => {
    if (a.status === '판매완료' && b.status !== '판매완료') return 1;
    if (a.status !== '판매완료' && b.status === '판매완료') return -1;
    return b.id - a.id; // Sort by newest first within same status group
  });

  // My Sales: Items where I am the seller
  const mySales = items.filter(i =>
    (currentUserId && i.seller_user_id === currentUserId) ||
    (currentUserDiscordId && i.seller_discord_id === currentUserDiscordId)
  ).sort((a, b) => {
    if (a.status === '판매완료' && b.status !== '판매완료') return 1;
    if (a.status !== '판매완료' && b.status === '판매완료') return -1;
    if (a.status !== '판매완료' && b.status === '판매완료') return -1;
    return b.id - a.id;
  });

  // My Wishlist: Items I've liked
  const myWishlist = items.filter(i => wishlistIds.includes(i.id));

  // Pagination Logic
  const totalRequestsPages = Math.ceil(myRequests.length / ITEMS_PER_PAGE);
  const currentRequests = myRequests.slice((requestsPage - 1) * ITEMS_PER_PAGE, requestsPage * ITEMS_PER_PAGE);

  const totalSalesPages = Math.ceil(mySales.length / ITEMS_PER_PAGE);
  const currentSales = mySales.slice((salesPage - 1) * ITEMS_PER_PAGE, salesPage * ITEMS_PER_PAGE);

  const totalWishlistPages = Math.ceil(myWishlist.length / ITEMS_PER_PAGE);
  const currentWishlist = myWishlist.slice((wishlistPage - 1) * ITEMS_PER_PAGE, wishlistPage * ITEMS_PER_PAGE);

  return (
    <div className="flex flex-1 gap-4 p-4 bg-[#222] text-white overflow-hidden min-h-0">
      {/* My Purchase Requests */}
      <div className="flex-1 flex flex-col gap-4 border-r border-[#3d3d3d] pr-4 min-h-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-yellow-500 flex items-center gap-2">
            <Package className="h-5 w-5" /> 내 구매 요청 목록
            <span className="text-sm text-gray-400 font-normal">({myRequests.length})</span>
          </h2>
          <PaginationControls
            currentPage={requestsPage}
            totalPages={totalRequestsPages}
            onPageChange={setRequestsPage}
          />
        </div>
        <div className="flex-1 overflow-y-auto bg-[#1a1a1a] border border-[#3d3d3d] rounded p-2 text-sm min-h-0">
          {myRequests.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">구매 요청한 아이템이 없습니다.</div>
          ) : (
            currentRequests.map(item => (
              <div key={item.id} className={`bg-[#2a2a2a] p-3 mb-2 rounded border border-[#333] flex flex-col gap-2 ${item.status === '판매완료' ? 'opacity-50 grayscale' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#1a1a1a] rounded border border-[#444] flex items-center justify-center shrink-0">
                      {item.image ? (<Image src={item.image} alt={item.name} width={64} height={74} />) : <Package className="text-gray-600 h-6 w-6" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-white truncate text-sm">{item.name}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${item.status === '판매중' ? 'bg-green-950 text-green-400 border-green-900' :
                          item.status === '판매완료' ? 'bg-gray-800 text-gray-500 border-gray-700' :
                            'bg-yellow-950 text-yellow-400 border-yellow-900'
                          }`}>
                          {item.status === '판매완료' ? '거래완료' : item.status}
                        </span>
                        <span className="text-yellow-500 font-bold text-xs">{Number(item.price).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {item.status === '거래대기중' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 text-[10px] font-bold"
                        onClick={() => setCancelItemId(item.id)}
                        disabled={(item.cancel_count ?? 0) >= 3}
                      >
                        취소
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 px-1 py-1 bg-[#1a1a1a]/50 rounded text-[11px]">
                  <div className="flex gap-1 items-center text-gray-400">
                    <span>판매자: <span
                      className={`text-gray-300 ${item.seller_user_id ? "cursor-pointer hover:underline hover:text-white" : ""}`}
                      onClick={() => item.seller_user_id && handleUserClick(item.seller_user_id)}
                    >{item.seller}</span></span>
                    {item.seller_discord_id && <span className="bg-[#333] px-1 rounded text-[9px]">{item.seller_discord_id}</span>}
                  </div>
                  {item.trade_message && (
                    <div className="text-blue-400 leading-tight italic line-clamp-1">
                      "{item.trade_message}"
                    </div>
                  )}
                  {item.status === '판매완료' && item.sold_at && (
                    <div className="text-right text-[9px] text-gray-500 mt-1">
                      {formatRelativeTime(item.sold_at)} 거래됨
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* My Sales */}
      <div className="flex-1 flex flex-col gap-4 border-r border-[#3d3d3d] pr-4 min-h-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-green-500 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" /> 내 판매 목록
            <span className="text-sm text-gray-400 font-normal">({mySales.length})</span>
          </h2>
          <PaginationControls
            currentPage={salesPage}
            totalPages={totalSalesPages}
            onPageChange={setSalesPage}
          />
        </div>
        <div className="flex-1 overflow-y-auto bg-[#1a1a1a] border border-[#3d3d3d] rounded p-2 text-sm">
          {mySales.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">판매 등록한 아이템이 없습니다.</div>
          ) : (
            currentSales.map(item => (
              <div key={item.id} className={`bg-[#2a2a2a] p-3 mb-2 rounded border border-[#333] flex flex-col gap-2 ${item.status === '판매완료' ? 'opacity-50 grayscale' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#1a1a1a] rounded border border-[#444] flex items-center justify-center shrink-0">
                      {item.image ? (<Image src={item.image} alt={item.name} width={64} height={74} />) : <Package className="text-gray-600 h-6 w-6" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-white truncate text-sm">{item.name}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${item.status === '판매중' ? 'bg-green-950 text-green-400 border-green-900' :
                          item.status === '판매완료' ? 'bg-gray-800 text-gray-500 border-gray-700' :
                            'bg-yellow-950 text-yellow-400 border-yellow-900'
                          }`}>
                          {item.status}
                        </span>
                        <span className="text-yellow-500 font-bold text-xs">{Number(item.price).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {item.status === '판매완료' ? (
                      <span className="text-[10px] text-gray-500 font-bold self-center px-2">완료</span>
                    ) : (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={() => handleEditClick(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-red-500" onClick={() => handleDeleteClick(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 px-1 py-1 bg-[#1a1a1a]/50 rounded text-[11px]">
                  {item.trade_message && (
                    <div className="text-blue-400 leading-tight italic line-clamp-1">
                      "{item.trade_message}"
                    </div>
                  )}
                  <div className="flex gap-1 items-center text-gray-400">
                    <span>
                      {item.status === '판매완료' ? '구매자: ' : '구매요청자: '}
                      <span
                        className={`text-gray-300 ${item.buyer_user_id ? "cursor-pointer hover:underline hover:text-white" : ""}`}
                        onClick={() => item.buyer_user_id && handleUserClick(item.buyer_user_id)}
                      >{item.buyer || (item.status === '판매중' ? '-' : '요청 없음')}</span>
                    </span>
                    {item.buyer_discord_id && <span className="bg-[#333] px-1 rounded text-[9px]">{item.buyer_discord_id}</span>}
                  </div>
                  {item.status === '판매완료' && item.sold_at && (
                    <div className="text-right text-[9px] text-gray-500 mt-1">
                      {formatRelativeTime(item.sold_at)} 거래됨
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* My Wishlist */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-red-500 flex items-center gap-2">
            <Heart className="h-5 w-5 fill-current" /> 찜 목록
            <span className="text-sm text-gray-400 font-normal">({myWishlist.length})</span>
          </h2>
          <PaginationControls
            currentPage={wishlistPage}
            totalPages={totalWishlistPages}
            onPageChange={setWishlistPage}
          />
        </div>
        <div className="flex-1 overflow-y-auto bg-[#1a1a1a] border border-[#3d3d3d] rounded p-2 text-sm min-h-0">
          {myWishlist.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">찜한 아이템이 없습니다.</div>
          ) : (
            currentWishlist.map(item => (
              <div key={item.id} className={`bg-[#2a2a2a] p-3 mb-2 rounded border border-[#333] flex flex-col gap-2 ${item.status === '판매완료' ? 'opacity-50 grayscale' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#1a1a1a] rounded border border-[#444] flex items-center justify-center shrink-0">
                      {item.image ? (<Image src={item.image} alt={item.name} width={64} height={74} />) : <Package className="text-gray-600 h-6 w-6" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-white truncate text-sm">{item.name}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold border ${item.status === '판매중' ? 'bg-green-950 text-green-400 border-green-900' :
                          item.status === '판매완료' ? 'bg-gray-800 text-gray-500 border-gray-700' :
                            'bg-yellow-950 text-yellow-400 border-yellow-900'
                          }`}>
                          {item.status}
                        </span>
                        <span className="text-yellow-500 font-bold text-xs">{Number(item.price).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {onPurchaseRequest && (
                      <Button
                        size="sm"
                        disabled={item.status !== '판매중'}
                        className={`${item.status === '판매중' ? 'bg-[oklch(0.6_0.15_240)] hover:bg-[oklch(0.55_0.15_240)]' : 'bg-gray-700'} text-white text-[10px] h-7 px-2`}
                        onClick={() => {
                          setPurchaseRequestItemId(item.id);
                          setPurchaseRequestMessage("");
                        }}
                      >
                        {item.status === '판매중' ? '요청' : '진행중'}
                      </Button>
                    )}
                    {onToggleWishlist && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-gray-500 hover:text-red-500"
                        onClick={() => onToggleWishlist(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 px-1 py-1 bg-[#1a1a1a]/50 rounded text-[11px]">
                  <div className="flex gap-1 items-center text-gray-400">
                    <span>판매자: <span
                      className={`text-gray-300 ${item.seller_user_id ? "cursor-pointer hover:underline hover:text-white" : ""}`}
                      onClick={() => item.seller_user_id && handleUserClick(item.seller_user_id)}
                    >{item.seller}</span></span>
                    {item.seller_discord_id && <span className="bg-[#333] px-1 rounded text-[9px]">{item.seller_discord_id}</span>}
                  </div>
                  {item.trade_message && (
                    <div className="text-blue-400 leading-tight italic line-clamp-2">
                      "{item.trade_message}"
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="bg-[#222] border-[#3d3d3d] text-white">
          <DialogHeader><DialogTitle>판매 정보 수정</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">판매 가격 (사이버머니)</label>
              <Input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="bg-[#333] border-[#444] text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">판매 메시지</label>
              <textarea
                className="w-full bg-[#333] border border-[#444] text-white p-3 rounded h-24 resize-none focus:outline-none text-sm"
                value={newTradeMessage}
                onChange={(e) => setNewTradeMessage(e.target.value.slice(0, 100))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingItem(null)}>취소</Button>
            <Button onClick={handleUpdateConfirm} className="bg-[oklch(0.6_0.15_240)] text-white">수정 완료</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteItemId} onOpenChange={(open) => !open && setDeleteItemId(null)}>
        <AlertDialogContent className="bg-[#222] border-[#3d3d3d] text-white">
          <AlertDialogHeader><AlertDialogTitle>판매 취소</AlertDialogTitle><AlertDialogDescription>정말로 판매를 취소하시겠습니까?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#333] border-[#444] text-white">취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 text-white">판매 취소</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!cancelItemId} onOpenChange={(open) => !open && setCancelItemId(null)}>
        <AlertDialogContent className="bg-[#222] border-[#3d3d3d] text-white">
          <AlertDialogHeader><AlertDialogTitle>구매 요청 취소</AlertDialogTitle><AlertDialogDescription>구매 요청을 취소하시겠습니까?</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#333] border-[#444] text-white">취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (cancelItemId && onCancelPurchaseRequest) { onCancelPurchaseRequest(cancelItemId); setCancelItemId(null); } }}
              className="bg-red-600 text-white"
            >
              요청 취소
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!purchaseRequestItemId} onOpenChange={(open) => !open && setPurchaseRequestItemId(null)}>
        <AlertDialogContent className="bg-[#222] border-[#3d3d3d] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>구매 요청</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {items.find(i => i.id === purchaseRequestItemId)?.name} 아이템에 구매 요청을 보내시겠습니까?
            </AlertDialogDescription>
            <textarea
              className="w-full bg-[#333] border border-[#444] text-white p-2 rounded mt-4 h-24 resize-none focus:outline-none focus:border-[oklch(0.6_0.15_240)] placeholder-gray-500 text-sm"
              placeholder="판매자에게 보낼 메시지를 입력하세요 (선택사항)"
              value={purchaseRequestMessage}
              onChange={(e) => setPurchaseRequestMessage(e.target.value)}
            />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#333] border-[#444] text-white hover:bg-[#444] hover:text-white" onClick={() => setPurchaseRequestMessage("")}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (purchaseRequestItemId && onPurchaseRequest) {
                  onPurchaseRequest(purchaseRequestItemId, purchaseRequestMessage);
                  setPurchaseRequestItemId(null);
                  setPurchaseRequestMessage("");
                }
              }}
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
