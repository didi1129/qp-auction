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

import { User } from "@supabase/supabase-js";

export default function Home() {
  const [activeTab, setActiveTab] = useState("search");

  // Cast MOCK_ITEMS to Item[] to ensure compatibility
  const [items, setItems] = useState<Item[]>(MOCK_ITEMS as Item[]);

  // Supabase Fetching
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [completionItemId, setCompletionItemId] = useState<number | null>(null);
  const [searchCriteria, setSearchCriteria] = useState<{ category: string; keyword: string } | null>(null);
  const [priceHistory, setPriceHistory] = useState<Item[]>([]);

  // Auth & Notifications Logic
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Poll for notifications
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const discordId = user.identities?.find((id: any) => id.provider === 'discord')?.id;
    if (!discordId) return;

    const fetchNotifications = async () => {
      // Use user.id for RLS-compatible querying
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('target_user_id', user.id) // Query by UUID
        .order('created_at', { ascending: false });

      if (data) {
        const mappedNotifs: Notification[] = data.map((n: any) => ({
          id: n.id.toString(),
          message: n.message,
          timestamp: new Date(n.created_at).toLocaleTimeString(),
          read: n.is_read,
          itemId: n.item_id,
          type: n.result_code === 'trade_request' ? 'trade_request' :
            n.result_code === 'trade_accept' ? 'trade_accept' :
              n.result_code === 'trade_declined' ? 'trade_declined' :
                n.result_code === 'trade_complete' ? 'trade_completed' : undefined
        }));
        setNotifications(mappedNotifs);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, [user]);

  // Fetch Items
  useEffect(() => {
    const fetchItems = async () => {
      const { data, error } = await supabase
        .from('market_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching items:", error);
      } else if (data && data.length > 0) {
        // Map backend view structure to Frontend Item type
        const expiredIds: number[] = [];
        const rawMapped = data.map((item: any) => {
          // Calculate time left (24 hours from created_at)
          const createdAt = new Date(item.created_at);
          const expireTime = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
          const now = new Date();
          const diffMs = expireTime.getTime() - now.getTime();

          const isExpired = diffMs <= 0;
          if (isExpired && (item.status === "판매중" || item.status === "판매완료")) {
            expiredIds.push(item.market_id);
            return null;
          }

          let timeLeftStr = "만료됨";
          if (diffMs > 0) {
            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            timeLeftStr = `${diffHrs}시간 ${diffMins}분`;
          } else {
            timeLeftStr = "0분";
          }

          const mapped: Item = {
            id: item.market_id, // Map market_id to id
            name: item.name,
            price: item.price,
            level: 0, // Default or fetch if available in view
            category: item.category,
            count: item.count,
            timeLeft: timeLeftStr,
            isNew: item.isNew,
            image: item.image,
            seller: item.seller,
            buyer: item.buyer,
            status: item.status,
            seller_discord_id: item.seller_discord_id,
            seller_user_id: item.seller_user_id, // Map the UUID
            buyer_discord_id: item.buyer_discord_id,
            item_id: item.item_id, // Link to original item id
          };
          return mapped;
        });

        const mappedItems: Item[] = rawMapped.filter((item): item is Item => item !== null);

        // Delete expired items from DB
        if (expiredIds.length > 0) {
          console.log("Removing expired items from market:", expiredIds);
          supabase
            .from('market_items')
            .delete()
            .in('id', expiredIds)
            .then(({ error }) => {
              if (error) console.error("Error deleting expired items:", error);
            });
        }

        setItems(mappedItems);
      }
      setIsLoaded(true);
    };

    fetchItems();
  }, []);

  // Fetch Price History
  useEffect(() => {
    const fetchPriceHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('market_price_history')
          .select('*')
          .order('sold_at', { ascending: false });

        if (error) {
          // Table might not exist yet, ignore quietly or log but don't break UI
          console.warn("Market history fetch skipped or failed:", error.message);
          return;
        }

        if (data) {
          const mappedHistory: Item[] = data.map((h: any) => ({
            id: h.id,
            name: h.name,
            category: h.category,
            price: h.price,
            count: h.count,
            seller: h.seller,
            buyer: h.buyer,
            image: h.image,
            status: '판매완료',
            item_id: h.item_id
          }));
          setPriceHistory(mappedHistory);
        }
      } catch (e) {
        console.error("Price history fetch error:", e);
      }
    };

    fetchPriceHistory();
  }, [items]);

  // Buyer requests purchase
  const handlePurchaseRequest = async (id: number, message?: string) => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }

    const item = items.find(i => i.id === id);
    if (!item) return;

    // Prevent self-purchase
    // Prefer UUID check
    if (item.seller_user_id === user.id) {
      alert("본인의 아이템은 구매할 수 없습니다.");
      return;
    }

    // Fallback Legacy Check (if needed, but UUID is safer if populated)
    // const discordId = user.identities?.find((id: any) => id.provider === 'discord')?.id;
    // if (item.seller_discord_id === discordId) { ... } 
    // ^ This legacy check might fail if seller_discord_id is now username. 
    // We trust UUID check.

    // Extract Identity
    // User requested: Nickname = global_name, ID = username (full_name)
    const globalName = user.user_metadata?.custom_claims?.global_name;
    const username = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Unknown";

    const buyerNickname = globalName || username;
    const discordHandle = username;

    const discordId = user.identities?.find((id: any) => id.provider === 'discord')?.id; // Still need Snowflake for internal/logging if needed? or just use handle.

    // Update Item Status in DB
    const { error: updateError } = await supabase
      .from('market_items')
      .update({
        status: '거래대기중',
        buyer: buyerNickname,
        buyer_discord_id: discordHandle // Store Handle (Username)
      })
      .eq('id', item.id);

    if (updateError) {
      console.error("Error updating item status:", updateError);
      alert("상태 업데이트 실패");
      return;
    }

    const notificationMessage = message
      ? `구매 요청: ${buyerNickname}님이 '${item.name}' 구매를 희망합니다.\n"${message}"`
      : `구매 요청: ${buyerNickname}님이 '${item.name}' 구매를 희망합니다.`;

    // Insert Notification
    const { error } = await supabase
      .from('notifications')
      .insert({
        item_id: item.id,
        target_user_discord_id: item.seller_discord_id, // This might be snowflake OR username depending on when item was created. 
        target_user_id: item.seller_user_id, // RLS relies on this UUID.
        sender_user_discord_id: discordHandle, // Store Handle here too for consistency? Or Snowflake?
        // Let's store Handle as per user request for "ID". 
        message: notificationMessage,
        buyer_message: message || null,
        result_code: 'trade_request',
        is_read: false
      });

    if (error) {
      console.error("Error sending notification:", error);
      // Revert status change? ideally yes, but keeping simple
      alert("구매 요청 전송 실패");
      return;
    }

    // Update Local State (Optimistic)
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? {
          ...item,
          status: "거래대기중" as const,
          buyer: buyerNickname,
          buyer_discord_id: discordHandle
        } : item
      )
    );
    alert("판매자에게 구매 요청을 보냈습니다.");
  };

  // Seller accepts trade (Triggered from Notification 'Trade' button)
  const handleAcceptTrade = async (itemId: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // Update Item Status to 'Trading' in DB
    await supabase
      .from('market_items')
      .update({ status: '거래중' })
      .eq('id', itemId);

    // Update Local State
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, status: "거래중" as const } : item
      )
    );

    // Navigate to Complete Tab
    setCompletionItemId(itemId);
    setActiveTab("complete");
  };

  // Seller declines trade
  const handleDeclineTrade = async (itemId: number) => {
    // Revert status to 'Selling' in DB (Clear buyer info too)
    await supabase
      .from('market_items')
      .update({ status: '판매중', buyer: null, buyer_discord_id: null })
      .eq('id', itemId);

    // Update Notification Status in DB to 'trade_declined'
    await supabase
      .from('notifications')
      .update({ result_code: 'trade_declined' })
      .eq('item_id', itemId)
      .eq('result_code', 'trade_request'); // Only update the request notification

    // Update Local State
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, status: "판매중" as const, buyer: undefined, buyer_discord_id: undefined } : item
      )
    );
  };

  const handleNavigateToComplete = (itemId: number) => {
    setCompletionItemId(itemId);
    setActiveTab("complete");
  };

  const handleCompleteTrade = async (itemId: number) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    // Update Item Status in DB to 'Completed'
    await supabase
      .from('market_items')
      .update({
        status: '판매완료'
        // Buyer info is already set during purchase request
      })
      .eq('id', itemId);

    // Insert into market_price_history for persistent market tracking
    await supabase
      .from('market_price_history')
      .insert({
        item_id: item.item_id,
        name: item.name,
        category: item.category,
        price: item.price,
        count: item.count,
        seller: item.seller,
        buyer: item.buyer,
        image: item.image,
        sold_at: new Date().toISOString()
      });

    // Update Notification Status to 'trade_complete'
    await supabase
      .from('notifications')
      .update({ result_code: 'trade_complete' })
      .eq('item_id', itemId)
      .eq('result_code', 'trade_request');

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, status: "판매완료" as const }
          : item
      )
    );
    alert("거래가 성공적으로 완료되었습니다!");
    setCompletionItemId(null);
    setActiveTab("search"); // Go back to list to see the update
  };

  // User deletes their own item
  const handleDeleteItem = async (itemId: number) => {
    const { error } = await supabase
      .from('market_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error("Error deleting item:", error);
      alert("아이템 삭제 실패");
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== itemId));
    alert("아이템이 삭제되었습니다.");
  };

  // User updates their own item (e.g. price change)
  const handleUpdateItem = async (itemId: number, updates: Partial<Item>) => {
    const { error } = await supabase
      .from('market_items')
      .update({
        price: updates.price, // Only price support for now
      })
      .eq('id', itemId);

    if (error) {
      console.error("Error updating item:", error);
      alert("아이템 수정 실패");
      return;
    }

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    );
    alert("아이템 정보가 수정되었습니다.");
  };

  // User registers new item
  const handleRegisterItem = (newItem: Item) => {
    setItems((prev) => [newItem, ...prev]);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // Search/Filter Logic
  const handleSearch = (category: string, keyword: string) => {
    setSearchCriteria({ category, keyword });
  };

  const filteredItems = items.filter((item) => {
    if (!searchCriteria) return true;
    const matchesCategory = item.category === searchCriteria.category;
    const matchesKeyword = item.name.toLowerCase().includes(searchCriteria.keyword.toLowerCase());
    return matchesCategory && matchesKeyword;
  });

  const username = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Unknown";
  // User wants "ID" to be the username (handle), so we use that for matching "buyer_discord_id" or display.
  // We use user.id (UUID) for strict ownership checks (seller_user_id).

  return (
    <div className="flex flex-col h-screen bg-[#1a1a1a] text-white overflow-hidden">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        notifications={notifications}
        onClearNotifications={handleClearNotifications}
        onNavigateToComplete={handleNavigateToComplete}
        onAcceptTrade={handleAcceptTrade}
        onDeclineTrade={handleDeclineTrade}
        user={user}
      />

      {activeTab === "sell" ? (
        <SellTab onRegister={handleRegisterItem} user={user} />
      ) : activeTab === "myitems" ? (
        <MyItemsTab
          items={items}
          onAcceptTrade={handleAcceptTrade}
          currentUserDiscordId={username}
          currentUserId={user?.id}
          onDelete={handleDeleteItem}
          onUpdate={handleUpdateItem}
        />
      ) : activeTab === "market" ? (
        <MarketPriceTab items={[...items, ...priceHistory]} />
      ) : activeTab === "search" ? (
        <div className="flex flex-1 overflow-hidden">
          <Sidebar onSearch={handleSearch} />
          <main className="flex-1 flex flex-col min-w-0 bg-[#222]">
            <ItemTable
              items={filteredItems}
              onPurchaseRequest={handlePurchaseRequest}
              isLoading={!isLoaded}
              currentUserDiscordId={username}
              currentUserId={user?.id}
            />
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
