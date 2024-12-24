
import { config } from "../../../config";
import axios, { AxiosInstance } from "axios";

//class UTXO {
let utxoClass = class UTXO {
    // private clientUrl = config.NODE.BTC_RPC_URL;
    // private axiosClient: AxiosInstance;
    public config: any;

    constructor() {
        this.config = {
            method: 'get',
            headers: {
                'apikey': `${config.NODE.BTC_API_KEY}`,
                'Content-Type': 'application/json',
            }
        };
        // this.axiosClient = axios.create({
        //     baseURL: this.clientUrl,
        //     headers: {
        //         // Authorization: this.clineAPIKEY,
        //         "Content-Type": "application/json",
        //     },
        // });
    }

    public async sendRawTransaction(raw: string) {
        try {
            this.config.url = `${config.NODE.BTC_RPC_URL}api/v2/sendtx/${raw}`;
            console.log("this config >>>>", this.config)
            let response: any = await axios(this.config);
            return { status: true, data: response.data };
        } catch (err: any) {
            console.error("Error in sendRawTransaction of BTC", err)
            if (err.response && err.response.data && err.response.data.error === '-26: dust') {
                return { status: false, custom_err_msg: "Entered amount is too low." };
            }
    
            return { status: false, data: (err as Error).message };
        }
    }
};

let utxo = new utxoClass();

export const BtcHelper = utxo;
