export interface ITrnxHistoryInterface {
    id: number,
    user_id: number;
    to_user_id: number | null;
    coin_id: number;
    coin_family: number;
    type: string;
    req_type: string;
    from_adrs: string | null;
    to_adrs: string;
    tx_id: string | null;
    is_maker: number | null,
    merchant_id: string | null
    order_id: string | null;
    tx_raw: string | null;
    status: string;
    blockchain_status: string | null;
    amount: number;
    block_id: number | null;
    block_hash: string | null;
    speedup: string | null;
    nonce: number | null;
    tx_fee: number | null;
    swap_fee: number | null;
    gas_limit: number | null;
    gas_price: number | null;
    gas_reverted: number | null;
    fiat_price: number | null,
    fiat_type: string | null,
    country_code: string | null,
    order_status: string | null;
    referral_upgrade_level: string | null;
    rocketx_request_id?: string | null;
    changelly_order_id?: string | null;
    to_coin_family?: number | null;
    // address_book_name: string
    recipient_address?: string | null;
}
