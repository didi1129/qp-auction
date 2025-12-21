"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Package, Clock } from "lucide-react";
import { Item } from "@/lib/types";
import { supabase } from "@/lib/supabase";

import { User } from "@supabase/supabase-js";

interface SellTabProps {
  onRegister: (item: Item) => void;
  user: User | null;
}

export function SellTab({ onRegister, user }: SellTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [price, setPrice] = useState("");
  const [tradeMessage, setTradeMessage] = useState("");
  const [tradeChannel, setTradeChannel] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    if (term.length === 0) {
      setSearchResults([]);
      return;
    }

    const { data, error } = await supabase
      .from('items_info')
      .select('*')
      .ilike('name', `%${term}%`)
      .limit(20);

    if (error) {
      console.error(error);
    } else {
      console.log("SellTab search results:", data);
      setSearchResults(data || []);
    }
  };

  const handleRegister = async () => {
    if (!selectedItem || !price || !user) {
      if (!user) alert("로그인이 필요합니다.");
      return;
    }

    const globalName = user.user_metadata?.custom_claims?.global_name;
    const username = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Unknown";

    const sellerName = globalName || username;
    const discordHandle = username;

    const { data, error } = await supabase
      .from('market_items')
      .insert({
        item_id: selectedItem.id,
        seller: sellerName,
        seller_discord_id: discordHandle,
        user_id: user.id,
        price: Number(price),
        count: 1,
        status: "판매중",
        "timeLeft": "24시간 00분",
        "isNew": true,
        trade_message: tradeMessage,
        trade_channel: tradeChannel || null,
        room_number: roomNumber || null
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("판매 등록 중 오류가 발생했습니다.");
      return;
    }

    const newItem: Item = {
      id: data.id,
      name: selectedItem.name,
      category: selectedItem.category,
      price: data.price,
      basicPrice: selectedItem.basicPrice,
      count: data.count,
      timeLeft: data.timeLeft,
      isNew: data.isNew,
      seller: data.seller,
      status: data.status,
      seller_discord_id: data.seller_discord_id,
      seller_user_id: user.id,
      image: selectedItem.image,
      item_id: selectedItem.id,
      trade_message: data.trade_message,
      trade_channel: data.trade_channel,
      room_number: data.room_number,
      item_gender: selectedItem.item_gender
    };

    onRegister(newItem);
    alert('판매 등록에 성공했습니다!');
    setSelectedItem(null);
    setPrice("");
    setTradeMessage("");
    setTradeChannel("");
    setRoomNumber("");
    setSearchTerm("");
    setSearchResults([]);
  };

  return (
    <div className="flex flex-1 gap-4 p-4 bg-[#222] text-white overflow-hidden">
      {/* Search Panel (Left) */}
      <div className="w-[300px] flex flex-col gap-4 border-r border-[#3d3d3d] pr-4">
        <h2 className="text-lg font-bold text-yellow-500">판매할 아이템 선택</h2>

        <div className="relative">
          <Input
            placeholder="아이템 검색..."
            className="bg-[#333] text-white border-[#444] pl-8 focus:ring-offset-0 focus:ring-1 focus:ring-[oklch(0.6_0.15_240)]"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
        </div>

        <div className="flex-1 overflow-y-auto bg-[#1a1a1a] border border-[#3d3d3d] rounded">
          {searchResults.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className={`
                p-3 flex items-center gap-3 cursor-pointer hover:bg-[#333] border-b border-[#2a2a2a]
                ${selectedItem?.id === item.id ? "bg-[#2a3f4a] border-l-4 border-l-[oklch(0.6_0.15_240)]" : ""}
              `}
            >
              <div className="w-8 h-8 bg-[#2a2a2a] rounded flex items-center justify-center border border-[#444] overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                ) : <div className="text-[10px] text-gray-500">IMG</div>}
              </div>
              <div>
                <div className="text-white font-bold flex items-center gap-1">
                  {item.name}
                  {item.item_gender && (
                    <span className="text-gray-400 text-xs font-normal">
                      ({item.item_gender === 'Female' ? '여' : item.item_gender === 'Male' ? '남' : item.item_gender === 'Unisex' ? '공용' : item.item_gender})
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400">{item.category}</div>
              </div>
            </div>
          ))}
          {searchTerm.length > 0 && searchResults.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              검색 결과가 없습니다.
            </div>
          )}
          {searchTerm.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              아이템 이름을 입력하세요.
            </div>
          )}
        </div>
      </div>

      {/* Registration Form (Right) */}
      <div className="flex-1 flex flex-col gap-6 pl-4 max-w-2xl">
        <h2 className="text-lg font-bold text-yellow-500">판매 정보 입력</h2>

        <div className="bg-[#1a1a1a] p-6 rounded border border-[#3d3d3d] flex flex-col gap-6">
          <div className="flex gap-4 items-start">
            <div className="w-24 h-24 bg-[#2a2a2a] border border-[#444] flex items-center justify-center rounded overflow-hidden">
              {selectedItem ? (
                selectedItem.image ? (
                  <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-contain" />
                ) : (
                  <Package className="h-10 w-10 text-white" />
                )
              ) : (
                <span className="text-gray-600 text-xs">선택안함</span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xl font-bold">{selectedItem ? selectedItem.name : "아이템을 선택해주세요"}</span>
              <span className="text-gray-400 text-sm">{selectedItem ? selectedItem.category : "-"}</span>
            </div>
          </div>

          <div className="grid grid-cols-[100px_1fr] gap-4 items-center">
            <label className="text-gray-400 font-bold">판매 가격</label>
            <div className="relative">
              <Input
                type="number"
                className="bg-[#333] text-white border-[#444] text-right pr-8 font-bold focus:ring-offset-0 focus:ring-1 focus:ring-[oklch(0.6_0.15_240)]"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={!selectedItem}
              />
              <span className="absolute right-3 top-2.5 text-gray-400 text-sm">원</span>
            </div>

            {/* <label className="text-gray-400 font-bold">등록 시간</label>
            <div className="flex items-center gap-2 text-white font-bold bg-[#333] px-3 py-2 rounded">
              <Clock className="h-4 w-4 text-gray-400" />
              24시간 00분
            </div> */}

            <label className="text-gray-400 font-bold">거래 채널</label>
            <Input
              className="bg-[#333] text-white border-[#444] focus:ring-offset-0 focus:ring-1 focus:ring-[oklch(0.6_0.15_240)] placeholder-gray-500"
              placeholder="예: 1234 (선택사항)"
              value={tradeChannel}
              onChange={(e) => setTradeChannel(e.target.value)}
              disabled={!selectedItem}
            />

            <label className="text-gray-400 font-bold">방 번호</label>
            <Input
              className="bg-[#333] text-white border-[#444] focus:ring-offset-0 focus:ring-1 focus:ring-[oklch(0.6_0.15_240)] placeholder-gray-500"
              placeholder="예: 123 (선택사항)"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              disabled={!selectedItem}
            />

            <label className="text-gray-400 font-bold">판매 메시지</label>
            <textarea
              className="bg-[#333] text-white border border-[#444] p-3 rounded h-24 resize-none focus:outline-none focus:border-[oklch(0.6_0.15_240)] placeholder-gray-500 text-sm"
              placeholder="예: 연락주세요, 흥정 가능합니다 (100자 이내)"
              value={tradeMessage}
              onChange={(e) => setTradeMessage(e.target.value.slice(0, 100))}
              disabled={!selectedItem}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#3d3d3d]">
            <Button
              className="w-32 bg-[oklch(0.6_0.15_240)] hover:bg-[oklch(0.55_0.15_240)] text-white font-bold"
              disabled={!selectedItem || !price}
              onClick={handleRegister}
            >
              판매 등록
            </Button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-[#2a2a2a] p-4 text-xs text-gray-400 rounded">
          <ul className="list-disc pl-4 space-y-1">
            <li>아이템은 등록 후 24시간 동안 판매됩니다.</li>
            <li>판매 등록한 아이템은 취소할 수 있습니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
