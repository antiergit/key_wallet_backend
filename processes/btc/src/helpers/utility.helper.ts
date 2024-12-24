import BigNumber from "bignumber.js";
const FCM = require("fcm-node");
import { Db_Helper, RabbitMq_Helper } from ".";
import { config } from "../config";
import { NotificationModel } from "../models/tables";
import { userQueries } from './dbHelper/index';

class UtilityHelper {
    public FCM_SERVER_KEY: any = config.config.KEYS.FCM_PUSH;
    bigNumberSafeConversion = async (val: number) => {
        const amount = val.toString();
        const value = new BigNumber(amount);
        return value.toFixed();
    }
    SendNotification = async (
        data: any
    ) => {
        try {
            let toUserId: number = data.to_user_id ? data.to_user_id : 0;

            // let deviceTokens: any = await Db_Helper.GetDeviceTokens(toUserId);
            // let device_tokens = [];

            // for await (let deviceToken of deviceTokens) {
            //     device_tokens.push(deviceToken.device_token);
            // }
            //===============================================================================
            let userData: any = await userQueries.userJoinDeviceTokenJoinMAkerWallets(
                ["user_id"],
                { user_id: toUserId },
                ["device_token"],
                { push: 1 },
                ["device_token"],
                { is_login: 1, status: 1 }
            )
            let device_tokens: any = [];

            // Check if user_device_token_data exists and is an array
            if (userData[0].user_device_token_data && Array.isArray(userData[0].user_device_token_data)) {
                device_tokens = device_tokens.concat(userData[0].user_device_token_data.map((item: any) => item.device_token));
            }

            // Check if user_maker_wallet_data exists and is an array
            if (userData[0].user_maker_wallet_data && Array.isArray(userData[0].user_maker_wallet_data)) {
                device_tokens = device_tokens.concat(userData[0].user_maker_wallet_data.map((item: any) => item.device_token));
            }
            console.log("deviceTokens deviceTokens", device_tokens)

            //===============================================================================

            if (device_tokens && this.FCM_SERVER_KEY) {
                let announcement_title: string = data.announcement_title == undefined ? "" : data.announcement_title;
                let announcement_message: string = data.announcement_message == undefined ? "" : data.announcement_message;

                let fcm = new FCM(this.FCM_SERVER_KEY);
                let message;

                if (Array.isArray(device_tokens)) {
                    message = {
                        tokens: device_tokens,
                        collapse_key: "type_a",
                        notification: {
                            title: data.title,
                            body: data.message
                        },
                        data: {
                            body: data.message ? (data.message).toString() : "",
                            title: data.title ? (data.title).toString() : "",
                            notification_type: data.notification_type ? (data.notification_type).toString() : "",
                            tx_id: data.tx_id ? (data.tx_id).toString() : "",
                            tx_type: data.tx_type ? (data.tx_type).toString() : "",
                            from_user_id: data.from_user_id ? (data.from_user_id).toString() : "",
                            user_coin_id: data.coin_id ? (data.coin_id).toString() : "",
                            announcement_title: announcement_title ? (announcement_title).toString() : "",
                            announcement_message: announcement_message ? (announcement_message).toString() : "",
                        },
                    };
                } else {
                    message = {
                        tokens: device_tokens,
                        collapse_key: "type_a",
                        notification: {
                            title: data.title,
                            body: data.message
                        },
                        data: {
                            body: data.message ? (data.message).toString() : "",
                            title: data.title ? (data.title).toString() : "",
                            notification_type: data.notification_type ? (data.notification_type).toString() : "",
                            tx_id: data.tx_id ? (data.tx_id).toString() : "",
                            tx_type: data.tx_type ? (data.tx_type).toString() : "",
                            from_user_id: data.from_user_id ? (data.from_user_id).toString() : "",
                            user_coin_id: data.coin_id ? (data.coin_id).toString() : "",
                            announcement_title: announcement_title ? (announcement_title).toString() : "",
                            announcement_message: announcement_message ? (announcement_message).toString() : "",
                        },
                    };
                }
                await Db_Helper.addingCoinsToQueue(config.config.PUSH_NOTIFICATION_QUEUE, message)

                // fcm.send(message, function (err: any, messageId: number) {
                //     if (err) {
                //         console.error("Something has gone wrong!", err);
                //     }
                //     console.debug(`fcm push notification >>`, messageId);
                // });
            }
            const checkOldNotif: any = await NotificationModel.count({
                where: {
                    to_user_id: toUserId,
                    notification_type: data.notification_type,
                    tx_id: data.tx_id,
                    tx_type: data.tx_type
                }
            });

            if (checkOldNotif == 0) {
                await NotificationModel.create({
                    message: data.message,
                    amount: data.amount,
                    alert_price: null,
                    fiat_type: null,
                    from_user_id: data.from_user_id ? data.from_user_id : 0,
                    to_user_id: toUserId,
                    coin_symbol: data.coin_symbol,
                    coin_id: data.coin_id,
                    notification_type: data.notification_type,
                    tx_id: data.tx_id,
                    tx_type: data.notification_type,
                    resent_count: null,
                    view_status: "0",
                    state: "0",
                    coin_price_in_usd: null,
                    wallet_address: data.wallet_address,
                })
            }
            return true;
        } catch (error: any) {
            console.error(`SendNotification error >>>`, error);
            return false;
        }
    }
    public async adding_coins_to_queue(queueName: string, data: any) {
        try {
            await RabbitMq_Helper.assertQueue(queueName)
            await RabbitMq_Helper.sendToQueue(queueName, Buffer.from(JSON.stringify(data)))
            return true;
        } catch (err: any) {
            console.error("Error in adding_coins_to_queue>>>", err)
            return false;
        }
    }
}
export let Utility_Helper = new UtilityHelper();
