import { config } from '../config/config';
import axios, { AxiosInstance } from "axios";

class UTXO {

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


    async getUserBtcBalance(address: string) {
        try {
            this.config.url = `${config.NODE.BTC_RPC_URL}api/v2/address/${address}`
            const response = await axios(this.config);
            return response.data.balance / 100000000;
        } catch (err: any) {
            console.error('error getUserBtcBalance >>>>>>', err);
            throw err;
        }
    }
}

var utxo = new UTXO();
export default utxo;
