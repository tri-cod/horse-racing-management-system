export type BetStatus = 'PENDING' | 'WON' | 'LOST' | 'CANCELLED';

/* Payload khi đặt cược */
export interface BetItem {
  raceHorseId: number;
  betAmount: number;
}

export interface PlaceBetPayload {
  raceId: number;
  betItems: BetItem[];
}

/* Response từ backend — mỗi BetResponse = 1 lần đặt cược, chứa nhiều ngựa */
export interface BetItemResponse {
  id: number;
  raceHorseId: number;
  horseName?: string;
  betAmount: number;
  odds: number;
  resultStatus: string;   /* PENDING | WON | LOST */
  payout?: number | null; /* null trước khi có kết quả race */
}

export interface BetResponse {
  id: number;
  raceId: number;
  raceName?: string;
  totalAmount: number;
  status: string;
  betItems: BetItemResponse[];
  createdAt: string;
}

/* Legacy — giữ lại để không break các import cũ */
export type Bet = BetResponse;
