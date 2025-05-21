export interface blocks_trnx {
  block_number: number;
  tx: any;
  retry_count: number;
  key: string | null;
  pair: string | null;
}
