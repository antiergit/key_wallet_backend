export interface WalletInterface {
  wallet_id: number,
  user_id: number,
  wallet_name: string,
  checker_code: string | null,
  wallet_address: string,
  coin_id: number,
  coin_family?: number,
  balance: number,
  balance_blocked?: number | null,
  user_withdraw_limit?: number | null,
  default_wallet?: number | 0,
  is_verified?: number | null,
  status?: number | 0,
  is_deleted?: number | null,
  sort_order?: number | null,
  is_private_wallet?: number | null
}