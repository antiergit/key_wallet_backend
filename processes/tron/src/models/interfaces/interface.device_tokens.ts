export interface DeviceTokenInterface {
    id: number,
    device_token: string | string[],
    user_id: number,
    status: number,
    push?: number,
    created_at: Date,
    updated_at: Date
}
