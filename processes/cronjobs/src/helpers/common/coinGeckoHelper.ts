import axios from "axios";
import { config } from "../../config";

class CoinGeckoHelper {

    public async coinGeckoCoinList(data: any) {
        try {
            if (!data || !data.coin_family || !data.token_address) {
                console.error('Invalid data provided 🔥 ~ ~');
                return { status: false, error: 'Invalid data provided' };
            }
            let baseURL: string = config.COIN_GECKO.COIN_GECKO_BY_TOKEN;
            let tokenAddress: string = data.token_address;

            let url: string | null = null;

            switch (data.coin_family) {
                case 1:
                    url = `${baseURL}/binance-smart-chain/contract/${tokenAddress}`;
                    break;
                case 2:
                    url = `${baseURL}/ethereum/contract/${tokenAddress}`;
                    break;
                case 6:
                    url = `${baseURL}/tron/contract/${tokenAddress}`;
                    break;
                default:
                    console.error(`Unsupported coin family: ${data.coin_family} 🔥 ~ ~`);
                    return { status: false, error: `Unsupported coin family: ${data.coin_family}` };
            }
            if (!url) {
                console.error('URL generation failed 🔥 ~ ~');
                return { status: false, error: `URL generation failed` };
            }

            console.log("url::", url);

            const headers = {
                'x-cg-pro-api-key': config.COIN_GECKO.API_KEY,
            };

            let response: any = await axios.get(url, { headers });

            if (response?.data?.id) {
                return {
                    status: true,
                    data: { id: response?.data?.id, image: response?.data?.image?.small }
                };
            } else {
                return { status: false, error: `Token address ${tokenAddress} does not exist on CoinGecko` };
            }
        } catch (err: any) {
            if (err.response && err.response.status === 404 && err.response.data.error === 'coin not found') {
                console.error("Coin not found 🔥 ~ ~");
                return { status: false, error: 'Coin not found' };
            } else {
                console.error("Error in coinGeckoCoinList 🔥 ~ ~", err.message);
                throw err;
            }
        }
    }
    public async coinGeckoQuotesLatestApi(currency: any, coinGeckoIds: any
    ) {
        try {
            let result: any = await coinGeckoHelper.coinGeckoMarketInfoDataForCoinPrice(
                currency,
                coinGeckoIds,
            );
            let marketData: any;
            if (result.length) {
                marketData = result;
            }
            return { data: marketData };
        } catch (err: any) {
            console.error("Error in coinGeckoQuotesLatestApi 🔥 ~ ~", err.message);
            return null;
        }
    }
    public async coinGeckoMarketInfoDataForCoinPrice(currency: any, coin_gecko_ids: any) {
        try {
            const url = `${config.COIN_GECKO.COIN_GECKO_MARKET}?ids=${coin_gecko_ids}&vs_currency=${currency}`;
            const headers = {
                'x-cg-pro-api-key': config.COIN_GECKO.API_KEY,
            };
            const response = await axios.get(url, { headers });
            return response.data;
        } catch (err: any) {
            console.error("Error in coinGeckoMarketInfoDataForCoinPrice 🔥 ~ ~", err.message);
            throw err;
        }
    }

}
const coinGeckoHelper = new CoinGeckoHelper();
export default coinGeckoHelper;