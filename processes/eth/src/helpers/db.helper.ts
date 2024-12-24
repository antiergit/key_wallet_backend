import {
    BooleanEnum,
    CoinFamilyEnum,
    TokenStandard,
} from "../enum";

import {
    CoinInterface,
    CoinsModel,
    DeviceTokenModel
} from "../models/index";
import WalletModel from "../models/tables/model.wallets";

class DbHelper {

    public async getCoinData(
        coinType: string,
        coinFamily: number
    ): Promise<CoinInterface | null> {
        let result: CoinInterface | null = await CoinsModel.findOne({
            where: { coin_symbol: coinType, coin_family: coinFamily },
        });
        if (result) return result;
        else return null;
    }

    public async getWalletInfoByAddressAndCoinId(
        wallet_address: string,
        coin_id: number | undefined
    ) {
        try {
            let queryRes: any = await WalletModel.findOne({
                where: { wallet_address, coin_id },
            });
            if (queryRes) return queryRes;
            else return null;
        } catch (error) {
            return null;
        }
    }

    /** list of all active crypto coins */
    ActiveCoinsListQry = async () => {
        try {
            return await CoinsModel.findAll({
                where: {
                    coin_status: BooleanEnum.true,
                }
            });
        } catch (error: any) {
            console.error(`Db_Helper ActiveCoinsList error >>> \n `, error);
            return {};
        }
    }

    /** list of all crypto coins with token  */
    TokenListQry = async (
        coin_family: CoinFamilyEnum,
        token_standard: TokenStandard
    ) => {
        try {
            return await CoinsModel.findAll({
                attributes: [
                    'id',
                    'coin_name',
                    'coin_symbol',
                    'price_source_slug',
                    'coin_image',
                    'coin_family',
                    'is_token',
                    'token_address',
                    'token_type',
                    'decimals',
                    'coin_status',
                    'default_wallet',
                    'price_source'
                ],
                where: {
                    coin_status: BooleanEnum.true,
                    is_token: BooleanEnum.true,
                    coin_family: coin_family,
                    token_type: token_standard
                },
                raw: true
            });
        } catch (error: any) {
            console.error(`DbHelper TokenListQry error >>> \n `, error);
            return {};
        }
    }

    /** get user device token using user id */
    GetDeviceTokens = async (user_id: number) => {
        try {
            return await DeviceTokenModel.findAll({
                attributes: ["device_token"],
                where: {
                    user_id: user_id,
                    push: BooleanEnum.true
                },
                order: [
                    ["updated_at", "DESC"],
                    ['id', 'DESC']
                ],
                limit: 3,
                raw: true
            });
        } catch (error: any) {
            console.error(`getDeviceToken error >>>`, error);
            return false;
        }
    };

}
export let Db_Helper = new DbHelper();

