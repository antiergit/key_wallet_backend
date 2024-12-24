export interface AdminInterface {
    id: number,
    username: string,
    email: string,
    password: string,
    mobile_no: string | null,
    google2fa_secret: string | null,
    google2fa_status: number | null,
    jwt_token: string | null,
    login_status: number | null,
    active: number | 1,
    created_at?: Date,
    updated_at?: Date
  }