import database from "../config/db";
import Sequelize from "sequelize";
import { CoinInterface, WalletInterface } from "../models";
import redisClient from "../config/redis";
import { promisify } from "util";
import { config } from "../config/config";
import { global_helper } from "../helpers/global_helper";
import { Blockchain_Helper } from "../helpers";
import { Op } from "sequelize";
import { behindBlockQueries, coinQueries } from "../helpers/dbHelper";

class BscProcessHelper {
  public CoinsInterface: CoinInterface[];
  public WalletAddresses: WalletInterface[];

  constructor() {
    this.fetchERC20Tokens();
  }
  public getKeyValuePair = async (keyName: string, field: string) => {
    try {
      const getAsync = promisify(redisClient.HGET).bind(redisClient);
      const value = await getAsync(keyName, field.toUpperCase() || "");
      return value;
    } catch (err: any) {
      console.error('getKeyValuePair >>>>', err);
      return null;
    }
  }
  public setBlocks = async (field: string, key: string, minBlockConfirmation: number, newBlock: number | null) => {
    try {
      let { getBlockNumber } = Blockchain_Helper.BSC_Web3.eth;
      let latestBlock = await getBlockNumber();
      latestBlock = latestBlock - minBlockConfirmation;
      if (newBlock) {
        if (newBlock < latestBlock) {
          await bscProcessHelper.setKeyValuePair(field, key, latestBlock.toString())
        } else {
          console.log("No updation of blocks")
        }
      } else {
        await bscProcessHelper.setKeyValuePair(field, key, latestBlock.toString())
      }
    } catch (err: any) {
      console.error("Error in  getBlocks", err)
      await global_helper.save_error_logs('MATIC_setBlocks', err.message)
    }
  }
  public setKeyValuePair = async (keyName: string, field: string, value: string) => {
    try {
      redisClient.hset(keyName, field.toUpperCase(), value);
    } catch (err: any) {
      console.error('setKeyValuePair >>>', err);
    }
  }
  public diff_blocks_add_in_db = async (current_block: number, old_block: number) => {
    try {
      let value_exist: any = await this.getKeyValuePair(config.REDISKEYS.ALL_PROCESSES, config.REDISKEYS.NODE_ALERT_BSC)
      if (value_exist) {
        let setvalue: number = Number(value_exist) + 1;
        if (Number(value_exist) <= 100) {
          await this.setKeyValuePair(config.REDISKEYS.ALL_PROCESSES, config.REDISKEYS.NODE_ALERT_BSC, setvalue.toString())
          if (Number(value_exist) == 0 || Number(value_exist) == 5 || Number(value_exist) == 10 || Number(value_exist) == 20 || Number(value_exist) == 50 || Number(value_exist) == 75 || Number(value_exist) == 100) {
            let email_body = `<p>Bscereum Node Issue ${Number(value_exist)}</p><p>Current block running = ${current_block}.</p><p>Old Block = ${old_block}.</p>`;
            await global_helper.send_mail(config.NODE_ISSUE_ALERT_EMAIL, email_body, `Bsc Node Issue ${Number(value_exist)}`);
          } else {
            console.log("no email")
          }
        } else {
          console.log("Number(value_exist) > 100")
        }
      } else {
        await this.setKeyValuePair(config.REDISKEYS.ALL_PROCESSES, config.REDISKEYS.NODE_ALERT_BSC, '0')
      }

      let dataToInsert = {
        start_block: old_block,
        end_block: current_block,
        coin_family: config.STATIC_COIN_FAMILY.BNB,
        status: 0
      }
      console.log("dataToInsert>>>>", dataToInsert)
      await behindBlockQueries.create(dataToInsert)

      return true;
    } catch (err: any) {
      console.error("💥 ~ Error in diff_blocks_add_in_redis.", err)
      await global_helper.save_error_logs('BSC_diff_blocks_add_in_db', err.message)
      return false;
    }
  }
  public getHashTable = async (keyName: string) => {
    try {
      const getAsync: any = promisify(redisClient.hvals).bind(redisClient)
      const value: any = await getAsync(keyName)
      return value;
    } catch (err: any) {
      console.error("Error in getHashTable>>>", err)
      return null;
    }
  }
  public deleteKeyValuePair = async (keyName: string, field: string) => {
    try {
      redisClient.hdel(keyName, field.toUpperCase(), function (err) {
        if (err) {
          throw err;
        }
        return true;
      })
    } catch (err: any) {
      console.error("Error in deleteKeyValuePair>>>", err)
      return false;
    }
  }
  public fetchERC20Tokens = async () => {
    try {
      let tokens: any = await coinQueries.findAll(
        ["coin_id", "coin_name", "coin_symbol", "mainnet_token_address", "coin_gicko_alias", "coin_image", "coin_family", "coin_status", "is_token", "token_type", "decimals", "cmc_id", "is_on_cmc", "usd_price", "withdraw_limit", "token_abi", "uuid", "token_address", "for_swap", "added_by", "created_at", "updated_at"],
        {
          coin_status: 1,
          coin_family: config.STATIC_COIN_FAMILY.BNB,
          [Op.or]: [{ token_type: { [Op.ne]: config.TOKEN_TYPE721_BSC } }, { token_type: null }]
        },
        [['coin_id', 'ASC']]
      )

      redisClient.set(config.TOKEN_TYPE_BSC || "", JSON.stringify(tokens));
    } catch (err: any) {
      console.error('fetchERC20Tokens >>>>>', err);
      await global_helper.save_error_logs('BSC_fetchERC20Tokens', err.message)
    }
  }
  public checkIfContract = async (address: string) => {
    try {
      const getAsync = promisify(redisClient.get).bind(redisClient);
      const value = await getAsync(config.TOKEN_TYPE_BSC || "");

      const erc20Tokens: CoinInterface[] = value ? JSON.parse(value) : [];
      const token = erc20Tokens.find(
        (el: any) => Number(el.is_token) === 1 && el.token_address?.toUpperCase() === address?.toUpperCase()
      );
      if (token) return token;
      return null;
    } catch (error: any) {
      console.error('checkIfContract >>>', error);
      return null;
    }
  };
  public fetchERC721Tokens = async () => {
    try {
      const getTokenQuery = `SELECT * FROM coins WHERE coin_status=1 AND coin_family=${config.STATIC_COIN_FAMILY.BNB} AND (token_type!='${config.TOKEN_TYPE_BSC}' OR token_type is null)`;

      const tokens: CoinInterface[] = await database.db_read.query(getTokenQuery, {
        type: Sequelize.QueryTypes.SELECT,
      });

      redisClient.set(config.TOKEN_TYPE721_BSC, JSON.stringify(tokens));
    } catch (error: any) {
      console.error('fetchERC721Tokens >>>>', error);
    }
  };
  public checkIfOurNFTContract = async (address: string) => {
    try {
      const getAsync = promisify(redisClient.get).bind(redisClient);
      const value = await getAsync(config.TOKEN_TYPE721_BSC);
      const erc721Tokens: CoinInterface[] = value ? JSON.parse(value) : [];
      const token = erc721Tokens.find(
        (el: any) => Number(el.is_token) === 1 && el.token_address.toUpperCase() === address?.toUpperCase()
      );

      if (token) return token;
      return null;
    } catch (error: any) {
      console.error('checkIfOurNFTContract >>>>>', error);
      return null;
    }
  };
  public check_our_wallet_address = async (address: string) => {
    try {

      let wallet_data: any = await this.getKeyValuePair(config.BSC_WALLET_ADDRESS, address);
      if (wallet_data) {
        console.log("wallet_Data>>>>>>>>", wallet_data)
      }
      return JSON.parse(wallet_data);
    } catch (err: any) {
      console.error('check_our_wallet_address >>>>>', err);
      return null;
    }
  };
  public NativeCoinByCoinFamily = async (coin_family: number) => {
    try {
      const getAsync = promisify(redisClient.get).bind(redisClient);
      const value = await getAsync(config.TOKEN_TYPE_BSC || "");
      const erc20Tokens: CoinInterface[] = value ? JSON.parse(value) : [];
      return erc20Tokens.find(
        (el: CoinInterface) => Number(el.is_token) === 0 && el.coin_family === coin_family
      );

    } catch (err: any) {
      console.error(`NativeCoinByCoinFamily >>>`, err);
      return 0;
    }
  }
  public CoinByCoinId = async (coin_id: number) => {
    try {
      const getAsync = promisify(redisClient.get).bind(redisClient);
      const value = await getAsync(config.TOKEN_TYPE_BSC || "");

      const erc20Tokens: CoinInterface[] = value ? JSON.parse(value) : [];
      return erc20Tokens.find(
        (el: CoinInterface) => el.coin_id === coin_id
      );

    } catch (err: any) {
      console.error(`CoinByCoinId >>>`, err);
      return null;
    }
  }
  public behindBlocks = async () => {
    try {
      let behindBlocks: any = await behindBlockQueries.findOne(
        ['id', 'start_block', 'end_block'],
        { status: 0, coin_family: config.STATIC_COIN_FAMILY.BNB },
        [['id', 'ASC']]
      )

      if (behindBlocks) {
        let add_data = {
          id: behindBlocks.id,
          // block_number: behindBlocks.block_number,
          start_block: behindBlocks.start_block,
          end_block: behindBlocks.end_block,
          diff: behindBlocks.end_block - behindBlocks.start_block
        }
        let dataaaaa_exist: any = await this.setKeyValuePair(config.BLOCKS, config.READ_BEHINED_BLOCK_BSC, JSON.stringify(add_data))
      } else {
        console.log("you have not any behind block yet")
      }
    } catch (err: any) {
      console.error(`behindBlocks >>>`, err);
      return null;
    }
  }

}
const bscProcessHelper = new BscProcessHelper();
export default bscProcessHelper;