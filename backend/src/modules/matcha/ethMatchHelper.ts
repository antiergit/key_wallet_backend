import { AbiItem } from "web3-utils";
import Web3 from "web3";
import { config } from "../../config";
import axios from "axios";

class ethMatchaHelper {
  public matchaApiKey: string;

  constructor() {
    this.initialize();
  }

  public initialize() {
    this.matchaApiKey = config.MATCHA_API_KEY;
  }
  public async getPriceOfEthToken(
    params: any
  ) {

    const headers = {
      "0x-api-key": [this.matchaApiKey],
    };

    try {
      const response = await axios.get("https://api.0x.org/swap/v1/price", {
        params,
        headers,
      }).then(response=>{
        console.log("then:",response.data);
        return {status: true, data: response.data};
      }).catch(error=>{
        console.log("error:",error);
        return {status: false, data: error.message};
      });

      return response;
    } catch (error) {
      console.error("Error fetching price:", error);
      throw error;
    }
  }
  public async getQuoteOfEthToken(
    params: any
  ) {

    const headers = {
      "0x-api-key": [this.matchaApiKey],
    };

    try {
      const response = await axios.get("https://api.0x.org/swap/v1/quote", {
        params,
        headers,
      }).then(response=>{
        console.log("then:",response.data);
        return {status: true, data: response.data};
      }).catch(error=>{
        console.log("error:",error);
        return {status: false, data: error.message};
      });

      return response;
    } catch (error) {
      console.error("Error fetching Quote:", error);
      throw error;
    }
  }
};

export const eth_matcha_helper  = new ethMatchaHelper();