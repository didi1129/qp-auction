"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ItemTable } from "@/components/ItemTable";
import { SellTab } from "@/components/SellTab";
import { MyItemsTab } from "@/components/MyItemsTab";
import { MOCK_ITEMS } from "@/lib/constants";
import { Item, Notification } from "@/lib/types";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

import { CompleteTab } from "@/components/CompleteTab";
import { MarketPriceTab } from "@/components/MarketPriceTab";

export default function Home() {
  const [activeTab, setActiveTab] = useState("search");

  // Cast MOCK_ITEMS to Item[] to ensure compatibility
  const [items, setItems] = useState<Item[]>(MOCK_ITEMS as Item[]);

  // Supabase Fetching
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase.from('market_listings').select('*');
      if (error) {
        console.error("Error fetching items:", error);
      } else if (data && data.length > 0) {
        // Map backend view structure to Frontend Item type
        const mappedItems: Item[] = data.map((item: any) => ({
          id: item.market_id, // Map market_id to id
          name: item.name,
          price: item.price,
          level: 0, // Default or fetch if available in view
          category: item.category,
          count: item.count,
          timeLeft: item.timeLeft,
          isNew: item.isNew,
          image: item.image,
          seller: item.seller,
          status: item.status,
          // Add other fields if present in View
          // item_gender, item_source etc can be ignored or added to Item type if needed
        }));
        setItems(mappedItems);
      }
      setIsLoaded(true);
    };

    fetchItems();
  }, []);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [completionItemId, setCompletionItemId] = useState<number | null>(null);

  // Buyer requests purchase
  const handlePurchaseRequest = (id: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "거래대기중" as const } : item
      )
    );
  };

  // Seller accepts trade (Simulated)
  const handleAcceptTrade = (id: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    // Update Item Status
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "거래중" as const } : item
      )
    );

    // Create Notification
    const newNotif: Notification = {
      id: Date.now().toString(),
      message: `'${item.name}' 아이템의 판매자 ${item.seller}님이 거래를 수락하셨습니다!`,
      timestamp: new Date().toLocaleTimeString(),
      read: false,
      itemId: item.id,
      type: "trade_accept"
    };

    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleNavigateToComplete = (itemId: number) => {
    setCompletionItemId(itemId);
    setActiveTab("complete");
    // Mark notification as read? Optional.
  };

  const handleCompleteTrade = (itemId: number, buyerNickname: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, status: "판매완료" as const, buyer: buyerNickname }
          : item
      )
    );
    alert("거래가 성공적으로 완료되었습니다!");
    setCompletionItemId(null);
    setActiveTab("search"); // Go back to list to see the update
  };

  // User registers new item
  const handleRegisterItem = (newItem: Item) => {
    setItems((prev) => [newItem, ...prev]);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  return (
    <div className="flex flex-col h-screen bg-[#1a1a1a] text-white overflow-hidden">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notifications={notifications}
        onClearNotifications={handleClearNotifications}
        onNavigateToComplete={handleNavigateToComplete}
      />

      {activeTab === "sell" ? (
        <SellTab onRegister={handleRegisterItem} />
      ) : activeTab === "myitems" ? (
        <MyItemsTab items={items} onAcceptTrade={handleAcceptTrade} />
      ) : activeTab === "market" ? (
        <MarketPriceTab items={items} />
      ) : activeTab === "search" ? (
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0 bg-[#222]">
            <ItemTable items={items} onPurchaseRequest={handlePurchaseRequest} isLoading={!isLoaded} />
          </main>
        </div>
      ) : activeTab === "complete" ? (
        <CompleteTab
          item={items.find(i => i.id === completionItemId) || null}
          onComplete={handleCompleteTrade}
        />
      ) : (
        <div className="flex items-center justify-center flex-1 text-gray-500">
          준비 중인 기능입니다.
        </div>
      )}
    </div>
  );
}
