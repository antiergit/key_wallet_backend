import { Op } from "sequelize";
import * as Models from '../models/model/index'
import redisClient from "../connections/redis.conn";
import { promisify } from "util";
import { config } from "../config/config";
import { BooleanEnum, CoinFamily } from "../enum";
import { Blockchain_Helper, RabbitMq, coin_queries, global_helper, node_issue_error_log_queries, wallet_queries } from '../helpers';

class TronProcessHelper {
  public CoinsInterface: any;
  public WalletAddresses: any;
  public tron_coin_family: any = config.COIN_FAMILY_TRON
  public all_processes: string = config.REDISKEYS.ALL_PROCESSES;
  public node_alert_tron: string = config.REDISKEYS.NODE_ALERT_TRON;
  public tron_wallet_address: string = config.TRON_WALLET_ADDRESS;
  public tron_token_type: string = config.TOKEN_TYPE_TRON;
  public tron_token_10: string = config.TOKEN_TYPE10_TRON;
  public read_behined_block: string = config.READ_BEHINED_BLOCK_TRON;
  public blocks: any = config.BLOCKS;
  public user_all_coins_balance_update: any = config.USER_ALL_COINS_BALANCE_UPDATE;
  public tron_update_balance_of_coin: any = config.TRON_UPDATE_BALANCE_OF_COIN;




