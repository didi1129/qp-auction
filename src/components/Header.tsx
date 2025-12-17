import { Button } from "@/components/ui/button";
import { Search, History, Heart, ShoppingBag, CheckSquare, HelpCircle, User, StopCircle } from "lucide-react";

export function Header() {
  return (
    <header className="flex flex-col w-full bg-sidebar border-b border-border">
      {/* Top Bar with Logo and User Stats */}
      <div className="flex h-14 items-center justify-between px-4 bg-[#1a1a1a]">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-yellow-500 tracking-tighter">
            <span className="text-yellow-400">큐플옥션</span> <span className="text-gray-400 text-sm font-normal ml-2">QPLAY AUCTION</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 bg-[#2a2a2a] px-3 py-1 rounded border border-[#3d3d3d]">
            <span className="text-gray-400">큐플포인트</span>
            <span className="text-white font-bold">5,389</span>
            <span className="text-yellow-500 ml-2">●</span>
          </div>
          <div className="flex items-center gap-2 bg-[#2a2a2a] px-3 py-1 rounded border border-[#3d3d3d]">
            <span className="text-yellow-500 font-bold">254,048,586</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <User className="h-4 w-4" />
            <StopCircle className="h-4 w-4" />
            <HelpCircle className="h-4 w-4" />
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-auto p-0 ml-2">
              나가기 &gt;
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-end px-4 gap-1 bg-[#2a2a2a] border-b border-[#3d3d3d] pt-2">
        <NavTab label="검색" icon={<Search className="h-4 w-4" />} active />
        <NavTab label="시세" icon={<History className="h-4 w-4" />} />
        <NavTab label="찜목록" icon={<Heart className="h-4 w-4" />} />
        <NavTab label="판매" icon={<ShoppingBag className="h-4 w-4" />} />
        <NavTab label="완료" icon={<CheckSquare className="h-4 w-4" />} />
      </div>
    </header>
  );
}

function NavTab({ label, icon, active = false }: { label: string; icon: React.ReactNode; active?: boolean }) {
  return (
    <button
      className={`
        flex items-center gap-2 px-8 py-2 rounded-t-lg font-bold text-sm transition-colors
        ${active
          ? "bg-[oklch(0.6_0.15_240)] text-white shadow-[0_-2px_4px_rgba(0,0,0,0.2)]"
          : "bg-[#333] text-gray-400 hover:bg-[#444] hover:text-white mb-[1px]"}
      `}
    >
      {icon}
      {label}
    </button>
  );
}
