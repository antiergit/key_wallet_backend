import { config } from "../../config";
import axios from "axios";

class RocketXHelper {
    public rocketxApiKey: string;

    constructor() {
        this.initialize();
    }

    public initialize() {
        this.rocketxApiKey = config.ROCKETX_API_KEY;
    }


    public async getConfig(
        params: any
    ) {
        const headers = {
            "x-api-key": this.rocketxApiKey
        };
        try {
            const response = await axios
                .get("https://api.rocketx.exchange/v1/configs", {
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

    public async getTokens(
        params: any
    ) {
        const headers = {
            "x-api-key": this.rocketxApiKey
        };
        try {
            const response = await axios
                .get("https://api.rocketx.exchange/v1/tokens", {
                    params,
                    headers,
                })
                .then(response => {
                    //console.log("then:", response.data);
                    return { status: true, data: response.data };
                })
                .catch(error => {
                    //console.log("error:", error);
                    return { status: false, data: error.message };
                });

            return response;
        } catch (error) {
            console.error("Error fetching price:", error);
            throw error;
        }
    }

    public async getAllTokens(
        data: any
    ) {
        const headers = {
            "x-api-key": this.rocketxApiKey
        };
        try {
            const response = await axios
                .post("https://api.rocketx.exchange/v1/tokens", {
                    params: data?.params,
                    headers,
                    data: data?.body
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

    public async getQuotation(params: any) {
        const headers = {
            "x-api-key": this.rocketxApiKey
        };

        try {
            const response = await axios
                .get("https://api.rocketx.exchange/v1/quotation", {
                    params,
                    headers,
                })
                .then(response => {
                    return { status: true, data: response.data };
                })
                .catch(error => {
                    console.log("error:", error);  // Logs the error details if the request fails
                    return { status: false, data: error.message };
                });

            return response;
        } catch (error) {
            console.error("Error fetching price:", error);  // Logs any unexpected errors
            throw error;
        }
    }

    public async swapTrxn(data: any) {
        const headers = {
            "x-api-key": this.rocketxApiKey
        };

        console.log("Request URL: https://api.rocketx.exchange/v1/swap");
        console.log("Request Data:", data); // Logs the body data
        console.log("Request Headers:", headers); // Logs the headers

        try {
            // Correct way to pass headers and data in the axios POST request
            const response = await axios
                .post("https://api.rocketx.exchange/v1/swap", data?.body, {
                    headers: headers
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
            console.error("Error in swapTrxn:", error);
            throw error;
        }
    }


    public async getStatus(
        params: any
    ) {
        const headers = {
            "x-api-key": this.rocketxApiKey
        };
        try {
            const response = await axios
                .get("https://api.rocketx.exchange/v1/status", {
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


};

export const rocketx_helper = new RocketXHelper();