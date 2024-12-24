export interface MakerCheckerNotificationsInterface {
    id: number,
    maker_user_id: number | null,
    checker_user_id: number | null,
    type: string | null,
    message: string | null,
    view_status: number | null,
    status: number | null,
    notification_status: number | null,
    created_at: Date,
    updated_at: Date
}