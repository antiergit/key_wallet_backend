export interface MakerWalletInterface {
    id: number,
    device_token: string | null,
    wallet_address: string | null,
    wallet_name: string | null,
    user_id: number | null,
    coin_family: number | null,
    device_id: string | null,
    status: number | null,
    fiat_currency: string,
    theme: string,
    is_login: number | null,
    created_at: Date,
    updated_at: Date
}