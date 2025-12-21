export interface Item {
  id: number;
  name: string;
  level?: number;
  price: number;
  basicPrice?: number; // For global DB items
  averagePrice?: number;
  perItemPrice?: number;
  count?: number;
  timeLeft?: string;
  isNew?: boolean;
  category: string;
  image?: string;
  seller?: string | null;
  buyer?: string | null;
  status?: "판매중" | "거래대기중" | "거래중" | "판매완료" | null;
  seller_discord_id?: string | null;
  seller_user_id?: string | null;
  buyer_discord_id?: string | null;
  buyer_user_id?: string | null;
  item_id?: number;
  trade_message?: string;
  cancel_count?: number;
  item_gender?: string | null;
  sold_at?: string;
  trade_channel?: string;
  room_number?: string;
  seller_avatar_url?: string | null;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  itemId?: number; // Link to the item for actions
  type?: "trade_request" | "trade_accept" | "trade_complete_seller" | "trade_declined" | "trade_review_needed";
}
