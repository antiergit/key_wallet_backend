export interface UserInterface {
  user_id: number;
  user_name: string | null,
  // email: string | null,
  referral_code: string;
  referral_count: number | 0;
  device_id: string | null;
  referral_type_id: number | 1;
  gp_referred: number | 0,
  fran_referred: number | 0,
  pre_fran_referred: number | 0,
  mas_fran_referred: number | 0,
  request_rejected: number | 0,
  created_at: string;
  updated_at: string;
}
