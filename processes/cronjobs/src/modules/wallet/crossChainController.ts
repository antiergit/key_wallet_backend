import { changellyCrossChainCoinQueries, notificationQueries, trnxHistoryQueries, userQueries, walletQueries } from "../../helpers/dbHelper/index";
import fs from "fs";
import crypto from 'crypto';
import axios from "axios";
import { config } from "../../config";
import { CHANGELLY_GET_STATUS } from './../../constants/globalEnum'
import { RabbitMq, blockChainHelper, bnbHelper, ethHelper, globalHelper, redisClient, tronHelper } from "../../helpers/common";
import BigNumber from 'bignumber.js';
import { Op } from "sequelize";

class CrossChainController {

    public async getTxDetails(data: {
        id: number,
        from_adrs: string | null,
        user_id: number,
        to_adrs: string,
        order_id: string | null
    }) {
        try {
            let privateKeyString = await fs.readFileSync(`${__dirname}/../../config/keys/${config.CHANGELLY.CHANGELLY_CROSS_CHAIN_PRIVATE_KEY_NAME}`, { encoding: "utf-8" })
            let privateKeyBuffer = Buffer.from(privateKeyString, 'hex');

            let payload: any = {
                jsonrpc: "2.0",
                id: "test",
                method: "getTransactions",
                params: {
                    id: data.order_id
                }
            }
            let signature: any = crypto.sign('sha256', Buffer.from(JSON.stringify(payload)), {
                key: privateKeyBuffer,
                type: 'pkcs8',
                format: 'der'
            });
            let headers: any = {
                'Content-Type': 'application/json',
                'X-Api-Key': `${config.CHANGELLY.CHANGELLY_CROSS_CHAIN_PUBLIC_API_KEY}`,
                'X-Api-Signature': signature.toString('base64')
            }

            let responseFromChangelly: any = await axios.post(
                `${config.CHANGELLY.CHANGELLY_CROSS_CHAIN_BASE_URL}`,
                payload,
                { headers })


            await crossChainController.setOrderStatus(responseFromChangelly.data, data)
        } catch (err: any) {
            console.error("Error in getTxDetails 🔥 ~ ~", err.message)
        }
    }
    public async setOrderStatus(resData: any, queueData: any) {
        try {
            let orderStatus: any = null;
            let orderReason: any = null;

            if (
                resData.result[0].status == CHANGELLY_GET_STATUS.WAITING ||
                resData.result[0].status == CHANGELLY_GET_STATUS.CONFIRMING ||
                resData.result[0].status == CHANGELLY_GET_STATUS.EXCHANGING ||
                resData.result[0].status == CHANGELLY_GET_STATUS.SENDING ||
                resData.result[0].status == CHANGELLY_GET_STATUS.HOLD) {

                console.log(`Order status is ${resData.result[0].status}`)
                orderStatus = 'pending';
                orderReason = resData.result[0].status;

            } else if (resData.result[0].status == CHANGELLY_GET_STATUS.FINISHED) {
                // Need to add conditions
                console.log(`Order status is ${resData.result[0].status}`)

                let transactionId: string = resData.result[0].payoutHash;

                let transactionExist: any = await trnxHistoryQueries.findOne(
                    ["id"],
                    { tx_id: transactionId }
                )

                if (transactionExist) {
                    orderStatus = 'completed';
                    orderReason = resData.result[0].status;

                } else {
                    orderStatus = 'pending';
                    orderReason = resData.result[0].status;

                    await crossChainController.updateInTrnxHistory(resData, transactionId, queueData)

                }
            } else if (
                resData.result[0].status == CHANGELLY_GET_STATUS.FAILED ||
                resData.result[0].status == CHANGELLY_GET_STATUS.REFUNDED ||
                resData.result[0].status == CHANGELLY_GET_STATUS.OVERDUE ||
                resData.result[0].status == CHANGELLY_GET_STATUS.EXPIRED) {

                console.log(`Order status is ${resData.result[0].status}`)
                orderStatus = 'failed';
                orderReason = resData.result[0].status;

            } else {
                console.log(`Order status is different response`)
                orderStatus = 'pending';
                orderReason = resData.result[0].status;
            }
            if (orderStatus) {
                await trnxHistoryQueries.update(
                    { order_status: orderStatus, order_reason: orderReason },
                    { id: queueData.id }
                )
            }
            console.log("Done Transaction Cross chain")
        } catch (err: any) {
            console.error("Error in setOrderStatus 🔥 ~ ~", err.message)
        }
    }
    public async updateInTrnxHistory(resData: any, transactionId: string, queueData: any) {
        try {
            // Get coin Details from Changelly Cross Chains Table
            let coinDetails: any = await changellyCrossChainCoinQueries.findOne(
                ["id", "coin_id", "coin_family", "is_token", "contract_address", "protocol"],
                { ticker: resData.result[0].currencyTo }
            )
            if (coinDetails.coin_family == 1 || coinDetails.coin_family == 2 || coinDetails.coin_family == 6) {

                if (coinDetails) {
                    let transactionDetails: any;

                    if (coinDetails.coin_family == 1) {
                        transactionDetails = await bnbHelper.getTrnxDetails(transactionId)
                    } else if (coinDetails.coin_family == 2) {
                        transactionDetails = await ethHelper.getTrnxDetails(transactionId)
                    } else if (coinDetails.coin_family == 6) {
                        transactionDetails = await tronHelper.getTransactionInfo(transactionId)
                    }
                    if (transactionDetails.status) {
                        // Update Wallets Table
                        await crossChainController.updateWallets(coinDetails, queueData.user_id, resData.result[0].payoutAddress)

                        // Update in Transaction  History
                        let transactionDataSaved: any = await trnxHistoryQueries.create({
                            user_id: 0,
                            to_user_id: queueData.user_id,
                            coin_id: coinDetails.coin_id,
                            coin_family: coinDetails.coin_family,
                            type: 'deposit',
                            referral_upgrade_level: null,
                            req_type: 'EXNG',
                            from_adrs: transactionDetails.data.fromAddress,
                            to_adrs: resData.result[0].payoutAddress,
                            tx_id: transactionId,
                            is_maker: null,
                            merchant_id: null,
                            order_id: null,
                            order_status: null,
                            order_reason: null,
                            tx_raw: null,
                            status: 'completed',
                            blockchain_status: 'confirmed',
                            amount: resData.result[0].amountTo,
                            block_id: transactionDetails.data.blockId,
                            block_hash: null,
                            speedup: null,
                            nonce: null,
                            tx_fee: 0,
                            swap_fee: null,
                            gas_limit: null,
                            gas_price: null,
                            gas_reverted: null,
                            fiat_price: null,
                            fiat_type: 'USD',
                            country_code: null

                        })
                        let transactionSavedId = transactionDataSaved.id;
                        // Update Notifications Table
                        await crossChainController.sendNotification(
                            transactionSavedId,
                            resData.result[0].amountTo,
                            coinDetails,
                            queueData.user_id,
                            resData.result[0].payoutAddress)

                    } else {
                        console.log("Transaction status is false")
                    }
                } else {
                    console.log("Coin details does not exist")
                }
            } else {
                console.log("It is btc transaction will get confirm from processes")
            }
        } catch (err: any) {
            console.error("Error in updateInTrnxHistory 🔥 ~ ~", err.message)
        }
    }
    public async updateWallets(coinDetails: any, userId: number, receiverWalletAddress: string) {
        try {

            let checkWalletExist: any = await walletQueries.findOne(
                ["wallet_id"],
                { wallet_address: receiverWalletAddress, coin_id: coinDetails.coin_id }
            )
            if (!checkWalletExist) {
                console.log("Wallet does not exist")
                // Create Wallet
                let userData: any = '';

                if (coinDetails.coin_family == config.STATIC_COIN_FAMILY.ETH) {
                    userData = await redisClient.getKeyValuePair(config.ETH.ETH_WALLET_ADDRESS, receiverWalletAddress.toUpperCase())
                } else if (coinDetails.coin_family == config.STATIC_COIN_FAMILY.BTC) {
                    userData = await redisClient.getKeyValuePair(config.BTC.BTC_WALLET_ADDRESS, receiverWalletAddress.toUpperCase())
                } else if (coinDetails.coin_family == config.STATIC_COIN_FAMILY.TRX) {
                    userData = await redisClient.getKeyValuePair(config.TRON.TRON_WALLET_ADDRESS, receiverWalletAddress.toUpperCase())
                } else if (coinDetails.coin_family == config.STATIC_COIN_FAMILY.BNB) {
                    userData = await redisClient.getKeyValuePair(config.BNB.BNB_WALLET_ADDRESS, receiverWalletAddress.toUpperCase())
                }

                userData = JSON.parse(userData);
                let walletName: string = userData.wallet_name;
                await walletQueries.create({
                    user_id: userId,
                    wallet_name: walletName,
                    checker_code: null,
                    wallet_address: receiverWalletAddress,
                    coin_id: coinDetails.coin_id,
                    coin_family: coinDetails.coin_family,
                    balance: 0,
                    balance_blocked: null,
                    user_withdraw_limit: null,
                    default_wallet: 1,
                    is_verified: 1,
                    status: 1,
                    is_deleted: null,
                    sort_order: null,
                    is_private_wallet: null
                })
            }
            let balDetails: any = await blockChainHelper.getBalances(
                {
                    coin_id: coinDetails.coin_id,
                    coin_family: coinDetails.coin_family,
                    is_token: coinDetails.is_token,
                    token_address: coinDetails.contract_address,
                    token_type: coinDetails.protocol
                }, receiverWalletAddress);

            if (balDetails.status) {

                await walletQueries.update(
                    { balance: balDetails.balance },
                    { wallet_address: receiverWalletAddress, coin_id: coinDetails.coin_id })
            } else {
                await RabbitMq.assertQueue(config.BACKEND_WALLET_ADDRESSES);
                await RabbitMq.sendToQueue(config.BACKEND_WALLET_ADDRESSES, Buffer.from(JSON.stringify(
                    {
                        coin_data: {
                            coin_id: coinDetails.coin_id,
                            coin_family: coinDetails.coin_family,
                            is_token: coinDetails.is_token,
                            token_address: coinDetails.contract_address,
                            token_type: coinDetails.protocol
                        },
                        wallet_address: receiverWalletAddress,
                        queue_count: 0
                    })))
            }

        } catch (err: any) {
            console.error("Error in updateWallets 🔥 ~ ~", err.message)
        }
    }
    public async sendNotification(transactionRowId: number, amount: any, coinDetails: any, userId: number, receiverWalletAddress: string) {
        try {
            let depositNotificationExist: any = await notificationQueries.findOne(
                ['notification_id', 'tx_type'],
                { tx_id: transactionRowId, tx_type: 'deposit' }
            )
            if (!depositNotificationExist) {
                let coinSymbol: string;

                if (coinDetails.coin_family == 3) {
                    coinSymbol = 'BTC';
                } else {
                    let key: any = (coinDetails.coin_family == 1) ? config.BNB.TOKEN_TYPE_BSC
                        : (coinDetails.coin_family == 2) ? config.ETH.TOKEN_TYPE_ETH
                            : (coinDetails.coin_family == 6) ? config.TRON.TOKEN_TYPE_TRON
                                : 'Not_PRESENT'

                    let coinsData: any =
                        await globalHelper.getCoinDetailsFromRedis(
                            key,
                            coinDetails.coin_id)

                    coinSymbol = (coinsData.coin_symbol).toUpperCase();
                }
                let am = amount.toString();
                let value: any = new BigNumber(am);
                value = value.toFixed()
                let notiMsg = `Deposit of ${value} ${coinSymbol} has been confirmed.`;
                let notificationData: any = {
                    message: notiMsg,
                    amount: amount,
                    from_user_id: 0,
                    to_user_id: userId,
                    wallet_address: receiverWalletAddress,
                    tx_id: transactionRowId,
                    coin_symbol: coinSymbol,
                    coin_id: coinDetails.coin_id,
                    tx_type: 'deposit',
                    notification_type: 'deposit',
                    state: "confirmed"
                };

                await notificationQueries.create(notificationData)

                let userData: any = await userQueries.userJoinDeviceTokenJoinMAkerWallets(
                    ["user_id"],
                    { user_id: userId },
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

                if (device_tokens) {
                    console.log("device_tokens device_tokens device_tokens >>>", device_tokens)

                    let message: any = {
                        tokens: device_tokens,
                        collapse_key: "type_a",
                        notification: {
                            title: 'DEPOSIT',
                            body: notiMsg
                        },
                        data: {
                            body: notiMsg,
                            title: 'DEPOSIT',
                            notification_type: "deposit",
                            tx_id: transactionRowId ? (transactionRowId).toString() : "",
                            tx_type: "deposit",
                            from_user_id: "0",
                            user_coin_id: coinDetails.coin_id ? (coinDetails.coin_id).toString() : ""
                        },
                    };

                    await globalHelper.addingCoinsToQueue(config.PUSH_NOTIFICATION_QUEUE, message)
                }

            } else {
                console.log("depositNotificationExist is present")
            }
        } catch (err: any) {
            console.error("Error in sendNotification 🔥 ~ ~", err.message)
        }
    }
    // public async getCrossChainSupportedCoins(){
    //     try{
    //         console.log("Entered into getCrossChainSupportedCoins >>>>");
    //         let privateKeyString = await fs.readFileSync(`${__dirname}/../../config/keys/${config.CHANGELLY.CHANGELLY_CROSS_CHAIN_PRIVATE_KEY_NAME}`, { encoding: "utf-8" })
    //         let privateKeyBuffer = Buffer.from(privateKeyString, 'hex');
    //         let payload: any = {
    //             jsonrpc: "2.0",
    //             id: "test",
    //             method: "getCurrenciesFull",
    //             params: {}
    //         }
    //         let signature: any = crypto.sign('sha256', Buffer.from(JSON.stringify(payload)), {
    //             key: privateKeyBuffer,
    //             type: 'pkcs8',
    //             format: 'der'
    //         });
    //         let headers: any = {
    //             'Content-Type': 'application/json',
    //             'X-Api-Key': `${config.CHANGELLY.CHANGELLY_CROSS_CHAIN_PUBLIC_API_KEY}`,
    //             'X-Api-Signature': signature.toString('base64')
    //         }

    //         let responseFromChangelly: any = await axios.post(
    //             `${config.CHANGELLY.CHANGELLY_CROSS_CHAIN_BASE_URL}`,
    //             payload,
    //             { headers })

    //         await crossChainController.updateCrosschainDataInDb(responseFromChangelly.data)
    //     }catch(err:any){
    //         console.error("Error in getCrossChainSupportedCoins 🔥 ~ ~", err.message)
    //     }
    // }

    // public async updateCrosschainDataInDb(coins: any) {
    //     try {
    //       let updateCoinIds: number[] = [];
    //       let newTokens: any[] = [];
    //       let total: number = 0;
    
    //       if (coins.result.length === 0) {
    //         console.log("No coins found.");
    //         return;
    //       }
    
    //       console.log("Processing Changelly coins...");
    
          // Filter relevant blockchains
        //   let relevantCoins: any = coins.result.filter((coin: any) =>
        //     ["binance_smart_chain", "ethereum", "bitcoin", "tron"].includes(
        //       coin.blockchain
        //     )
        //   );
    
        //   for (let coin of relevantCoins) {
        //     let isPrimaryCoin: any = ["bnbbsc", "eth", "btc", "trx"].includes(
        //       coin.ticker
        //     );
    
            // if (isPrimaryCoin) {
            //   let coinExist =
            //     await changellyCrossChainCoinQueries.findOne(
            //         ["id"],
            //     {is_token: 0,ticker: coin.ticker,blockchain: coin.blockchain}
            //     );
    
            //   if (coinExist) {
            //     await this.updateCoin(coinExist.id, coin);
            //     updateCoinIds.push(coinExist.id);
            //   }
            // } else if (coin.contractAddress) {
            //     total++;
            //   let tokenExist =
            //   await changellyCrossChainCoinQueries.findOne(
            //        ["id"],
            //     { is_token: 1, contract_address: coin.contractAddress }
            //     );
    
            //   if (tokenExist) {
            //     await this.updateCoin(tokenExist.id, coin);
            //     updateCoinIds.push(tokenExist.id);
            //   } else {
                // let coinId = await this.findOrCreateCoin(coin);
                // if (coinId > 0) {
                //   newTokens.push(this.createChangellyTokenRecord(coin, coinId));
                // }
            //   }
            // }
        //   }
    
          // Perform batch insert for new tokens
        //   if (newTokens.length > 0) {
        //     let newTokensIds :any =  await changellyCrossChainCoinQueries.bulkCreate(
        //       newTokens);
        //     updateCoinIds.push(...newTokensIds.map((token: any) => token.id));
        //   }
    
          // Set other coins to inactive
    //       if(updateCoinIds.length > 5){
    //         await changellyCrossChainCoinQueries.update(
    //             { status: 0 },
    //             { id: { [Op.notIn]: updateCoinIds } }
    //           );
    //       }
    
    //       console.log("Total new coins added:", total);
    //     } catch (err: any) {
    //       console.error("Error in updateCrosschainDataInDb 🔥 ~ ~", err.message);
    //     }
    //   }
    //   public async updateCoin(coinId: number, coin: any) {
    //     await changellyCrossChainCoinQueries.update(
    //       {
    //         name: coin.name,
    //         status: 1,
    //         full_name: coin.fullName,
    //         enabled: coin.enabled.toString(),
    //         enabled_from: coin.enabledFrom.toString(),
    //         enabled_to: coin.enabledTo.toString(),
    //         fix_rate_enabled: coin.fixRateEnabled.toString(),
    //         payin_confirmations: coin.payinConfirmations,
    //         address_url: coin.addressUrl,
    //         transaction_url: coin.transactionUrl,
    //         image: coin.image,
    //         fixed_time: coin.fixedTime,
    //         protocol: coin.protocol,
    //         blockchain_precision: coin.blockchainPrecision,
    //       },
    //       { id: coinId }
    //     );
    //   }

    //   public async findOrCreateCoin(coin: any) {
        // let coinExistInCoins = await Models.CoinsModel.findOne({
        //   attributes: ["coin_id"],
        //   where: { token_address: coin.contractAddress },
        //   raw: true,
        // });
    
        // if (!coinExistInCoins) {
        //   console.log("Adding new coin:", coin.contractAddress);
        //   return await changellyController.addCoinsToCoinTable(
        //     coin.contractAddress,
        //     this.getCoinFamily(coin.blockchain)
        //   );
        // }
    
        // return coinExistInCoins.coin_id;
    //   }

    //   public getCoinFamily(blockchain: string): number {
    //     switch (blockchain) {
    //       case "binance_smart_chain":
    //         return 1;
    //       case "ethereum":
    //         return 2;
    //       case "bitcoin":
    //         return 3;
    //       case "tron":
    //         return 6;
    //       default:
    //         return 0;
    //     }
    //   }

    //   public createChangellyTokenRecord(coin: any, coinId: number) {
    //     const coinFamily = this.getCoinFamily(coin.blockchain);
    //     return {
    //       name: coin.name,
    //       coin_id: coinId,
    //       status: 1,
    //       coin_family: coinFamily,
    //       is_token: 1,
    //       ticker: coin.ticker,
    //       full_name: coin.fullName,
    //       enabled: coin.enabled.toString(),
    //       enabled_from: coin.enabledFrom.toString(),
    //       enabled_to: coin.enabledTo.toString(),
    //       fix_rate_enabled: coin.fixRateEnabled.toString(),
    //       payin_confirmations: coin.payinConfirmations,
    //       address_url: coin.addressUrl,
    //       transaction_url: coin.transactionUrl,
    //       image: coin.image,
    //       fixed_time: coin.fixedTime,
    //       contract_address: coin.contractAddress,
    //       blockchain: coin.blockchain,
    //       protocol: coin.protocol,
    //       blockchain_precision: coin.blockchainPrecision,
    //       created_at: new Date(),
    //       updated_at: new Date(),
    //     };
    //   }

    //   public async addCoinsToCoinTable(tokenAddress: string, coinFamily: number) {
        // try {
        //   let tokenDetails: any = await global_helper.return_decimals_name_symbol(
        //     coinFamily,
        //     tokenAddress,
        //     "en"
        //   );
        //   if (tokenDetails) {
            // tokenDetails.decimals = tokenDetails.decimals.toString();
            // let swapData: any = await Models.SwapSettingsModel.findOne({
            //   attributes: ["id", "address", "percentage"],
            //   where: { id: 1 },
            //   raw: true,
            // });
    
            // let swapSupported: number = await global_helper.swapSupportedByMatcha(
            //   tokenAddress,
            //   coinFamily,
            //   swapData
            // );
    
            // let coinGickoData: any =
            //   await global_helper.get_coin_gicko_by_token_address(
            //     tokenAddress,
            //     coinFamily
            //   );
    
            // let image: any = coinGickoData ? coinGickoData.image : null;
            // let coinGeckoId: any = coinGickoData ? coinGickoData.id : null;
            // let gaslessStatus: any = null;
    
            // if (coinFamily == 2) {
            //   gaslessStatus = await global_helper.getGasLessStatus(
            //     tokenAddress,
            //     swapData
            //   );
            // }
            // tokenDetails.decimals = tokenDetails.decimals.toString();
            // let tokenType: string =
            //   coinFamily == 1
            //     ? "BEP20"
            //     : coinFamily == 2
            //     ? "ERC20"
            //     : coinFamily == 6
            //     ? "TRC20"
            //     : "NONE";
    
            // if (coinFamily == 1 || coinFamily == 2 || coinFamily == 6) {
            //   let coinData: any = {
            //     coin_name: tokenDetails.name,
            //     coin_symbol: tokenDetails.symbol.toUpperCase(),
            //     coin_image: image,
            //     cmc_id: null,
            //     coin_gicko_id: coinGeckoId,
            //     coin_gicko_alias: null,
            //     coin_family: coinFamily,
            //     coin_status: 1,
            //     is_token: 1,
            //     is_on_cmc: 1,
            //     for_swap: swapSupported,
            //     gasless: gaslessStatus,
            //     added_by: "admin",
            //     token_type: tokenType.toUpperCase(),
            //     decimals: Math.pow(10, parseInt(tokenDetails.decimals)),
            //     token_address: tokenAddress,
            //     created_at: new Date(),
            //     updated_at: new Date(),
            //     is_on_coin_gicko: 1,
            //   };
    
            //   let response: any = await Models.CoinsModel.create(coinData);
            //   coinData.coin_id = response.coin_id;
            //   await WalletHelper.update_token_in_redis(coinData, 0);
            //   return response.coin_id;
        //     } else {
        //       return 0;
        //     }
        //   } else {
        //     console.log("Not getting token details");
        //     return 0;
        //   }
    //     } catch (err: any) {
    //       console.error("Error in addCoinsToCoinTable 🔥 ~ ~", err.message);
    //       return 0;
    //     }
    //   }
    

}
const crossChainController = new CrossChainController();
export default crossChainController;
