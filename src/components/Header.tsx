import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, History, Heart, ShoppingBag, CheckSquare, HelpCircle, User, StopCircle, Bell, Box } from "lucide-react";
import { Notification } from "@/lib/types";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  notifications: Notification[];
  onClearNotifications: () => void;
}

export function Header({ activeTab, onTabChange, notifications, onClearNotifications }: HeaderProps) {
  const unreadCount = notifications.filter(n => !n.read).length;

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
            {/* Notification Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-[#1a1a1a]" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-[#222] border-[#3d3d3d] text-white p-0" align="end">
                <div className="p-3 border-b border-[#3d3d3d] flex justify-between items-center">
                  <span className="font-bold">알림 ({unreadCount})</span>
                  <Button variant="ghost" size="sm" onClick={onClearNotifications} className="text-xs h-6 text-gray-400">지우기</Button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">새로운 알림이 없습니다.</div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="p-3 border-b border-[#333] hover:bg-[#2a2a2a] text-sm">
                        <div className="text-gray-200">{notif.message}</div>
                        <div className="text-xs text-gray-500 mt-1">{notif.timestamp}</div>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <User className="h-4 w-4 ml-2" />
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
        <NavTab label="검색" tabId="search" icon={<Search className="h-4 w-4" />} activeTab={activeTab} onClick={onTabChange} />
        <NavTab label="내 아이템" tabId="myitems" icon={<Box className="h-4 w-4" />} activeTab={activeTab} onClick={onTabChange} />
        <NavTab label="시세" tabId="market" icon={<History className="h-4 w-4" />} activeTab={activeTab} onClick={onTabChange} />
        <NavTab label="찜목록" tabId="wishlist" icon={<Heart className="h-4 w-4" />} activeTab={activeTab} onClick={onTabChange} />
        <NavTab label="판매" tabId="sell" icon={<ShoppingBag className="h-4 w-4" />} activeTab={activeTab} onClick={onTabChange} />
        <NavTab label="완료" tabId="complete" icon={<CheckSquare className="h-4 w-4" />} activeTab={activeTab} onClick={onTabChange} />
      </div>
    </header>
  );
}

function NavTab({
  label,
  tabId,
  icon,
  activeTab,
  onClick
}: {
  label: string;
  tabId: string;
  icon: React.ReactNode;
  activeTab: string;
  onClick: (tab: string) => void;
}) {
  const active = activeTab === tabId;
  return (
    <button
      onClick={() => onClick(tabId)}
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
