import database from "../config/db";
import Sequelize from "sequelize";
import { CoinInterface, CoinsModel, EthOldBLockModel, WalletInterface } from "../models";
import redisClient from "../config/redis";
import { promisify } from "util";
import { config } from "../config/config";
import { BooleanEnum, CoinFamilyEnum } from "../enum";
import { global_helper } from "../helpers/global_helper";
import { Blockchain_Helper } from "../helpers";
import { Op } from "sequelize";

class EthProcessHelper {
  public CoinsInterface: CoinInterface[];
  public WalletAddresses: WalletInterface[];

  constructor() {
    this.fetchERC20Tokens();
    // this.fetchERC721Tokens();
    // this.fetchWalletAddress();
  }
  public async getKeyValuePair(keyName: string, field: string) {
    try {
      const getAsync = promisify(redisClient.HGET).bind(redisClient);
      const value = await getAsync(keyName, field.toUpperCase() || "");
      return value;
    } catch (err: any) {
      console.error('getKeyValuePair >>>>', err);
      return null;
    }
  }
  public async setBlocks(field: string, key: string, minBlockConfirmation: number, newBlock: number | null) {
    try {
      let { getBlockNumber } = Blockchain_Helper.Web3.eth;
      let latestBlock = await getBlockNumber();
      latestBlock = latestBlock - minBlockConfirmation;
      if (newBlock) {
        if (newBlock < latestBlock) {
          await ethProcessHelper.setKeyValuePair(field, key, latestBlock.toString())
        } else {
          console.log("No updation of blocks")
        }
      } else {
        await ethProcessHelper.setKeyValuePair(field, key, latestBlock.toString())
      }
    } catch (err: any) {
      console.error("Error in  getBlocks", err)
      await global_helper.save_error_logs('ETH_setBlocks', err.message)
    }
  }
  public async setKeyValuePair(keyName: string, field: string, value: string) {
    try {
      redisClient.hset(keyName, field.toUpperCase(), value);
    } catch (err: any) {
      console.error('setKeyValuePair >>>', err);
    }
  }
  public async diff_blocks_add_in_db(current_block: number, old_block: number) {
    try {
      let value_exist: any = await this.getKeyValuePair(config.REDISKEYS.ALL_PROCESSES, config.REDISKEYS.NODE_ALERT_ETH)
      if (value_exist) {
        let setvalue: number = Number(value_exist) + 1;
        if (Number(value_exist) <= 100) {
          await this.setKeyValuePair(config.REDISKEYS.ALL_PROCESSES, config.REDISKEYS.NODE_ALERT_ETH, setvalue.toString())
          if (Number(value_exist) == 0 || Number(value_exist) == 5 || Number(value_exist) == 10 || Number(value_exist) == 20 || Number(value_exist) == 50 || Number(value_exist) == 75 || Number(value_exist) == 100) {
            let email_body = `<p>Ethereum Node Issue ${Number(value_exist)}</p><p>Current block running = ${current_block}.</p><p>Old Block = ${old_block}.</p>`;
            await global_helper.send_mail(config.NODE_ISSUE_ALERT_EMAIL, email_body, `Ethereum Node Issue ${Number(value_exist)}`);
          } else {
            console.log("no email")
          }
        } else {
          console.log("Number(value_exist) > 100")
        }
      } else {
        await this.setKeyValuePair(config.REDISKEYS.ALL_PROCESSES, config.REDISKEYS.NODE_ALERT_ETH, '0')
      }
      // let blocks: any = [];
      // let dataToInsert: any = [];
      // for (let i: any = old_block; i <= current_block; i++) {
      // blocks.push(i)
      let dataToInsert = { block_number: old_block, coin_family: config.COIN_FAMILY_ETH, start_block: old_block, end_block: current_block, status: 0}
      // }
      console.log("dataToInsert>>>>", dataToInsert)
      // await EthOldBLockModel.destroy({ where: { block_number: { [Op.in]: blocks } } })
      await EthOldBLockModel.create(dataToInsert)
      return true;
      // REDIS BASED
      // for (let i: any = old_block; i <= current_block; i++) {
      //   let data_exist: any = await this.getKeyValuePair(config.READ_BEHINED_BLOCK_ETH, i.toString())
      //   if (data_exist) {
      //     console.log("This block exist in redis read behined", i)
      //   } else {
      //     await this.setKeyValuePair(config.READ_BEHINED_BLOCK_ETH, i.toString(), i.toString())
      //   }
      // }
      // return true;
    } catch (err: any) {
      console.error("💥 ~ Error in diff_blocks_add_in_redis.", err)
      await global_helper.save_error_logs('ETH_diff_blocks_add_in_db', err.message)
      return false;
    }
  }

  // public async getLastBlockProcessed(blockNumber: number) {
  //   try {
  //     const getAsync = promisify(redisClient.get).bind(redisClient);
  //     const value = await getAsync(config.LAST_BLOCK_NUMBER || "");
  //     if (value) return parseInt(value);
  //     redisClient.set(
  //       config.LAST_BLOCK_NUMBER || "",
  //       blockNumber.toString()
  //     );
  //   } catch (error: any) {
  //     console.error('getLastBlockProcessed >>>', error);
  //   }
  // }

