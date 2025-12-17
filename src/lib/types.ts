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
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
}
