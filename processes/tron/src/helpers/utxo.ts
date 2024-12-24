import { config } from '../config/config';
import axios from "axios";
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


    public async getUserBtcBalance(address: string) {
        try {
            this.config.url = `${config.NODE.BTC_RPC_URL}api/v2/address/${address}`
            const response = await axios(this.config);
            let tokBalance: any = response.data.balance / 100000000;
            return Number(tokBalance);
        } catch (err: any) {
            console.error('error in getUserBtcBalance >>>>>>', err);
            throw err;
        }
    }
}

var utxo = new UTXO();
export default utxo;
