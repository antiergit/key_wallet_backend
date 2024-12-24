import BigNumber from "bignumber.js";
// import FCM from 'fcm-push';
// /import FCM from 'fcm-node'
var FCM = require("fcm-node");
import { userQueries } from './dbHelper/index';


import {
    Db_Helper
} from ".";

import {
    config
} from "../config/config";

import { NotificationModel } from "../models";
import { global_helper } from "./global_helper";

class UtilityHelper {
    //    public REDIS_BLOCKS: string = `${CONFIG.REDISKEYS.BLOCKS}_${CONFIG.COIN_FAMILY_ETH}`;
    public FCM_SERVER_KEY: any = config.KEYS.FCM_PUSH;

    bigNumberSafeMath = async (c: any, operation: any, d: any) => {
        18;
        var a = new BigNumber(c);
        var b = new BigNumber(d);
        var rtn: any;
        switch (operation.toLowerCase()) {
            case "-":
                rtn = a.minus(b);
                break;
            case "+":
                rtn = a.plus(b);
                break;
            case "*":
            case "x":
                rtn = a.multipliedBy(b);
                break;
            case "÷":
            case "/":
                rtn = a.dividedBy(b);
                break;
            default:
                //operator = operation;
                break;
        }
        return rtn.toString();
    }

    bigNumberSafeConversion = async (val: number) => {
        const amount = val.toString();
        const value = new BigNumber(amount);
        return value.toFixed();
    };

    convertAmount = async (hexAmount: any) => {
        return new BigNumber("0x" + hexAmount.toString());
    }


    exponentialToDecimal = async (exponential: number) => {
        let decimal: string = exponential.toString().toLowerCase();
        if (decimal.includes("e+")) {
            const exponentialSplitted = decimal.split("e+");
            let postfix: string = "";
            for (let i = 0; i < +exponentialSplitted[1] - (exponentialSplitted[0].includes(".") ? exponentialSplitted[0].split(".")[1].length : 0); i++) {
                postfix += "0";
            }
            const addCommas = (text: string) => {
                let j: number = 3;
                let textLength: number = text.length;
                while (j < textLength) {
                    text = `${text.slice(0, textLength - j)}${text.slice(textLength - j, textLength)}`;
                    textLength++;
                    j += 3 + 1;
                }
                return text;
            };
            decimal = addCommas(exponentialSplitted[0].replace(".", "") + postfix);
        }
        if (decimal.toLowerCase().includes("e-")) {
            const exponentialSplitted = decimal.split("e-");
            let prefix: string = "0.";
            for (let i = 0; i < +exponentialSplitted[1] - 1; i++) {
                prefix += "0";
            }
            decimal = prefix + exponentialSplitted[0].replace(".", "");
        }
        return decimal;
    }

    //    UpdateBlockNumber = async (
    //       block_number: number
    //    ) => {
    //       Redis_Helper.SetHashTable(
    //          this.REDIS_BLOCKS, // key
    //          BlocksKeysEnum.OLD_READ,// field
    //          JSON.stringify(Number(block_number)) // value 
    //       );

    //       /** next block to read */
    //       Redis_Helper.SetHashTable(
    //          this.REDIS_BLOCKS, // key
    //          BlocksKeysEnum.NEXT_READ,// field
    //          JSON.stringify(++block_number) // value 
    //       );
    //       return true;
    //    }

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
                await global_helper.addingCoinsToQueue(config.PUSH_NOTIFICATION_QUEUE, message)


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
                let notificationModel: any = {
                    message: data.message,
                    from_user_id: data.from_user_id ? data.from_user_id : 0,
                    amount: data.amount,
                    to_user_id: toUserId,
                    coin_symbol: data.coin_symbol,
                    notification_type: data.notification_type,
                    tx_id: data.tx_id,
                    coin_id: data.coin_id,
                    wallet_address: data.wallet_address,
                    tx_type: data.notification_type,
                    view_status: "0",
                    state: "0",
                }
                await NotificationModel.create(notificationModel);
            }
            return true;
        } catch (error: any) {
            console.error(`SendNotification error >>>`, error);
            return false;
        }
    };


}
export let Utility_Helper = new UtilityHelper();
