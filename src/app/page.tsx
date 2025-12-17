"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ItemTable } from "@/components/ItemTable";
import { SellTab } from "@/components/SellTab";

export default function Home() {
  const [activeTab, setActiveTab] = useState("search");

  return (
    <div className="flex flex-col h-screen bg-[#1a1a1a] text-white overflow-hidden">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "sell" ? (
        <SellTab />
      ) : activeTab === "search" ? (
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0 bg-[#222]">
            <ItemTable />
          </main>
        </div>
      ) : (
        <div className="flex items-center justify-center flex-1 text-gray-500">
          준비 중인 기능입니다.
        </div>
      )}
    </div>
  );
}
