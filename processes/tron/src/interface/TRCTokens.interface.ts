import { TrnxTypeEnum } from "../enum";

export type ERC20Tokens = {
   coin_symbol: string,
   token_address: string,
   decimals: number,
};

export type ERC721Tokens = {
   coin_symbol: string,
   token_address: string,
   decimals: number,
};

export type TxType = {
   tx_id: string,
   fromAddress: string,
   toAddress: string,
   token: ERC20Tokens | null,
   amount: number,
   blockId: number,
   isNFTToken?: boolean,
   txType: TrnxTypeEnum,
   trnx_fee: number
};
