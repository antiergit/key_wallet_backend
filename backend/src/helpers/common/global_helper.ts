import axios from "axios";
import { config } from "../../config";
import { ethWeb3 } from "./web3_eth_helpers";
import { GlblCoins, GlblMessages } from "../../constants/global_enum";
import { utxobtc } from "./web3_btc_helpers";
import { trxWeb3 } from "./web3_trx_helper";
import { CoinInterface, NotificationInterface } from "../../models";
import { AbiItem } from "web3-utils";
import { exponentialToDecimal } from "./globalFunctions";
import * as Models from '../../models/model/index';
import commonHelper from "./common.helpers";
import { bscWeb3 } from "./web3.bsc_helper";
import { URL as _URL, URLSearchParams as _URLSearchParams } from "url";
import { bsc_matcha_helper } from "../../modules/matcha/bscMatchaHelper";
import { eth_matcha_helper } from "../../modules/matcha/ethMatchHelper";
import rabbitMq from "./rabbitMq";


class Global_helper {
    getError(error: any) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log("error.response.data.message: ", error.response.data);
            return error.response.data.message
            // This will print: 'You run out of money. Top up your wallet.'
        } else if (error.request) {
            // The request was made but no response was received
            console.error("error.request: ", error.request);
            return error.request
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error: ', error.message);
            return error.message
        }
    }

    public async swapSupportedByMatcha(tokenAddress: string, coinFamily: number, swapData: any) {
        try {
            let responseDetails: any;
            console.log("Entered into swapSupportedByMatcha");
            if (coinFamily == 1) {
                responseDetails = await bsc_matcha_helper.getPriceOfBscToken(
                    {
                        sellToken: tokenAddress,
                        buyToken: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
                        sellAmount: "1000000000000000000",
                        slippagePercentage: "0.01",
                        takerAddress: "0xC9549DE1cD1958b2f6AC2E589eF3aE851d1E9879",
                        feeRecipient: swapData.address,
                        buyTokenPercentageFee: swapData.percentage
                    }
                )
            } else if (coinFamily == 2) {
                responseDetails = await eth_matcha_helper.getPriceOfEthToken(
                    {
                        sellToken: tokenAddress,
                        buyToken: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
                        sellAmount: "1000000000000000000",
                        slippagePercentage: "0.01",
                        takerAddress: "0xC9549DE1cD1958b2f6AC2E589eF3aE851d1E9879",
                        feeRecipient: swapData.address,
                        buyTokenPercentageFee: swapData.percentage
                    }
                )
            } else {
                console.log("Not entered into eth or bnb")
                responseDetails = { status: false }
            }
            if (responseDetails.status) {
                return 1;
            } else {
                return 0;
            }
        } catch (err: any) {
            console.error("Error in swapSupportedByMatcha", err);
            return 0;
        }
    }
    public async return_decimals_name_symbol(coin_family: number, token_address: string, lang: string) {
        try {
            let tokenDetails: any = { decimals: 0, name: "", symbol: "" }
            switch (coin_family) {
                case config.STATIC_COIN_FAMILY.BNB:
                    tokenDetails = await bscWeb3.searchToken(token_address, lang);
                    break;
                case config.STATIC_COIN_FAMILY.ETH:
                    tokenDetails = await ethWeb3.searchToken(token_address, lang);
                    break;
                case config.STATIC_COIN_FAMILY.TRX:
                    tokenDetails = await trxWeb3.searchToken(token_address, lang);
                    break;
            }
            return tokenDetails;
        } catch (err: any) {
            console.error("Error in return_decimals_name_symbol>>", err)
            await commonHelper.save_error_logs("return_decimals_name_symbol", err.message);
            return (null)
        }
    }
    public async validate_address(walletAddress: string, coinFamily: number) {
        try {
            switch (coinFamily) {
                case config.STATIC_COIN_FAMILY.BNB:
                    return await bscWeb3.validate_bnb_address(walletAddress);
                case config.STATIC_COIN_FAMILY.ETH:
                    return await ethWeb3.validate_eth_address(walletAddress);
                case config.STATIC_COIN_FAMILY.BTC:
                    return await utxobtc.validate_btc_address(walletAddress);
                case config.STATIC_COIN_FAMILY.TRX:
                    return await trxWeb3.validate_trx_address(walletAddress)
            }
        } catch (err: any) {
            console.error("Error in validate_address", err)
            await commonHelper.save_error_logs("validate_address", err.message);
            return false;
        }
    }
    public async get_new_token_balance(coinFamily: number, walletAddress: string, tokenAddress: string) {
        try {
            let tokenBalance: any;
            let userBalance: string = '';
            switch (coinFamily) {
                case config.STATIC_COIN_FAMILY.BNB:
                    tokenBalance = (await bscWeb3.get_bep20_token_balance(tokenAddress, config.CONTRACT_ABI as AbiItem[], walletAddress))?.toString();
                    userBalance = exponentialToDecimal(Number(tokenBalance))
                    break;
                case config.STATIC_COIN_FAMILY.ETH:
                    tokenBalance = (await ethWeb3.get_erc20_token_balance(tokenAddress, config.CONTRACT_ABI as AbiItem[], walletAddress))?.toString();
                    userBalance = exponentialToDecimal(Number(tokenBalance))
                    break;
                case config.STATIC_COIN_FAMILY.TRX:
                    userBalance = (await trxWeb3.TRC20_Token_Balance(walletAddress, tokenAddress))?.toString()
                    break;
                default:
                    throw GlblMessages.INVALID_COIN_FAMILY
            }
            return { status: true, balance: userBalance };
        } catch (err: any) {
            console.error("Error in get_new_token_balance.", err)
            await commonHelper.save_error_logs("get_new_token_balance", err.message);
            return { status: false, balance: '0' };
        }
    }
    public async find_plateform(coin_family: number) {
        try {
            const coingecko_platforms_ids = [
                {
                    id: "ethereum",
                    name: "ethereum",
                    shortname: "ETH",
                    coin_family: config.STATIC_COIN_FAMILY.ETH,
                    symbol: GlblCoins.ETH
                },
                {
                    id: "bitcoin",
                    name: "bitcoin",
                    shortname: "BTC",
                    coin_family: config.STATIC_COIN_FAMILY.BTC,
                    symbol: GlblCoins.BTC
                },
                {
                    id: "TRON",
                    name: "TRON",
                    shortname: "TRON",
                    coin_family: config.STATIC_COIN_FAMILY.TRX,
                    symbol: GlblCoins.TRX
                },
                {
                    id: "binance",
                    name: "BNB",
                    shortname: "BNB",
                    coin_family: config.STATIC_COIN_FAMILY.BNB,
                    symbol: GlblCoins.BNB
                },
            ];
            const platform_id: any = await coingecko_platforms_ids.find((pd) => pd.coin_family == coin_family);
            return platform_id;
        } catch (err: any) {
            console.error("Error in findPlateForm helper", err)
            await commonHelper.save_error_logs("find_plateform", err.message);
            return null;
        }
    }

    public async UpdateCmcImgUrl(image_url: string) {
        try {
            if (image_url.includes("img/coins/16x16/")) {
                image_url = image_url.replace('16x16', '200x200');
            } else if (image_url.includes("img/coins/32x32/")) {
                image_url = image_url.replace('32x32', '200x200');
            } else if (image_url.includes("img/coins/64x64/")) {
                image_url = image_url.replace('64x64', '200x200');
            } else if (image_url.includes("img/coins/128x128/")) {
                image_url = image_url.replace('128x128', '200x200');
            }
            return image_url;
        } catch (err: any) {
            console.error(`UpdateCmcImgUrl error>>> `, err)
            return 'null';
        }
    }

    public async get_wallet_balance(coinData: CoinInterface, wallet_address: string) {
        try {
            let balance: string | any = '0';
            switch (coinData.coin_family) {
                case config.STATIC_COIN_FAMILY.BNB:
                    balance = (await bscWeb3.get_balance(coinData, wallet_address))?.toString()
                    break;
                case config.STATIC_COIN_FAMILY.ETH:
                    balance = (await ethWeb3.get_balance(coinData, wallet_address))?.toString()
                    break;
                case config.STATIC_COIN_FAMILY.BTC:
                    balance = (await utxobtc.get_balance(wallet_address))?.toString()
                    break;
                case config.STATIC_COIN_FAMILY.TRX:
                    balance = (await trxWeb3.Fetch_Balance(wallet_address, coinData))?.toString()
                    break;
            }
            return { status: true, balance: balance };
        } catch (err: any) {
            console.error("Error in get_wallet_balance.", err)
            await commonHelper.save_error_logs("get_wallet_balance", err.message);
            return { status: false, balance: '0' };
        }
    }
    public async fetch_data(method: string, url: string, header: Object) {
        try {
            let config_data: any = {
                method: method,
                url: url,
                headers: header
            }
            let return_data: any;
            await axios(config_data)
                .then(function (response) {
                    return_data = response?.data;
                    return response?.data;
                })
                .catch(function (err: any) {
                    console.error('axios catch error', err.message);
                    return_data = null;
                    return null;
                });
            return return_data;
        } catch (err: any) {
            console.error('🔥 ~ ~ fetch_data error', err);
            return null;
        }
    }
    public subtractDays(date: any, days: number) {
        date.setDate(date.getDate() - days);
        return date;
    }
    public subtractMonths(date: any, months: number) {
        date.setMonth(date.getMonth() - months);
        return date;
    }
    public async save_notification(object: NotificationInterface) {
        try {
            await Models.NotificationModel.create(object)
            return true;
        } catch (err: any) {
            console.error("Error in save_notification>>>>", err)
            return false;
        }
    }
    public async SendNotification(data: any) {
        try {
            let toUserId: number = data.to_user_id ? data.to_user_id : 0;
            
            // Get user device tokens
            let userData: any = await Models.UsersModel.findOne({
                where: { user_id: toUserId },
                include: [
                    {
                        model: Models.DeviceTokenModel,
                        as: 'user_device_token_data',
                        where: { push: 1 },
                        required: false
                    }
                ]
            });
            
            let device_tokens: any = [];
            
            // Check if user_device_token_data exists and is an array
            if (userData && userData.user_device_token_data && Array.isArray(userData.user_device_token_data)) {
                device_tokens = device_tokens.concat(userData.user_device_token_data.map((item: any) => item.device_token));
            }
            
            // // Check if notification already exists
            // const checkOldNotif: any = await Models.NotificationModel.count({
            //     where: {
            //         to_user_id: toUserId,
            //         notification_type: data.notification_type,
            //         tx_id: data.tx_id,
            //         tx_type: data.tx_type
            //     }
            // });
            
           // if (checkOldNotif === 0) {
                // Create notification in database
                let notificationData: any = {
                    message: data.message,
                    amount: data.amount,
                    from_user_id: data.from_user_id ? data.from_user_id : 0,
                    to_user_id: toUserId,
                    notification_type: data.notification_type,
                    tx_id: data.tx_id,
                    tx_type: data.tx_type,
                    coin_symbol: data.coin_symbol,
                    coin_id: data.coin_id,
                    view_status: 0,
                    state: data.state || "0",
                    wallet_address: data.wallet_address,
                    created_at: new Date(),
                    updated_at: new Date()
                };
                
                await Models.NotificationModel.create(notificationData);
           // }
            
            // Send push notification if device tokens exist
            if (device_tokens && device_tokens.length > 0) {
                let message = {
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
                    },
                };
                
                // Add to notification queue
                await this.addingCoinsToQueue(config.PUSH_NOTIFICATION_QUEUE, message);
            }
            
            return true;
        } catch (error: any) {
            console.error(`SendNotification error >>>`, error);
            return false;
        }
    }
    
    public async addingCoinsToQueue(queueName: string, data: any) {
        try {
            await rabbitMq.assertQueue(queueName);
            await rabbitMq.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
            return true;
        } catch (err: any) {
            console.error("Error in addingCoinsToQueue>>>", err);
            return false;
        }
    }

    public async get_coin_family_from_blockchain(coin: string) {
        try {
            let coin_family: number = 0
            coin = coin.toLowerCase()
            if (coin == "eth") {
                coin_family = config.STATIC_COIN_FAMILY.ETH;
            }
            if (coin == "btc") {
                coin_family = config.STATIC_COIN_FAMILY.BTC;
            }
            if (coin == 'trx') {
                coin_family = config.STATIC_COIN_FAMILY.TRX;
            }
            if (coin == 'bnb') {
                coin_family = config.STATIC_COIN_FAMILY.BNB;
            }
            return coin_family;
        } catch (err: any) {
            console.error("Error in get_coin_family_from_blockchain>>", err)
            throw 0;
        }
    }
    public async get_token_image_from_coin_gicko(data: any) {
        try {
            let result: any = await this.coin_gicko_market_info_data('usd', data);
            let image: any;
            let id: any;
            if (result.data.length) {
                image = result.data[0].image;
                id = result.data[0].id;
            }
            // let imageUrl: any = await this.UpdateCmcImgUrl(image)
            return { image: image, id: id };
        } catch (err: any) {
            console.error("Error in get_token_image_from_coin_gicko", err);
            return null;
        }
    }

    public async get_coin_gicko_by_token_address(token_address: string, coin_family: number) {
        try {
            let url: any;
            if (coin_family == 2) {
                url = `https://pro-api.coingecko.com/api/v3/coins/ethereum/contract/${token_address}`

            }
            else if (coin_family == 1) {
                url = `https://pro-api.coingecko.com/api/v3/coins/binance-smart-chain/contract/${token_address}`
            }
            else if (coin_family == 6) {
                url = `https://pro-api.coingecko.com/api/v3/coins/tron/contract/${token_address}`
            }

            // let url: any = `${config.COIN_GECKO.COIN_GECKO_BY_TOKEN}/${}`

            console.log("url::", url);
            const headers = {
                'x-cg-pro-api-key': config.COIN_GECKO.API_KEY,
            };


            const response = await axios.get(url, { headers });

            console.log("result::", response.data);
            //console.log("result1::",response.data[0]);


            if (response?.data?.id) {
                return { id: response?.data?.id, image: response?.data?.image?.small };
            }
            else {
                console.log(`token address ${token_address} does not exist on coingecko`)
                return null;
            }

        } catch (err: any) {
            console.log("Error in coinGicko_info_data>>>", err);
            return null;
        }
    }
    public async getGasLessStatus(tokenAddress: string, swapData: any) {
        try {

            let configData: any = {
                method: 'get',
                url: `https://api.0x.org/tx-relay/v1/swap/price?buyToken=0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee&sellAmount=10000000000000000000&sellToken=${tokenAddress}&takerAddress=0x967b464F8010587C50B6A2Df847F96e7d1041CEB&slippagePercentage=0.01&feeRecipient=${swapData.address}&buyTokenPercentageFee=${swapData.percentage}`,
                headers: {
                    '0x-chain-id': '1',
                    '0x-api-key': config.MATCHA_API_KEY
                }
            };

            let response: any = await axios(configData)
            return 1;
        } catch (err: any) {
            console.error("Error in getGasLessStatus>>>", err)
            return null;
        }
    }

    public async coin_gicko_market_info_data(currency: any, coin_gicko_id: any) {
        try {
            let result: any = [];

            let url: any = new URL(`${config.COIN_GECKO.COIN_GECKO_MARKET}`)
            url.searchParams.append("ids", coin_gicko_id);
            url.searchParams.append("vs_currency", currency);
            url.searchParams.append("x_cg_pro_api_key", config.COIN_GECKO.API_KEY);


            result = await axios({
                method: "get",
                url: url,
            });
            console.log("result::", result);
            return result;
        } catch (err: any) {
            console.error("Error in coin_gicko_market_info_data>>>", err);
            throw err;
        }
    }

    public async coinGecko_quotes_latest_api(
        currency: any,
        coin_glicko_id: any
    ) {
        try {
            let result: any = await this.coin_gicko_market_info_data(
                currency,
                coin_glicko_id,
            );
            let marketData: any;
            let price: any;
            if (result.data.length) {
                marketData = result.data[0];
            }
            console.log("result::", marketData);
            return { data: marketData };
        } catch (err: any) {
            console.error("Error in coinGecko_quotes_latest_api", err);
            return null;
        }
    }
    public async coin_gicko_price_data(currencies: any, coin_gicko_id: any) {
        try {
            let result: any = [];

            let url: any = new URL(`${config.COIN_GECKO.COIN_GECKO_PRICE}`)
            url.searchParams.append("ids", coin_gicko_id);

            url.searchParams.append("vs_currencies", currencies);
            url.searchParams.append("include_market_cap", true);
            url.searchParams.append("include_24hr_vol", true);
            url.searchParams.append("include_24hr_change", true);
            url.searchParams.append("x_cg_pro_api_key", config.COIN_GECKO.API_KEY);



            result = await axios({
                method: "get",
                url: url
            });

            return result;
        } catch (err: any) {
            console.error("Error in coin_glicko_price_data>>>", err);
            throw err;
        }
    }




}
export const global_helper = new Global_helper();
