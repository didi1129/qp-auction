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

// Database Row Types
export interface ItemInfoRow {
  id: number;
  name: string;
  category: string;
  level?: number;
  gender?: string;
  item_gender?: string;
  image?: string;
  basicPrice?: number;
  created_at: string;
}

export interface MarketItemRow {
  id: number;
  item_id: number;
  seller: string;
  seller_discord_id: string;
  user_id: string;
  price: number;
  count: number;
  status: "판매중" | "거래대기중" | "거래중" | "판매완료";
  isNew: boolean;
  trade_message?: string;
  trade_channel?: string;
  room_number?: string;
  seller_avatar_url?: string;
  created_at: string;
  buyer?: string;
  buyer_discord_id?: string;
  buyer_user_id?: string;
  sold_at?: string;
  cancel_count?: number;
  items_info?: ItemInfoRow;
}

export interface NotificationRow {
  id: number;
  item_id?: number;
  target_user_discord_id?: string;
  target_user_id?: string;
  sender_user_discord_id?: string;
  message: string;
  buyer_message?: string;
  result_code?: string;
  is_read: boolean;
  created_at: string;
}

export interface WishlistRow {
  id: number;
  user_id: string;
  item_id: number;
  created_at: string;
}

export interface MarketPriceHistoryRow {
  id: number;
  item_id: number;
  name: string;
  category: string;
  price: number;
  count: number;
  seller: string;
  buyer: string;
  image?: string;
  item_gender?: string;
  sold_at: string;
  created_at: string;
}

export interface ReviewRow {
  id: number;
  reviewee_id: string;
  reviewer_id: string;
  market_item_id: number;
  is_recommended: boolean;
  comment: string | null;
  created_at: string;
}
