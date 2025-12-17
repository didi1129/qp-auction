import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { ItemTable } from "@/components/ItemTable";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-[#1a1a1a] text-white overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 bg-[#222]">
          <ItemTable />
        </main>
      </div>
    </div>
  );
}
