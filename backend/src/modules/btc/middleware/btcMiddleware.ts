import { Request, Response, NextFunction } from 'express';
import response from "../../../helpers/response/response.helpers";
import { config } from "../../../config";
import * as Models from '../../../models/model/index';
import { language } from '../../../constants';
import commonHelper from '../../../helpers/common/common.helpers';


var transactionMiddleware = {
    requestInfo: async (req: Request, res: Response, next: NextFunction) => {
        let lang: any = req.headers['content-language'] || 'en';
        try {
            let coinData = await Models.CoinsModel.findOne({
                where: {
                    coin_symbol: req.params.coin,
                    coin_family: config.STATIC_COIN_FAMILY.BTC
                },
                attributes: ['coin_id', 'coin_name', 'coin_symbol', 'coin_gicko_alias', 'coin_image', 'coin_family', 'coin_status', 'is_token', 'token_type', 'token_address', 'token_abi']
            })
            if (coinData) {
                req.coininfo = {
                    token_abi: coinData.is_token == 1 ? config.CONTRACT_ABI : '',
                    token_address: coinData.token_address,
                    decimals: coinData.decimals,
                    is_token: coinData.is_token == 1 ? true : false,
                    token_type: null,
                    coin_id: coinData.coin_id,
                    coin_symbol: coinData.coin_symbol,
                    coin_family: coinData.coin_family
                }
                next();
            } else {
                return response.error(res, {
                    data: {
                        message: language[lang].INVALID_COIN_SYMBOL
                    },
                });
            }
        } catch (err: any) {
            await commonHelper.save_error_logs("btc_middleware", err.message);
            return response.error(res, {
                data: {
                    message: language[lang].CATCH_MSG,
                    data: { message: language[lang].CATCH_MSG },
                },
            });
        }
    }
};

export default transactionMiddleware;