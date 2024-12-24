export interface blocks_trnx {
    block_number: number,
    tx_id: string,
    retry_count: number,
    key: string | null,
    pair: string | null
}
