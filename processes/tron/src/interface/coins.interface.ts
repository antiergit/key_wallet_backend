import {
   CoinStatus,
   TokenManagedByEnum,
   TokenStandard,
   BooleanEnum
} from "../enum"

export interface CoinsInterface {
   id: number,
   coin_name: string,
   coin_symbol: string,
   price_source_slug: string,
   coin_image: string,
   coin_family: any,
   token_standard: TokenStandard
   is_token: BooleanEnum,
   token_address: string,
   decimals: number,
   status: CoinStatus,
   managed_by: TokenManagedByEnum,
   token_id: string,
   created_at: string,
   updated_at: string
}
