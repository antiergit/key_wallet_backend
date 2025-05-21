import axios from "axios";
import { config } from "../../config";
import { OnlyControllerInterface } from "../../interfaces/controller.interface";
import crypto from 'crypto';
import fs from "fs";

class ChangellyHelper implements OnlyControllerInterface {

    constructor() {
        this.initialize();
    }
    public initialize() { }

    public async getReqBody(fx: string) {
        try {
            let payload: any = {
                jsonrpc: "2.0",
                id: "test",
                method: fx
            }

            if (fx == 'getPairs') {
                payload.params = {
                    // from: "eth",
                    to: 'btc',
                    txType: "fixed"   // fixed, float
                }

            } else if (fx == 'getPairsParams') {
                payload.params = [
                    {
                        from: "eth",
                        to: "btc"
                    },
                    {
                        from: "btc",
                        to: "eth"
                    }
                ]

            } else if (fx == 'getMinAmount') {
                payload.params = {
                    from: "btc",
                    to: "eth"
                }
            } else if (fx == 'createSubaccount') {
                payload.params = {
                    email: "paras.goyal@antiersolutions.com"
                }
            } else if (fx == 'updateSubaccount') {
                payload.params = {
                    subaccountId: "FhbRm-Ox",
                    email: "paras.goyal@antiersolutions.com"
                }
            } else if (fx == 'getExchangeAmount') {
                //===========================================================
                // Params as object with 1 pair
                payload.params = {
                    from: "ltc",
                    to: "eth",
                    amountFrom: "3.99"
                }
                //===========================================================
                // // Params as array of 1 pair
                // payload.params = [{
                //     from: "ltc",
                //     to: "eth",
                //     amountFrom: "3.99"
                // }]
                //===========================================================
                // // Params as array of 2 pairs
                // payload.params = [
                //     {
                //         from: "ltc",
                //         to: "eth",
                //         amountFrom: "3.99"
                //     },
                //     {
                //         from: "btc",
                //         to: "ltc",
                //         amountFrom: "1"
                //     }
                // ]
                //===========================================================
                // // Params with userMetadata
                // payload.params = {
                //     from: "ltc",
                //     to: "eth",
                //     amountFrom: "3.99",
                //     userMetadata: "{\"param1\": 50, \"param2\": \"string\", \"param3\": \"50.5189\"}"
                // }
                //===========================================================

            } else if (fx == 'createTransaction') {
                console.log("Entered into createTransaction")
                //===========================================================
                // // Example 1
                // payload.params = {
                //     from: "eth",
                //     to: "xrp",
                //     address: "<<valid xrp address -- Recipient address--->>",
                //     //  extraId: "",
                //     amountFrom: "0.0339"
                // }
                //===========================================================
                // // Example 2
                // payload.params = {
                //     from: "xlm",
                //     to: "xrp",
                //     address: "<<valid xrp address -- Recipient address--->>",
                //     // extraId: "",
                //     amountFrom: "400",
                //     // refundAddress: "<<valid xlm address to make automatic refund in case of transaction fail>>",
                //     // refundExtraId: "<<valid xlm extraId to make automatic refund in case of transaction fail>>",
                //     // subaccountId: "VjdiO-x"
                // }
                //===========================================================
                // // Example with userMetadata
                // payload.params = {
                //     from: "eth",
                //     to: "xrp",
                //     address: "<<valid xrp address -- Recipient address--->>",
                //     //  extraId: "",
                //     amountFrom: "0.0339",
                //     // userMetadata: "{\"param1\": 50, \"param2\": \"string\", \"param3\": \"50.5189\"}"
                // }
                //===========================================================
            } else if (fx == 'getFixRateForAmount') {
                payload.params = [
                    {
                        from: "eth",
                        to: "btc",
                        amountFrom: "5.2" //Amount that user is going to exchange.
                    },
                    {
                        from: "btc",
                        to: "eth",
                        amountTo: "2.25" //Amount that user is going to receive.
                    }
                ]
            } else if (fx == 'createFixTransaction') {
                console.log("Entered into createFixTransaction")
                // payload.params = {
                //     from: "eth",
                //     to: "xrp",
                //     address: "Recipient address",
                //     // extraId: "209****48",
                //     amountFrom: "0.2",
                //     rateId: "f3dd48106a63b*********b7ab5413d32c7b96301a7e83", // Get from getFixRateForAmount
                //     // refundAddress: "0x576ea9d3**********3d3fd5f1499a0"
                // }
            } else if (fx == 'getFixRate') {
                payload.params = [
                    {
                        from: "eth",
                        to: "btc"
                    },
                    {
                        from: "eth",
                        to: "ltc"
                    }
                ]
            } else if (fx == 'getTransactions') {
                //====================================================
                payload.params = {
                    id: "wv0c7lctdph8ibib"  // ID from the createTransaction/createFixTransaction response
                }
                //====================================================
                // payload.params = {
                //     id: [
                //         "xln3********ms8im", // ID from the createTransaction/createFixTransaction response
                //         "tr4g3********zk4t4",
                //         "484ec********pln5"
                //     ],
                //     currency: [
                //         "xrp",
                //         "eth"
                //     ],
                //     status: [
                //         "finished",
                //         "sending"
                //     ]
                // }
                //====================================================
                // payload.params = {
                //     currency: "xrp",
                //     address: "<<payin address to search>>",
                //     payoutAddress: "<<payout address to search>>",
                //     // extraId: "<<payin extraId to search>>",
                //     // subaccountId: "dskOx-r",
                //     limit: 10,
                //     offset: 10,
                //     since: 1483290569942384
                // }
                //=====================================================

            } else if (fx == 'getStatus') {
                payload.params = {
                    id: "bfpu2j81lg8tt41c" //Transaction ID
                }
            } else if (fx == 'validateAddress') {
                payload.params = {
                    currency: "eth",
                    address: "0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97"
                }
            }

            return payload;

        } catch (err: any) {
            console.error("Error in getReqBody of changelly", err.message)
            throw err;
        }
    }
    // OnOffRamp
    public async getHeaderOfOnOffRampTesting(endpoint: string) {
        try {
            let privateKeyString = await fs.readFileSync(`${__dirname}/../../config/keys/${config.CHANGELLY.CHANGELLY_ON_OFF_RAMP_PRIVATE_KEY_NAME}`, { encoding: "utf-8" })
            let message: any = {};
            let path: any = `${config.CHANGELLY.CHANGELLY_ON_OFF_RAMP_BASE_URL}/${endpoint}`;
            let payload: any = path + JSON.stringify(message);
            let privateKeyObject: any = crypto.createPrivateKey({
                key: privateKeyString,
                type: 'pkcs1',
                format: 'pem',
                encoding: 'base64',
            });
            console.log("on off ramp key >>>",config.CHANGELLY.CHANGELLY_ON_OFF_RAMP_PUBLIC_API_KEY)

            let signature: any = crypto.sign('sha256', Buffer.from(payload), privateKeyObject).toString('base64');
            let headers: any = {
                'Content-Type': 'application/json',
                'X-Api-Key': `${config.CHANGELLY.CHANGELLY_ON_OFF_RAMP_PUBLIC_API_KEY}`,
                'X-Api-Signature': signature
            }
            return headers;
        } catch (err: any) {
            console.error("Error in getHeaderOfOnOffRampTesting of changelly", err.message)
            throw err;
        }
    }
    public async getResponseDataOfOnOffRampTesting(headers: any, endpoint: string) {
        try {
            let responseFromChangelly: any = await axios.get(
                `${config.CHANGELLY.CHANGELLY_ON_OFF_RAMP_BASE_URL}/${endpoint}`,
                { headers: headers })
            return responseFromChangelly;
        } catch (err: any) {
            console.error("Error in getResponseDataOfOnOffRampTesting of changelly", err.message)
            throw err;
        }
    }

