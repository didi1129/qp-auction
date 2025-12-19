"use client";

import { Item } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle, Pencil, Trash2 } from "lucide-react";
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
}

export function MyItemsTab({ items, onAcceptTrade, currentUserDiscordId, currentUserId, onDelete, onUpdate }: MyItemsTabProps) {
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<number | null>(null);
  const [newPrice, setNewPrice] = useState("");
  const [newTradeMessage, setNewTradeMessage] = useState("");

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
  // For now, sticking to status check. In future, we should track requester ID.
  const myRequests = items.filter(i => i.status === "거래대기중" || i.status === "거래중" || (i.status === "판매완료" && i.buyer_discord_id === currentUserDiscordId));

  // My Sales: Items where I am the seller
  // Check UUID first, then fallback to Discord Handle
  const mySales = items.filter(i =>
    (currentUserId && i.seller_user_id === currentUserId) ||
    (currentUserDiscordId && i.seller_discord_id === currentUserDiscordId)
  );

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
                    {
                      item.image ? (<Image src={item.image} alt={item.name} width={64} height={74} />)
                        :
                        <Package className="text-gray-600 h-5 w-5" />
                    }
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
              <div key={item.id}>
                <div className="bg-[#2a2a2a] p-3 mb-2 rounded border border-[#333] flex justify-between items-center relative z-0">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-[#1a1a1a] rounded border border-[#444] flex items-center justify-center">
                      {
                        item.image ? (<Image src={item.image} alt={item.name} width={64} height={74} />)
                          :
                          <Package className="text-gray-600 h-5 w-5" />
                      }
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold">{item.name}</span>
                      <span className="text-xs text-gray-400">{Number(item.price).toLocaleString()} 메소</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs bg-[#333] px-2 py-1 rounded">{item.status}</span>
                    {item.status === '판매완료' ? (
                      item.buyer && <span className="text-xs text-gray-400">구매자: {item.buyer}</span>
                    ) : (
                      <div className="flex gap-1 mt-1">
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
                {item.trade_message && (
                  <div className="bg-[#1a1a1a] p-2 mt-[-8px] mb-2 rounded-b border-x border-b border-[#333] text-xs text-yellow-500/80 italic flex items-start gap-2">
                    <span className="shrink-0 font-bold">[거래 메시지]</span>
                    <span className="break-words line-clamp-2">{item.trade_message}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="bg-[#222] border-[#3d3d3d] text-white">
          <DialogHeader>
            <DialogTitle>판매 정보 수정</DialogTitle>
            <DialogDescription>
              수정할 가격을 입력해주세요.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">판매 가격 (메소)</label>
              <Input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                className="bg-[#333] border-[#444] text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">거래 메시지</label>
              <textarea
                className="w-full bg-[#333] border border-[#444] text-white p-3 rounded h-24 resize-none focus:outline-none focus:border-[oklch(0.6_0.15_240)] placeholder-gray-500 text-sm"
                placeholder="거래 시 참고할 메시지"
                value={newTradeMessage}
                onChange={(e) => setNewTradeMessage(e.target.value.slice(0, 100))}
              />
              <p className="text-[10px] text-gray-500 text-right">{newTradeMessage.length}/100</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingItem(null)}>취소</Button>
            <Button onClick={handleUpdateConfirm} className="bg-[oklch(0.6_0.15_240)] text-white hover:bg-[oklch(0.55_0.15_240)]">수정 완료</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!deleteItemId} onOpenChange={(open) => !open && setDeleteItemId(null)}>
        <AlertDialogContent className="bg-[#222] border-[#3d3d3d] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>판매 취소</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              정말로 판매를 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#333] border-[#444] text-white hover:bg-[#444]">취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 text-white hover:bg-red-700">판매 취소</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div >
  );
}