  constructor() {
    this.fetchTRC20Tokens();
    // this.fetchERC721Tokens();
    // this.fetchWalletAddress();
  }
  public async fetchTRC20Tokens() {
    try {
      let tokens: any = await Models.CoinsModel.findAll(
        {
          where: {
            coin_status: 1,
            coin_family: this.tron_coin_family,
            [Op.or]: [
              { token_type: { [Op.ne]: this.tron_token_10 } },
              { token_type: null }
            ]
          }
        }
      )
      redisClient.set(this.tron_token_type || "", JSON.stringify(tokens));
    } catch (err: any) {
      console.error('error in fetchTRC20Tokens >>>>>', err.message);
    }
  };
  public async getKeyValuePair(keyName: string, field: string) {
    try {
      let getAsync = promisify(redisClient.HGET).bind(redisClient);
      let value = await getAsync(keyName, field.toUpperCase() || "");
      return value;
    } catch (err: any) {
      console.error('error in getKeyValuePair >>>', err);
      return null;
    }
  }
  public async setBlocks(field: string, key: string, minBlockConfirmation: number, newBlock: number | null) {
    try {
      let getBlockInfo: any = await Blockchain_Helper.tronWeb.trx.getCurrentBlock();

      if (!getBlockInfo || !getBlockInfo.block_header || !getBlockInfo.block_header.raw_data) {
        console.error('Unable to fetch current block');
        // await global_helper.save_error_logs('Tron_setBlocks', 'Unable to fetch current block')
        await node_issue_error_log_queries.node_issue_error_logs_create({
          function: "setBlocks",
          block_number: null,
          error: null,
          transaction_id: null,
          from_adrs: null,
          to_adrs: null,
          coin_family: this.tron_coin_family,
          extra: "under setBlocks if(!getBlockInfo)"
        })
        return;
      }

      console.debug("getBlockInfo >>>>>>>>>>>", getBlockInfo.block_header.raw_data.number)
      let currentBlock: number = getBlockInfo.block_header.raw_data.number;

      let latestBlock: number = currentBlock - Number(minBlockConfirmation);

      if (newBlock) {
        if (newBlock < latestBlock) {
          await tronProcessHelper.setKeyValuePair(field, key, latestBlock.toString())
        } else {
          console.log("No updation of blocks")
        }
      } else {
        await tronProcessHelper.setKeyValuePair(field, key, latestBlock.toString())
      }
    } catch (err: any) {
      console.error("Error in  getBlocks", err)
      // await global_helper.save_error_logs('TRON_setBlocksss', err.message)
      await node_issue_error_log_queries.node_issue_error_logs_create({
        function: "setBlocks",
        block_number: null,
        error: err.message,
        transaction_id: null,
        from_adrs: null,
        to_adrs: null,
        coin_family: this.tron_coin_family,
        extra: "catch under setBlocks"
      })
    }
  }
  public async setKeyValuePair(keyName: string, field: string, value: string) {
    try {
      redisClient.hset(keyName, field.toUpperCase(), value);
    } catch (err: any) {
      console.error('error in setKeyValuePair >>>', err);
    }
  }
  public async diffence_blocks_add_in_db(current_block: number, old_block: number) {
    try {
      let value_exist: any = await this.getKeyValuePair(this.all_processes, this.node_alert_tron)

      if (value_exist) {

        let setvalue: number = Number(value_exist) + 1;

        if (Number(value_exist) <= 100) {

          await this.setKeyValuePair(this.all_processes, this.node_alert_tron, setvalue.toString())

          if (Number(value_exist) == 0 || Number(value_exist) == 5 || Number(value_exist) == 10 || Number(value_exist) == 20 || Number(value_exist) == 50 || Number(value_exist) == 75 || Number(value_exist) == 100) {

            let email_body = `<p>Tron Node Issue ${Number(value_exist)}</p><p>Current block running = ${current_block}.</p><p>Old Block = ${old_block}.</p>`;

            await global_helper.send_mail(config.NODE_ISSUE_ALERT_EMAIL, email_body, `Tron Node Issue ${Number(value_exist)}`);

          } else {
            console.log("no email")
          }
        } else {
          console.log("Number(value_exist) > 100")
        }
      } else {
        await this.setKeyValuePair(this.all_processes, this.node_alert_tron, '0')
      }

      let dataToInsert = { block_number: old_block, coin_family: config.COIN_FAMILY_TRON, start_block: old_block, end_block: current_block, status: 0 }

      console.log("dataToInsert>>>>", dataToInsert)
      await Models.TronOldBLockModel.create(dataToInsert)

      return true;
    } catch (err: any) {
      console.error("Error in diffence_blocks_add_in_redis>>", err)
      // await global_helper.save_error_logs('TRON_diff_blocks_add_in_db', err.message)
      return false;
    }
  }
  public async check_our_wallet_address(address: string) {
    try {
      let wallet_data: any = await this.getKeyValuePair(this.tron_wallet_address, address)
      return JSON.parse(wallet_data);
    } catch (err: any) {
      console.error('error in check_our_wallet_address >>>>>', err);
      return null;
    }
  }
  public checkIfContract = async (address: string) => {
    try {
      const getAsync = promisify(redisClient.get).bind(redisClient);
      const value = await getAsync(this.tron_token_type || "");
      const erc20Tokens: any = value ? JSON.parse(value) : [];
      const token = erc20Tokens.find(
        (el: any) => Number(el.is_token) === Number(BooleanEnum.true) && el.token_address.toUpperCase() === address.toUpperCase()
      );
      if (token) return token;
      return null;
    } catch (err: any) {
      console.error('error in checkIfContract >>>>', err);
      return null;
    }
  }
  public async NativeCoinByCoinFamily(coin_family: CoinFamily) {
    try {
      const getAsync = promisify(redisClient.get).bind(redisClient);
      const value = await getAsync(this.tron_token_type || "");
      const trc20Tokens: any = value ? JSON.parse(value) : [];
      return trc20Tokens.find(
        (el: any) => Number(el.is_token) === Number(BooleanEnum.false) && el.coin_family === coin_family
      );
    } catch (error: any) {
      console.error(`error in NativeCoinByCoinFamily >>>`, error);
      return null;
    }
  }
  public CoinByCoinId = async (
    coin_id: number
  ) => {
    try {
      const getAsync = promisify(redisClient.get).bind(redisClient);
      const value = await getAsync(this.tron_token_type || "");

      const erc20Tokens: any = value ? JSON.parse(value) : [];
      return erc20Tokens.find(
        (el: any) => el.coin_id === coin_id
      );

    } catch (error: any) {
      console.error(`error in CoinByCoinId >>>`, error);
      return null;
    }
  }
  public behindBlocks = async () => {
    try {
      let behindBlocks: any = await Models.TronOldBLockModel.findOne({
        attributes: ['id', 'block_number', 'start_block', 'end_block'],
        where: { status: 0 },
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
        await this.setKeyValuePair(this.blocks, this.read_behined_block, JSON.stringify(add_data))
      } else {
        console.log("you have not any behind block yet")
      }
    } catch (err: any) {
      console.error(`error in behindBlocks >>>`, err);
      return null;
    }
  }
  public async adding_coins_to_queue(wallet_address: string, coin_details: any) {
    try {
      if (!wallet_address) {
        console.error(`wallet_address missing >>> `);
        return false;
      }
      let wallet_data: any = await wallet_queries.wallet_find_one(
        ["coin_id", "user_id", "wallet_address"],
        { wallet_address: wallet_address, coin_id: coin_details.coin_id }
      )

      if (!wallet_data) {
        let wallet_data: any = await tronProcessHelper.check_our_wallet_address(wallet_address)
        if (wallet_data) {
          let data_obj: any = {
            user_id: wallet_data.user_id,
            wallet_name: wallet_data.wallet_name,
            wallet_address: wallet_address,
            coin_id: coin_details.coin_id,
            coin_family: coin_details.coin_family,
            balance: 0,
            default_wallet: 1,
            status: 1
          }
          await wallet_queries.wallet_create(data_obj)
          //=======================================================================
          console.log("wallet got created>>")
          if (coin_details.added_by) {
            console.log("coin.added_by exist", coin_details.added_by)
            if (coin_details.added_by == 'user') {
              console.log("added by user")
              let user_exist: any = await Models.CustomTokennModel.findOne({
                attributes: ["id"],
                where: { user_id: wallet_data.user_id, coin_id: coin_details.coin_id },
                raw: true
              })
              if (user_exist) {
                console.log("user exist")
              } else {
                console.log("user not exist")
                await Models.CustomTokennModel.create({
                  coin_id: coin_details.coin_id,
                  user_id: wallet_data.user_id,
                  created_at: new Date(),
                  updated_at: new Date()
                })
              }

            }
          } else {
            console.log("coin.added_by does not exist")
          }
          //=======================================================================
        } else {
          console.log("Not our wallet address", wallet_address)
        }
      }
      console.log("Under adding_coins_to_queue>>>wallet_address>>", wallet_address, "coin_id>>>", coin_details.coin_id)
      if (wallet_address && coin_details.coin_id) {
        await RabbitMq.send_tx_to_queue(this.tron_update_balance_of_coin, Buffer.from(JSON.stringify({ wallet_address: wallet_address, coin_id: coin_details.coin_id })))
        return true;
      }
    } catch (err: any) {
      console.error("Error in adding_coins_to_queue>>>", err)
      // await commonHelper.save_error_logs("adding_coins_to_queue", err.message);
      return false;
    }
  }
  public async adding_address_to_queue(wallet_address: string) {
    try {
      if (!wallet_address) {
        console.error(`wallet_address missing in adding_address_to_queue >>> `);
        return false;
      }
      let wallet_data: any = await wallet_queries.wallet_find_one(
        ["user_id"],
        { wallet_address: wallet_address }
      )
      console.log("Under adding_address_to_queue>>>user_id>>", wallet_data.user_id)

      if (wallet_data) {
        await RabbitMq.send_tx_to_queue(this.user_all_coins_balance_update, Buffer.from(JSON.stringify({ user_id: wallet_data.user_id })))
        return true;
      }
    } catch (err: any) {
      console.error("Error in adding_address_to_queue>>>", err)
      return false;
    }
  }


  public async getHashTable(keyName: string) {
    try {
      const getAsync = promisify(redisClient.hvals).bind(redisClient);
      const value = await getAsync(keyName);
      return value;
    } catch (err: any) {
      console.error(`💥 ~ getHashTable error`, err);
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
      console.error("Error in deleteKeyValuePair>>", err)
    }

  }
  // public async fetchWalletAddress() {
  //   try {
  //     const getaddressQuery = `SELECT wa.wallet_address,wa.user_id FROM wallets as wa INNER JOIN coins as co ON co.coin_id=wa.coin_id  WHERE wa.wallet_address != '' AND wa.wallet_address IS NOT null AND co.coin_family=${config.COIN_FAMILY_TRON} GROUP BY wa.wallet_address`;
  //     const addresses: any = await database.db_read.query(getaddressQuery, {
  //       type: Sequelize.QueryTypes.SELECT,
  //     });
  //     for (let address of addresses) {
  //       this.setKeyValuePair(config.TRON_WALLET_ADDRESS, address.wallet_address, JSON.stringify({ address: address.wallet_address, user_id: address.user_id, email: address.email, wallet_name: address.wallet_name }));
  //     }
  //   } catch (error: any) {
  //     console.log('fetchWalletAddress >>>');
  //   }
  // };
  // public async getLastBlockProcessed(blockNumber: number) {
  //   try {
  //     const getAsync: any = promisify(redisClient.get).bind(redisClient);
  //     const value: any = await getAsync(config.LAST_BLOCK_NUMBER || "");
  //     if (value) return parseInt(value);
  //     redisClient.set(
  //       config.LAST_BLOCK_NUMBER || "",
  //       blockNumber.toString()
  //     );
  //   } catch (error: any) {
  //     console.error('getLastBlockProcessed >>>>>', error);
  //   }
  // };
  // public async updateLastBlockProcessed(lastBlockProcessed: number) {
  //   try {
  //     const updatedBlockNumber: number = ++lastBlockProcessed;
  //     redisClient.set(
  //       config.LAST_BLOCK_NUMBER || "",
  //       updatedBlockNumber.toString()
  //     );
  //   } catch (error: any) {
  //     console.error('updateLastBlockProcessed >>>>', error);
  //   }
  // };
  // public fetchERC721Tokens = async () => {
  //   try {
  //     const getTokenQuery = `SELECT * FROM coins WHERE coin_status=1 AND coin_family=${config.COIN_FAMILY_TRON} AND (token_type!='${config.TOKEN_TYPE_TRON}' OR token_type is null)`;
  //     const tokens: any = await database.db_read.query(getTokenQuery, {
  //       type: Sequelize.QueryTypes.SELECT,
  //     });
  //     redisClient.set(config.TOKEN_TYPE10_TRON, JSON.stringify(tokens));
  //   } catch (error: any) {
  //     console.error('fetchERC721Tokens >>>>', error);
  //   }
  // };

  // public checkIfOurNFTContract = async (address: string) => {
  //   try {
  //     const getAsync = promisify(redisClient.get).bind(redisClient);
  //     const value = await getAsync(config.TOKEN_TYPE10_TRON);

  //     const erc721Tokens: any = value ? JSON.parse(value) : [];

  //     const token = erc721Tokens.find(
  //       (el: any) => Number(el.is_token) === Number(BooleanEnum.true) && el.token_address.toUpperCase() === address.toUpperCase()
  //     );

  //     if (token) return token;
  //     return null;
  //   } catch (error: any) {
  //     console.error('checkIfOurNFTContract >>>>>', error);
  //     return null;
  //   }
  // };


  public async get_coin_id(trnx: any) {
    try {
      const trnx_info: any = await Blockchain_Helper.tronWeb.trx.getTransactionInfo(trnx.data.txID)
      if (trnx_info?.log) {
        let logs: any = trnx_info?.log[0];
        let token_address: any = await Blockchain_Helper.tronWeb.address.fromHex('41' + logs.address)
        console.log("token_address>>>", token_address, trnx.data.txID)
        let is_token = await Blockchain_Helper.Trc20_Token(token_address)
        if (is_token != null) {
          console.log("is_token not != null", trnx.data.txID, is_token.coin_id)
          return { is_token: is_token, token_address: token_address };
        } else {
          console.log("is_token 2 === null", trnx.data.txID);
          return { is_token: null, token_address: null };
        }
      }
      return { is_token: null, token_address: null };
    } catch (err: any) {
      console.error('Error in get_coin_id>>', err)
      return { is_token: null, token_address: null };
    }
  }

}

const tronProcessHelper = new TronProcessHelper();
export default tronProcessHelper;
