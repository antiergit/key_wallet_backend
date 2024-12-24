export interface WatchlistInterface {
  id?: number;
  user_id: number;
  coin_id: number;
  status: string;
  wallet_address: string;
  created_at?: string;
  updated_at?: string;
}