    //==============================================

    // Cross - Chain
    public async getHeader(message: any) {
        try {
            let privateKeyString = await fs.readFileSync(`${__dirname}/../../config/keys/${config.CHANGELLY.CHANGELLY_CROSS_CHAIN_PRIVATE_KEY_NAME}`, { encoding: "utf-8" })

            let privateKeyBuffer = Buffer.from(privateKeyString, 'hex');
            let signature: any = crypto.sign('sha256', Buffer.from(JSON.stringify(message)), {
                key: privateKeyBuffer,
                type: 'pkcs8',
                format: 'der'
            });
            console.log("cross chain key >>>",config.CHANGELLY.CHANGELLY_CROSS_CHAIN_PUBLIC_API_KEY)
            let headers: any = {
                'Content-Type': 'application/json',
                'X-Api-Key': `${config.CHANGELLY.CHANGELLY_CROSS_CHAIN_PUBLIC_API_KEY}`,
                'X-Api-Signature': signature.toString('base64')
            }
            return headers;
        } catch (err: any) {
            console.error("Error in getHeader of changelly", err.message)
            throw err;
        }
    }
    public async getResponseData(payload: any, headers: any) {
        console.log("🚀 ~ ChangellyHelper ~ getResponseData ~ headers:", headers)
        console.log("🚀 ~ ChangellyHelper ~ getResponseData ~ payload:", payload)
        try {
            let responseFromChangelly: any = await axios.post(
                `${config.CHANGELLY.CHANGELLY_CROSS_CHAIN_BASE_URL}`,
                payload,
                { headers })
            return responseFromChangelly;
        } catch (err: any) {
            console.error("Error in getResponseData of changelly", err.message)
            throw err;
        }
    }

