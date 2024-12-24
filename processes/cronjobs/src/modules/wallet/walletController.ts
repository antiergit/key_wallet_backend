import { Op } from "sequelize";
import { config } from "../../config";
import { RabbitMq, blockChainHelper, coinGeckoHelper, notificationhelper, redisClient, thirdPartyHelper } from "../../helpers/common/index";
import { coinQueries, gasPriceQueries, makerTrnxRequestQueries, makerWalletQueries, trnxHistoryQueries, walletQueries } from "../../helpers/dbHelper/index";

const { ETH: ETH, BNB: BNB } = config.STATIC_COIN_FAMILY;
const { fetch_coin_gicko_ids_coin_counter: FETCH_COIN_GICKO_IDS_COIN_COUNTER } = config.REDISKEYS.COIN_LIMIT_COUNT_FIELD;

class WalletController {

    public async updateGasPrice(coinFamily: number) {
        try {
            let resp: any;
            let whereClause: any;
            let shouldUpdate = false;

            if (coinFamily == 1) {
                resp = await thirdPartyHelper.getBNBGas();
                whereClause = { coin_family: BNB };
                shouldUpdate = false;
            } else if (coinFamily == 2) {
                resp = await thirdPartyHelper.getETHGas();
                whereClause = { coin_family: ETH };
                shouldUpdate = true;
            } else {
                console.error("Invalid coin family provided. 🔥 ~ ~");
                shouldUpdate = false;
            }

            if (resp && resp.status) {
                const { SafeGasPrice, ProposeGasPrice, FastGasPrice } = resp.response.result;

                if (coinFamily == 1 && Math.floor(SafeGasPrice) <= 3) {
                    console.log("SafeGasPrice is less than or equal to 3. Skipping update.");
                    shouldUpdate = false;
                } else if (coinFamily == 1 && Math.floor(SafeGasPrice) > 3) {
                    shouldUpdate = true;
                }

                if (shouldUpdate) {
                    await gasPriceQueries.update({
                        safe_gas_price: Math.floor(SafeGasPrice),
                        propose_gas_price: Math.floor(ProposeGasPrice),
                        fast_gas_price: Math.floor(FastGasPrice),
                    }, whereClause);
                    console.log("Gas prices updated successfully.");
                }
            } else {
                console.log("Response status is false. Kindly check>>", resp);
            }
        } catch (err: any) {
            console.error("Error in updateGasPrice 🔥 ~ ~", err.message);
        }
    }
    public async sendPushNotification(data: any) {
        try {
            console.log("Entered into sendPushNotification >>", data)
            if (data) {
                await notificationhelper.sendNotification(data)
            } else { console.log("No data present in pushNotifcation>>>") }
        } catch (err: any) {
            console.error("Error in sendPushNotification 🔥 ~ ~", err.message)
        }
    }
    public async fetchCoinGeckoIds() {
        try {
            let limit: number = 5;
            let coinLimitCounterKey = config.REDISKEYS.COIN_LIMIT_COUNTS;
            let coinCounter = FETCH_COIN_GICKO_IDS_COIN_COUNTER;

            const findCoinCounter = await redisClient.getKeyValuePair(coinLimitCounterKey, coinCounter);
            let coinLimitCount = findCoinCounter ? Number(findCoinCounter) : 0;

            let data: any = await coinQueries.findAndCountAll(
                ["coin_id", "coin_image", "token_address", "coin_symbol", "coin_family"],
                { coin_status: 1, coin_gicko_id: null, is_on_coin_gicko: 1 },
                [['coin_id', 'ASC']],
                limit,
                coinLimitCount
            )
            if (data?.count > 0) {

                for await (const iterator of data.rows) {
                    let queryData: any = {
                        coin_family: iterator.coin_family,
                        token_address: iterator.token_address,
                    };
                    console.log(
                        "iterator",
                        iterator.coin_family + "query data" + queryData.token_address
                    );

                    try {
                        let result: any = await coinGeckoHelper.coinGeckoCoinList(queryData);
                        if (result.status) {

                            if (result.data.id) {
                                let coinGeckoId = result?.data.id;
                                let img: any = result?.data.image;
                                if (!iterator.coin_image) {

                                    await coinQueries.update(
                                        { coin_gicko_id: coinGeckoId, coin_image: img },
                                        { coin_id: iterator.coin_id }
                                    )
                                } else {
                                    await coinQueries.update(
                                        { coin_gicko_id: coinGeckoId },
                                        { coin_id: iterator.coin_id }
                                    )
                                }
                            }
                        } else {
                            console.log("Result status false for this queryData", queryData);
                            await coinQueries.update(
                                { is_on_coin_gicko: 0 },
                                { coin_id: iterator.coin_id }
                            )
                        }
                    } catch (err: any) {
                        console.log("Error in getting cmc data 🔥 ~ ~", err.message);
                        // await coinQueries.update(
                        //     { is_on_coin_gicko: 0 },
                        //     { coin_id: iterator.coin_id }
                        // )
                    }
                }
            }
        } catch (err: any) {
            console.error("Error in fetchCoinGickoIds 🔥 ~ ~", err.message)
        }
    }
    public async updateWalletBalance(data: any) {
        try {
            console.log("Entered into updateBalance", data);
            if (data.queue_count < 5) {
                let balDetails: any = await blockChainHelper.getBalances(data.coin_data, data.wallet_address);
                if (balDetails.status) {

                    await walletQueries.update(
                        { balance: balDetails.balance },
                        { wallet_address: data.wallet_address, coin_id: data.coin_data.coin_id })
                } else {
                    await RabbitMq.assertQueue(config.BACKEND_WALLET_ADDRESSES);
                    await RabbitMq.sendToQueue(config.BACKEND_WALLET_ADDRESSES, Buffer.from(JSON.stringify(
                        {
                            coin_data: data.coin_data,
                            wallet_address: data.wallet_address,
                            queue_count: data.queue_count + 1
                        })))
                }
            }

        } catch (err: any) {
            console.error("Error in updateWalletBalance 🔥 ~ ~", err.message)
        }
    }
    public async expireRequest() {
        try {
            // let thirtyMinutesAgo: any = new Date(Date.now() - 3 * 60 * 1000).toISOString(); // 3 minutes
            let thirtyMinutesAgo: any = new Date(Date.now() - 30 * 60 * 1000).toISOString(); // 30 minutes

            console.log("Entered into expireRequest 30 min ago >>", thirtyMinutesAgo)

            await makerTrnxRequestQueries.destroy({
                status: 'pending',
                created_at: {
                    [Op.lte]: thirtyMinutesAgo
                }
            })
            await makerWalletQueries.destroy({
                status: 0,
                created_at: {
                    [Op.lte]: thirtyMinutesAgo
                }
            })
        } catch (err: any) {
            console.error("Error in expireRequest 🔥 ~ ~", err.message)
        }
    }
    public async getPendingTransactions() {
        try {
            let where: any = {
                type: 'cross_chain', order_id: { [Op.ne]: null }
                , [Op.or]: [{ order_status: 'pending' }, { order_status: 'processing' }]
            }

            let transactions: any = await trnxHistoryQueries.findAndCountAll(
                ['id', 'from_adrs', 'user_id', 'to_adrs', 'order_id', 'blockchain_status'],
                where,
                [['id', 'DESC']],
            );

            if (transactions.count > 0) {
                for await (const el of transactions.rows) {

                    if (el.blockchain_status == 'confirmed') {
                        await RabbitMq.assertQueue(config.PENDING_CROSS_CHAIN_TX_TOPIC);
                        await RabbitMq.sendToQueue(config.PENDING_CROSS_CHAIN_TX_TOPIC, Buffer.from(JSON.stringify(
                            {
                                id: el.id,
                                from_adrs: el.from_adrs,
                                user_id: el.user_id,
                                to_adrs: el.to_adrs,
                                order_id: el.order_id
                            })))

                        await trnxHistoryQueries.update(
                            { order_status: 'processing' },
                            { id: el.id }
                        )
                    } else if (el.blockchain_status == 'failed') {
                        await trnxHistoryQueries.update(
                            { order_status: 'failed' },
                            { id: el.id }
                        )
                    }
                }
            }
        } catch (err: any) {
            console.error("Error in getPendingTransactions 🔥 ~ ~", err.message)
        }

    }
}
const walletController = new WalletController();
export default walletController;
