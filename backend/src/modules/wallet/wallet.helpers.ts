import { OnlyControllerInterface } from "../../interfaces/controller.interface";
import redisHelper from "../../helpers/common/redis";
import * as Models from "../../models/model/index";
import { config } from "../../config";
import { GlblAddedBy, GlblBooleanEnum } from "../../constants/global_enum";
import { exponentialToDecimal } from "../../helpers/common/globalFunctions";
import {
  coin_price_in_fiat_queries,
  coin_queries,
  custom_token_queries,
  swapSettingQueries
} from "../../helpers/dbHelper";
import { language } from "../../constants";
import { global_helper } from "../../helpers/common/global_helper";
import commonHelper from "../../helpers/common/common.helpers";
import currency_fiat_queries from "../../helpers/dbHelper/currency_fiats";
import { wallet_queries } from "../../helpers/dbHelper";
import userhelper from "../user/helper";
class WalletHelpers implements OnlyControllerInterface {
  constructor() {
    this.initialize();
  }
  public initialize() { }
  public async add_coin_to_table(tokenAddress: string, symbol: string, name: string, coinGickoAlias: any, coinFamily: number, tokenType: string, decimals: any, lang: any, currentUTCDate: any, userId: number, coinGeckoId: string) {
    try {
      let swapData: any = await swapSettingQueries.swapSettingsFindOne(
        ['id', 'address', 'percentage'],
        { id: 1 },
        [['id', 'ASC']])

      let swapSupported: number = await global_helper.swapSupportedByMatcha(tokenAddress, coinFamily, swapData)

      let image: any = null;
      let coinGickoData: any = null;


      if (tokenAddress && coinGeckoId) {
        coinGickoData = await global_helper.get_coin_gicko_by_token_address(
          tokenAddress,
          coinFamily
        );

        image = coinGickoData ? coinGickoData.image : null;
        coinGeckoId = coinGickoData ? coinGickoData.id : null;
      }
      console.log(
        "coin_gicko_data>>>",
        coinGickoData,
        "token_type>>",
        tokenType
      );

      // Get gasless status
      let gaslessStatus: any = null;

      if (coinFamily == 2) {
        gaslessStatus = await global_helper.getGasLessStatus(tokenAddress, swapData);
      }

      let coinData: any = {
        coin_name: name,
        coin_symbol: symbol.toUpperCase(),
        coin_image: image,
        cmc_id: null,
        coin_gicko_id: coinGeckoId,
        coin_gicko_alias: coinGickoAlias,
        coin_family: coinFamily,
        coin_status: GlblBooleanEnum.true,
        is_token: GlblBooleanEnum.true,
        is_on_cmc: GlblBooleanEnum.true,
        for_swap: swapSupported,
        gasless: gaslessStatus,
        added_by: GlblAddedBy.USER,
        token_type: tokenType.toUpperCase(),
        decimals: Math.pow(10, parseInt(decimals)),
        token_address: tokenAddress,
        created_at: currentUTCDate,
        updated_at: currentUTCDate,
        is_on_coin_gicko: 1
      }
      let response: any = await coin_queries.coin_create(coinData)

      coinData.coin_id = response.coin_id;

      await WalletHelper.update_token_in_redis(coinData, 0)
      await custom_token_queries.custom_token_create({ coin_id: coinData.coin_id, user_id: userId })

      if (coinGickoData) {
        await WalletHelper.update_fiat_coin_price(
          coinGeckoId,
          symbol,
          name,
          coinFamily,
          tokenAddress,
          coinData.coin_id
        );
      }

      return { coinData: coinData }
    } catch (err: any) {
      console.error("Error in add_coin_to_table>>", err);
      await commonHelper.save_error_logs("add_coin_to_table", err.message);
      return null;
    }
  }

