import { OnlyControllerInterface } from "../../interfaces/controller.interface";
import { Request, Response } from "express";
import { rocketx_helper } from "./helper";
import response from "../../helpers/response/response.helpers";
import commonHelper from "../../helpers/common/common.helpers";
import { language } from "../../constants";
import { Op } from "sequelize";
import { changellyDetailsQueries, coin_queries, swapSettingQueries } from "../../helpers/dbHelper";
import RocketxSupportedCoinsModel from "../../models/model/model.rocketx_supported_coins";
import { RocketXNetworkId } from "../../constants/global_enum";

class rocketxController implements OnlyControllerInterface {
    constructor() {
        this.initialize();
    }

    public initialize() {

    }

    public getConfig = async (req: Request, res: Response) => {
        let lang: any = req.headers["content-language"] || "en";
        try {
            let result = await rocketx_helper.getConfig(req.params);

            if (result.status) {
                return response.success(res, {
                    data: {
                        status: true,
                        data: result.data,
                    },
                });
            } else {
                return response.error(res, {
                    data: {
                        status: false,
                        data: result.data,
                    },
                });
            }
        } catch (error: any) {
            console.error("Error in getConfig", error);
            await commonHelper.save_error_logs("getConfig", error.message);
            return response.error(res, {
                data: { message: error.message || language[lang].CATCH_MSG, data: {} },
            });
        }
    };

    public getTokens = async (req: Request, res: Response) => {
        let lang: any = req.headers["content-language"] || "en";
        try {
            const currentUTCDate: string = new Date().toISOString().replace(/T/, " ").replace(/\..+/, "");
            let result = await rocketx_helper.getTokens(req.params);

            if (result.status) {
                // Filter the result data to include only the desired network_ids
                /*
                const filteredData = result.data.filter((item: any) =>
                    ['TRON', 'ethereum', 'binance'].includes(item.network_id)
                );

                console.log("Filtered Data Length: ", filteredData.length); // This should be 314

                // Array to hold all the records to be inserted
                let recordsToInsert: any = [];

                for (const item of filteredData) {
                    let coinDataExist: any = await coin_queries.coin_find_one(
                        ["coin_id"],
                        { coin_family: RocketXNetworkId[item.network_id.toUpperCase()], token_address: item.contract_address, is_token: 1 }
                    );

                    console.log("🚀 ~ rocketxController ~ getTokens= ~ coinDataExist:", coinDataExist);

                    if ((coinDataExist && coinDataExist?.coin_id) || item?.is_native_token) {
                        // Collect data to insert into the recordsToInsert array
                        recordsToInsert.push({
                            rocketx_id: item.id,
                            token_name: item.token_name,
                            token_symbol: item.token_symbol,
                            coin_id: coinDataExist?.coin_id || 0,
                            rocketx_coin_id: item.coin_id,
                            icon_url: item.icon_url,
                            enabled: item.enabled,
                            score: item.score,
                            is_custom: item.is_custom,
                            is_native_token: item.is_native_token,
                            contract_address: item.contract_address,
                            network_id: item.network_id,
                            token_decimals: item.token_decimals,
                            chain_id: item.chainId,
                            walletless_enabled: item.walletless_enabled,
                            buy_enabled: item.buy_enabled,
                            sell_enabled: item.sell_enabled,
                            created_at: currentUTCDate,
                            updated_at: currentUTCDate
                        });
                    }
                }

                // Only insert once all records have been collected
                if (recordsToInsert.length > 0) {
                    await RocketxSupportedCoinsModel.bulkCreate(recordsToInsert);
                }
                */
                return response.success(res, {
                    data: {
                        status: true,
                        data: result.data,
                    },
                });
            } else {
                return response.error(res, {
                    data: {
                        status: false,
                        data: result.data,
                    },
                });
            }
        } catch (error: any) {
            console.error("Error in oxChain > oxChainQuotesApi.", error);
            await commonHelper.save_error_logs("oxChainQuotesApi", error.message);
            return response.error(res, {
                data: { message: error.message || language[lang].CATCH_MSG, data: {} },
            });
        }
    };




    public getAllTokens = async (req: Request, res: Response) => {
        let lang: any = req.headers["content-language"] || "en";
        try {
            const data: any = {
                params: req?.params,
                body: req?.body
            };

            let result = await rocketx_helper.getAllTokens(data);

            if (result.status) {
                return response.success(res, {
                    data: {
                        status: true,
                        data: result.data,
                    },
                });
            } else {
                return response.error(res, {
                    data: {
                        status: false,
                        data: result.data,
                    },
                });
            }
        } catch (error: any) {
            console.error("Error in getAllTokens", error);
            await commonHelper.save_error_logs("getAllTokens", error.message);
            return response.error(res, {
                data: { message: error.message || language[lang].CATCH_MSG, data: {} },
            });
        }
    };

