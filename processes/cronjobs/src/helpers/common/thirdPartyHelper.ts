import axios from "axios";
import { config } from "../../config";

class ThirdPartyHelper {

    // ETH
    public async getETHGas() {
        try {
            let url: string = `${config.ETH.GAS_FEE_URL}${config.ETH.GAS_FEE_API_KEY}`;
            let resp: any = await axios.get(url)
            if (resp.status == 200) {
                return { status: true, response: resp.data };
            } else {
                return { status: false, response: resp.data };
            }
        } catch (err: any) {
            console.error("Error in getEthGas 🔥 ~ ~", err.message);
            return { status: false, response: err.message };
        }
    }

    // BNB
    public async getBNBGas() {
        try {
            let url: string = `${config.BNB.GAS_FEE_URL}${config.BNB.GAS_FEE_API_KEY}`;
            let resp: any = await axios.get(url)
            if (resp.status == 200) {
                return { status: true, response: resp.data };
            } else {
                return { status: false, response: resp.data };
            }
        } catch (err: any) {
            console.error("Error in getBNBGas 🔥 ~ ~", err.message);
            return { status: false, response: err.message };
        }
    }

}

const thirdPartyHelper = new ThirdPartyHelper();
export default thirdPartyHelper;