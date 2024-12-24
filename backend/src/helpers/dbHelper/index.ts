import { Request } from "express";
import { WalletInterface } from "../../models/interface/index.interface";
import { config } from "../../config";
import * as Models from '../../models/model/index'
import redisClient from "../common/redis";
import { CoinFamily, GlblBlockchainTxStatusEnum, TxReqTypesEnum, Status } from "../../constants/global_enum";
import wallet_queries from "./wallets";
import user_queries from "./users";
import coin_queries from './coins';
import device_token_queries from "./device_tokens";
import catch_err_msg_queries from "./catch_err_msgs";
import notification_queries from "./notifications";
import address_book_wallet_queries from './address_book_wallet';
import address_book_queries from './address_books';
import gas_prices_queries from './gas_prices';
import custom_token_queries from './custom_tokens';
import coin_price_in_fiat_queries from "./coin_price_in_fiat";
import trnx_history_queries from './trnx_history';
import { GlblCode, GlblMessages } from "../../constants/global_enum";
import adminErrQueries from './admin_err_logs';
import adminQueries from './admins';
import swapSettingQueries from './swap_settings';
import changellySupportedCrossChainCoinQueries from './changelly_supported_cross_chain_coins';
import changellySupportedCountriesQueries from './changelly_supported_countries';
import changellySupportedOnOffRampsQueries from './changelly_supported_on_off_ramps';
import changellySupportedProvidersQueries from './changelly_supported_providers';
import changellyDetailsQueries from './changelly_details';
import changellyWebhooksQueries from './changelly_webhooks';
import changellyOnOffRampOrdersQueries from './changelly_on_off_ramp_orders';
export {
  wallet_queries,
  user_queries,
  coin_queries,
  device_token_queries,
  catch_err_msg_queries,
  notification_queries,
  address_book_wallet_queries,
  address_book_queries,
  gas_prices_queries,
  custom_token_queries,
  coin_price_in_fiat_queries,
  trnx_history_queries,
  adminErrQueries,
  adminQueries,
  swapSettingQueries,
  changellySupportedCrossChainCoinQueries,
  changellySupportedCountriesQueries,
  changellySupportedOnOffRampsQueries,
  changellySupportedProvidersQueries,
  changellyDetailsQueries,
  changellyWebhooksQueries,
  changellyOnOffRampOrdersQueries
};

class DbHelper {
  public async send_response_without_pagination(data: any, err_exist: number) {
    try {
      let obj: any
      if (err_exist == 0) {
        obj = {
          message: GlblMessages.SUCCESS,
          status: Status.TRUE,
          code: GlblCode.SUCCESS,
        }
        if (data) {
          obj.data = data
        } else {
          obj.data = GlblMessages.SUCCESS
        }
      } else {
        obj = {
          message: data,
          status: Status.FALSE,
          code: GlblCode.ERROR_CODE,
          data: {}
        }
      }
      return obj;
    } catch (err: any) {
      console.error("Error in send_response_without_pagination>>", err)
      throw err;
    }
  }

