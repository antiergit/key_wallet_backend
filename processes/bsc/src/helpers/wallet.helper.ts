import { config } from "../config/index";
import { CoinInterface } from "../models";
import { Blockchain_Helper } from "./blockchain.helper";
import { walletQueries } from "./dbHelper";
import { global_helper } from "./global_helper";
import { Utility_Helper } from "./utility.helper";
import utxo from "./utxo";

class WalletHelper {

    public async Fetch_Balance(address: string, coin: CoinInterface,) {
        try {
            let balance: number = 0;
            let bal: any;
            if (coin) {
                switch (coin.coin_family) {
                    case config.config.STATIC_COIN_FAMILY.ETH:
                        balance = await Blockchain_Helper.ETH_Fetch_Balance(address, coin);
                        break;
                    case config.config.STATIC_COIN_FAMILY.BNB:
                        balance = await Blockchain_Helper.fetch_bnb_balance(address, coin);
                        break;
                    case config.config.STATIC_COIN_FAMILY.BTC:
                        bal = await utxo.getUserBtcBalance(address);
                        balance = Number(bal);
                        break;
                    case config.config.STATIC_COIN_FAMILY.TRX:
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
        } catch (err: any) {
            console.error(`error WalletHelper Fetch_Balance error bnb >>>`, err);
            return { status: false, balance: 0 };
        }
    }


    public async Update_Balance(wallet_address: string, coin: CoinInterface) {
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

            let wallet_data: any = await walletQueries.findOne(
                ["balance"],
                { wallet_address: wallet_address, coin_id: coin.coin_id },
                [['wallet_id', 'ASC']]
            )

            if (wallet_data) {
                console.log("Wallet data exist");
                if (balDetails.status) {
                    await walletQueries.update(
                        { balance: balDetails.balance, status: 1 },
                        { wallet_address: wallet_address, coin_id: coin.coin_id }
                    )
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
        } catch (err: any) {
            console.error(`WalletHelper Update_Balance error >>>`, err);
            return { status: false, balance: 0 };
        }
    }

    public async Update_all_active_coin_balance(wallet_address: string) {
        try {
            console.log("🚀 ~ WalletHelper ~ Update_all_active_coin_balance ~ Update_all_active_coin_balance:")
            let address_coins: any = await walletQueries.walletJoinCoins(
                ["coin_id", "wallet_address"],
                { wallet_address: wallet_address, status: 1 },
                ["coin_id", "coin_name", "coin_symbol", "coin_family", "is_token", "token_type", "token_address"],
                { coin_status: 1 }
            )
            console.log("🚀 ~ WalletHelper ~ Update_all_active_coin_balance ~ address_coins:", address_coins)
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
