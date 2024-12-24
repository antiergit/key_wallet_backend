declare namespace Express {
  import { AbiItem } from "web3-utils";
  export interface Request {
    device_token: string;
    userId: number;
    coininfo: {
      token_abi: AbiItem[] | string;
      token_address: string | null | undefined;
      decimals: number;
      is_token: number | boolean;
      token_type: string | null;
      coin_id: number;
      cmc_id?: number;
      coin_symbol: string;
      coin_family: number;
    };
    loginUserId: number;
  }
  export interface Response {
    userId: number;
  }
}
