export interface SwapInterface {
    id?: number;
    chain_id: number;
    coin_id:number;
    coin_name?: string;
    coin_symbol: string;
    coin_image: string;
    decimals: number;
    token_address: string;
    is_token: number;
    is_active: number;
    coin_family: number;
    is_custom_added:number;
    created_at?: string
    updated_at?: string
  }
  