import { BooleanEnum } from "../enum";
import {
    DeviceTokenModel,
    WalletModel
} from "../models/tables";
import { CoinInterface } from "../models/interfaces";
import { Utility_Helper } from "./utility.helper";
import { config } from "../config/config";
import { RabbitMq_Helper } from "./rabbitmq.helper";
class DbHelper {
    Update_Balance = async (
        wallet_address: string,
        coin: CoinInterface,
        balDetails: any
    ) => {
        try {
            if (!wallet_address) {
                console.error(`wallet_address missing >>> `);
                return false;
            }

            if (balDetails.status) {
                console.log("update balance wallet_address", wallet_address, "coin_id", coin.coin_id, "balance", balDetails.balance)

                await WalletModel.update({
                    balance: balDetails.balance,
                    status: 1
                }, {
                    where: {
                        wallet_address: wallet_address,
                        coin_id: coin.coin_id
                    }
                });

            }

            if (balDetails.status == false) {
                console.log("update balance wallet_address adding in queue", wallet_address)
                await Utility_Helper.adding_coins_to_queue(config.BACKEND_WALLET_ADDRESSES,
                    {
                        coin_data: {
                            coin_id: coin.coin_id,
                            coin_family: 3,
                            is_token: 0,
                            token_address: null,
                            token_type: null
                        }, wallet_address: wallet_address, queue_count: 0
                    })
            }
            return true
        } catch (error: any) {
            console.error(`WalletHelper Update_Balance error >>>`, error);
            return {};
        }
    }
    /** get user device token using user id */
    GetDeviceTokens = async (user_id: number) => {
        try {
            return await DeviceTokenModel.findAll({
                attributes: ["device_token"],
                where: {
                    user_id: user_id,
                    push: BooleanEnum.true
                },
                order: [
                    ["updated_at", "DESC"],
                    ['id', 'DESC']
                ],
                limit: 3,
                raw: true
            });
        } catch (error: any) {
            console.error(`getDeviceToken error >>>`, error);
            return false;
        }
    }

    public async addingCoinsToQueue(queueName: string, data: any) {
        try {
            await RabbitMq_Helper.assertQueue(queueName)
            await RabbitMq_Helper.sendToQueue(queueName, Buffer.from(JSON.stringify(data)))
            return true;
        } catch (err: any) {
            console.error("Error in addingCoinsToQueue>>>", err.message)
            return false;
        }
    }
}
export let Db_Helper = new DbHelper();