  public async getWalletIdByAddress(
    wallet_address: string,
    coin_id: number
  ): Promise<number | null> {
    try {
      var queryRes = await Models.WalletModel.findOne({
        where: { wallet_address, coin_id },
        attributes: ["wallet_id"],
      });
      if (queryRes) return queryRes.wallet_id;
      else return null;
    } catch (error) {
      return null;
    }
  }
  public async getWalletInfoByAddressAndCoinId(
    wallet_address: string,
    coin_id: number | undefined
  ): Promise<WalletInterface | null> {
    try {
      let queryRes: any = await Models.WalletModel.findOne({
        where: { wallet_address, coin_id },
      });
      if (queryRes) return queryRes;
      else return null;
    } catch (error) {
      return null;
    }
  }
  public async getUserDeviceToken(
    userId: number
  ): Promise<{ device_token: Array<string> }> {
    let deviceTokensData: any = await Models.DeviceTokenModel.findAll({
      where: { user_id: userId, status: 1 },
      attributes: ["device_token"],
    });
    let newValue: any = [];
    for await (let deviceToken of deviceTokensData) {
      newValue.push(deviceToken.device_token);
    }
    if (newValue.length > 0) return { device_token: newValue as string[] };
    else return { device_token: [] };
  }
  public async saveWithdrawTxDetails(
    req: Request, isMaker: number | null
  ) {
    try {
      let to_user_id: number = 0;
      let user_data: any = '';
      if (req.coininfo.coin_family == CoinFamily.ETH) {
        user_data = await redisClient.getKeyValuePair(config.ETH_WALLET_ADDRESS, req.body.to.toUpperCase())
      } else if (req.coininfo.coin_family == CoinFamily.BTC) {
        user_data = await redisClient.getKeyValuePair(config.BTC_WALLET_ADDRESS, req.body.to.toUpperCase())
      } else if (req.coininfo.coin_family == CoinFamily.TRX) {
        user_data = await redisClient.getKeyValuePair(config.TRON_WALLET_ADDRESS, req.body.to.toUpperCase())
      } else if (req.coininfo.coin_family == CoinFamily.BNB) {
        user_data = await redisClient.getKeyValuePair(config.BNB_WALLET_ADDRESS, req.body.to.toUpperCase())
      }
      user_data = JSON.parse(user_data);
      to_user_id = user_data ? user_data?.user_id : 0;

      let updateWallet: any = await trnx_history_queries.trnx_history_create({
        user_id: req.userId,
        to_user_id: to_user_id,
        coin_id: req.coininfo.coin_id,
        coin_family: req.coininfo.coin_family,
        type: req.body.tx_type,
        req_type: req.body.req_type || TxReqTypesEnum.APP,
        from_adrs: req.body.from,
        to_adrs: req.body.to,
        is_maker: isMaker,
        tx_id: req.body.tx_hash,
        merchant_id: null,
        order_id: req.body.order_id ? req.body.order_id : null,
        tx_raw: req.body.tx_raw || null,
        status: req.body.tx_status,
        blockchain_status: req.body.blockchain_status || GlblBlockchainTxStatusEnum.PENDING,
        amount: req.body.amount,
        block_id: null,
        block_hash: null,
        speedup: req.body.is_speedup || null,
        nonce: req.body.nonce || null,
        tx_fee: req.body.gas_price || null,
        swap_fee: req.body.swap_fee || null,
        gas_limit: req.body.gas_estimate || null,
        gas_price: req.body.gas_price || null,
        gas_reverted: null,
        fiat_type: 'USD',
        country_code: null,
        order_status: req.body.order_id ? GlblBlockchainTxStatusEnum.PENDING : null,
        rocketx_request_id: req.body?.requestId ? req.body?.requestId : null
      });

      if (updateWallet) {
        return { status: true, data: updateWallet };
      } else {
        return { status: false, data: null };
      }
    } catch (err: any) {
      console.error("ERROR in  save tx>>>>>>>>>>>>>>>", err)
      return { status: false, data: null };
    }
  }
  public async ifDepositTxExist(
    txid: string,
    toadrs: string
  ): Promise<Boolean> {
    let depositTxn: any = await Models.TrnxHistoryModel.findOne({
      where: { tx_id: txid, to_adrs: toadrs },
      attributes: ["id"],
    });
    if (depositTxn) return true;
    else return false;
  }
  public async ifWithdrawTxExist(txid: string): Promise<Boolean> {
    let withdrawTxn: any = await Models.TrnxHistoryModel.findOne({
      where: { tx_id: txid },
      attributes: ["id"],
    });
    if (withdrawTxn) return true;
    else return false;
  }
  public async checkWithdrawTxWithAddress(
    txid: string,
    address: string
  ): Promise<Boolean> {
    var withdrawTxn = await Models.TrnxHistoryModel.findOne({
      where: { tx_id: txid, from_adrs: address },
    });
    if (withdrawTxn) {
      return true;
    } else {
      return false;
    }
  }
  public async find_one_coins_table(attributes: any, where_clause: any) {
    try {
      let coin_data: any;
      if (attributes.length > 0) {
        coin_data = await Models.CoinsModel.findOne({
          attributes: attributes,
          where: where_clause,
          raw: true
        })
      } else {
        coin_data = await Models.CoinsModel.findOne({
          where: where_clause,
          raw: true
        })
      }
      return coin_data;
    } catch (err: any) {
      console.error(`Error in find_one_coins_table>>`, err);
      return null;
    }
  }

  public async find_one_wallet_table(attributes: any, where_clause: any) {
    try {
      let user_wallet_data: any = await Models.WalletModel.findOne({
        attributes: attributes,
        where: where_clause,
        raw: true
      })
      return user_wallet_data;
    } catch (err: any) {
      console.error("Error in find_one_wallet_table>>", err)
      throw err;
    }
  }
  public async find_all_coins(where_clause: any) {
    try {
      let coins_data: any = await Models.CoinsModel.findAll({
        where: where_clause,
        raw: true
      })
      return coins_data;
    } catch (err: any) {
      console.error("Error in find_all_coins>>", err)
      throw err;
    }
  }
  public async create_wallet_data(obj: any) {
    try {
      let data: any = await Models.WalletModel.create(obj)
      return data;
    } catch (err: any) {
      console.error("Error in create_wallet_data>>", err)
      throw err;
    }
  }
  public async get_referrer_from_data(referral_code: string) {
    try {
      let user_data: any = await this.get_user_data({ referral_code: referral_code })
      return user_data;
    } catch (err: any) {
      console.error("Error in get_referre_id>>", err)
      throw err;
    }
  }
  public async get_user_data(obj: any) {
    try {
      let user_data: any = await Models.UsersModel.findOne({
        attributes: ["user_id", "referral_code", "referral_type_id", "gp_referred", "fran_referred", "pre_fran_referred", "mas_fran_referred", "request_rejected"],
        where: obj,
        raw: true
      })
      return user_data;
    } catch (err: any) {
      console.error("Error in get_user_data>>>", err)
      throw err;
    }
  }
  public async update_user_table(obj: any, user_id: number) {
    try {
      await Models.UsersModel.update(obj, { where: { user_id: user_id } })
      return true;
    } catch (err: any) {
      console.error("Error in update_user_table>>", err)
      throw err;
    }
  }
  public async checkIfuserReferred(obj: any) {
    try {
      let user_data: any = await Models.ReferralModel.findOne({
        attributes: ["id", "referrer_to", "referrer_from", "used_referral_code", "to_device_id"],
        where: obj,
        raw: true
      })
      return user_data;
    } catch (err: any) {
      console.error("Error in checkIfuserReferred", err)
      throw err;
    }
  }

  public async save_referral_data(data: any) {
    try {
      let save_referral_data: any = await Models.ReferralModel.create(data);
      return save_referral_data;
    } catch (err: any) {
      console.error("Error in save_referral_data", err)
      throw err;
    }
  }

}

const dbHelper = new DbHelper();
export default dbHelper;
