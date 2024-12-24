import axios from "axios";
import { config } from "../../config";

class BtcHelper {
    public config: any;
    constructor() {
        this.config = {
            method: 'get',
            headers: {
                'apikey': `${config.NODE.BTC_API_KEY}`,
                'Content-Type': 'application/json',
            }
        };
    }
    public async getBalance(address: string) {
        try {
            this.config.url = `${config.NODE.BTC_RPC_URL}api/v2/address/${address}`
            const response = await axios(this.config);
            return response.data.balance / 100000000;
        } catch (err: any) {
            console.error("Error in getBalance of BTC 🔥 ~ ~ ", err.message)
            throw err;
        }
    }
}

const btcHelper = new BtcHelper();
export default btcHelper;