    // OnOffRamp
    public async getHeaderOfOnOffRamp(path: string, message: any) {
        try {
            let privateKeyString = await fs.readFileSync(`${__dirname}/../../config/keys/${config.CHANGELLY.CHANGELLY_ON_OFF_RAMP_PRIVATE_KEY_NAME}`, { encoding: "utf-8" })
            let payload: any = path + JSON.stringify(message);
            let privateKeyObject: any = crypto.createPrivateKey({
                key: privateKeyString,
                type: 'pkcs1',
                format: 'pem',
                encoding: 'base64',
            });

            let signature: any = crypto.sign('sha256', Buffer.from(payload), privateKeyObject).toString('base64');
            let headers: any = {
                'Content-Type': 'application/json',
                'X-Api-Key': `${config.CHANGELLY.CHANGELLY_ON_OFF_RAMP_PUBLIC_API_KEY}`,
                'X-Api-Signature': signature
            }
            return headers;
        } catch (err: any) {
            console.error("Error in getHeaderOfOnOffRamp of changelly", err.message)
            throw err;
        }
    }
    public async getResponseDataOfOnOffRamp(headers: any, path: string, apiType: string, data: any) {
        try {
            let responseFromChangelly: any = null;
            if (apiType == 'get') {
                responseFromChangelly = await axios.get(path, { headers: headers })
            } else {
                responseFromChangelly = await axios.post(path, data, { headers: headers })
            }
            console.log("🚀 ~ ChangellyHelper ~ getResponseDataOfOnOffRamp ~ responseFromChangelly:", responseFromChangelly)
            return responseFromChangelly;
        } catch (err: any) {
            console.error("Error in getResponseDataOfOnOffRamp of changelly", err.message)
            throw err;
        }
    }
    public async generateOrderId() {
        try {
            let timestamp: any = Date.now().toString(36);
            let randomString: any = Math.random().toString(36).substr(2, 4);
            let orderId: string = `${timestamp}${randomString}`;
            return orderId;
        } catch (err: any) {
            console.error("Error in generateOrderId of changelly", err.message)
            throw err;
        }
    }


}
export const changellyHelper = new ChangellyHelper();