import { config } from "../config";
import { CoinFamilyEnum } from "../enum";
import { CoinInterface, CoinsModel } from "../models";
import WalletModel from "../models/tables/model.wallets";
import ethProcessHelper from "../processes/process.helper";
import { Blockchain_Helper } from "./blockchain.helper";
import { global_helper } from "./global_helper";
import { Utility_Helper } from "./utility.helper";
import utxo from "./utxo";

class WalletHelper {

    Fetch_Balance = async (
        address: string,
        coin: CoinInterface,
    ) => {
        try {
            let balance: number | any = 0;
            let bal: any;
            if (coin) {
                switch (coin.coin_family) {
                    case CoinFamilyEnum.ETH:
                        balance = await Blockchain_Helper.Fetch_Balance(address, coin);
                        break;
                    case CoinFamilyEnum.BNB:
                        balance = await Blockchain_Helper.Fetch_Balance_bnb(address, coin);
                        break;
                    case CoinFamilyEnum.BTC:
                        bal = await utxo.getUserBtcBalance(address);
                        balance = Number(bal);
                        break;
                    case CoinFamilyEnum.TRON:
                        bal = await Blockchain_Helper.TRX_Fetch_Balance(address, coin);
                        balance = Number(bal);
                        break;

                    default:
                        balance = 0;
                        break;
                }
            }
            balance = Number(await Utility_Helper.exponentialToDecimal(balance));
            return { status: true, balance: balance };
        } catch (error: any) {
            console.error(`WalletHelper Fetch_Balance error >>>`, error);
            return { status: false, balance: 0 };
        }
    }


    Update_Balance = async (
        wallet_address: string,
        coin: CoinInterface
    ) => {
        try {
            if (!wallet_address) {
                console.error(`wallet_address missing >>> `);
                return false;
            }
            /* fatch wallet balnce */
            let balDetails: any = await this.Fetch_Balance(
                wallet_address,
                coin
            );
            let wallet_data: any = await WalletModel.findOne({
                attributes: ["balance"],
                where: {
                    wallet_address: wallet_address,
                    coin_id: coin.coin_id,
                }
            })
            if (wallet_data) {
                console.log("Wallet data exist");
                if (balDetails.status) {

                    await WalletModel.update(
                        { balance: balDetails.balance, status: 1 },
                        {
                            where: { wallet_address: wallet_address, coin_id: coin.coin_id }
                        });

                }
            } else {
                console.log("wallet data does not exist");
                await global_helper.insertCoinInWallet(wallet_address, coin, balDetails)
            }

            if (balDetails.status == false) {
                await global_helper.addingCoinsToQueue(config.config.BACKEND_WALLET_ADDRESSES,
                    {
                        coin_data: {
                            coin_id: coin.coin_id,
                            coin_family: coin.coin_family,
                            is_token: coin.is_token,
                            token_address: coin.token_address,
                            token_type: coin.token_type
                        }, wallet_address: wallet_address, queue_count: 0
                    })
            }
            return balDetails;
        } catch (error: any) {
            console.error(`WalletHelper Update_Balance error >>>`, error);
            return { status: false, balance: 0 };
        }
    }

    Update_all_active_coin_balance = async (wallet_address: string) => {
        try {
            let address_coins: any = await WalletModel.findAll({
                attributes: ["coin_id", "wallet_address"],
                where: {
                    wallet_address: wallet_address,
                    status: 1
                },
                include: [{
                    model: CoinsModel,
                    attributes: ["coin_id", "coin_name", "coin_symbol", "coin_family", "is_token", "token_type", "token_address"],
                    as: "coin_data",
                    required: true,
                    where: {
                        coin_status: 1,
                    },
                }],
            })
            for (let i = 0; i < address_coins.length; i++) {
                await this.Update_Balance(address_coins[i].wallet_address, address_coins[i].coin_data);
            }
            return 1;

        } catch (err: any) {
            console.error(`WalletHelper Update_all_active_coin_balance error >>>`, err);
            return 0;

        }
    }


}
export let Wallet_Helper = new WalletHelper();
