import { Fiat_Currency } from "../../constants/global_enum";
export interface DeviceTokenInterface {
  id: number;
  device_token: string | string[];
  user_id: number;
  status: number;
  push?: number;
  language : string | 'en';
  fiat_currency:string | Fiat_Currency.USD
}
