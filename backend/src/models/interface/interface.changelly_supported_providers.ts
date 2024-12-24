export interface ChangellySupportedProvidersInterface {
    id: number,
    code: string | null,
    name: string | null,
    trust_pilot_rating: string | null,
    icon_url: string | null,
    status: number | null,
    created_at: Date,
    updated_at: Date
}