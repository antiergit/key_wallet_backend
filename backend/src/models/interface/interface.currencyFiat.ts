export interface CurrencyFiatInterface {
  currency_id: number;
  currency_name: string;
  currency_code: string;
  status: number;
  currency_symbol: string;
  uuid?: number | null;
  image?: string | null
}