  public async update_fiat_coin_price(
    coin_gicko_id: string,
    coin_symbol: string,
    coin_name: string,
    coin_family: number,
    token_address: any,
    coin_id: number
  ) {
    try {
      let coin_data_update: any = {
        coin_symbol: coin_symbol,
        coin_name: coin_name,
        coin_family: coin_family,
        token_address: token_address,
      };
      let fiatCurrency: any =
        await currency_fiat_queries.currency_fiat_find_all(
          ["currency_code", "status"],
          { status: 1 }
        );

      console.log("fiatCurrency.length", fiatCurrency.length);
      if (fiatCurrency.length) {
        // let codes: any = fiatCurrency.map((el: any) => el.currency_code);
        for (let i: number = 0; i < fiatCurrency.length; i++) {
          let data_exist: any =
            await coin_price_in_fiat_queries.coin_price_in_fiat_find_one(
              ["id"],
              {
                coin_gicko_id: coin_gicko_id,
                fiat_type: fiatCurrency[i].currency_code.toLowerCase(),
              }
            );
          if (!data_exist) {
            let coin_data: any =
              await global_helper.coinGecko_quotes_latest_api(
                fiatCurrency[i].currency_code.toLowerCase(),
                coin_gicko_id
              );
            if (coin_data) {
              if (coin_data.data) {
                let latest_price: any = {
                  price: coin_data.data.current_price,
                  timestamp: coin_data.data.last_updated,
                  volume_24h: coin_data.data.total_volume,
                  price_change_24h: coin_data.data.price_change_percentage_24h,
                };
                let data_to_insert: any = {
                  coin_id: coin_id,
                  coin_symbol: coin_data_update.coin_symbol,
                  coin_name: coin_data_update.coin_name,
                  coin_family: coin_data_update.coin_family,
                  cmc_id: null,
                  coin_gicko_id: coin_gicko_id,
                  fiat_type: fiatCurrency[i].currency_code.toLowerCase(),
                  value: coin_data.data.current_price,
                  price_change_24h: coin_data.data.price_change_24h,
                  price_change_percentage_24h:
                    coin_data.data.price_change_percentage_24h,
                  market_cap: coin_data.data.market_cap,
                  circulating: coin_data.data.circulating_supply,
                  total_supply: coin_data.data.total_supply,
                  rank: coin_data.data.market_cap_rank,
                  volume_24h: coin_data.data.total_volume,
                  token_address: coin_data_update.token_address,
                  max_supply: coin_data.data.max_supply,
                  latest_price: latest_price,
                  roi: null,
                  open: null,
                  high: null,
                  average: null,
                  close: null,
                  low: null,
                  change_price: null,
                };

                await coin_price_in_fiat_queries.coin_price_in_fiat_create(
                  data_to_insert
                );

              } else {
                console.log("no data in coingecko")
              }
            } else {
              console.log("no coin data got ")
            }
          }
        }
      }
      else {
        console.log("no fiat currency");
      }
    } catch (err: any) {
      console.error("Error in update_fiat_coin_price>>", err);
      await commonHelper.save_error_logs("update_fiat_coin_price", err.message);
      return null;
    }
  }
  public async insert_entry_in_custom_token_table(coinId: number, userId: number) {
    try {
      let selectToken: any = await custom_token_queries.custom_token_find_one(
        ["id", "user_id", "coin_id"],
        { coin_id: coinId, user_id: userId }
      );
      if (selectToken == null) {
        await custom_token_queries.custom_token_create({
          coin_id: coinId,
          user_id: userId,
        });
      } else {
        console.log("Data is present in selectToken")
      }
    } catch (err: any) {
      console.error("Error in insert_entry_in_custom_token_table>>", err);
      await commonHelper.save_error_logs(
        "insert_entry_in_custom_token_table",
        err.message
      );
      return null;
    }
  }
  public async create_wallet_for_coin(walletAddress: string, coinId: number, walletName: string, userId: number, coinFamily: number, lang: string, currentUTCDate: any, tokenAddress: string, isToken: number, tokenType: string) {
    try {
      let message: any;
      let wallet_data: any = await wallet_queries.wallet_find_one_with_order(['wallet_id', 'status'], { wallet_address: walletAddress, coin_id: coinId }, [['wallet_id', 'ASC']])
      if (!wallet_data) {

        let tokenBalData: any = await global_helper.get_new_token_balance(coinFamily, walletAddress, tokenAddress)

        wallet_data = {
          wallet_address: walletAddress,
          wallet_name: walletName,
          coin_id: coinId,
          user_id: userId,
          balance: tokenBalData.status ? tokenBalData.balance : '0',
          default_wallet: 1,
          coin_family: coinFamily,
          status: 1,
          created_at: currentUTCDate,
          updated_at: currentUTCDate,
        };
        await wallet_queries.wallet_create(wallet_data);
        message = language[lang].TOKEN_ADDED;
        if (tokenBalData.status == false) {
          // add to queue
          await userhelper.adding_coins_to_queue(config.BACKEND_WALLET_ADDRESSES,
            {
              coin_data: {
                coin_id: coinId,
                coin_family: coinFamily,
                is_token: isToken,
                token_address: tokenAddress,
                token_type: tokenType
              }, wallet_address: walletAddress, queue_count: 0
            })
        }
      } else {
        if (wallet_data.status == 1) {
          message = language[lang].TOKEN_EXIST;
        } else {
          await wallet_queries.wallet_update(
            { status: 1 },
            { wallet_address: walletAddress, coin_id: coinId }
          );
          message = language[lang].TOKEN_ADDED;
        }
      }
      return message;
    } catch (err: any) {
      console.error("error at create_wallet_for_coin================>", err);
      await commonHelper.save_error_logs("create_wallet_for_coin", err.message);
      return null;
    }
  }
  public async update_token_in_redis(coin_data: any, coin_id: number) {
    try {
      let coin_family = coin_data.coin_family;
      let tokensList: any;
      let specific_token_data: any;
      if (coin_id > 0) {
        let token: any = await coin_queries.coin_find_one([], {
          coin_id: coin_id,
        });
        specific_token_data = token;
      } else {
        specific_token_data = coin_data;
      }
      switch (coin_family) {
        case config.STATIC_COIN_FAMILY.ETH:
          tokensList = await redisHelper.getRedisSting(
            config.TOKENLIST.ETH.ERC20
          );
          tokensList = JSON.parse(tokensList);
          if (tokensList) {
            await tokensList.push(specific_token_data);
            await redisHelper.setRedisSting(
              config.TOKENLIST.ETH.ERC20,
              JSON.stringify(tokensList)
            );
          } else {
            tokensList = await coin_queries.coin_find_all([], {
              coin_status: 1,
              coin_family: coin_family,
            });
            await redisHelper.setRedisSting(
              config.TOKENLIST.ETH.ERC20,
              JSON.stringify(tokensList)
            );
          }
          break;
        case config.STATIC_COIN_FAMILY.BNB:
          tokensList = await redisHelper.getRedisSting(
            config.TOKENLIST.BSC.BEP20
          );
          tokensList = JSON.parse(tokensList);
          if (tokensList) {
            await tokensList.push(specific_token_data);
            await redisHelper.setRedisSting(
              config.TOKENLIST.BSC.BEP20,
              JSON.stringify(tokensList)
            );
          } else {
            tokensList = await coin_queries.coin_find_all([], {
              coin_status: 1,
              coin_family: coin_family,
            });
            await redisHelper.setRedisSting(
              config.TOKENLIST.BSC.BEP20,
              JSON.stringify(tokensList)
            );
          }
          break;
        case config.STATIC_COIN_FAMILY.TRX:
          tokensList = await redisHelper.getRedisSting(
            config.TOKENLIST.TRON.TRX20
          );
          tokensList = JSON.parse(tokensList);
          if (tokensList) {
            await tokensList.push(specific_token_data);
            await redisHelper.setRedisSting(
              config.TOKENLIST.TRON.TRX20,
              JSON.stringify(tokensList)
            );
          } else {
            tokensList = await coin_queries.coin_find_all([], {
              coin_status: 1,
              coin_family: coin_family,
            });
            await redisHelper.setRedisSting(
              config.TOKENLIST.TRON.TRX20,
              JSON.stringify(tokensList)
            );
          }
          break;
      }
    } catch (err: any) {
      console.error("error at update_token_in_redis", err);
      await commonHelper.save_error_logs("update_token_in_redis", err.message);
      return null;
    }
  }
  // public async send_mail(email: string, text: string, subject: string) {
  //   try {
  //     console.log("email >>>>.", email)
  //     const MAILGUN_API_KEY: string = ``;
  //     const MAILGUN_DOMAIN: string = ``;
  //     const MAILGUN_BASE_URL: string = ``;
  //     const response: any = await axios({
  //       method: 'post',
  //       url: `${MAILGUN_BASE_URL}/messages`,
  //       auth: {
  //         username: 'api',
  //         password: MAILGUN_API_KEY
  //       },
  //       params: {
  //         from: "",
  //         to: email,
  //         subject: subject,
  //         html: text
  //       }
  //     });
  //     console.log("response>>", response)
  //     return response;
  //   } catch (err: any) {
  //     console.error("send_mail", err)
  //     throw err;
  //   }
  // }

