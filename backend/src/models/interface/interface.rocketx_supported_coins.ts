export interface RocketxSupportedCoinsInterface {
    id: number,

    rocketx_id: number,
    token_name: string,
    token_symbol: string,
    coin_id: number,
    rocketx_coin_id: number,

    icon_url: string,
    enabled: number,
    score: number,
    is_custom: number,

    is_native_token: number,
    contract_address: string,
    network_id: string,
    token_decimals: number,
    chain_id: string,

    walletless_enabled: number,
    buy_enabled: number,
    sell_enabled: number,

    created_at: Date,
    updated_at: Date
}