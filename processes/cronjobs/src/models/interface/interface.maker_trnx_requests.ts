export interface MakerTrnxRequestInterface {
    id: number,
    maker_user_id: number | null,
    user_id: number | null,
    coin_id: number | null,
    from_address: string | null,
    to_address: string | null,
    crypto_amount: string | null,
    wallet_name: string | null,
    trnx_fee: number | null,
    status: string | null,
    created_at: Date,
    updated_at: Date
}