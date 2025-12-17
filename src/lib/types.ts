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
  seller?: string;
  buyer?: string;
  status?: "판매중" | "거래대기중" | "거래중" | "판매완료";
  seller_discord_id?: string;
  seller_user_id?: string;
  buyer_discord_id?: string;
  item_id?: number;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  itemId?: number; // Link to the item for actions
  type?: "trade_request" | "trade_accept" | "trade_complete" | "trade_declined" | "trade_completed";
}
