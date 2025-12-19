"use client";

import { Item } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle, Pencil, Trash2, Heart } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import Image from "next/image";

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
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [newTradeMessage, setNewTradeMessage] = useState("");
  const [cancelItemId, setCancelItemId] = useState<number | null>(null);
  // Purchase Request for Wishlist
  const [purchaseRequestItemId, setPurchaseRequestItemId] = useState<number | null>(null);
  const [purchaseRequestMessage, setPurchaseRequestMessage] = useState("");

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
  });

  // My Sales: Items where I am the seller
  const mySales = items.filter(i =>
    (currentUserId && i.seller_user_id === currentUserId) ||
    (currentUserDiscordId && i.seller_discord_id === currentUserDiscordId)
  );

  // My Wishlist: Items I've liked
  const myWishlist = items.filter(i => wishlistIds.includes(i.id));

  return (
    <div className="flex flex-1 gap-4 p-4 bg-[#222] text-white overflow-hidden h-full">
      {/* My Purchase Requests */}
      <div className="flex-1 flex flex-col gap-4 border-r border-[#3d3d3d] pr-4">
        <h2 className="text-lg font-bold text-yellow-500 flex items-center gap-2">
          <Package className="h-5 w-5" /> 내 구매 요청 목록
          <span className="text-sm text-gray-400 font-normal">({myRequests.length})</span>
        </h2>
        <div className="flex-1 overflow-y-auto bg-[#1a1a1a] border border-[#3d3d3d] rounded p-2 text-sm">
          {myRequests.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">구매 요청한 아이템이 없습니다.</div>
          ) : (
            myRequests.map(item => (
              <div key={item.id} className="bg-[#2a2a2a] p-3 mb-2 rounded border border-[#333] flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#1a1a1a] rounded border border-[#444] flex items-center justify-center">
                    {item.image ? (<Image src={item.image} alt={item.name} width={64} height={74} />) : <Package className="text-gray-600 h-5 w-5" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white">
                      {item.name} {item.status === '판매완료' && <span className="text-gray-500 font-normal">(거래완료)</span>}
                    </span>
                    <span className="text-xs text-gray-400">
                      {Number(item.price).toLocaleString()} 메소 | {item.seller}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${item.status === '거래중' ? 'text-blue-500' : item.status === '판매완료' ? 'text-gray-500' : 'text-yellow-500'}`}>
                    {item.status === '판매완료' ? '거래완료' : item.status}
                  </span>
                  {item.status === '거래대기중' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 text-xs"
                      onClick={() => setCancelItemId(item.id)}
                      disabled={(item.cancel_count ?? 0) >= 3}
                    >
                      취소
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* My Sales */}
      <div className="flex-1 flex flex-col gap-4 border-r border-[#3d3d3d] pr-4">
        <h2 className="text-lg font-bold text-green-500 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" /> 내 판매 목록
          <span className="text-sm text-gray-400 font-normal">({mySales.length})</span>
        </h2>
        <div className="flex-1 overflow-y-auto bg-[#1a1a1a] border border-[#3d3d3d] rounded p-2 text-sm">
          {mySales.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">판매 등록한 아이템이 없습니다.</div>
          ) : (
            mySales.map(item => (
              <div key={item.id} className="mb-2">
                <div className="bg-[#2a2a2a] p-3 rounded border border-[#333] flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#1a1a1a] rounded border border-[#444] flex items-center justify-center">
                      {item.image ? (<Image src={item.image} alt={item.name} width={64} height={74} />) : <Package className="text-gray-600 h-5 w-5" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold">{item.name}</span>
                      <span className="text-xs text-gray-400">{Number(item.price).toLocaleString()} 메소</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${item.status === '판매중' ? 'bg-green-900 text-green-200' : 'bg-gray-800 text-gray-400'}`}>
                      {item.status}
                    </span>
                    {item.status === '판매완료' ? (
                      item.buyer && <span className="text-[10px] text-gray-400">구매자: {item.buyer}</span>
                    ) : (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white" onClick={() => handleEditClick(item)}>
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-500" onClick={() => handleDeleteClick(item.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* My Wishlist */}
      <div className="flex-1 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-red-500 flex items-center gap-2">
          <Heart className="h-5 w-5 fill-current" /> 찜 목록
          <span className="text-sm text-gray-400 font-normal">({myWishlist.length})</span>
        </h2>
        <div className="flex-1 overflow-y-auto bg-[#1a1a1a] border border-[#3d3d3d] rounded p-2 text-sm">
          {myWishlist.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">찜한 아이템이 없습니다.</div>
          ) : (
            myWishlist.map(item => (
              <div key={item.id} className={`bg-[#2a2a2a] p-3 mb-2 rounded border border-[#333] flex justify-between items-center ${item.status === '판매완료' ? 'opacity-40 grayscale' : ''}`}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-[#1a1a1a] rounded border border-[#444] flex items-center justify-center">
                    {item.image ? (<Image src={item.image} alt={item.name} width={64} height={74} />) : <Package className="text-gray-600 h-5 w-5" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-white truncate max-w-[120px]">{item.name}</span>
                    <span className="text-xs text-yellow-500">{Number(item.price).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {item.status === '판매중' && onPurchaseRequest && (
                    <Button
                      size="sm"
                      className="bg-[oklch(0.6_0.15_240)] hover:bg-[oklch(0.55_0.15_240)] text-white text-[10px] h-7 px-2"
                      onClick={() => {
                        setPurchaseRequestItemId(item.id);
                        setPurchaseRequestMessage("");
                      }}
                    >
                      요청
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
              <label className="text-sm font-medium text-gray-400">판매 가격 (메소)</label>
              <Input type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="bg-[#333] border-[#444] text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">거래 메시지</label>
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
