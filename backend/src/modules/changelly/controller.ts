import { language } from "../../constants";
import response from "../../helpers/response/response.helpers";
import { OnlyControllerInterface } from "../../interfaces/controller.interface";
import { Request, Response } from "express";
import commonHelper from "../../helpers/common/common.helpers";
import { changellyHelper } from "./helper";
import { changellyDetailsQueries, changellyOnOffRampOrdersQueries, changellySupportedCountriesQueries, changellySupportedCrossChainCoinQueries, changellySupportedOnOffRampsQueries, changellySupportedProvidersQueries, changellyWebhooksQueries, coin_queries } from "../../helpers/dbHelper";
import { Op } from "sequelize";
import { config } from "../../config";
import { global_helper } from "../../helpers/common/global_helper";

class ChangellyController implements OnlyControllerInterface {
    constructor() {
        this.initialize();
    }

    public initialize() { }


    public async getChangellyData(req: Request, res: Response) {
        const lang = req.headers["content-language"] || "en";
        try {
            console.log(`Entered into getChangellyData`, req.params.fx);
            let fx: string = (req.params.fx).toString();

            // Get All Currencies Supported by Changelly ==> getCurrencies
            // Get CryptoCurrencies Full Details  ==> getCurrenciesFull
            // Get Available Pairs  ==> getPairs

            // Get Available Pair Limits ==> getPairsParams (Available for some time)
            // Get Minimum Amount for floating rate Transactions ==> getMinAmount  (Available for some time)

            // Create Users ==> createSubaccount (Not Working) ==> Error  {code: -32603,message: "The method is not allowed for api key"}
            // Update Users ==> updateSubaccount (Not Working) ==> Error  {code: -32603,message: "The method is not allowed for api key"}

            // Floating Estimated Exchange ==> getExchangeAmount
            // Floating Create Transaction ==> createTransaction
            // Estimated Fixed Rate Exchange ==> getFixRateForAmount
            // Create Fixed Rate Transaction ==> createFixTransaction

            // Get Fixed Rate ==> getFixRate (Deprecated)

            // Get Transactions ==> getTransactions
            // Get Transaction Status  ==> getStatus
            // Validate Address ==> validateAddress


            let payload: any = await changellyHelper.getReqBody(fx);
            let headers: any = await changellyHelper.getHeader(payload);
            let responseData: any = await changellyHelper.getResponseData(payload, headers);

            return response.success(res, {
                data: {
                    status: true,
                    data: responseData.data
                }
            });
        } catch (err: any) {
            console.error("Error in getChangellyData:", err.message);
            await commonHelper.save_error_logs("getChangellyData", err.message);
            return response.error(res, {
                data: {
                    message: language[lang].CATCH_MSG,
                },
            });
        }
    }
    async OnOffRampTesting(req: Request, res: Response) {
        const lang = req.headers["content-language"] || "en";
        try {
            console.log(`Entered into OnOffRampTesting`, req.params.fx);
            let fx: string = (req.params.fx).toString();
            let headers: any = await changellyHelper.getHeaderOfOnOffRampTesting(fx);
            let responseData: any = await changellyHelper.getResponseDataOfOnOffRampTesting(headers, fx);

            return response.success(res, {
                data: {
                    status: true,
                    data: responseData.data
                }
            });
        } catch (err: any) {
            console.error("Error in OnOffRampTesting:", err.message);
            await commonHelper.save_error_logs("OnOffRampTesting", err.message);
            return response.error(res, {
                data: {
                    message: language[lang].CATCH_MSG,
                },
            });
        }
    }
    //==============================================
    // Cross - Chain
    public async changellySupportedCrossChainCoins(req: Request, res: Response) {
        const lang = req.headers["content-language"] || "en";
        let { search, coinFamily, getPairsFor, fiatType, addressListKeys }: { search: string, coinFamily: number, getPairsFor: string, fiatType: string, addressListKeys: any } = req.body;
        try {
            console.log("req body changelly changellySupportedCrossChainCoins >>>", req.body)
            console.log("Entered into changellySupportedCrossChainCoins")

            let whereClause: any = { status: 1, coin_id: { [Op.not]: null } }

            if (getPairsFor) {
                // Get Data from Third Party
                try {
                    let payload: any = {
                        jsonrpc: "2.0",
                        id: "test",
                        method: "getPairs",
                        params: {
                            from: getPairsFor.toLowerCase(),
                            txType: "fixed" // fixed, float
                        }
                    }
                    let headers: any = await changellyHelper.getHeader(payload);
                    let responseData: any = await changellyHelper.getResponseData(payload, headers);
                    console.log("🚀 ~ ChangellyController ~ changellySupportedCrossChainCoins ~ responseData:", responseData.data)
                    let toValues: any = responseData.data.result.map((item: any) => item.to);
                    console.log("🚀 ~ ChangellyController ~ changellySupportedCrossChainCoins ~ toValues:", toValues)

                    whereClause.ticker = { [Op.in]: toValues }
                    whereClause.enabled_to = "true";
                } catch (err: any) {
                    console.error("Error in changellySupportedCrossChainCoins From Third Party:", err.message);
                    await commonHelper.save_error_logs("changellySupportedCrossChainCoins Third Party", err.message);
                    return response.error(res, {
                        data: {
                            message: language[lang].CATCH_MSG,
                        },
                    });
                }
            } else {
                whereClause.enabled_from = "true";
            }
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


            let coinsData: any = await coin_queries.coinsJoinCoinPriceInFiatJoinChangellyJoinWallet(
                ["coin_id", "coin_name", "coin_symbol", "coin_image", "coin_family", "is_token", "token_type", "decimals", "token_address"],
                { coin_status: 1 },
                ["id", "value", "price_change_24h", "price_change_percentage_24h"],
                { fiat_type: fiatType },
                ['id', 'name', 'status', 'coin_id', ['coin_family', 'coinFamily'], ['is_token', 'isToken'], 'ticker', ['full_name', 'fullName'], 'enabled', ['enabled_from', 'enabledFrom'], ['enabled_to', 'enabledTo'], ['fix_rate_enabled', 'fixRateEnabled'], ['payin_confirmations', 'payinConfirmations'], ['address_url', 'AddressUrl'], ['transaction_url', 'transactionUrl'], 'image', ['fixed_time', 'fixedTime'], ['contract_address', 'contractAddress'], 'protocol', 'blockchain', ['blockchain_precision', 'blockchainPrecision'], 'created_at', 'updated_at'],
                whereClause,
                ["wallet_id", "coin_id", "balance", "wallet_address"],
                { wallet_address: { [Op.in]: addressListKeys }, status: 1 }
            )

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

    public async changellySupportedCrossChainCoins2(req: Request, res: Response) {
        const lang = req.headers["content-language"] || "en";
        let { search, coinFamily, getPairsFor, fiatType, addressListKeys, selectedCoinId, isChangellyCoin }: { search: string, coinFamily: number, getPairsFor: string, fiatType: string, addressListKeys: any, selectedCoinId: any, isChangellyCoin:boolean } = req.body;

        try {
            console.log("req body changelly changellySupportedCrossChainCoins >>>", req.body);
            console.log("Entered into changellySupportedCrossChainCoins");

            let whereClause: any = { status: 1, coin_id: { [Op.not]: null } };
            let whereClause2: any = { coin_id: { [Op.not]: null } };

            if (getPairsFor && isChangellyCoin) {
                // Get Data from Third Party
                try {
                    let payload: any = {
                        jsonrpc: "2.0",
                        id: "test",
                        method: "getPairs",
                        params: {
                            from: getPairsFor.toLowerCase(),
                            txType: "fixed", // fixed, float
                        }
                    };
                    let headers: any = await changellyHelper.getHeader(payload);
                    let responseData: any = await changellyHelper.getResponseData(payload, headers);
                    let toValues: any = responseData.data.result.map((item: any) => item.to);

                    whereClause.ticker = { [Op.in]: toValues };
                    whereClause.enabled_to = "true";
                } catch (err: any) {
                    console.error("Error in changellySupportedCrossChainCoins From Third Party:", err.message);
                    await commonHelper.save_error_logs("changellySupportedCrossChainCoins Third Party", err.message);
                    return response.error(res, {
                        data: {
                            message: language[lang].CATCH_MSG,
                        },
                    });
                }
            } else {
                whereClause.enabled_from = "true";
            }

            if (coinFamily) { whereClause.coin_family = coinFamily }
            if (search) {
                search = `%${search}%`;
                whereClause[Op.or] = [
                    { name: { [Op.like]: search } },
                    { ticker: { [Op.like]: search } },
                    { full_name: { [Op.like]: search } }
                ];
            }

            // Fetch data from both queries
            let changellyData: any = await coin_queries.coinsJoinCoinPriceInFiatJoinChangellyJoinWallet(
                ["coin_id", "coin_name", "coin_symbol", "coin_image", "coin_family", "is_token", "token_type", "decimals", "token_address"],
                { coin_status: 1 },
                ["id", "value", "price_change_24h", "price_change_percentage_24h"],
                { fiat_type: fiatType },
                [
                    'id', 'name', 'status', 'coin_id', ['coin_family', 'coinFamily'], ['is_token', 'isToken'], 'ticker',
                    ['full_name', 'fullName'], 'enabled', ['enabled_from', 'enabledFrom'], ['enabled_to', 'enabledTo'],
                    ['fix_rate_enabled', 'fixRateEnabled'], ['payin_confirmations', 'payinConfirmations'],
                    ['address_url', 'AddressUrl'], ['transaction_url', 'transactionUrl'], 'image',
                    ['fixed_time', 'fixedTime'], ['contract_address', 'contractAddress'], 'protocol', 'blockchain',
                    ['blockchain_precision', 'blockchainPrecision'], 'created_at', 'updated_at'
                ],
                whereClause,
                ["wallet_id", "coin_id", "balance", "wallet_address"],
                { wallet_address: { [Op.in]: addressListKeys }, status: 1 }
            );

            let rocketxData: any = await coin_queries.coinsJoinCoinPriceInFiatJoinRocketxJoinWallet(
                ["coin_id", "coin_name", "coin_symbol", "coin_image", "coin_family", "is_token", "token_type", "decimals", "token_address"],
                { coin_status: 1 },
                ["id", "value", "price_change_24h", "price_change_percentage_24h"],
                { fiat_type: fiatType },
                [
                    'id', 'rocketx_id', 'token_name', 'token_symbol', 'coin_id', 'rocketx_coin_id', 'icon_url', 'enabled',
                    'score', 'is_custom', 'is_native_token', 'contract_address', 'network_id', 'token_decimals',
                    'chain_id', 'walletless_enabled', 'buy_enabled', 'sell_enabled', 'created_at', 'updated_at'
                ],
                whereClause2,
                ["wallet_id", "coin_id", "balance", "wallet_address"],
                { wallet_address: { [Op.in]: addressListKeys }, status: 1 }
            );

            // Merging data without checking uniqueness, as you requested
            let mergedData: any = [];

            rocketxData.forEach((coin: any) => {
                if (!coin.token_address && coin.coins_rocketx_rel?.contract_address) {
                    coin.token_address = coin.coins_rocketx_rel.contract_address;
                }
                mergedData.push(coin);
            });

            changellyData.forEach((coin: any) => {
                mergedData.push(coin);
            });

            if (selectedCoinId) {
                mergedData = mergedData.filter((item: any) => item.coin_id !== selectedCoinId);
            }            

            // Return raw merged data
            return response.success(res, {
                data: {
                    success: true,
                    message: language[lang].SUCCESS,
                    data: mergedData,
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
    public async minAmount(req: Request, res: Response) {
        const lang = req.headers["content-language"] || "en";
        let { from, to, amountFrom, fiatType, coinIds, fromCryptoSymbol }: { from: string, to: string, amountFrom: string, fiatType: string, coinIds: any, fromCryptoSymbol: string } = req.body;
        try {
            console.log("req body changelly minAmount >>>", req.body)
            console.log("Entered into minAmount")

            let payload: any = {
                jsonrpc: "2.0",
                id: "test",
                method: "getExchangeAmount",
                params: {
                    from: from.toLowerCase(),
                    to: to.toLowerCase(),
                    amountFrom: amountFrom
                }
            }
            let headers: any = await changellyHelper.getHeader(payload);
            let responseData: any = await changellyHelper.getResponseData(payload, headers);
            console.log("🚀 ~ ChangellyController ~ minAmount ~ responseData:", responseData)

            if (responseData?.data?.error?.message?.includes("Invalid amount for pair")) {
                console.log("Getting Error Invalid amount for pair");
                 //let errMsg: string = language[lang].CHANGE_MIN_AMOUNT(responseData?.data?.error?.data?.limits?.min?.from, fromCryptoSymbol);
                let errMsg: string;
                const errorMessage = responseData?.data?.error?.message;
              
                if (errorMessage?.includes("Maximum amount")) {
                    const maxAmount = responseData?.data?.error?.data?.limits?.max?.from;
                    errMsg = language[lang].CHANGE_MAX_AMOUNT(maxAmount, fromCryptoSymbol);
                } else if (errorMessage?.includes("Minimal amount")) {
                    const minAmount = responseData?.data?.error?.data?.limits?.min?.from;
                    errMsg = language[lang].CHANGE_MIN_AMOUNT(minAmount, fromCryptoSymbol);
                } else {
                    errMsg = "Invalid amount for pair.";
                }

                responseData.data.error.message = errMsg;

                return response.error(res, {
                    data: {
                        message: errMsg,
                        data: responseData?.data
                    },
                });
            } else if (responseData?.data?.error) {
                console.log("Received different error:", responseData.data.error.message);
                return response.error(res, {
                    data: {
                        message: responseData.data.error.message,
                        data: responseData?.data
                    },
                });
            }

            let coinPriceFiatData: any = await coin_queries.coinsJoinCoinPriceInFiat(
                ["coin_id", "coin_symbol"],
                ["id", "value", "price_change_24h", "price_change_percentage_24h"],
                { coin_id: { [Op.in]: coinIds }, coin_status: 1 },
                { fiat_type: fiatType }
            )
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
                    success: true,
                    message: language[lang].SUCCESS,
                    coinPriceFiatData: coinPriceFiatData,
                    data: responseData.data,
                    clientCommission: commission
                }
            });
        } catch (err: any) {
            console.error("Error in minAmount:", err.message);
            await commonHelper.save_error_logs("minAmount", err.message);
            return response.error(res, {
                data: {
                    message: language[lang].CATCH_MSG,
                },
            });
        }
    }
    public async createTransaction(req: Request, res: Response) {
        const lang = req.headers["content-language"] || "en";
        let { from, to, amountFrom, fromAddress, toAddress }: { from: string, to: string, amountFrom: string, fromAddress: string, toAddress: string } = req.body;
        try {
            console.log("req body changelly createTransaction >>>", req.body)
            console.log("Entered into createTransaction")
            let payload: any = {
                jsonrpc: "2.0",
                id: "test",
                method: "createTransaction",
                params: {
                    from: from.toLowerCase(),
                    to: to.toLowerCase(),
                    amountFrom: amountFrom,
                    address: toAddress,
                    refundAddress: fromAddress, // Refund to user who made transaction
                    fromAddress: fromAddress
                }
            }
            let headers: any = await changellyHelper.getHeader(payload);
            let responseData: any = await changellyHelper.getResponseData(payload, headers);

            if (responseData?.data?.error) {
                console.log("Received different error:", responseData.data.error.message);
                return response.error(res, {
                    data: {
                        message: responseData.data.error.message,
                        data: responseData?.data
                    },
                });
            }

            return response.success(res, {
                data: {
                    success: true,
                    message: language[lang].SUCCESS,
                    data: responseData.data
                }
            });
        } catch (err: any) {
            console.error("Error in createTransaction:", err.message);
            await commonHelper.save_error_logs("createTransaction", err.message);
            return response.error(res, {
                data: {
                    message: language[lang].CATCH_MSG,
                },
            });
        }
    }
    // On - Off Ramp
    public async onOffRampListing(req: Request, res: Response) {
        const lang = req.headers["content-language"] || "en";
        let { fiatType, addressListKeys }: { fiatType: string, addressListKeys: any } = req.body;
        try {
            console.log("req body changelly onOffRampListing >>>", req.body)
            let onOffRampCountries: any = await changellySupportedCountriesQueries.changellySupportedCountriesFindAll(
                ['id', 'code', 'name', 'status', 'state_code'],
                { status: 1 },
                [['name', 'ASC']]
            )
            let onOffRampFiats: any = await changellySupportedOnOffRampsQueries.changellySupportedOnOffRampsFindAll(
                ['id', 'type', 'ticker', 'name', 'icon_url', 'changelly_precision'],
                { status: 1, type: 'fiat' },
                [['name', 'ASC']]
            )
            let onOffRampCryptos: any = await coin_queries.coinsJoinCoinPriceInFiatJoinChangellyOnOffRampJoinWallet(
                ["coin_id", "coin_name", "coin_symbol", "coin_image", "coin_family", "is_token", "token_type", "decimals", "token_address"],
                { coin_status: 1 },
                ["id", "value", "price_change_24h", "price_change_percentage_24h"],
                { fiat_type: fiatType },
                ['id', 'type', 'coin_id', 'ticker', 'name', 'extra_id_name', 'icon_url', 'changelly_precision', 'status'],
                { type: 'crypto', status: 1 },
                ["wallet_id", "coin_id", "balance", "wallet_address"],
                { wallet_address: { [Op.in]: addressListKeys }, status: 1 }
            )

            return response.success(res, {
                data: {
                    success: true,
                    message: language[lang].SUCCESS,
                    data: {
                        onOffRampCountries: onOffRampCountries,
                        onOffRampFiats: onOffRampFiats,
                        onOffRampCryptos: onOffRampCryptos
                    }
                }
            });

        } catch (err: any) {
            console.error("Error in onOffRampListing:", err.message);
            await commonHelper.save_error_logs("onOffRampListing", err.message);
            return response.error(res, {
                data: {
                    message: language[lang].CATCH_MSG,
                },
            });
        }
    }

    public async onOffRampListing2(req: Request, res: Response) {
        const lang = req.headers["content-language"] || "en";
        let { fiatType, addressListKeys, coinFamilies }: { fiatType: string, addressListKeys: any, coinFamilies: any } = req.body;
        try {
            console.log("req body changelly onOffRampListing >>>", req.body)
            let onOffRampCountries: any = await changellySupportedCountriesQueries.changellySupportedCountriesFindAll(
                ['id', 'code', 'name', 'status', 'state_code'],
                { status: 1 },
                [['name', 'ASC']]
            )
            let onOffRampFiats: any = await changellySupportedOnOffRampsQueries.changellySupportedOnOffRampsFindAll(
                ['id', 'type', 'ticker', 'name', 'icon_url', 'changelly_precision'],
                { status: 1, type: 'fiat' },
                [['name', 'ASC']]
            )
            let onOffRampCryptos: any = await coin_queries.coinsJoinCoinPriceInFiatJoinChangellyOnOffRampJoinWallet2(
                ["coin_id", "coin_name", "coin_symbol", "coin_image", "coin_family", "is_token", "token_type", "decimals", "token_address"],
                { coin_status: 1 },
                ["id", "value", "price_change_24h", "price_change_percentage_24h"],
                { fiat_type: fiatType },
                ['id', 'type', 'coin_id', 'ticker', 'name', 'extra_id_name', 'icon_url', 'changelly_precision', 'status'],
                { type: 'crypto', status: 1 },
                ["wallet_id", "coin_id", "balance", "wallet_address"],
                { wallet_address: { [Op.in]: addressListKeys }, status: 1, coin_family: { [Op.in]: coinFamilies } }
            )

            return response.success(res, {
                data: {
                    success: true,
                    message: language[lang].SUCCESS,
                    data: {
                        onOffRampCountries: onOffRampCountries,
                        onOffRampFiats: onOffRampFiats,
                        onOffRampCryptos: onOffRampCryptos
                    }
                }
            });

        } catch (err: any) {
            console.error("Error in onOffRampListing:", err.message);
            await commonHelper.save_error_logs("onOffRampListing", err.message);
            return response.error(res, {
                data: {
                    message: language[lang].CATCH_MSG,
                },
            });
        }
    }

    public async onOffRampGetOffers(req: Request, res: Response) {
        const lang = req.headers["content-language"] || "en";
        let { type, currencyFrom, currencyTo, amountFrom, country, state }:
            { type: string, currencyFrom: string, currencyTo: string, amountFrom: string, country: string, state: string } = req.body;
        try {
            console.log("req body changelly onOffRampGetOffers >>>", req.body)
            let fx: string = (type == 'buy') ? '/offers' : '/sell/offers';
            let path: string =
                `${config.CHANGELLY.CHANGELLY_ON_OFF_RAMP_BASE_URL}${fx}?currencyFrom=${currencyFrom}&currencyTo=${currencyTo}&amountFrom=${amountFrom}&country=${country}`;

            if (country == 'US') {
                path = `${path}&state=${state}`;
            }
            console.log("path == ", path)

            let headers: any = await changellyHelper.getHeaderOfOnOffRamp(path, {});
            // console.log("Headers == ", headers)

            let responseData: any = await changellyHelper.getResponseDataOfOnOffRamp(headers, path, 'get', {});
            let providersList: any = await changellySupportedProvidersQueries.changellySupportedProvidersFindAll(
                ['id', 'code', 'name', 'trust_pilot_rating', 'icon_url'],
                { status: 1 },
                [['id', 'ASC']]
            )
            return response.success(res, {
                data: {
                    success: true,
                    message: language[lang].SUCCESS,
                    data: {
                        providersList: providersList,
                        offers: responseData.data
                    }
                }
            });

        } catch (err: any) {
            console.error("Error in onOffRampListing:", err.message);
            await commonHelper.save_error_logs("onOffRampListing", err.message);
            return response.error(res, {
                data: {
                    message: language[lang].CATCH_MSG,
                },
            });
        }
    }
    public async createOrder(req: Request, res: Response) {
        const lang = req.headers["content-language"] || "en";
        console.log("req body changelly createOrder >>>", req.body)

        let { type, providerCode, currencyFrom, currencyTo, amountFrom, country, state, recipientWalletAddress, paymentMethod }:
            {
                type: string, providerCode: string, currencyFrom: string, currencyTo: string,
                amountFrom: string, country: string, state: string, recipientWalletAddress: string, paymentMethod: string
            } = req.body;
        try {
            let userId: number = req.userId;
            // let userId: number = 5;

            let fx: string = (type == 'buy') ? '/orders' : '/sell/orders';
            let path: string = `${config.CHANGELLY.CHANGELLY_ON_OFF_RAMP_BASE_URL}${fx}`;

            let orderId: string = await changellyHelper.generateOrderId()
            console.log("orderId >>", orderId)

            let reqData: any = {
                externalOrderId: orderId,
                externalUserId: userId.toString(),
                providerCode: providerCode,
                currencyFrom: currencyFrom,
                currencyTo: currencyTo,
                amountFrom: amountFrom,
                country: country,
                paymentMethod: paymentMethod

            }
            if (type == 'buy') {
                reqData.walletAddress = recipientWalletAddress
            } else {
                reqData.refundAddress = recipientWalletAddress
            }
            if (country == 'US') {
                reqData.state = state
            }
            await changellyOnOffRampOrdersQueries.changellyOnOffRampOrdersCreate({
                user_id: userId,
                external_order_id: orderId,
                type: type,
                provider_code: providerCode,
                currency_from: currencyFrom,
                currency_to: currencyTo,
                amount_from: amountFrom,
                country: country,
                state: state,
                wallet_address: recipientWalletAddress,
                payment_method: paymentMethod,
                order_id: null,
                redirect_url: null,
                created_at: new Date(),
                updated_at: new Date()
            })
            let headers: any = await changellyHelper.getHeaderOfOnOffRamp(path, reqData);
            let responseData: any = await changellyHelper.getResponseDataOfOnOffRamp(headers, path, 'post', reqData);

            if (responseData.data) {
                await changellyOnOffRampOrdersQueries.changellyOnOffRampOrdersUpdate(
                    { redirect_url: responseData.data.redirectUrl, order_id: responseData.data.orderId },
                    { external_order_id: orderId })
            }
            return response.success(res, {
                data: {
                    success: true,
                    message: language[lang].SUCCESS,
                    data: responseData.data
                }
            });
        } catch (error: any) {
            if (error.response) {
                const errorMessage = error.response.data.errorMessage || 'An unknown error occurred';
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
                console.error('Error response headers:', error.response.headers);

                return response.error(res, {
                    data: {
                        message: errorMessage
                    }
                });
            } else {
                console.error("Error in createOrder:", error.message);
                await commonHelper.save_error_logs("createOrder", error.message);
                return response.error(res, {
                    data: {
                        message: language[lang].CATCH_MSG,
                    },
                });
            }
        }
    }
    public async webhook(req: Request, res: Response) {
        const lang = req.headers["content-language"] || "en";
        try {
            await changellyWebhooksQueries.changellyWebhooksCreate({
                hook_data: req.body,
                created_at: new Date(),
                updated_at: new Date()
            })
            return response.success(res, {
                data: {
                    success: true,
                    message: language[lang].SUCCESS,
                }
            });
        } catch (err: any) {
            console.error("Error in webhook:", err.message);
            await commonHelper.save_error_logs("webhook", err.message);
            return response.error(res, {
                data: {
                    message: language[lang].CATCH_MSG,
                },
            });
        }
    }
}
export const changellyController = new ChangellyController();