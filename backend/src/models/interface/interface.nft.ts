export interface NFTInterface {
  id?: number;
  wallet_address: string;
  coin_id: number;
  token_id: string;
  image: string;
  description: string;
  name: string;
  token_address: string;
  token_uri: string;
  user_id: number;
  available?: number;
  coin_family?: number;
}