  // public async updateLastBlockProcessed(lastBlockProcessed: number) {
  //   try {
  //     const updatedBlockNumber = ++lastBlockProcessed;
  //     redisClient.set(
  //       config.LAST_BLOCK_NUMBER || "",
  //       updatedBlockNumber.toString()
  //     );
  //   } catch (error: any) {
  //     console.error('updateLastBlockProcessed >>>>', error)
  //   }
  // }
  public async getHashTable(keyName: string) {
    try {
      const getAsync: any = promisify(redisClient.hvals).bind(redisClient)
      const value: any = await getAsync(keyName)
      return value;
    } catch (err: any) {
      console.error("Error in getHashTable>>>", err)
      return null;
    }
  }
  public async deleteKeyValuePair(keyName: string, field: string) {
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
      let tokens: any = await CoinsModel.findAll({
        attributes: ["coin_id", "coin_name", "coin_symbol", "mainnet_token_address", "coin_gicko_alias", "coin_image", "coin_family", "coin_status", "is_token", "token_type", "decimals", "cmc_id", "is_on_cmc", "usd_price", "withdraw_limit", "token_abi", "uuid", "token_address", "for_swap", "added_by", "created_at", "updated_at"],
        where: {
          coin_status: 1,
          coin_family: config.COIN_FAMILY_ETH,
          [Op.or]: [{ token_type: { [Op.ne]: config.TOKEN_TYPE721_ETH } }, { token_type: null }]
        },
        raw: true
      })
      redisClient.set(config.TOKEN_TYPE_ETH || "", JSON.stringify(tokens));
    } catch (err: any) {
      console.error('fetchERC20Tokens >>>>>', err);
      await global_helper.save_error_logs('ETH_fetchERC20Tokens', err.message)
    }
  }

  public checkIfContract = async (address: string) => {
    try {
      const getAsync = promisify(redisClient.get).bind(redisClient);
      const value = await getAsync(config.TOKEN_TYPE_ETH || "");

      const erc20Tokens: CoinInterface[] = value ? JSON.parse(value) : [];
      const token = erc20Tokens.find(
        (el: any) => Number(el.is_token) === Number(BooleanEnum.true) && el.token_address?.toUpperCase() === address?.toUpperCase()
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
      const getTokenQuery = `SELECT * FROM coins WHERE coin_status=1 AND coin_family=${config.COIN_FAMILY_ETH} AND (token_type!='${config.TOKEN_TYPE_ETH}' OR token_type is null)`;

      const tokens: CoinInterface[] = await database.db_read.query(getTokenQuery, {
        type: Sequelize.QueryTypes.SELECT,
      });

      redisClient.set(config.TOKEN_TYPE721_ETH, JSON.stringify(tokens));
    } catch (error: any) {
      console.error('fetchERC721Tokens >>>>', error);
    }
  };

  public checkIfOurNFTContract = async (address: string) => {
    try {
      const getAsync = promisify(redisClient.get).bind(redisClient);
      const value = await getAsync(config.TOKEN_TYPE721_ETH);
      const erc721Tokens: CoinInterface[] = value ? JSON.parse(value) : [];
      const token = erc721Tokens.find(
        (el: any) => Number(el.is_token) === Number(BooleanEnum.true) && el.token_address.toUpperCase() === address?.toUpperCase()
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
      let wallet_data: any = await this.getKeyValuePair(config.ETH_WALLET_ADDRESS, address);
      if (wallet_data) {
        console.log("wallet_Data>>>>>>>>", wallet_data)
      }
      return JSON.parse(wallet_data);
      // return address_data ? JSON.parse(address_data) : {};
    } catch (error: any) {
      console.error('check_our_wallet_address >>>>>', error);
      return null;
    }
  };
  public NativeCoinByCoinFamily = async (
    coin_family: CoinFamilyEnum
  ) => {
    try {
      const getAsync = promisify(redisClient.get).bind(redisClient);
      const value = await getAsync(config.TOKEN_TYPE_ETH || "");

      const erc20Tokens: CoinInterface[] = value ? JSON.parse(value) : [];
      return erc20Tokens.find(
        (el: CoinInterface) => Number(el.is_token) === Number(BooleanEnum.false) && el.coin_family === coin_family
      );

    } catch (error: any) {
      console.error(`NativeCoinByCoinFamily >>>`, error);
      return 0;
    }
  }

  public CoinByCoinId = async (
    coin_id: number
  ) => {
    try {
      const getAsync = promisify(redisClient.get).bind(redisClient);
      const value = await getAsync(config.TOKEN_TYPE_ETH || "");

      const erc20Tokens: CoinInterface[] = value ? JSON.parse(value) : [];
      return erc20Tokens.find(
        (el: CoinInterface) => el.coin_id === coin_id
      );

    } catch (error: any) {
      console.error(`CoinByCoinId >>>`, error);
      return null;
    }
  }
  public behindBlocks = async () => {
    try {
      let behindBlocks: any = await EthOldBLockModel.findOne({
        attributes: ['id', 'block_number', 'start_block', 'end_block'],
        where: {status: 0},
        raw: true,
        order: [['id', 'ASC']]
      })
      if (behindBlocks) {
        let add_data = {
          id: behindBlocks.id,
          start_block: behindBlocks.start_block,
          end_block: behindBlocks.end_block,
          diff: behindBlocks.end_block - behindBlocks.start_block
        }
        let dataaaaa_exist: any = await this.setKeyValuePair(config.BLOCKS, config.READ_BEHINED_BLOCK_ETH, JSON.stringify(add_data))
      } else {
        console.log("you have not any behind block yet")
      }
    } catch (err: any) {
      console.error(`behindBlocks >>>`, err);
      return null;
    }
  }
}
const ethProcessHelper = new EthProcessHelper();
export default ethProcessHelper;