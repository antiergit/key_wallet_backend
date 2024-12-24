import { BooleanEnum, TokenStandard } from "../../enum/index";
export interface CoinInterface {
    coin_id: number;
    coin_name: string;
    coin_symbol: string;
    coin_gicko_alias: string | null;
    coin_image?: string | null;
    coin_family: number;
    cmc_id?: number;
    is_on_cmc: number,
    coin_status: BooleanEnum | 0;
    is_token: BooleanEnum | 0;
    token_type: TokenStandard | null;
    decimals: number | 0;
    usd_price?: number | 1;
    withdraw_limit?: number | 0;
    token_abi?: string | null;
    token_address: string;
    added_by: string,
    created_at?: string;
    updated_at?: string;
    uuid?: string | null;
    for_swap?: number;
}
