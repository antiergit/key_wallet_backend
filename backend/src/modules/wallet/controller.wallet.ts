import { Request, Response } from "express";
import { Op, Sequelize } from "sequelize";
import response from "../../helpers/response/response.helpers";
import { OnlyControllerInterface } from "../../interfaces/controller.interface";
import { config } from "../../config";
import moment from "moment";
import { WalletHelper } from "./wallet.helpers";
import { Parser } from "json2csv";
import * as Models from "../../models/model/index";
import {
  GlblBooleanEnum,
  GlblCode,
  GlblMessages,
  Fiat_Currency,
  GlblBlockchainTxStatusEnum,
  TxTypesEnum,
  Status,
} from "../../constants/global_enum";
import { global_helper } from "../../helpers/common/global_helper";
import { language } from "../../constants";
import commonHelper from "../../helpers/common/common.helpers";
import { coin_queries, wallet_queries } from "../../helpers/dbHelper/index";
const crypto = require("crypto");
import userhelper from "../user/helper";
import redisClient from "../../helpers/common/redis";

class WalletController implements OnlyControllerInterface {
  constructor() {
    this.initialize();
  }
  public initialize() { }

  /** Used in front end */
  public async addToken(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      console.log("req body addToken >>>", req.body)
      let currentUTCDate: string = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");

      let {
        coin_family,
        coin_gicko_id,
        token_type,
        token_address,
        name,
        symbol,
        coin_gicko_alias,
        decimals,
        wallet_address,
        wallet_name,
        isSwapList,
      }: {
        coin_family: number;
        coin_gicko_id: string;
        token_type: string;
        token_address: string;
        name: string;
        symbol: string;
        coin_gicko_alias: string;
        decimals: string;
        wallet_address: string;
        wallet_name: string;
        isSwapList: any;
      } = req.body;

      let coinDataExist: any = await coin_queries.coin_find_one(
        [
          "coin_id",
          "coin_name",
          "coin_symbol",
          "coin_image",
          "cmc_id",
          "coin_gicko_alias",
          "coin_family",
          "coin_status",
          "is_token",
          "is_on_cmc",
          "for_swap",
          "added_by",
          "token_type",
          "decimals",
          "token_address",
          "coin_gicko_id",
        ],
        { coin_family: coin_family, token_address: token_address }
      );

      if (coinDataExist) {
        if (coinDataExist.coin_status == 0) {
          await coin_queries.coin_update(
            { coin_status: 1 },
            { coin_id: coinDataExist.coin_id }
          );
          await WalletHelper.update_token_in_redis(
            { coin_family: coin_family },
            coinDataExist.coin_id
          );
        } else {
          console.log("coin status is active");
        }

        if (coinDataExist.added_by == "user") {
          await WalletHelper.insert_entry_in_custom_token_table(
            coinDataExist.coin_id,
            req.userId
          );
        }
      } else {
        let response: any = await WalletHelper.add_coin_to_table(
          token_address,
          symbol,
          name,
          coin_gicko_alias,
          coin_family,
          token_type,
          decimals,
          lang,
          currentUTCDate,
          req.userId,
          coin_gicko_id
        );

        coinDataExist = response.coinData;
      }

      let message: string = await WalletHelper.create_wallet_for_coin(
        wallet_address,
        coinDataExist.coin_id,
        wallet_name,
        req.userId,
        coin_family,
        lang,
        currentUTCDate,
        token_address,
        1,
        token_type
      );

      return response.success(res, {
        data: { message: message },
      });
    } catch (err: any) {
      console.error("Error in wallet > addToken.", err);
      await commonHelper.save_error_logs("wallet_addToken", err.message);
      throw language[lang].CATCH_MSG;
    }
  }
  public async portfolio(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      console.log("req body portfolio >>>", req.body)
      let {
        page,
        limit,
        fiat_type,
      }: { page: number | string; limit: number | string; fiat_type: string } =
        req.body;
      fiat_type =
        req.body.fiat_type == undefined
          ? Fiat_Currency.USD
          : req.body.fiat_type;
      let search: any =
        req.body.search == undefined
          ? (req.body.search = "%%")
          : (req.body.search = "%" + req.body.search + "%");
      let pageNo: any = parseInt(page as string) || GlblBooleanEnum.true;
      let limitNo: any = parseInt(limit as string) || 10;
      let offset: number = GlblBooleanEnum.false;
      if (pageNo != GlblBooleanEnum.true) {
        offset = (pageNo - GlblBooleanEnum.true) * limitNo;
      }
      let user_id: number = req.userId;
      // let user_id: number = 5;

      let wallets: any = await Models.WalletModel.findAndCountAll({
        attributes: [
          "wallet_id",
          "wallet_name",
          "user_id",
          "wallet_address",
          "balance",
          "status",
          "sort_order",
        ],
        where: {
          wallet_address: { [Op.in]: req.body.addressListKeys },
          status: GlblBooleanEnum.true,
        },
        include: [
          {
            model: Models.CoinsModel,
            attributes: [
              "coin_id",
              "coin_image",
              "coin_name",
              "coin_symbol",
              "coin_family",
              "decimals",
              "is_token",
              "token_address",
            ],
            required: true,
            where: {
              coin_status: GlblBooleanEnum.true,
              coin_family: { [Op.in]: req.body.coin_family },
              [Op.or]: [
                { coin_name: { [Op.like]: search } },
                { coin_symbol: { [Op.like]: search } },
              ],
              [Op.and]: Sequelize.literal(
                `(token_type is null or token_type NOT IN('BEP721', 'ERC721')) AND (IF(added_by='admin',1=1,coin.coin_id IN(select coin_id FROM custom_tokens WHERE user_id=${user_id})))`
              ),
            },
            include: [
              {
                model: Models.CoinPriceInFiatModel,
                as: "fiat_price_data",
                attributes: [
                  "value",
                  "price_change_24h",
                  "fiat_type",
                  "price_change_percentage_24h",
                ],
                where: {
                  fiat_type: fiat_type,
                  // coin_family:"$coins.coin_family$"
                },
                required: false,
              },
              {
                model: Models.WatchlistsModel,
                attributes: ["user_id", "coin_id", "wallet_address", "status"],
                as: "watchlist_data",
                where: {
                  user_id: user_id,
                  wallet_address: { [Op.in]: req.body.addressListKeys },
                  status: "1",
                },
                required: false,
              },
            ],
          },
        ],
        order: [["sort_order", "ASC"]],
        limit: limitNo,
        offset: offset,
      });
      response.success(res, {
        data: {
          status: true,
          data: wallets.rows,
          meta: {
            page: page,
            pages: Math.ceil(wallets.count / limitNo),
            perPage: limitNo,
            total: wallets.count,
          },
        },
      });
    } catch (err: any) {
      console.error("Error in wallet > portfolio.", err);
      await commonHelper.save_error_logs("wallet_portfolio", err.message);
      response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }

  public async portfolioWithBalance(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      console.log("req body portfolioWithBalance >>>", req.body);
      let {
        page,
        limit,
        fiat_type,
      }: { page: number | string; limit: number | string; fiat_type: string } = req.body;
  
      fiat_type = req.body.fiat_type == undefined ? Fiat_Currency.USD : req.body.fiat_type;
  
      let search: any = req.body.search == undefined
        ? (req.body.search = "%%")
        : (req.body.search = "%" + req.body.search + "%");
  
      let pageNo: any = parseInt(page as string) || GlblBooleanEnum.true;
      let limitNo: any = parseInt(limit as string) || 10;
      let offset: number = GlblBooleanEnum.false;
  
      if (pageNo != GlblBooleanEnum.true) {
        offset = (pageNo - GlblBooleanEnum.true) * limitNo;
      }
  
      let user_id: number = req.userId;
  
      let wallets: any = await Models.WalletModel.findAndCountAll({
        attributes: [
          "wallet_id",
          "wallet_name",
          "user_id",
          "wallet_address",
          "balance",
          "status",
          "sort_order",
        ],
        where: {
          wallet_address: { [Op.in]: req.body.addressListKeys },
          status: GlblBooleanEnum.true,
          balance: { [Op.gt]: 0 }, // ✅ filter wallets with non-zero balance
        },
        include: [
          {
            model: Models.CoinsModel,
            attributes: [
              "coin_id",
              "coin_image",
              "coin_name",
              "coin_symbol",
              "coin_family",
              "decimals",
              "is_token",
              "token_address",
            ],
            required: true,
            where: {
              coin_status: GlblBooleanEnum.true,
              coin_family: { [Op.in]: req.body.coin_family },
              [Op.or]: [
                { coin_name: { [Op.like]: search } },
                { coin_symbol: { [Op.like]: search } },
              ],
              [Op.and]: Sequelize.literal(
                `(token_type is null or token_type NOT IN('BEP721', 'ERC721')) AND (IF(added_by='admin',1=1,coin.coin_id IN(select coin_id FROM custom_tokens WHERE user_id=${user_id})))`
              ),
            },
            include: [
              {
                model: Models.CoinPriceInFiatModel,
                as: "fiat_price_data",
                attributes: [
                  "value",
                  "price_change_24h",
                  "fiat_type",
                  "price_change_percentage_24h",
                ],
                where: {
                  fiat_type: fiat_type,
                },
                required: false,
              },
              {
                model: Models.WatchlistsModel,
                attributes: ["user_id", "coin_id", "wallet_address", "status"],
                as: "watchlist_data",
                where: {
                  user_id: user_id,
                  wallet_address: { [Op.in]: req.body.addressListKeys },
                  status: "1",
                },
                required: false,
              },
            ],
          },
        ],
        order: [["sort_order", "ASC"]],
        limit: limitNo,
        offset: offset,
      });
  
      response.success(res, {
        data: {
          status: true,
          data: wallets.rows,
          meta: {
            page: page,
            pages: Math.ceil(wallets.count / limitNo),
            perPage: limitNo,
            total: wallets.count,
          },
        },
      });
    } catch (err: any) {
      console.error("Error in wallet > portfolioWithBalance.", err);
      await commonHelper.save_error_logs("wallet_portfolio_with_balance", err.message);
      response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }

  
  public async activeInactiveWallet(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      console.log("req body activeInactiveWallet >>>", req.body)
      let currentUTCDate: string = new Date()
        .toISOString()
        .replace(/T/, " ")
        .replace(/\..+/, "");
      let {
        coinId,
        walletAddress,
        isActive,
      }: { coinId: number; walletAddress: string; isActive: any } = req.body;
      let userId: number = req.userId;
      let message: string;
      let coin_data: any = await coin_queries.coin_find_one([], {
        coin_id: coinId,
      });

      if (!coin_data) {
        let err: string = language[lang].COIN_NOT_FOUND;
        throw new Error(err);
      }

      let balDetails: any = await global_helper.get_wallet_balance(
        coin_data,
        walletAddress
      );
      let wallet_exist: any = await wallet_queries.wallet_find_one(
        ["wallet_id"],
        { wallet_address: walletAddress, coin_id: coinId }
      );
      if (!wallet_exist) {
        let wallet_data: any = await wallet_queries.wallet_find_one(
          ["wallet_id", "wallet_name"],
          { wallet_address: walletAddress }
        );
        console.log("wallet_name >>>", wallet_data);
        let obj: any = {
          user_id: userId,
          coin_family: coin_data.coin_family,
          wallet_name: wallet_data?.wallet_name
            ? wallet_data.wallet_name
            : null,
          wallet_address: walletAddress,
          coin_id: coinId,
          balance: balDetails.status ? balDetails.balance : "0",
          default_wallet: GlblBooleanEnum.true,
          is_verified: GlblBooleanEnum.true,
          status: GlblBooleanEnum.true,
          created_at: currentUTCDate,
          updated_at: currentUTCDate,
        };
        await wallet_queries.wallet_create(obj);
      } else {
        let update_wallet_data: any = { status: isActive };
        if (balDetails.status) {
          update_wallet_data.balance = balDetails.balance;
        }
        await wallet_queries.wallet_update(update_wallet_data, {
          user_id: userId,
          wallet_address: walletAddress,
          coin_id: coinId,
        });
      }
      if (isActive == GlblBooleanEnum.true) {
        message = language[lang].TOKEN_WALLET_ACTIVE;
      } else {
        message = language[lang].TOKEN_WALLET_INACTIVE;
      }
      if (balDetails.status == false) {
        console.log("bal is not updated");
        // adding_coins_to_queue
        await userhelper.adding_coins_to_queue(
          config.BACKEND_WALLET_ADDRESSES,
          {
            coin_data: {
              coin_id: coin_data.coin_id,
              coin_family: coin_data.coin_family,
              is_token: coin_data.is_token,
              token_address: coin_data.token_address,
              token_type: coin_data.token_type,
            },
            wallet_address: walletAddress,
            queue_count: 0,
          }
        );
      }
      return response.success(res, {
        data: {
          message: message,
        },
      });
    } catch (err: any) {
      console.error("Error in wallet > activeInactiveWallet.", err);
      await commonHelper.save_error_logs(
        "wallet_activeInactiveWallet",
        err.message
      );
      response.error(res, {
        data: { message: language[lang].CATCH_MSG, data: {} },
      });
    }
  }
  public async toggleCoinList(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      console.log("req body toggleCoinList >>>", req.body)
      const {
        page,
        limit,
        currency_code,
      }: {
        page: number | string;
        limit: number | string;
        currency_code: string;
      } = req.body;
      const addresses: [] = req.body.addrsListKeys;
      const coinfamiles: [] = req.body.coinFamilyKeys;
      let search: any =
        req.body.search == undefined
          ? (req.body.search = "%%")
          : (req.body.search = "%" + req.body.search + "%");
      let pageNo: any = parseInt(page as string) || GlblBooleanEnum.true;
      let limitNo: any = parseInt(limit as string) || 10;
      let offset: number = GlblBooleanEnum.false;
      if (pageNo != GlblBooleanEnum.true) {
        offset = (pageNo - GlblBooleanEnum.true) * limitNo;
      }
      let data: any = await Models.CoinsModel.findAndCountAll({
        attributes: [
          "coin_id",
          "coin_image",
          "coin_name",
          "coin_symbol",
          "coin_family",
          "is_token",
          "token_address",
          "token_type",
          "coin_status",
        ],
        where: {
          coin_status: GlblBooleanEnum.true,
          coin_family: { [Op.in]: coinfamiles },
          [Op.or]: [
            { coin_name: { [Op.like]: search } },
            { coin_symbol: { [Op.like]: search } },
          ],
          [Op.and]: Sequelize.literal(
            `(coins.token_type IS NULL OR coins.token_type NOT IN('BEP721', 'ERC721')) AND (IF(added_by='admin',1=1,coins.coin_id IN(select coin_id FROM custom_tokens WHERE user_id=${req.userId})))`
          ),
        },
        include: [
          {
            model: Models.WalletModel,
            attributes: [
              "wallet_address",
              [Sequelize.literal(`(IF (status= null,0,status))`), `status`],
            ],
            where: {
              wallet_address: { [Op.in]: addresses },
            },
            required: false,
            as: "wallet_data",
          },
          {
            model: Models.CoinPriceInFiatModel,
            as: "fiat_price_data",
            attributes: [
              "price_change_24h",
              "value",
              "price_change_percentage_24h",
            ],
            where: {
              fiat_type: currency_code,
            },
            required: false,
          },
        ],
        order: [
          Sequelize.literal(
            "(CASE WHEN  wallet_data.status=1 THEN wallet_data.status END)  DESC, coins.coin_id ASC,(CASE WHEN  wallet_data.status=0 THEN coins.coin_id END)  ASC"
          ),
        ],
        limit: limitNo,
        offset: offset,
      });
      let objData: any = {
        status: true,
        data: data.rows,
        meta: {
          page: pageNo,
          pages: Math.ceil(data.count / limitNo),
          perPage: limitNo,
          total: data.count,
        },
      };
      response.success(res, {
        data: objData,
      });
    } catch (err: any) {
      console.error("Error in wallet > toggleCoinList.", err);
      await commonHelper.save_error_logs("wallet_toggleCoinList", err.message);
      response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }
  public async transactions(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      console.log("req body transactions >>>", req.body)
      let address_list: any = req.body.addrsListKeys ? req.body.addrsListKeys : [];
      let fiat_currency: string = String(
        req.body.fiat_currency ? req.body.fiat_currency : Fiat_Currency.USD
      );
      let search: any =
        req.body.search == undefined
          ? (req.body.search = "%%")
          : (req.body.search = "%" + req.body.search + "%");
      let limit: number = Number(
        req.body.limit == undefined ? (req.body.limit = "25") : req.body.limit
      );
      let page: number = Number(
        req.body.page == undefined ? (req.body.page = "1") : req.body.page
      );
      let offset: number = (page - GlblBooleanEnum.true) * limit;
      let coin_id: number =
        req.body.coin_id == undefined
          ? (req.body.coin_id = GlblBooleanEnum.false)
          : req.body.coin_id;
      let status: GlblBlockchainTxStatusEnum =
        req.body.status == undefined
          ? (req.body.status = null)
          : req.body.status;
      let date_from: number = req.body.date_from ? req.body.date_from : null;
      let date_to: number = req.body.date_to ? req.body.date_to : null;
      let type: any = req.body.trnx_type ? req.body.trnx_type : "all";
      let coin_family: any = req.body.coin_family ? req.body.coin_family : [];
      let userId: number = req.userId;

      let where_clause: any = {
        [Op.or]: [
          {
            [Op.and]: [
              { from_adrs: { [Op.in]: address_list } },
              { user_id: userId },

              {
                [Op.or]: [
                  { blockchain_status: GlblBlockchainTxStatusEnum.PENDING },
                  { blockchain_status: GlblBlockchainTxStatusEnum.FAILED },
                  { blockchain_status: GlblBlockchainTxStatusEnum.CONFIRMED },
                  { blockchain_status: null },
                ],
              },
            ],
          },
          {
            [Op.and]: [
              { to_adrs: { [Op.in]: address_list } },
              { to_user_id: userId },

              Sequelize.literal(
                `IF(merchant_id IS NOT null, 1 = 1, trnx_history.blockchain_status = "${GlblBlockchainTxStatusEnum.CONFIRMED}")`
              ),
            ],
          },
        ],
      };

      // let attr: any = ['id',
      //   [Sequelize.literal(`IF(type ='withdraw' OR type = 'deposit',(IF(FIND_IN_SET(from_adrs, "${address_list.toString()}"),'withdraw','deposit')),type)`), 'type']
      //   , 'tx_fee', 'tx_id', 'user_id', 'req_type', 'from_adrs', 'to_adrs', 'coin_family', 'tx_raw', 'order_id', 'status', 'blockchain_status', 'coin_id', 'amount', 'fiat_price', 'fiat_type', 'created_at', 'updated_at', 'referral_upgrade_level'];

      let attr: any = [
        "id",
        [
          Sequelize.literal(
            `IF(type ='withdraw' OR type = 'deposit',(IF(FIND_IN_SET(user_id, "${userId}"),'withdraw','deposit')),type)`
          ),
          "type",
        ],
        "tx_fee",
        "tx_id",
        "user_id",
        "req_type",
        "from_adrs",
        "to_adrs",
        "coin_family",
        "tx_raw",
        "order_id",
        "status",
        "blockchain_status",
        "coin_id",
        "amount",
        "fiat_price",
        "fiat_type",
        "created_at",
        "updated_at",
        "referral_upgrade_level",
        "rocketx_request_id",
        "changelly_order_id",
        "to_coin_family"
      ];

      if (type == TxTypesEnum.DEPOSIT) {
        // attr = ['id',
        // [Sequelize.literal(`IF(type ='withdraw' OR type = 'deposit',(IF(FIND_IN_SET(to_adrs, "${address_list.toString()}"),'deposit','withdraw')),type)`), 'type']
        // , 'tx_fee', 'tx_id', 'user_id', 'req_type', 'from_adrs', 'to_adrs', 'coin_family', 'tx_raw', 'order_id', 'status', 'blockchain_status', 'coin_id', 'amount', 'fiat_price', 'fiat_type', 'created_at', 'updated_at', 'referral_upgrade_level'];

        attr = [
          "id",
          [
            Sequelize.literal(
              `IF(type ='withdraw' OR type = 'deposit',(IF(FIND_IN_SET(to_user_id, "${userId}"),'deposit','withdraw')),type)`
            ),
            "type",
          ],
          "tx_fee",
          "tx_id",
          "user_id",
          "req_type",
          "from_adrs",
          "to_adrs",
          "coin_family",
          "tx_raw",
          "order_id",
          "status",
          "blockchain_status",
          "coin_id",
          "amount",
          "fiat_price",
          "fiat_type",
          "created_at",
          "updated_at",
          "referral_upgrade_level",
          "rocketx_request_id",
          "changelly_order_id",
          "to_coin_family"
        ];

        where_clause = {
          to_adrs: {
            [Op.in]: address_list
          },
          to_user_id: userId,
          blockchain_status: GlblBlockchainTxStatusEnum.CONFIRMED,
          [Op.or]: [
            { type: TxTypesEnum.WITHDRAW },
            { type: TxTypesEnum.DEPOSIT },
          ],
        };
      }
      if (type == TxTypesEnum.WITHDRAW) {
        where_clause = {
          from_adrs: {
            [Op.in]: address_list
          },
          user_id: userId,

          [Op.or]: [
            { blockchain_status: GlblBlockchainTxStatusEnum.PENDING },
            { blockchain_status: GlblBlockchainTxStatusEnum.FAILED },
            { blockchain_status: GlblBlockchainTxStatusEnum.CONFIRMED },
            { blockchain_status: null },
          ],
          [Op.or]: [
            { type: TxTypesEnum.WITHDRAW },
            { type: TxTypesEnum.DEPOSIT },
          ],
        };
      }
      if (type == TxTypesEnum.DAPP) {
        where_clause = {
          [Op.or]: [
            { type: TxTypesEnum.DAPP },
            { type: TxTypesEnum.APPROVE },
            { type: TxTypesEnum.SWAP },
            { type: TxTypesEnum.CROSS_CHAIN },
          ],
          from_adrs: {
            [Op.in]: address_list
          },
          user_id: userId,
        };
      }
      if (type == TxTypesEnum.BUY) {
        where_clause = {
          to_adrs: {
            [Op.in]: address_list
          },
          to_user_id: userId,
          type: TxTypesEnum.BUY,
        };
      }
      if (type == TxTypesEnum.SELL) {
        where_clause = {
          to_adrs: {
            [Op.in]: address_list
          },
          to_user_id: userId,
          type: TxTypesEnum.SELL,
        };
      }
      if (type == TxTypesEnum.CARDS) {
        where_clause = {
          [Op.or]: [
            { type: TxTypesEnum.CARD_FEES },
            { type: TxTypesEnum.CARD_RECHARGE },
          ],
          from_adrs: {
            [Op.in]: address_list
          },
          user_id: userId,
        };
      }
      if (type == TxTypesEnum.LEVEL_UPGRADE) {
        where_clause = {
          type: TxTypesEnum.LEVEL_UPGRADATION_LEVEL,
          from_adrs: {
            [Op.in]: address_list
          },
          user_id: userId,
        };
      }
      if (status) {
        where_clause = {
          ...where_clause,
          blockchain_status: status,
        };
      }

      if (coin_family) {
        where_clause = {
          ...where_clause,
          coin_family: { [Op.in]: coin_family },
        };
      }
      if (date_from && date_to) {
        where_clause = {
          ...where_clause,
          [Op.and]: Sequelize.literal(
            `trnx_history.created_at BETWEEN '${date_from}' and '${date_to}'`
          ),
        };
      }
      let coin_where: any = "";
      if (coin_id > GlblBooleanEnum.false) {
        coin_where = { id: coin_id };
        where_clause = {
          ...where_clause,
          coin_id: coin_id,
        };
      }
      if (search) {
        coin_where = {
          ...coin_where,
          [Op.and]: {
            [Op.or]: {
              coin_name: {
                [Op.like]: search,
              },
              coin_symbol: {
                [Op.like]: search,
              },
            },
          },
        };
      }
      let query: any = {
        attributes: attr,
        where: where_clause,
        include: [
          {
            model: Models.CoinsModel,
            attributes: ["coin_symbol", "coin_name"],
            as: "coin_data",
            where: Sequelize.literal(coin_where),
            include: [
              {
                model: Models.CoinPriceInFiatModel,
                as: "fiat_price_data",
                attributes: [
                  "fiat_type",
                  "value",
                  "price_change_24h",
                  "price_change_percentage_24h",
                ],
                where: { fiat_type: fiat_currency },
                required: false,
              },
            ],
          },
        ],
        order: [["id", "DESC"]],
        limit: limit,
        offset: offset,
      };
      let transaction_data: any = await Models.TrnxHistoryModel.findAndCountAll(
        query
      );
      return response.success(res, {
        data: {
          success: true,
          message: GlblMessages.SUCCESS,
          data: transaction_data.rows,
          meta: {
            page: page,
            pages: Math.ceil(transaction_data.count / limit),
            perPage: limit,
            total: transaction_data.count,
          },
        },
      });
    } catch (err: any) {
      console.error("Error in wallet > transactions.", err);
      await commonHelper.save_error_logs("wallet_transactions", err.message);
      response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }
  public async updateWalletOrder(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      console.log("req body updateWalletOrder >>>", req.body)
      const { wallets }: any = req.body;
      for await (let wallet of wallets) {

        await wallet_queries.wallet_update(
          { sort_order: wallet.order },
          {
            coin_id: wallet.coin_id,
            wallet_address: wallet.wallet_address,
          }
        )
      }
      return response.success(res, { data: { status: true } });
    } catch (err: any) {
      console.error("Error in wallet > updateWalletOrder.", err);
      await commonHelper.save_error_logs(
        "wallet_updateWalletOrder",
        err.message
      );
      return response.error(res, { data: language[lang].CATCH_MSG });
    }
  }
  public async searchToken(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      console.log("req body searchToken >>>", req.body)
      let {
        tokenAddress,
        coinFamily,
      }: { tokenAddress: string; coinFamily: number } = req.body;
      let tokenDetails: { decimals: any; name: any; symbol: any } = {
        decimals: "0",
        name: "",
        symbol: "",
      };
      console.log("Entered into searchToken request data", req.body);
      tokenDetails = await global_helper.return_decimals_name_symbol(
        coinFamily,
        tokenAddress,
        lang
      );
      console.log("tokenDetails >> tokenDetails ", tokenDetails);

      if (!tokenDetails || tokenDetails == null) {
        return response.error(res, {
          data: { message: language[lang].INVALID_TOKEN, data: {} },
        });
      }

      tokenDetails.decimals = tokenDetails.decimals.toString();

      if (
        Object.keys(tokenDetails).length !== GlblBooleanEnum.false &&
        tokenDetails.constructor === Object
      ) {
        return response.success(res, {
          data: {
            message: language[lang].TOKENS_SEARCH,
            data: tokenDetails,
          },
        });
      }
      return response.error(res, {
        data: { message: language[lang].TOKENS_NOT_FOUND, data: {} },
      });
    } catch (err: any) {
      console.error("Error in wallet > searchToken.", err);
      await commonHelper.save_error_logs("wallet_searchToken", err.message);
      return response.error(res, {
        data: {
          data: { message: language[lang].CATCH_MSG, data: {} },
        },
      });
    }
  }
  public async swapList(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      console.log("req body swapList >>>", req.body)
      const coin_family: [] = req.body.coin_family;
      const addresses: [] = req.body.addrsListKeys;
      let fiat_type: string = req.body.fiat_type;
      let where_clause: {};
      where_clause = {
        for_swap: 1,
        coin_family: { [Op.in]: coin_family },
        coin_status: GlblBooleanEnum.true,
        [Op.and]: Sequelize.literal(
          `(IF((added_by='admin' OR added_by='swap'),1=1,coins.coin_id IN(select coin_id FROM custom_tokens WHERE user_id=${req.userId})))`
        ),
      };
      let isFav = false;
      let swap_list_data: any = await Models.CoinsModel.findAll({
        attributes: [
          "coin_id",
          "mainnet_token_address",
          "is_token",
          "coin_name",
          "coin_symbol",
          "coin_image",
          "coin_family",
          "decimals",
          "coin_status",
          "token_address",
          "for_swap",
          "added_by",
        ],
        where: where_clause,
        include: [
          {
            model: Models.CoinPriceInFiatModel,
            as: "fiat_price_data",
            attributes: ["value", "price_change_percentage_24h"],
            where: {
              fiat_type: fiat_type,
            },
            required: false,
          },
          {
            model: Models.WalletModel,
            attributes: ["user_id", "balance"],
            where: {
              wallet_address: { [Op.in]: addresses },
              status: GlblBooleanEnum.true,
              user_id: req.userId,
            },
            required: isFav,
          },
          {
            model: Models.WalletModel,
            attributes: ["coin_family", "balance"],
            as: "native_wallet_data",
            where: {
              wallet_address: { [Op.in]: addresses },
              user_id: req.userId,
              status: GlblBooleanEnum.true,
            },
            limit: GlblBooleanEnum.true,
          },
        ],
        order: [
          ["coin_family", "asc"],
          ["is_token", "asc"],
        ],
        logging: console.log
      });
      return response.success(res, {
        data: {
          message: language[lang].SWAP_LIST,
          data: swap_list_data,
          status: true,
          code: GlblCode.SUCCESS,
        },
      });
    } catch (err: any) {
      console.error("Error in wallet > swap_list.", err);
      await commonHelper.save_error_logs("wallet_swap_list", err.message);
      response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }
  public async getRpcUrl(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let data: any = {
        ETH_RPC_URL: config.NODE.ETH_RPC_URL,
        BTC_RPC_URL: config.NODE.BTC_RPC_URL,
        TRON_NODE: config.NODE.TRX_RPC_URL,
        BNB_RPC_URL: config.NODE.BNB_RPC_URL,
        ETH_DAPP_RPC_URL: config.NODE.ETH_DAPP_RPC_URL
      };

      return res.status(GlblCode.SUCCESS).send(data);
    } catch (err: any) {
      console.error("Error in wallet > getRpcUrl.", err);
      await commonHelper.save_error_logs("wallet_getRpcUrl", err.message);
      let data = {
        code: GlblCode.ERROR_CODE,
        status: false,
        message: language[lang].CATCH_MSG,
      };
      return res.status(data.code).send(data);
    }
  }
  public async updateWatchlist(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      console.log("req body updateWatchlist >>>", req.body)
      let user_id: number = req.userId;
      let data: any = req.body.data;
      for (let i = GlblBooleanEnum.false; i < data.length; i++) {
        const result: any = await Models.WatchlistsModel.findOne({
          where: {
            user_id: user_id,
            coin_id: data[i].coin_id,
            wallet_address: data[i].address,
          },
        });
        if (data[i].status == GlblBooleanEnum.false) {
          if (result) {
            await Models.WatchlistsModel.update(
              {
                status: "0",
              },
              {
                where: {
                  user_id: user_id,
                  coin_id: data[i].coin_id,
                  wallet_address: data[i].address,
                },
              }
            );
          } else {
            await Models.WatchlistsModel.create({
              status: "0",
              user_id: user_id,
              coin_id: data[i].coin_id,
              wallet_address: data[i].address,
            });
          }
        } else if (data[i].status == GlblBooleanEnum.true) {
          if (result) {
            await Models.WatchlistsModel.update(
              {
                status: "1",
              },
              {
                where: {
                  user_id: user_id,
                  coin_id: data[i].coin_id,
                  wallet_address: data[i].address,
                },
              }
            );
          } else {
            await Models.WatchlistsModel.create({
              status: "1",
              user_id: user_id,
              coin_id: data[i].coin_id,
              wallet_address: data[i].address,
            });
          }
        }
      }
      return res.status(GlblCode.SUCCESS).send({
        status: true,
        code: GlblCode.SUCCESS,
        message: language[lang].UPDATED,
      });
    } catch (err: any) {
      console.error("Error in wallet > updateWatchlist.", err);
      await commonHelper.save_error_logs("wallet_updateWatchlist", err.message);
      let data = {
        code: GlblCode.ERROR_CODE,
        status: false,
        message: language[lang].CATCH_MSG,
      };
      return res.status(data.code).send(data);
    }
  }
  public async getWatchlist(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      console.log("req body getWatchlist >>>", req.body)
      let user_id: any = req.userId;
      const { page, limit }: { page: number | string; limit: number | string } =
        req.body;
      let is_fav: number = req.body.is_fav;
      let fiat_type: string = req.body.fiat_type;
      let search: any =
        req.body.search == undefined
          ? (req.body.search = "%%")
          : (req.body.search = "%" + req.body.search + "%");
      let wallet_address: string = req.body.wallet_address;
      let pageNo: any = parseInt(page as string) || GlblBooleanEnum.true;
      let limitNo: any = parseInt(limit as string) || 10;
      let offset: number = GlblBooleanEnum.false;
      if (pageNo != GlblBooleanEnum.true) {
        offset = (pageNo - GlblBooleanEnum.true) * limitNo;
      }
      let isFav = false;
      if (is_fav == GlblBooleanEnum.true) {
        isFav = true;
      }
      let result: any = await Models.CoinsModel.findAndCountAll({
        attributes: [
          "coin_id",
          "coin_name",
          "coin_symbol",
          "coin_image",
          "coin_family",
          "is_token",
          "token_type",
        ],
        where: {
          coin_status: GlblBooleanEnum.true,
          coin_family: { [Op.in]: req.body.coin_family },
          [Op.and]: Sequelize.literal(
            `(coins.token_type IS NULL OR coins.token_type NOT IN('BEP721', 'ERC721')) AND (IF(added_by='admin',1=1,coins.coin_id IN(select coin_id FROM custom_tokens WHERE user_id=${req.userId})))`
          ),
          [Op.or]: [
            { coin_name: { [Op.like]: search } },
            { coin_symbol: { [Op.like]: search } },
          ],
        },
        include: [
          {
            model: Models.CoinPriceInFiatModel,
            attributes: ["price_change_percentage_24h", "value"],
            as: "fiat_price_data",
            where: {
              fiat_type: fiat_type,
            },
            required: false,
          },
          {
            model: Models.WalletModel,
            attributes: ["wallet_name", "balance", "wallet_address"],
            where: {
              user_id: user_id,
            },
            required: false,
          },
          {
            model: Models.WatchlistsModel,
            attributes: ["user_id", "coin_id", "wallet_address", "status"],
            as: "watchlist_data",
            where: {
              user_id: user_id,
              wallet_address: wallet_address,
              status: "1",
            },
            required: isFav,
          },
        ],
        offset: offset,
        limit: limitNo,
      });
      return res.status(GlblCode.SUCCESS).send({
        status: true,
        code: GlblCode.SUCCESS,
        data: result.rows,
        meta: {
          page: page,
          pages: Math.ceil(result.count / limitNo),
          perPage: limitNo,
          total: result.count,
        },
      });
    } catch (err: any) {
      console.error("Error in wallet > getWatchlist.", err);
      await commonHelper.save_error_logs("wallet_getWatchlist", err.message);
      let data = {
        code: GlblCode.ERROR_CODE,
        status: false,
        message: language[lang].CATCH_MSG,
      };
      return res.status(data.code).send(data);
    }
  }
  public async getCurrencyFiat(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      let data: any = await Models.CurrencyFiatModel.findAll({
        where: { status: GlblBooleanEnum.true },
        order: [["currency_name", "ASC"]],
      });
      response.success(res, {
        data: { message: language[lang].SUCCESS, data: data },
      });
    } catch (err: any) {
      console.error("Error in wallet > getCurrencyFiat.", err);
      await commonHelper.save_error_logs("wallet_getCurrencyFiat", err.message);
      response.error(res, {
        data: { message: language[lang].CATCH_MSG },
      });
    }
  }
  public async getFee(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      return res.status(GlblCode.SUCCESS).send({
        status: true,
        code: GlblCode.SUCCESS,
        message: language[lang].REQUEST_EXECUTED,
        fee: 40,
      });
    } catch (err: any) {
      console.error("Error in wallet > getFee.", err);
      await commonHelper.save_error_logs("wallet_getFee", err.message);
      let data = {
        code: GlblCode.ERROR_CODE,
        status: false,
        message: language[lang].CATCH_MSG,
      };
      return res.status(data.code).send(data);
    }
  }
  public async NativeCoinFiatPrice(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      console.log("req body NativeCoinFiatPrice >>>", req.body)
      let {
        coin_family,
        fiat_currency,
      }: { coin_family: number; fiat_currency: string } = req.body;

      let nativeCoin: any = await Models.CoinsModel.findOne({
        attributes: ["coin_gicko_id"],
        where: {
          coin_family: coin_family,
          is_token: GlblBooleanEnum.false,
          coin_status: GlblBooleanEnum.true,
        },
        raw: true,
      });

      let fiatCoinPrice: any;
      if (nativeCoin) {
        console.log(
          "Entered into if of nativeCoin",
          nativeCoin?.coin_gicko_id,
          ">>>>>",
          fiat_currency
        );

        fiatCoinPrice = await Models.CoinPriceInFiatModel.findOne({
          attributes: ["value"],
          where: {
            coin_gicko_id: nativeCoin?.coin_gicko_id,
            fiat_type: fiat_currency,
          },
          raw: true,
        });
      } else {
        console.log("Entered into else of nativeCoin");
        fiatCoinPrice = {
          value: 0,
        };
      }

      return res.status(GlblCode.SUCCESS).send({
        status: true,
        code: GlblCode.SUCCESS,
        message: language[lang].REQUEST_EXECUTED,
        data: { fiatCoinPrice: fiatCoinPrice },
      });
    } catch (err: any) {
      console.error("Error in wallet > NativeCoinFiatPrice.", err);
      await commonHelper.save_error_logs(
        "wallet_NativeCoinFiatPrice",
        err.message
      );
      let data = {
        code: GlblCode.ERROR_CODE,
        status: false,
        message: language[lang].CATCH_MSG,
      };
      return res.status(data.code).send(data);
    }
  }
  public async fetchValue(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      res.status(GlblCode.SUCCESS).send({
        message: language[lang].VALUE_FETCHED,
        data: {
          value: 80,
          crosschain: 80
        },
      });
    } catch (err: any) {
      console.error("Error in wallet > fetchValue", err);
      await commonHelper.save_error_logs("wallet_fetchValue", err.message);
      res.status(GlblCode.ERROR_CODE).send({
        message: language[lang].ERROR_FETCHING_DATA,
        data: {
          value: 80,
          crosschain: 80
        },
      });
    }
  }
  public async checkFiatBalance(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      console.log("req body checkFiatBalance >>>", req.body)
      let {
        coin_family,
        fiat_currency,
        coin_symbol,
      }: { coin_family: number; fiat_currency: string; coin_symbol: string } =
        req.body;

      let wallet_data: any = await Models.WalletModel.findOne({
        attributes: ["coin_id", "balance"],
        where: { coin_family: coin_family, user_id: req.userId },
        include: [
          {
            model: Models.CoinsModel,
            attributes: ["coin_id"],
            required: true,
            where: { is_token: GlblBooleanEnum.false },
            include: [
              {
                model: Models.CoinPriceInFiatModel,
                as: "fiat_price_data",
                attributes: ["value"],
                where: {
                  fiat_type: Fiat_Currency.USD,
                },
                required: true,
              },
            ],
          },
        ],
        order: [["wallet_id", "ASC"]],
      });
      let usd_value: any =
        wallet_data.coin.fiat_price_data.value == null
          ? "0.00"
          : wallet_data.coin.fiat_price_data.value;
      let bal_in_usd: number = usd_value * wallet_data.balance;
      bal_in_usd =
        bal_in_usd < 0.000001
          ? await WalletHelper.toFixedExp(bal_in_usd, 8)
          : bal_in_usd < 0.0001
            ? await WalletHelper.toFixedExp(bal_in_usd, 6)
            : await WalletHelper.toFixedExp(bal_in_usd, 2);
      console.log("bal_in_usd", bal_in_usd);
      if (bal_in_usd >= 10) {
        return res.status(GlblCode.SUCCESS).send({
          status: true,
          code: GlblCode.SUCCESS,
          message: "Going Fine",
        });
      } else {
        let min_balance = await WalletHelper.min_coin_balance(
          wallet_data,
          fiat_currency,
          usd_value
        );
        let coin: string =
          coin_family == 2
            ? "ETH"
            : coin_family == 6
              ? "TRON"
              : coin_family == 1
                ? "BNB"
                : "null";
        let token_type: string =
          coin_family == 2
            ? "ERC20"
            : coin_family == 6
              ? "TRC20"
              : coin_family == 1
                ? "BEP20"
                : "null";
        console.log("coin in wallet_checkFiatsBalance >>>", coin);
        return res.status(GlblCode.SUCCESS).send({
          status: true,
          code: GlblCode.SUCCESS,
          message: language[lang].MIN_BALANCE(
            min_balance.min_bal_in_fiat,
            fiat_currency,
            coin_symbol,
            coin,
            token_type
          ),
        });
      }
    } catch (err: any) {
      console.error("Error in wallet > checkFiatsBalance.", err);
      await commonHelper.save_error_logs(
        "wallet_checkFiatsBalance",
        err.message
      );
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }
  public async allBalances(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      console.log("req body allBalances >>>", req.body)
      let { makerUserIds, checkerUserIds, fiatType }:
        { makerUserIds: Array<number>, checkerUserIds: Array<number>, fiatType: string }
        = req.body;

      let checkerWalletData: any = [];
      let makerWalletData: any = [];

      let commonPart: any = [{
        model: Models.WalletModel,
        attributes: ["wallet_id", "balance", ["user_id", "checker_user_id"]],
        where: { status: GlblBooleanEnum.true },
        include: [
          {
            model: Models.CoinsModel,
            attributes: ["coin_id"],
            required: true,
            where: { coin_status: GlblBooleanEnum.true },
            include: [
              {
                model: Models.CoinPriceInFiatModel,
                as: "fiat_price_data",
                attributes: ["id", "value"],
                where: { fiat_type: fiatType },
                required: false,
              },
            ],
          },
        ],
      }]

      if (checkerUserIds.length > 0) {
        commonPart[0].as = 'user_wallet_relation';

        checkerWalletData = await Models.UsersModel.findAll({
          attributes: ["user_id"],
          where: { user_id: { [Op.in]: checkerUserIds } },
          include: commonPart,
          order: [["user_id", "ASC"]]
        })
      }

      if (makerUserIds.length > 0) {
        commonPart[0].as = 'maker_wallet_relation';
        commonPart[0].where = {
          ...commonPart[0].where,
          coin_family: {
            [Op.col]: "maker_wallets.coin_family"
          }
        }

        makerWalletData = await Models.MakerWalletsModel.findAll({
          attributes: [["id", "user_id"], ["user_id", "checker_user_id"]],
          where: { id: { [Op.in]: makerUserIds } },
          include: commonPart,
          order: [["id", "ASC"]]
        })
      }

      return response.success(res, {
        data: {
          status: true,
          makerUserData: makerWalletData,
          checkerUserData: checkerWalletData
        },
      });
    } catch (err: any) {
      console.error("Error in wallet > allBalances", err);
      await commonHelper.save_error_logs("wallet_allBalances", err.message);
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }

  public async allBalances_v2(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      console.log("req body allBalances_v2 >>>", req.body)
      let { makerUserIds, checkerUserIds, fiatType, walletData }:
        { 
          makerUserIds: Array<number>, 
          checkerUserIds: Array<number>, 
          fiatType: string,
          walletData: Array<{
            addrsListKeys: string[],
            coinFamilyKeys: number[]
          }>
        } = req.body;

      let checkerWalletData: any = [];
      let makerWalletData: any = [];

      // Helper function to execute query for a single address and coin family combination
      const executeQuery = async (addresses: string[], coinFamilies: number[], isMaker: boolean = false) => {
        let commonPart: any = [{
          model: Models.WalletModel,
          attributes: ["wallet_id", "balance", ["user_id", "checker_user_id"], "coin_id"],
          where: { 
            status: GlblBooleanEnum.true, 
            wallet_address: { [Op.in]: addresses }, 
            coin_family: { [Op.in]: coinFamilies } 
          },
          include: [
            {
              model: Models.CoinsModel,
              attributes: ["coin_id"],
              required: true,
              where: { coin_status: GlblBooleanEnum.true },
              include: [
                {
                  model: Models.CoinPriceInFiatModel,
                  as: "fiat_price_data",
                  attributes: ["id", "value"],
                  where: { fiat_type: fiatType },
                  required: false,
                },
              ],
            },
          ]
        }];

        if (isMaker) {
          commonPart[0].as = 'maker_wallet_relation';
          commonPart[0].where = {
            ...commonPart[0].where,
            coin_family: {
              [Op.col]: "maker_wallets.coin_family"
            }
          };
        } else {
          commonPart[0].as = 'user_wallet_relation';
        }

        return commonPart;
      };

      // Process checker users
      if (checkerUserIds.length > 0) {
        for (const wallet of walletData) {
          const { addrsListKeys, coinFamilyKeys } = wallet;
          const commonPart = await executeQuery(addrsListKeys, coinFamilyKeys);
          const result = await Models.UsersModel.findAll({
            attributes: ["user_id"],
            where: { user_id: { [Op.in]: checkerUserIds } },
            include: commonPart,
            order: [["user_id", "ASC"]],
            logging: false,
          });
          checkerWalletData = [...checkerWalletData, ...result];
        }
      }

      // Process maker users
      if (makerUserIds.length > 0) {
        for (const wallet of walletData) {
          const { addrsListKeys, coinFamilyKeys } = wallet;
          const commonPart = await executeQuery(addrsListKeys, coinFamilyKeys, true);
          const result = await Models.MakerWalletsModel.findAll({
            attributes: [["id", "user_id"], ["user_id", "checker_user_id"]],
            where: { id: { [Op.in]: makerUserIds } },
            include: commonPart,
            order: [["id", "ASC"]],
            logging: false,
          });
          makerWalletData = [...makerWalletData, ...result];
        }
      }

      return response.success(res, {
        data: {
          makerUserData: makerWalletData,
          checkerUserData: checkerWalletData
        },
      });
    } catch (err: any) {
      console.error("Error in wallet > allBalances_v2", err);
      await commonHelper.save_error_logs("wallet_allBalances_v2", err.message);
      return response.error(res, {
        data: {
          status: false,
          message: language[lang].CATCH_MSG,
        },
      });
    }
  }
  
  public async updateBalance(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      console.log("req body updateBalance >>>", req.body)
      let {
        wallet_address,
        coin_family,
        coin_id,
      }: { wallet_address: string; coin_family: number; coin_id: number } =
        req.body;
      let data: any = {
        wallet_address: wallet_address,
        coin_id: coin_id,
        coin_family: coin_family,
      };
      data.balance = await Models.WalletModel.findOne({
        attributes: ["balance"],
        where: {
          wallet_address: data.wallet_address,
          coin_id: data.coin_id,
        },
        raw: true,
      });
      return res.status(GlblCode.SUCCESS).send({
        status: true,
        code: GlblCode.SUCCESS,
        message: language[lang].REQUEST_EXECUTED,
        data: { balance: data.balance.balance },
      });
    } catch (err: any) {
      console.error("Error in wallet > updateBalance.", err);
      await commonHelper.save_error_logs("wallet_updateBalance", err.message);
      let data = {
        code: GlblCode.ERROR_CODE,
        status: false,
        message: language[lang].CATCH_MSG,
      };
      return res.status(data.code).send(data);
    }
  }
  public async downloadCsv(req: Request, res: Response) {
    let lang: any = req.headers["content-language"] || "en";
    try {
      // let id: any = req.params.id;
      let userId: any = req.params.id;
      console.log("req body downloadCsv >>>", req.params)


      let last_month_date: any = moment()
        .subtract(GlblBooleanEnum.true, "months")
        .format("YYYY-MM-DD");
      let wallet_addresses: any = await Models.WalletModel.findAll({
        attributes: ["wallet_address"],
        where: {
          user_id: userId
        },
        raw: true,
        group: ['wallet_address']
      })
      let addresses: string[] = [];
      if (wallet_addresses) {
        addresses = wallet_addresses.map((el: { wallet_address: string }) => el.wallet_address)
      }
      if (addresses.length == GlblBooleanEnum.false) {
        let data = {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: language[lang].NO_ADDRESS_FOUND
        };
        return response.error(res, {
          data: data
        });
      }
      let where_clause: any = {
        [Op.and]: [
          {
            [Op.or]: [
              {
                [Op.and]: [
                  { from_adrs: { [Op.in]: addresses } },
                  { user_id: userId },
                  {
                    [Op.or]: [
                      { blockchain_status: GlblBlockchainTxStatusEnum.PENDING },
                      { blockchain_status: GlblBlockchainTxStatusEnum.FAILED },
                      {
                        blockchain_status: GlblBlockchainTxStatusEnum.CONFIRMED,
                      },
                      { blockchain_status: null },
                    ],
                  },
                ],
              },
              {
                [Op.and]: [
                  { to_adrs: { [Op.in]: addresses } },
                  { to_user_id: userId },
                  { blockchain_status: GlblBlockchainTxStatusEnum.CONFIRMED },
                ],
              },
            ],
          },
          {
            created_at: {
              [Op.gt]: last_month_date,
            },
          },
        ],
      };

      //     let atr: any = [[
      //       Sequelize.literal(`IF(type ='withdraw' OR type = 'deposit',
      //     (IF(FIND_IN_SET(from_adrs, "${addresses.toString()}"),
      //         CONCAT(UCASE(SUBSTRING('withdraw', 1, 1)), SUBSTRING('withdraw', 2)),
      //         CONCAT(UCASE(SUBSTRING('deposit', 1, 1)), SUBSTRING('deposit', 2))
      //     )),
      //     CONCAT(UCASE(SUBSTRING(type, 1, 1)), SUBSTRING(type, 2))
      // )`), 'type'
      //     ], "from_adrs", "to_adrs", "tx_id", "status", "blockchain_status", "amount", "tx_fee", "created_at"];

      let atr: any = [
        [
          Sequelize.literal(`IF(type ='withdraw' OR type = 'deposit',
  (IF(FIND_IN_SET(user_id, "${userId}"),
      CONCAT(UCASE(SUBSTRING('withdraw', 1, 1)), SUBSTRING('withdraw', 2)),
      CONCAT(UCASE(SUBSTRING('deposit', 1, 1)), SUBSTRING('deposit', 2))
  )),
  CONCAT(UCASE(SUBSTRING(type, 1, 1)), SUBSTRING(type, 2))
)`),
          "type",
        ],
        "from_adrs",
        "to_adrs",
        "tx_id",
        "status",
        "blockchain_status",
        "amount",
        "tx_fee",
        "created_at",
      ];

      await Models.TrnxHistoryModel.findAll({
        attributes: atr,
        where: where_clause,
        order: [["created_at", "DESC"]],
      }).then((objs) => {
        let data: any = [];
        objs.forEach((obj) => {
          obj.type =
            obj.type == "Cross_chain"
              ? language[lang].CROSS_CHAIN
              : obj.type == "Dapp"
                ? language[lang].DAPP
                : obj.type == "Deposit"
                  ? language[lang].DEPOSIT
                  : obj.type == "Swap"
                    ? language[lang].SWAP
                    : obj.type == "Withdraw"
                      ? language[lang].WITHDRAW
                      : obj.type == "Approve"
                        ? language[lang].APPROVE
                        : obj.type == "Buy"
                          ? language[lang].BUY
                          : obj.type == "Card_fees"
                            ? language[lang].CARD_FEES
                            : obj.type == "Level_upgradation_fee"
                              ? language[lang].LEVEL_UPGRADE
                              : language[lang].CARD_RECHARGE;
          obj.status =
            obj.status == "completed"
              ? language[lang].COMPLETED
              : language[lang].FAILED_STATUS;
          obj.blockchain_status =
            obj.blockchain_status == "confirmed"
              ? language[lang].CONFIRMED
              : obj.blockchain_status == "failed"
                ? language[lang].FAILED_STATUS
                : language[lang].PENDING_STATUS;
          const {
            type,
            from_adrs,
            to_adrs,
            tx_id,
            status,
            blockchain_status,
            amount,
            tx_fee,
            created_at,
          }: any = obj;
          data.push({
            type,
            from_adrs,
            to_adrs,
            tx_id,
            status,
            blockchain_status,
            amount,
            tx_fee,
            created_at,
          });
        });
        const opts = {
          fields: [
            { label: `${language[lang].TYPE}`, value: "type" },
            { label: `${language[lang].FROM_ADRS}`, value: "from_adrs" },
            { label: `${language[lang].TO_ADRS}`, value: "to_adrs" },
            { label: `${language[lang].TX_ID}`, value: "tx_id" },
            { label: `${language[lang].STATUS}`, value: "status" },
            {
              label: `${language[lang].BLOCKCHAIN_STATUS}`,
              value: "blockchain_status",
            },
            { label: `${language[lang].AMOUNT}`, value: "amount" },
            { label: `${language[lang].TRNX_FEE}`, value: "tx_fee" },
            { label: `${language[lang].CREATED}`, value: "created_at" },
          ],
        };
        const parser = new Parser(opts);
        const csvData = parser.parse(data);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=transaction_history.csv"
        );
        res.status(GlblCode.SUCCESS).end(csvData);
      });
    } catch (err: any) {
      console.error("Error in wallet > downloadCsv.", err);
      await commonHelper.save_error_logs("wallet_downloadCsv", err.message);
      let data = {
        code: GlblCode.ERROR_CODE,
        status: false,
        message: language[lang].CATCH_MSG,
      };
      return res.status(data.code).send(data);
    }
  }

  public addressValidateChainalysis = async (req: Request, res: Response) => {
    let lang: any = req.headers["content-language"] || "en";
    try {
      const wallet_address:any = req.query.wallet_address;

      let responseAPI:any = await commonHelper.addressValidateChainalysis(wallet_address);
      console.log("addressValidateChainalysis:responseAPI::",responseAPI);
      

      if (!responseAPI.status && responseAPI.message) {
        await this.handleErrorResponseChainAnalytics(
          req.body.from_address || wallet_address,
          req.body.to_address || null,
          req.body.amount || null,
          responseAPI,
          responseAPI.url || "API URL not available"
        );
        
        let data = {
          code: GlblCode.ERROR_CODE,
          status: false,
          message: language[lang].THIRD_PARTY_ERROR || language[lang].CATCH_MSG,
        };
        return res.status(data.code).send(data);
      }
      
      return res.status(GlblCode.SUCCESS).send({
        status: true,
        code: GlblCode.SUCCESS,
        data: responseAPI.response
      });
      
    } catch (error:any) {
      console.error("Error in wallet > addressValidateChainalysis.", error);
      await commonHelper.save_error_logs("address_ValidateChainalysis", error.message);
      let data = {
        code: GlblCode.ERROR_CODE,
        status: false,
        message: language[lang].CATCH_MSG,
      };
      return res.status(data.code).send(data);
    }
  }

  private handleErrorResponseChainAnalytics = async (from_address: any, to_address: any, amount: any, error: any, url: any) => {
    try {

      let errorResponse;
      let errUrl
      if (error.response && error.response.data) {
        errorResponse = error.response.data;
        errUrl = url
      } else {
        errorResponse = error
        errUrl = url
      }
      const mailBody = `REQUEST: ${errUrl}\n\nERROR: ${JSON.stringify(errorResponse)}`;
      const currentTime = Date.now();
      // const lastEmailTime = await redisHelper.getKeyValuePair("last_error_email_time", "LAST_MAIL_TIME");

      const cooldownPeriod = 60 * 60 * 1000; // 1 hour

      await Models.chainAnalErrorLogsModel.create({
        from_address: from_address,
        to_address: to_address,
        amount: amount,
        error_message: JSON.stringify(errorResponse),//errMessage,
      });
      // if (!lastEmailTime || (currentTime - parseInt(lastEmailTime, 10)) >= cooldownPeriod) {

      //   Mail_Helper.SEND_MAIL(config.MAIL_TO_ADDRESS, config.CC_ADDRESS, `${mailBody}`,
      //     `${config.NODE_ENV} USER ADDRESS BLOCKED BY CHAINANALYSIS`);

      //   await redisHelper.setKeyValuePair("last_error_email_time", "LAST_MAIL_TIME", currentTime.toString());

      // }
      // return errorResponse
    } catch (error) {

      return error
    }
  };

}

export const walletController = new WalletController();
