"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import { Item } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Info, Package, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [buyerMessage, setBuyerMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    const fetchItem = async () => {
      const { data, error } = await supabase
        .from('market_items')
        .select('*, items_info(*)')
        .eq('id', resolvedParams.id)
        .single();

      if (error) {
        console.error("Error fetching item:", error);
      } else {
        const itemInfo = data.items_info;
        const mappedItem: Item = {
          id: data.id,
          name: itemInfo?.name || "알 수 없는 아이템",
          price: data.price,
          level: itemInfo?.level || 0,
          category: itemInfo?.category || "일반",
          count: data.count,
          timeLeft: data.timeLeft,
          isNew: data.isNew,
          image: itemInfo?.image,
          seller: data.seller,
          status: data.status,
          seller_user_id: data.user_id,
          seller_discord_id: data.seller_discord_id,
          item_id: data.item_id,
          trade_message: data.trade_message,
          buyer_user_id: data.buyer_user_id,
          cancel_count: data.cancel_count ?? 0,
        };
        setItem(mappedItem);
      }
      setLoading(false);
    };

    fetchUser();
    fetchItem();
  }, [resolvedParams.id]);

  const handlePurchaseRequest = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!item) return;

    if (item.seller_user_id === user.id) {
      alert("본인의 아이템은 구매할 수 없습니다.");
      setIsPurchaseDialogOpen(false);
      return;
    }

    const globalName = user.user_metadata?.custom_claims?.global_name;
    const username = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Unknown";
    const buyerNickname = globalName || username;
    const discordHandle = username;

    const { error: updateError } = await supabase
      .from('market_items')
      .update({
        status: '거래대기중',
        buyer: buyerNickname,
        buyer_discord_id: discordHandle,
        buyer_user_id: user.id
      })
      .eq('id', item.id);

    if (updateError) {
      console.error("Error updating item status:", updateError);
      alert("상태 업데이트 실패");
      return;
    }

    const notificationMessage = buyerMessage
      ? `구매 요청: ${buyerNickname}님이 '${item.name}' 구매를 희망합니다.\n"${buyerMessage}"`
      : `구매 요청: ${buyerNickname}님이 '${item.name}' 구매를 희망합니다.`;

    const { error } = await supabase
      .from('notifications')
      .insert({
        item_id: item.id,
        target_user_discord_id: item.seller_discord_id,
        target_user_id: item.seller_user_id,
        sender_user_discord_id: discordHandle,
        message: notificationMessage,
        buyer_message: buyerMessage || null,
        result_code: 'trade_request',
        is_read: false
      });

    if (error) {
      console.error("Error sending notification:", error);
      alert("구매 요청 전송 실패");
      return;
    }

    setItem(prev => prev ? { ...prev, status: '거래대기중', buyer_user_id: user.id } : null);
    setIsPurchaseDialogOpen(false);
    setBuyerMessage("");
    alert("판매자에게 구매 요청을 보냈습니다.");
  };

  const handleCancelPurchaseRequest = async () => {
    if (!item || !user) return;

    if (item.cancel_count !== undefined && item.cancel_count >= 3) {
      alert("구매 요청 취소는 최대 3회까지만 가능합니다.");
      return;
    }

    const { error: updateError } = await supabase
      .from('market_items')
      .update({
        status: '판매중',
        buyer: null,
        buyer_discord_id: null,
        buyer_user_id: null,
        cancel_count: (item.cancel_count ?? 0) + 1
      })
      .eq('id', item.id);

    if (updateError) {
      console.error("Error cancelling purchase request:", updateError);
      alert("취소 처리 중 오류가 발생했습니다.");
      return;
    }

    // 알림 삭제
    const { error: notifError } = await supabase
      .from('notifications')
      .delete()
      .eq('item_id', item.id)
      .eq('result_code', 'trade_request');

    if (notifError) {
      console.error("Error deleting notification:", notifError);
    }

    setItem(prev => prev ? {
      ...prev,
      status: '판매중',
      buyer: null,
      buyer_discord_id: null,
      buyer_user_id: null,
      cancel_count: (prev.cancel_count ?? 0) + 1
    } : null);

    setIsCancelDialogOpen(false);
    alert("구매 요청이 취소되었습니다.");
  };

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

  const isMyItem = user?.id === item.seller_user_id;

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
          {/* Left Column: Image and Main Info */}
          <div className="flex flex-col gap-6">
            <div className="aspect-square bg-[#222] border border-[#444] rounded-lg flex items-center justify-center relative overflow-hidden">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="max-w-full max-h-full object-contain p-4"
                />
              ) : (
                <Package className="h-20 w-20 text-gray-600" />
              )}

              {(item.level ?? 0) > 0 && (
                <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-yellow-500 font-bold border border-yellow-500/30">
                  Lv.{item.level}
                </div>
              )}
            </div>

            {/* Title & Price (Moved below image) */}
            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-gray-400 border-gray-600 w-fit">{item.category}</Badge>
                  {item.status === '판매완료' && <Badge variant="destructive">판매완료</Badge>}
                  {item.status === '거래중' && <Badge className="bg-blue-600 hover:bg-blue-700">거래중</Badge>}
                  {item.status === '거래대기중' && <Badge className="bg-yellow-600">거래대기중</Badge>}
                </div>
                <h1 className="text-3xl font-bold">{item.name}</h1>
              </div>

              <div className="text-3xl font-bold text-yellow-500 flex items-end gap-2 bg-[#222] p-4 rounded-lg border border-[#333]">
                {item.price.toLocaleString()} <span className="text-sm font-normal text-gray-400 mb-1">원</span>
              </div>
            </div>
          </div>

          {/* Right Column: Meta Info & Actions */}
          <div className="flex flex-col gap-6">
            {/* Seller & Time Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#222] p-4 rounded-lg border border-[#333] flex flex-col gap-1">
                <span className="text-xs text-gray-400">판매자</span>
                <span className="font-bold text-lg truncate">{item.seller}</span>
              </div>
              <div className="bg-[#222] p-4 rounded-lg border border-[#333] flex flex-col gap-1">
                <span className="text-xs text-gray-400">남은 시간</span>
                <span className="font-bold text-lg text-yellow-500">{item.timeLeft || "24:00"}</span>
              </div>
            </div>

            {item.trade_message && (
              <div className="bg-[#2a3f4a]/30 p-4 rounded-lg border border-[#2a3f4a] space-y-2">
                <h3 className="text-sm font-bold text-yellow-500 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> 판매자 거래 메시지
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed break-words">
                  {item.trade_message}
                </p>
              </div>
            )}

            <div className="mt-auto space-y-4">
              <div className="flex items-center gap-2 text-gray-400 text-sm bg-[#222]/50 p-3 rounded-lg border border-[#333]/50">
                <Info className="h-4 w-4" />
                <span>
                  {isMyItem ? "본인이 등록한 아이템입니다." : "판매자와 조율 후 거래를 진행해 주세요."}
                </span>
              </div>

              {item.status === '거래대기중' && item.buyer_user_id === user?.id ? (
                <Button
                  onClick={() => {
                    if (!user) {
                      alert("로그인이 필요합니다.");
                      return;
                    }
                    setIsCancelDialogOpen(true);
                  }}
                  disabled={(item.cancel_count ?? 0) >= 3}
                  className="w-full h-14 text-xl font-bold bg-red-600 hover:bg-red-700"
                >
                  요청 취소
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    if (!user) {
                      alert("로그인이 필요합니다.");
                      return;
                    }
                    setIsPurchaseDialogOpen(true);
                  }}
                  disabled={item.status !== '판매중' || isMyItem}
                  className={`w-full h-14 text-xl font-bold ${item.status === '판매중' && !isMyItem
                    ? "bg-[oklch(0.6_0.15_240)] hover:bg-[oklch(0.55_0.15_240)]"
                    : "bg-gray-700 cursor-not-allowed"
                    }`}
                >
                  {isMyItem ? "본인 아이템" : item.status === '판매중' ? "구매 요청" : item.status}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <AlertDialogContent className="bg-[#222] border-[#3d3d3d] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>구매 요청</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {item.name} 아이템에 구매 요청을 보내시겠습니까?
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
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent className="bg-[#222] border-[#3d3d3d] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>구매 요청 취소</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              구매 요청을 취소하시겠습니까? 요청 취소는 최대 3회까지만 가능합니다.
              <br />
              <span className="text-red-400 text-xs mt-2 block">
                (현재 취소 횟수: {item.cancel_count || 0} / 3)
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#333] border-[#444] text-white hover:bg-[#444] hover:text-white">취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelPurchaseRequest}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              요청 취소
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
