import { NextFunction, Request, Response } from "express";
import { config } from "../../../config";
import response from "../../../helpers/response/response.helpers";
import { coin_queries } from "../../../helpers/dbHelper/index"
import { BlockChain } from "../../../constants/global_enum";
import { language } from "../../../constants";
import commonHelper from "../../../helpers/common/common.helpers";

var bnbMiddleware = {
  requestInfo: async (req: Request, res: Response, next: NextFunction) => {
    let lang: any = req.headers['content-language'] || 'en';
    try {
      let coinData: any;
      if (req.params.coin === BlockChain.BNB) {
        coinData = await coin_queries.coin_find_one(["coin_family", "token_abi", "token_address", "cmc_id", "decimals", "is_token", "token_type", "coin_id", "coin_symbol", "coin_name"], { coin_symbol: req.params.coin, coin_family: config.STATIC_COIN_FAMILY.BNB })
      } else {
        coinData = await coin_queries.coin_find_one(["coin_family", "token_abi", "token_address", "cmc_id", "decimals", "is_token", "token_type", "coin_id", "coin_symbol", "coin_name"], { token_address: req.params.coin, coin_family: config.STATIC_COIN_FAMILY.BNB })
      }
      if (coinData) {
        req.coininfo = {
          token_abi: coinData.is_token == 1 ? config.CONTRACT_ABI : "",
          token_address: coinData.token_address,
          decimals: coinData.decimals,
          is_token: coinData.is_token == 1 ? true : false,
          token_type: coinData.token_type,
          coin_id: coinData.coin_id,
          cmc_id: coinData.cmc_id,
          coin_symbol: coinData.coin_symbol,
          coin_family: coinData.coin_family
        };
        next();
      } else {
        return response.error(res, {
          data: { status: false, message: language[lang].INVALID_COIN_SYMBOL },
        });
      }
    } catch (err: any) {
      console.error("ERROR IN BNB REQUEST INFO::::", err)
      await commonHelper.save_error_logs("bnb_middleware", err.message);
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
          data: `${err}`,
        },
      });
    }
  },
};

export default bnbMiddleware;
