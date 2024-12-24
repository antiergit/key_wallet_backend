import { OnlyControllerInterface } from "../../interfaces/controller.interface";
import { Request, Response } from "express";
import { language } from "../../constants";
import commonHelper from "../../helpers/common/common.helpers";
import response from "../../helpers/response/response.helpers";
import { OnChainHelper } from "./helper";
import { config } from "../../config";
import redisHelper from "../../helpers/common/redis";
import * as Models from "../../models/model"

class onChainController implements OnlyControllerInterface {

    constructor() {
        this.initialize();
    }

    public initialize() { }
    public OneinchSwapApi = async (req: Request, res: Response) => {
        let lang: any = req.headers['content-language'] || 'en';
        try {
            const { chain_id, src, dst, amount, from, slippage, fee, referrer, mainRouteParts, parts } = req.body
            let responseAPI = await OnChainHelper.OneInchSwapApi(chain_id, src, dst, amount, from, slippage, fee, referrer, mainRouteParts, parts);

            return response.success(res, {
                data: {
                    status: true,
                    data: responseAPI
                },
            });
        } catch (error: any) {
            console.error("Error in on-chain > OneinchSwapApi.", error);
            await commonHelper.save_error_logs("OneinchSwapApi", error.message);

            return response.error(res, {
                data: { message: language[lang].CATCH_MSG, data: {} },
            });
        }
    }
    public OneinchQuotesApi = async (req: Request, res: Response) => {
        let lang: any = req.headers['content-language'] || 'en';
        try {
            const { chain_id, src, dst, amount, fee } = req.body

            let responseAPI = await OnChainHelper.OneInchQuotesApi(chain_id, src, dst, amount, fee);
            return response.success(res, {
                data: {
                    status: true,
                    data: responseAPI
                },
            });

        } catch (error: any) {
            console.error("Error in on-chain > OneinchQuotesApi.", error);
            await commonHelper.save_error_logs("OneinchQuotesApi", error.message);
            return response.error(res, {
                data: { message: language[lang].CATCH_MSG, data: {} },
            });
        }
    }
    public OneinchTokenApproval = async (req: Request, res: Response) => {
        let lang: any = req.headers['content-language'] || 'en';
        try {
            const { chain_id, tokenAddress, amount } = req.body
            let responseAPI = await OnChainHelper.TokenApprovalApi(chain_id, tokenAddress, amount);
            return response.success(res, {
                data: {
                    status: true,
                    data: responseAPI
                },
            });
        } catch (error: any) {
            console.error("Error in on-chain > OneinchTokenApproval.", error);
            await commonHelper.save_error_logs("OneinchTokenApproval", error.message);
            return response.error(res, {
                data: { message: language[lang].CATCH_MSG, data: {} },
            });
        }
    }
    public OneinchSpenderInfo = async (req: Request, res: Response) => {
        let lang: any = req.headers['content-language'] || 'en';
        try {
            const { chain_id } = req.body
            let responseAPI = await OnChainHelper.spenderInfoApi(chain_id);
            return response.success(res, {
                data: {
                    status: true,
                    data: responseAPI
                },
            });
        } catch (error: any) {
            console.error("Error in on-chain > OneinchSpenderInfo.", error);
            await commonHelper.save_error_logs("OneinchSpenderInfo", error.message);
            return response.error(res, {
                data: { message: language[lang].CATCH_MSG, data: {} },
            });
        }
    }
    public OneinchAllowanceCheck = async (req: Request, res: Response) => {
        let lang: any = req.headers['content-language'] || 'en';
        try {
            console.log("req body OneinchAllowanceCheck >>>", req.body)
            const { chain_id, tokenAddress, walletAddress } = req.body
            let responseAPI = await OnChainHelper.allowanceCheckOneInch(chain_id, tokenAddress, walletAddress);
            return response.success(res, {
                data: {
                    status: true,
                    data: responseAPI
                },
            });
        } catch (error: any) {
            console.error("Error in on-chain > OneinchAllowanceCheck.", error);
            await commonHelper.save_error_logs("OneinchAllowanceCheck", error.message);
            return response.error(res, {
                data: { message: language[lang].CATCH_MSG, data: {} },
            });
        }
    }
    public OneinchTokensApi = async (req: Request, res: Response) => {
        let lang: any = req.headers['content-language'] || 'en';
        try {
            const { chain_id } = req.body
            let responseAPI = await OnChainHelper.tokensApiOneInch(chain_id);
            return response.success(res, {
                data: {
                    status: true,
                    data: responseAPI
                },
            });
        } catch (error: any) {
            console.error("Error in on-chain > OneinchTokensApi.", error);
            await commonHelper.save_error_logs("OneinchTokensApi", error.message);
            return response.error(res, {
                data: { message: language[lang].CATCH_MSG, data: {} },
            });
        }
    }
    public commisionData = async (req: Request, res: Response) => {
        let lang: any = req.headers['content-language'] || 'en';
        try {
            console.log('ON_CHAIN_DATA >>>', config.ON_CHAIN_DATA)
            let onChainData: any = await redisHelper.getRedisSting(config.ON_CHAIN_DATA);
            console.log('onChainData >>>', onChainData);
            if (onChainData) {
                onChainData = JSON.parse(onChainData);
            } else {
                let fetch_data: any = await Models.SwapSettingsModel.findOne({
                    attributes: [['address', 'walletAddress'], 'percentage'],
                    where: { id: 1 },
                    raw: true
                });
                if (fetch_data && fetch_data?.percentage !== undefined) {
                    fetch_data.percentage = Number(fetch_data?.percentage)
                }
                if (fetch_data) {
                    await redisHelper.setRedisSting(config.ON_CHAIN_DATA, JSON.stringify(fetch_data));
                }
                onChainData = fetch_data;
            }
            // let walletAddress = config.ON_CHAIN.COMMISSION_WALLET_ADDRESS; //"0xD6DDb06aB05af725A0A830b939113989a19Bfd9d";
            // let amount = config.ON_CHAIN.COMMISSION_PERCENTAGE; //0.5
            // let res_data = {
            //     walletAddress: walletAddress,
            //     percentage: amount
            // }
            return response.success(res, {
                data: {
                    status: true,
                    data: onChainData,
                    message: "On-chain commission data get successfully."
                },
            });
        } catch (error: any) {
            console.error("Error in on-chain > commisionData.", error);
            await commonHelper.save_error_logs("commisionData", error.message);
            return response.error(res, {
                data: { message: language[lang].CATCH_MSG, data: {} },
            });
        }
    }
}
export const OnChainController = new onChainController();