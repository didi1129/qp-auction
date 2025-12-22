import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, History, Heart, ShoppingBag, CheckSquare, HelpCircle, User, LogIn, Bell, Box, LogOut, Star } from "lucide-react";
import { Notification } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { ReviewModal } from "./ReviewModal";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  notifications: Notification[];
  onClearNotifications: () => void;
  onNavigateToComplete: (itemId: number) => void;
  onAcceptTrade: (itemId: number) => void;
  onDeclineTrade: (itemId: number) => void;
  onMarkAsRead: (notificationId: string) => void;
  user: SupabaseUser | null;
}

export function Header({ activeTab, onTabChange, notifications, onClearNotifications, onNavigateToComplete, onAcceptTrade, onDeclineTrade, onMarkAsRead, user }: HeaderProps) {
  const unreadCount = notifications.filter(n => !n.read).length;
  const router = useRouter();


  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewData, setReviewData] = useState<{
    reviewerId: string;
    revieweeId: string;
    marketItemId: number;
    notificationId: string;
  } | null>(null);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="flex flex-col w-full bg-sidebar border-b border-border">
      {/* Top Bar with Logo and User Stats */}
      <div className="flex h-14 items-center justify-between px-4 bg-[#1a1a1a]">
        <div className="flex items-center gap-2 overflow-hidden">
          <h1 className="text-lg md:text-xl font-bold text-yellow-500 tracking-tighter shrink-0 flex items-center">
            <span className="text-yellow-400">큐플옥션</span>
            <span className="text-gray-500 text-[10px] md:text-sm font-normal ml-2 hidden sm:inline">QPLAY AUCTION</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4 text-sm shrink-0">
          <div className="flex items-center gap-1 md:gap-2 text-gray-400">
            {/* Notification Popover */}
            {user ? <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-white h-8 w-8 md:h-10 md:w-10">
                  <Bell className="h-4 w-4 md:h-5 md:w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2.5 w-2.5 md:h-3 md:w-3 bg-red-500 rounded-full border-2 border-[#1a1a1a]" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[calc(100vw-32px)] sm:w-80 bg-[#222] border-[#3d3d3d] text-white p-0" align="end">
                <div className="p-3 border-b border-[#3d3d3d] flex justify-between items-center">
                  <span className="font-bold">알림 ({unreadCount})</span>
                  <Button variant="ghost" size="sm" onClick={onClearNotifications} className="text-xs h-6 text-gray-400">지우기</Button>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">새로운 알림이 없습니다.</div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className={`p-3 border-b border-[#333] hover:bg-[#2a2a2a] text-sm relative ${notif.read ? 'opacity-50' : ''}`}>
                        <div className="flex justify-between items-start gap-2">
                          <div className="text-gray-200 flex-1">{notif.message}</div>
                          {!notif.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0 text-gray-500 hover:text-yellow-500"
                              onClick={() => onMarkAsRead(notif.id)}
                              title="읽음 처리"
                            >
                              <CheckSquare className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-2 flex gap-1 items-center">
                          <span>{formatRelativeTime(notif.timestamp)}</span>
                          {notif.read && (
                            <span className="text-[10px] bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded border border-gray-700">읽음</span>
                          )}
                        </div>
                        {/* Action Buttons & Badges */}
                        {notif.type === 'trade_request' && notif.itemId && (
                          <div className="flex gap-2 mt-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-[oklch(0.6_0.15_240)] hover:bg-[oklch(0.55_0.15_240)] text-white text-xs h-7"
                              onClick={() => {
                                // Optimistically disable or just rely on parent
                                onAcceptTrade(notif.itemId!)
                              }}
                            >
                              거래
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1 text-white text-xs h-7"
                              onClick={() => onDeclineTrade(notif.itemId!)}
                            >
                              거절
                            </Button>
                          </div>
                        )}

                        {notif.type === 'trade_declined' && (
                          <div className="mt-2 flex justify-end">
                            <span className="text-xs bg-red-900 text-red-200 px-2 py-1 rounded font-bold">거절함</span>
                          </div>
                        )}

                        {notif.type === 'trade_review_needed' && (
                          <Button
                            size="sm"
                            className="w-full mt-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs h-7 flex items-center justify-center gap-1"
                            onClick={async () => {
                              if (!user) return;
                              // Fetch the item info to get seller ID (reviewee)
                              const { data } = await supabase
                                .from('market_items')
                                .select('user_id')
                                .eq('id', notif.itemId)
                                .single();

                              if (data && data.user_id) {
                                setReviewData({
                                  reviewerId: user.id,
                                  revieweeId: data.user_id,
                                  marketItemId: notif.itemId!,
                                  notificationId: notif.id
                                });
                                setIsReviewOpen(true);
                              } else {
                                alert("판매자 정보를 찾을 수 없습니다.");
                              }
                            }}
                          >
                            <Star className="h-3 w-3" />
                            후기 등록
                          </Button>
                        )}

                        {notif.type === 'trade_complete_seller' && (
                          <div className="mt-2 flex justify-end">
                            <span className="text-xs bg-blue-900 text-blue-200 px-2 py-1 rounded font-bold">거래완료</span>
                          </div>
                        )}

                        {notif.type === 'trade_accept' && notif.itemId && (
                          <Button
                            size="sm"
                            className="w-full mt-2 bg-[oklch(0.6_0.15_240)] hover:bg-[oklch(0.55_0.15_240)] text-white text-xs h-7"
                            onClick={() => onNavigateToComplete(notif.itemId!)}
                          >
                            거래완료하기
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover> : null}

            {reviewData && (
              <ReviewModal
                isOpen={isReviewOpen}
                onClose={() => {
                  setIsReviewOpen(false);
                  setReviewData(null);
                }}
                reviewerId={reviewData.reviewerId}
                revieweeId={reviewData.revieweeId}
                marketItemId={reviewData.marketItemId}
                onReviewSubmitted={() => {
                  // Mark notification as read
                  onMarkAsRead(reviewData.notificationId);

                  // Also mark as processed logic? 
                  // For now, just mark read is good.
                }}
              />
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-auto p-0 ml-1 md:ml-2 gap-1 md:gap-2">
                    {/* User Avatar */}
                    {user.user_metadata.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-5 h-5 md:w-6 md:h-6 rounded-full" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span className="text-[10px] md:text-xs font-bold max-w-[60px] md:max-w-none truncate">
                      {user.user_metadata.custom_claims.global_name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#222] border-[#3d3d3d] text-white" align="end">
                  <DropdownMenuItem onClick={() => router.push('/my')} className="focus:bg-[#333] focus:text-white cursor-pointer px-3 py-2 text-sm">
                    <User className="mr-2 h-4 w-4" />
                    <span>마이페이지</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="focus:bg-[#333] focus:text-white cursor-pointer px-3 py-2 text-sm">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>로그아웃</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white ml-1 md:ml-2 gap-1 px-2 h-8"
                onClick={handleLogin}
              >
                <LogIn className="h-4 w-4" />
                <span className="text-[10px] md:text-xs">Discord 로그인</span>
              </Button>
            )}

            <HelpCircle className="h-4 w-4 ml-1 md:ml-2 hidden sm:block" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-end px-3 md:px-4 gap-1 bg-[#2a2a2a] border-b border-[#3d3d3d] pt-2 overflow-x-auto scrollbar-hide no-scrollbar">
        <NavTab label="검색" tabId="search" icon={<Search className="h-3.5 w-3.5 md:h-4 md:w-4" />} activeTab={activeTab} onClick={onTabChange} />
        <NavTab label="시세" tabId="market" icon={<History className="h-3.5 w-3.5 md:h-4 md:w-4" />} activeTab={activeTab} onClick={onTabChange} />
        <NavTab label="내 아이템" tabId="myitems" icon={<Box className="h-3.5 w-3.5 md:h-4 md:w-4" />} activeTab={activeTab} onClick={onTabChange} />
        <NavTab label="판매" tabId="sell" icon={<ShoppingBag className="h-3.5 w-3.5 md:h-4 md:w-4" />} activeTab={activeTab} onClick={onTabChange} />
        <NavTab label="완료" tabId="complete" icon={<CheckSquare className="h-3.5 w-3.5 md:h-4 md:w-4" />} activeTab={activeTab} onClick={onTabChange} />
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
        flex items-center gap-1.5 md:gap-2 px-4 md:px-8 py-2 rounded-t-lg font-bold text-xs md:text-sm transition-colors shrink-0 whitespace-nowrap
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
