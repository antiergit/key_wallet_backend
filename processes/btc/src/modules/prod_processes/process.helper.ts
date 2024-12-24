import { promisify } from 'util';
import redisClient from '../../helpers/redis.helper';
import database from '../../config/db';
import Sequelize from 'sequelize';
import { config } from '../../config/config';
import { CoinInterface, WalletInterface } from '../../models/interfaces';
import { BooleanEnum, CoinFamilyEnum } from '../../enum';
class BTCProcessHelper {
  constructor() {
    // this.fetchWalletAddress();
    this.fetch_coins();
  }
  public setRedisSting = async (key: string, value: number) => {
    try {
      redisClient.set(key, value.toString());
    } catch (error) {
      console.error('setRedisSting error', error);
    }
  }
  public updateLastBlockProcessed = async (
    key: string,
    lastBlockProcessed: number
  ) => {
    try {
      const updatedBlockNumber = ++lastBlockProcessed;
      redisClient.set(key, updatedBlockNumber.toString());
    } catch (error) {
      console.error('updateLastBlockProcessed error', error);
    }
  }
  public getKeyValuePair = async (keyName: string, field: string) => {
    try {
      const getAsync = promisify(redisClient.hget).bind(
        redisClient
      );
      let value: any = await getAsync(keyName, field.toUpperCase() || '');
      if (value) {
        return value
      } else {
        return null
      }
    } catch (error: any) {
      console.error('getKeyValuePair error', error);
      return null;
    }
  }
  public getBlockNumber = async (key: string) => {
    try {
      const getAsync = promisify(redisClient.get).bind(
        redisClient
      );
      const value = await getAsync(key);
      if (value) return parseInt(value);
      return null;
    } catch (error) {
      console.error('getBlockNumber error', error);
      return null;
    }
  }
  public setKeyValuePair = async (
    keyName: string,
    field: string,
    value: string
  ) => {
    try {
      redisClient.hsetnx(
        keyName,
        field.toUpperCase(),
        value
      );
    } catch (error) {
      console.error('setKeyValuePair error', error);
    }
  }
  public fetch_coins = async () => {
    try {
      const getTokenQuery = `SELECT * FROM coins WHERE coin_status=1 AND coin_family=${config.COIN_FAMILY_BTC}`;
      const coins: CoinInterface[] = await database.db_read.query(getTokenQuery, {
        type: Sequelize.QueryTypes.SELECT,
      });

      redisClient.set(config.TOKEN_TYPE_BTC || "", JSON.stringify(coins));
    } catch (error) {
      console.error('fetchERC20Tokens >>>>>', error);
    }
  }
  // public fetchWalletAddress = async () => {
  //   try {
  //     try {
  //       const getaddressQuery = `SELECT wa.wallet_address,wa.user_id FROM wallets as wa INNER JOIN coins as co ON co.coin_id=wa.coin_id  WHERE wa.wallet_address != '' AND wa.wallet_address IS NOT null AND co.coin_family=${config.COIN_FAMILY_BTC} GROUP BY wa.wallet_address`;
  //       const addresses: WalletInterface[] = await database.db_read.query(getaddressQuery, {
  //         type: Sequelize.QueryTypes.SELECT,
  //       });
  //       for (let address of addresses) {
  //         this.setKeyValuePair(config.BTC_WALLET_ADDRESSES, address.wallet_address, JSON.stringify({ address: address.wallet_address, user_id: address.user_id }));
  //       }
  //     } catch (error) {
  //       console.error('fetchWalletAddress >>>', error);
  //     }

  //   } catch (error) {
  //     console.error('fetchWalletAddress error', error);
  //   }
  // }
  public check_our_wallet_address = async (address: string) => {
    try {
      let wallet_data: any = await this.getKeyValuePair(config.BTC_WALLET_ADDRESSES, address)
      return JSON.parse(wallet_data);
    } catch (error: any) {
      console.error('check_our_wallet_address >>>>>', error);
      return null;
    }
  }
  public NativeCoinByCoinFamily = async (
    coin_family: CoinFamilyEnum
  ) => {
    try {
      const getAsync = promisify(redisClient.get).bind(redisClient);
      const value = await getAsync(config.TOKEN_TYPE_BTC || "");

      const erc20Tokens: CoinInterface[] = value ? JSON.parse(value) : [];
      return erc20Tokens.find(
        (el: CoinInterface) => Number(el.is_token) === Number(BooleanEnum.false) && el.coin_family === coin_family
      );

    } catch (error: any) {
      console.error(`NativeCoinByCoinFamily >>>`, error);
      return null
    }
  }
  public CoinByCoinId = async (
    coin_id: number
  ) => {
    try {
      const getAsync = promisify(redisClient.get).bind(redisClient);
      const value = await getAsync(config.TOKEN_TYPE_BTC || "");

      const erc20Tokens: CoinInterface[] = value ? JSON.parse(value) : [];
      return erc20Tokens.find(
        (el: CoinInterface) => el.coin_id === coin_id
      );

    } catch (error: any) {
      console.error(`CoinByCoinId >>>`, error);
      return null;
    }
  }
}

const btcProcessHelper = new BTCProcessHelper();
export default btcProcessHelper;
