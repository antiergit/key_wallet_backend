import { NotificationTypeEnum, TrnxTypeEnum } from "../enum"

export interface NotificationMessageInterface {
   title: string;
   message: string;
   to_user_id?: number;
   from_user_id?: number;
   notification_type: NotificationTypeEnum;
   tx_id: number;
   user_coin_id?: number;
   tx_type: TrnxTypeEnum;
   announcement_title?: string;
   announcement_message?: string;
   userCoinId?: number;
 }