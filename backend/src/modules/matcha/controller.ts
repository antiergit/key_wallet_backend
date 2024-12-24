import { OnlyControllerInterface } from "../../interfaces/controller.interface";
import { Request, Response } from "express";
import { language } from "../../constants";
import commonHelper from "../../helpers/common/common.helpers";
import response from "../../helpers/response/response.helpers";
import * as Models from "../../models/model";
import { bsc_matcha_helper } from "./bscMatchaHelper";
import { eth_matcha_helper } from "./ethMatchHelper";
import { CoinFamily } from "../../constants/global_enum";
import { Blockchains } from "./constants";
import { matcha_helper } from "./MatchHelper";

class oxController implements OnlyControllerInterface {
  constructor() {
    this.initialize();
  }

  public initialize() { }

  public oxChainQuotesApi = async (req: Request, res: Response) => {
    let lang: any = req.headers["content-language"] || "en";
    try {
      console.log("req body oxChainQuotesApi >>>", req.body)
      const body = req.body;
      console.log("body:", body);
      let result: any;

      switch (req.params.coin) {
        case "binancesmartchain":
          result = await bsc_matcha_helper.getQuoteOfBscToken(body);
          break;
        case "ethereum":
          result = await eth_matcha_helper.getQuoteOfEthToken(body);
          break;

        default:
          throw new Error("Blockchain Token Not Supported");
      }

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
      console.error("Error in oxChain > oxChainQuotesApi.", error);
      await commonHelper.save_error_logs("oxChainQuotesApi", error.message);
      return response.error(res, {
        data: { message: error.message || language[lang].CATCH_MSG, data: {} },
      });
    }
  };
  public oxChainPriceApi = async (req: Request, res: Response) => {
    let lang: any = req.headers["content-language"] || "en";
    try {
      console.log("req body oxChainPriceApi >>>", req.body)
      const body = req.body;
      let result: any;

      switch (req.params.coin) {
        case "binancesmartchain":
          result = await bsc_matcha_helper.getPriceOfBscToken(body);
          break;
        case "ethereum":
          result = await eth_matcha_helper.getPriceOfEthToken(body);
          break;

        default:
          throw new Error("Blockchain Token Not Supported");
      }

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
      console.error("Error in oxChain > oxChainPriceApi.", error);
      await commonHelper.save_error_logs("oxChainPriceApi", error.message);
      return response.error(res, {
        data: { message: error.message || language[lang].CATCH_MSG, data: {} },
      });
    }
  };
  public gaslessTokens = async (req: Request, res: Response) => {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let where_clause: any = {};
      let userId: number = req.userId;


      switch (req.params.coin) {

        case Blockchains.BNB:
          where_clause = {
            coin_family: CoinFamily.BNB,
            for_swap: 1,
            gasless: 1,
            is_token: 1,
            coin_status: 1,
          };
          break;
        case Blockchains.ETH:

          where_clause = {
            coin_family: CoinFamily.ETH,
            for_swap: 1,
            gasless: 1,
            is_token: 1,
            coin_status: 1,
          };
          break;

        default:
          throw new Error("Blockchain coin Not Supported");
      }

      let result: any = await Models.CoinsModel.findAll({
        attributes: ["coin_id", "mainnet_token_address", "is_token", "coin_name", "coin_symbol", "coin_image", "coin_family", "decimals", "coin_status", "token_address", "for_swap", "added_by", "gasless"],
        where: where_clause,
        include: [
          {
            model: Models.CoinPriceInFiatModel,
            as: "fiat_price_data",
            attributes: ["value", "price_change_percentage_24h"],
            where: {
              fiat_type: 'usd',
            },
            required: false,
          },
          {
            model: Models.WalletModel,
            attributes: [
              "user_id", "balance"],
            where: {
              status: 1,
              user_id: userId,
            },
            required: false
          },
          {
            model: Models.WalletModel,
            attributes: ["coin_family", "balance"],
            as: "native_wallet_data",
            where: {
              user_id: userId,
              status: 1
            },
            limit: 1
          }
        ],
        order: [
          ["coin_family", "asc"],
          ["is_token", "asc"],
        ],
      })

      if (result) {
        return response.success(res, {
          data: {
            status: true,
            data: result,
          },
        });
      } else {
        return response.error(res, {
          data: {
            status: false,
            data: result,
          },
        });
      }
    } catch (err: any) {
      console.error("Error in oxChain gasless tokens  > gaslessTokens.", err);
      await commonHelper.save_error_logs("gaslessTokens", err.message);
      return response.error(res, {
        data: { message: err.message || language[lang].CATCH_MSG, data: {} },
      });
    }
  };

  /** v2 ***/
  public oxChainQuotesApiV2 = async (req: Request, res: Response) => {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let result = await matcha_helper.getQuoteOfToken(req.body);
      
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
      console.error("Error in oxChain > oxChainQuotesApi.", error);
      await commonHelper.save_error_logs("oxChainQuotesApi", error.message);
      return response.error(res, {
        data: { message: error.message || language[lang].CATCH_MSG, data: {} },
      });
    }
  };

  public oxChainPricesApiV2 = async (req: Request, res: Response) => {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let result = await matcha_helper.getPriceOfToken(req.body);
      
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
      console.error("Error in oxChain > getPriceOfToken.", error);
      await commonHelper.save_error_logs("getPriceOfToken", error.message);
      return response.error(res, {
        data: { message: error.message || language[lang].CATCH_MSG, data: {} },
      });
    }
  };

  /** gasless */
  public getPriceOfGaslessToken = async (req: Request, res: Response) => {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let result = await matcha_helper.getPriceOfGaslessToken(req.body);
      
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
      console.error("Error in oxChain > getPriceOfToken.", error);
      await commonHelper.save_error_logs("getPriceOfToken", error.message);
      return response.error(res, {
        data: { message: error.message || language[lang].CATCH_MSG, data: {} },
      });
    }
  };


  public getQuoteOfGaslessToken = async (req: Request, res: Response) => {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let result = await matcha_helper.getQuoteOfGaslessToken(req.body);
      
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
      console.error("Error in oxChain > getPriceOfToken.", error);
      await commonHelper.save_error_logs("getPriceOfToken", error.message);
      return response.error(res, {
        data: { message: error.message || language[lang].CATCH_MSG, data: {} },
      });
    }
  };

  public submitTransaction = async (req: Request, res: Response) => {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let result = await matcha_helper.submitTransaction(req.body);
      
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
      console.error("Error in oxChain > getPriceOfToken.", error);
      await commonHelper.save_error_logs("getPriceOfToken", error.message);
      return response.error(res, {
        data: { message: error.message || language[lang].CATCH_MSG, data: {} },
      });
    }
  };


  public getTransactionStatus = async (req: Request, res: Response) => {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let result = await matcha_helper.getTransactionStatus(req.body);
      
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
      console.error("Error in oxChain > getPriceOfToken.", error);
      await commonHelper.save_error_logs("getPriceOfToken", error.message);
      return response.error(res, {
        data: { message: error.message || language[lang].CATCH_MSG, data: {} },
      });
    }
  };
}
export const oxChainController = new oxController();
