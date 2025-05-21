import { config } from "../../config";
import axios, { AxiosInstance } from "axios";
import { global_helper } from "./global_helper";
import commonHelper from "./common.helpers";

class utxo {
    // public btc_client_url = config.NODE.BTC_RPC_URL;
    // public btc_axios_client: AxiosInstance;
    public config: any;

    constructor() {
        this.config = {
            method: 'get',
            headers: {
                'apikey': `${config.NODE.BTC_API_KEY}`,
                'Content-Type': 'application/json',
            }
        };
        // this.btc_axios_client = axios.create({
        //     baseURL: this.btc_client_url,
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        // });
    }

    public async validate_btc_address(address: string) {
        try {
            this.config.url = `${config.NODE.BTC_RPC_URL}api/v2/address/${address}`
            let validate_data: any = await axios(this.config);
            if (validate_data.data) {
                return true;
            } else {
                return false;
            }
        } catch (err: any) {
            console.error("Error in validation BTC address", err)
            await commonHelper.save_error_logs("validate_btc_address", err.message);
            return false;
        }
    }
    public async get_balance(address: string) {
        try {
            this.config.url = `${config.NODE.BTC_RPC_URL}api/v2/address/${address}`
            let response: any = await axios(this.config);
            return response.data.balance / 100000000;
        } catch (err: any) {
            console.error("Erorr in get balacne of BTC.", err)
            await commonHelper.save_error_logs("get_balance_btc", err.message);
            throw err;
        }
    }

    public async get_confirmed_trnx(txId: string) {
        try {
            this.config.url = `${config.NODE.BTC_RPC_URL}api/v2/tx/${txId}`
            let response: any = await axios(this.config);
            if (response.data.confirmations != undefined) {
                return { status: true, data: response.data }
            } else {
                return { status: false, data: response.data }
            }
        } catch (err: any) {
            console.error("Erorr in get_confirmed_trnx of BTC.", err)
            await commonHelper.save_error_logs("get_confirmed_trnx_btc", err.message);
            return { status: false, data: err };
        }
    }
}

export const utxobtc = new utxo();
