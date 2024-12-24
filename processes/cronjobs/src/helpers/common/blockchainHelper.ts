import { config } from "../../config";
import { bnbHelper, btcHelper, ethHelper, tronHelper } from "./index";

class BlockchainHelper {
    public async getBalances(coinData: any, walletAddress: string) {
        try {
            let balance: any = '0';
            switch (coinData.coin_family) {
                case config.STATIC_COIN_FAMILY.ETH:
                    console.log("eth eth")
                    balance = (await ethHelper.getBalance(coinData.is_token, coinData.token_address, walletAddress)).toString()
                    break;
                case config.STATIC_COIN_FAMILY.BNB:
                    console.log("bnb bnb")
                    balance = (await bnbHelper.getBalance(coinData.is_token, coinData.token_address, walletAddress)).toString()
                    break;
                case config.STATIC_COIN_FAMILY.BTC:
                    console.log("btc btc")
                    balance = (await btcHelper.getBalance(walletAddress)).toString()
                    break;
                case config.STATIC_COIN_FAMILY.TRX:
                    console.log("trx trx")
                    balance = (await tronHelper.getBalance(walletAddress, coinData)).toString();
                    break;
            }
            return { status: true, balance: balance };
        } catch (err: any) {
            console.error("Error in getBalances  🔥 ~ ~ ", err.message)
            return { status: false, balance: '0' };
        }

    }
}
const blockChainHelper = new BlockchainHelper();
export default blockChainHelper;