  public async min_coin_balance(
    wallet_data: any,
    fiat_currency: string,
    usd_value: any
  ) {
    try {
      let fiat_currency_value: any = await Models.CoinPriceInFiatModel.findOne({
        attributes: ["value"],
        where: {
          coin_id: wallet_data.coin_id,
          fiat_type: fiat_currency,
        },
        raw: true,
      });
      let min_bal: number = 10 / usd_value;
      let min_bal_in_fiat: number = min_bal * fiat_currency_value.value;
      min_bal_in_fiat =
        min_bal_in_fiat < 0.000001
          ? await WalletHelper.toFixedExp(min_bal_in_fiat, 8)
          : min_bal_in_fiat < 0.0001
            ? await WalletHelper.toFixedExp(min_bal_in_fiat, 6)
            : await WalletHelper.toFixedExp(min_bal_in_fiat, 2);
      console.log("min_bal>>>>", min_bal_in_fiat);
      return {
        min_bal_in_fiat: min_bal_in_fiat,
        fiat_value: fiat_currency_value.value,
      };
    } catch (err: any) {
      console.error("Error in min_coin_balance of wallet", err);
      throw err;
    }
  }
  public async toFixedExp(num: any, fixed: number) {
    try {
      if (num) {
        num = exponentialToDecimal(Number(num));
        let re = new RegExp("^-?\\d+(?:.\\d{0," + (fixed || -1) + "})?");
        return num.toString().match(re)[0];
      } else {
        return "0.00";
      }
    } catch (err: any) {
      console.error("Error in toFixedExp>>", err);
      return "0.00";
    }
  }
}
export const WalletHelper = new WalletHelpers();