    public getQuotation = async (req: Request, res: Response) => {
        let lang: any = req.headers["content-language"] || "en";
        try {
            let result = await rocketx_helper.getQuotation(req.query);

            if (result.status) {
                let commissionData: any = await changellyDetailsQueries.changellyDetailsFindOne(
                    ["id", "value"],
                    { type: 'cross_chain' }
                )
                let commission: string = "0";
                if (commissionData) {
                    commission = JSON.parse(commissionData.value).client_commission
                }
                
                return response.success(res, {
                    data: {
                        status: true,
                        data: result.data,
                        clientCommission: commission
                    },
                });
            } else {
                return response.error(res, {
                    data: {
                        status: false,
                        data: result.data,
                    },
                });
            }
        } catch (error: any) {
            console.error("Error in getQuotation", error);
            await commonHelper.save_error_logs("getQuotation", error.message);
            return response.error(res, {
                data: { message: error.message || language[lang].CATCH_MSG, data: {} },
            });
        }
    };

    public swapTrxn = async (req: Request, res: Response) => {
        let lang: any = req.headers["content-language"] || "en";
        try {
            let commissionDetails: any = await swapSettingQueries.swapSettingsFindOne(
                ['rocketx_fee', 'rocketx_slippage'],
                { id: 1 },
                [['id', 'ASC']]);

            let bodyData: any = req.body;

            bodyData.rocketx_fee = commissionDetails?.rocketx_fee;
            bodyData.rocketx_slippage = commissionDetails?.rocketx_slippage;

            const data: any = {
                body: bodyData
            };

            let result = await rocketx_helper.swapTrxn(data);

            if (result.status) {
                return response.success(res, {
                    data: {
                        status: true,
                        data: result.data,
                    },
                });
            } else {
                return response.error(res, {
                    data: {
                        status: false,
                        data: result.data,
                    },
                });
            }
        } catch (error: any) {
            console.error("Error in swapTrxn", error);
            await commonHelper.save_error_logs("swapTrxn", error.message);
            return response.error(res, {
                data: { message: error.message || language[lang].CATCH_MSG, data: {} },
            });
        }
    };

    public getStatus = async (req: Request, res: Response) => {
        let lang: any = req.headers["content-language"] || "en";
        try {
            let result = await rocketx_helper.getStatus(req.query);

            if (result.status) {
                return response.success(res, {
                    data: {
                        status: true,
                        data: result.data,
                    },
                });
            } else {
                return response.error(res, {
                    data: {
                        status: false,
                        data: result.data,
                    },
                });
            }
        } catch (error: any) {
            console.error("Error in getStatus", error);
            await commonHelper.save_error_logs("getStatus", error.message);
            return response.error(res, {
                data: { message: error.message || language[lang].CATCH_MSG, data: {} },
            });
        }
    };


    public async rocketxSupportedCrossChainCoins(req: Request, res: Response) {
        const lang = req.headers["content-language"] || "en";
        let { search, coinFamily, getPairsFor, fiatType, addressListKeys }: { search: string, coinFamily: number, getPairsFor: string, fiatType: string, addressListKeys: any } = req.body;
        try {
            console.log("req body changelly changellySupportedCrossChainCoins >>>", req.body)
            console.log("Entered into changellySupportedCrossChainCoins")

            let whereClause: any = { coin_id: { [Op.not]: null } }

            if (coinFamily) { console.log("coinFamily"); whereClause.coin_family = coinFamily }
            if (search) {
                console.log("search");
                search = `%${search}%`;
                whereClause[Op.or] = [
                    { name: { [Op.like]: search } },
                    { ticker: { [Op.like]: search } },
                    { full_name: { [Op.like]: search } }
                ]
            }
            console.log("whereClause", whereClause);

            let coinsData: any = await coin_queries.coinsJoinCoinPriceInFiatJoinRocketxJoinWallet(
                ["coin_id", "coin_name", "coin_symbol", "coin_image", "coin_family", "is_token", "token_type", "decimals", "token_address"],
                { coin_status: 1 },
                ["id", "value", "price_change_24h", "price_change_percentage_24h"],
                { fiat_type: fiatType },
                [
                    'id', 'rocketx_id', 'token_name', 'token_symbol', 'coin_id', 'rocketx_coin_id', 'icon_url',
                    'enabled', 'score', 'is_custom', 'is_native_token', 'contract_address', 'network_id',
                    'token_decimals', 'chain_id', 'walletless_enabled', 'buy_enabled', 'sell_enabled',
                    'created_at', 'updated_at'
                ],
                whereClause,
                ["wallet_id", "coin_id", "balance", "wallet_address"],
                { wallet_address: { [Op.in]: addressListKeys }, status: 1 }
            );

            coinsData = coinsData.map((coin: any) => {
                if (!coin.token_address && coin.coins_rocketx_rel?.contract_address) {
                    coin.token_address = coin.coins_rocketx_rel.contract_address;
                }
                return coin;
            });

            return response.success(res, {
                data: {
                    success: true,
                    message: language[lang].SUCCESS,
                    data: coinsData
                }
            });
        } catch (err: any) {
            console.error("Error in changellySupportedCrossChainCoins:", err.message);
            await commonHelper.save_error_logs("changellySupportedCrossChainCoins", err.message);
            return response.error(res, {
                data: {
                    message: language[lang].CATCH_MSG,
                },
            });
        }
    }

}
export const rocketx_Controller = new rocketxController();
