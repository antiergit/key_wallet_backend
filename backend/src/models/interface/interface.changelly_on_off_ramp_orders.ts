export interface ChangellyOnOffRampOrdersInterface {
    id: number,
    user_id: number | null,
    external_order_id: string | null,
    type: string | null,
    provider_code: string | null,
    currency_from: string | null,
    currency_to: string | null,
    amount_from: string | null,
    country: string | null,
    state: string | null,
    wallet_address: string | null,
    payment_method: string | null,
    order_id: string | null,
    redirect_url: string | null,
    created_at: Date,
    updated_at: Date
}