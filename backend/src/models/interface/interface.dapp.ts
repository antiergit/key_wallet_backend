export interface DappInterface {
  id: number;
  status: number;
  about: string;
  image: string;
  url: string;
  dapp_name: string;
  dapp_group_id: number;
  coin_family: number;
  created_at?: string;
  updated_at?: string;
}
