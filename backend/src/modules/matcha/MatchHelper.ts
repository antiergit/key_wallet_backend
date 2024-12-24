import { config } from "../../config";
import axios from "axios";

class MatchaHelper {
  public matchaApiKey: string;

  constructor() {
    this.initialize();
  }

  public initialize() {
    this.matchaApiKey = config.MATCHA_API_KEY;
  }


  public async getQuoteOfToken(
    params: any
  ) {
    const headers = {
      "0x-api-key": this.matchaApiKey,
      "0x-version": "v2"
    };
    try {
      const response = await axios
        .get("https://api.0x.org/swap/allowance-holder/quote", {
          params,
          headers,
        })
        .then(response => {
          console.log("then:", response.data);
          return { status: true, data: response.data };
        })
        .catch(error => {
          console.log("error:", error);
          return { status: false, data: error.message };
        });

      return response;
    } catch (error) {
      console.error("Error fetching price:", error);
      throw error;
    }
  }


  public async getPriceOfToken(
    params: any
  ) {
    const headers = {
      "0x-api-key": this.matchaApiKey,
      "0x-version": "v2"
    };

    try {
      const response = await axios
        .get("https://api.0x.org/swap/allowance-holder/price", {
          params,
          headers,
        })
        .then(response => {
          console.log("then:", response.data);
          return { status: true, data: response.data };
        })
        .catch(error => {
          console.log("error:", error);
          return { status: false, data: error.message };
        });

      return response;
    } catch (error) {
      console.error("Error fetching price:", error);
      throw error;
    }
  }


  public async getPriceOfGaslessToken(
    params: any
  ) {
    const headers = {
      "0x-api-key": this.matchaApiKey,
      "0x-version": "v2"
    };

    try {
      const response = await axios
        .get("https://api.0x.org/gasless/price", {
          params,
          headers,
        })
        .then(response => {
          console.log("then:", response.data);
          return { status: true, data: response.data };
        })
        .catch(error => {
          return { status: false, data: error?.response?.data };
        });

      return response;
    } catch (error) {
      console.error("Error fetching price:", error);
      throw error;
    }
  }

  public async getQuoteOfGaslessToken(
    params: any
  ) {
    const headers = {
      "0x-api-key": this.matchaApiKey,
      "0x-version": "v2"
    };

    try {
      const response = await axios
        .get("https://api.0x.org/gasless/quote", {
          params,
          headers,
        })
        .then(response => {
          console.log("then:", response.data);
          return { status: true, data: response.data };
        })
        .catch(error => {
          return { status: false, data: error?.response?.data };
        });

      return response;
    } catch (error) {
      console.error("Error fetching price:", error);
      throw error;
    }
  }


  public async submitTransaction(
    data: any
  ) {
    const headers = {
      "0x-api-key": this.matchaApiKey,
      "0x-version": "v2"
    };

    try {
      const response = await axios
        .post("https://api.0x.org/gasless/submit", data, { headers })
        .then(response => {
          console.log("then:", response.data);
          return { status: true, data: response.data };
        })
        .catch(error => {
          console.log("🚀 ~ MatchaHelper ~ error:", error)
          return { status: false, data: error?.response?.data };
        });


      return response;
    } catch (error) {
      console.error("Error fetching price:", error);
      throw error;
    }
  }

  public async getTransactionStatus(
    params: any
  ) {
    const headers = {
      "0x-api-key": this.matchaApiKey,
      "0x-version": "v2"
    };

    try {
      const response = await axios
        .get("http://api.0x.org/gasless/status/" +
          params.tx_id +
          "?" +
          "chainId=" +
          params.chainId.toString(), {
          headers,
        })
        .then(response => {
          console.log("then:", response.data);
          return { status: true, data: response.data };
        })
        .catch(error => {
          return { status: false, data: error?.response?.data };
        });

      return response;
    } catch (error) {
      console.error("Error fetching price:", error);
      throw error;
    }
  }


};

export const matcha_helper = new MatchaHelper();