import { Request, Response } from "express";
import { OnlyControllerInterface } from "../../../interfaces/controller.interface";
import response from "../../../helpers/response/response.helpers";
import commonHelper from "../../../helpers/common/common.helpers";
import { bigNumberSafeMath } from "../../../helpers/common/globalFunctions";
import { config } from "../../../config";
import { AbiItem } from "web3-utils";
import dbHelper, { gas_prices_queries } from "../../../helpers/dbHelper/index";
import { language } from "../../../constants";
import { bscWeb3 } from "../../../helpers/common/web3.bsc_helper";
import { BscHelper } from "../helpers/bsc.helpers";
import { BlockChain, TokenType } from "../../../constants/global_enum";



class BNBController implements OnlyControllerInterface {
    constructor() {
        this.initialize();
    }
    public initialize() { }

    public async gasEstimation(req: Request, res: Response) {
        let lang: any = req.headers['content-language'] || 'en';
        try {
            console.log("req body bsc gas estimation >>>", req.body)

            let fee_price_data: any = await BscHelper.get_fee_price(req.coininfo, req.body, lang);
            let resultList: any = await gas_prices_queries.gas_prices_find_one(['id', 'coin_family', 'safe_gas_price', 'propose_gas_price', 'fast_gas_price'], { coin_family: 1 })

            return response.success(res, {
                data: {
                    status: true,
                    gas_estimate: fee_price_data.gas_estimate,
                    resultList
                },
            });
        } catch (err: any) {
            console.error("Error in gas_estimation_bsc", err)
            await commonHelper.save_error_logs("gas_estimation_bsc_error", err);
            return response.error(res, {
                data: { message: language[lang].CATCH_MSG },
            });
        }
    }
    public async send(req: Request, res: Response) {
        let lang: any = req.headers['content-language'] || 'en';
        try {
            console.log("req body bsc send >>>", req.body)

            let is_maker: number | null = req.body.is_maker ? req.body.is_maker : null;
            let { nonce, tx_raw, from, to, amount, gas_estimate, gas_price, tx_type }: { nonce: number, tx_raw: string, from: string, to: string, amount: string, gas_estimate: number, gas_price: number, tx_type: string } = req.body;

            const { token_address: contractAddress, token_abi: ABI } = req.coininfo;
            let dapp_transaction: any = req.body.add_amount;

            let maxGas: number = gas_price * gas_estimate;
            var gasInETH: any = await BscHelper.convertWeiToEth(maxGas);
            gas_price = gasInETH;
            if (req.coininfo.is_token == false && req.coininfo.coin_symbol == BlockChain.BNB) {
                let withdrawAmount: any;
                if (dapp_transaction == 1) {
                    withdrawAmount = bigNumberSafeMath('0', "+", gasInETH);
                } else {
                    withdrawAmount = bigNumberSafeMath(amount, "+", gasInETH);
                }
                let bscBalance: any = await bscWeb3.get_coin_balance(from, true);

                if (Number(bscBalance) < Number(withdrawAmount)) {
                    return response.error(res, {
                        data: { status: false, message: language[lang].INSUFFICIENT },
                    });
                }
            } else if (
                req.coininfo.coin_family == config.STATIC_COIN_FAMILY.BNB &&
                req.coininfo.is_token == true &&
                req.coininfo.token_type === TokenType.BEP20

            ) {
                let bscBalance: any = await bscWeb3.get_coin_balance(from, true);
                let BEP20TokenBalance: any = await bscWeb3.get_bep20_token_balance(
                    contractAddress,
                    ABI as AbiItem[],
                    req.body.from
                );

                if (Number(bscBalance) < Number(gasInETH)) {
                    return response.error(res, {
                        data: {
                            status: false,
                            message: language[lang].INSUFFICIENTBNB,
                        },
                    });
                } else if (Number(BEP20TokenBalance) < Number(amount)) {
                    return response.error(res, {
                        data: {
                            status: false,
                            message: language[lang].ETH_INSUFFICIENT(req.coininfo.coin_symbol)
                        },
                    });
                }
            }
            let transferData: any = await BscHelper.sendBscOrTokens(
                req,
                lang,
                tx_raw,
                async (err: Error, txid: string) => {
                    if (err) {
                        console.log("--------- sendBscOrTokens:", err);
                        return response.error(res, {
                            data: {
                                status: false,
                                message: err.message.replace(/^Returned error:+/i, ""),
                            },
                        });
                    } else {
                        req.body.tx_hash = txid;
                        req.body.tx_status = "completed";
                        let resultStatus: any = await dbHelper.saveWithdrawTxDetails(req, is_maker);

                        if (resultStatus.status && resultStatus.status == true) {
                            if (req.body.tx_type == 'Approve') {
                                return response.success(res, {
                                    data: {
                                        status: true,
                                        message: language[lang].APPROVE_REQUEST,
                                        tx_hash: txid,
                                    },
                                })
                            } else if (req.body.tx_type == 'withdraw') {
                                return response.success(res, {
                                    data: {
                                        status: true,
                                        message: language[lang].WITHDRAW_REQUEST_ETH(req.body.amount, req.coininfo.coin_symbol),
                                        tx_hash: txid,
                                    },
                                });
                            } else {
                                return response.success(res, {
                                    data: {
                                        status: true,
                                        message: language[lang].SWAP_REQUEST_ETH(req.body.amount, req.coininfo.coin_symbol),
                                        tx_hash: txid,
                                    },
                                });
                            }
                        } else {
                            return response.error(res, {
                                data: {
                                    status: false,
                                    message: language[lang].TRANSACTION_REQUEST
                                },
                            });
                        }
                    }
                }
            );
        } catch (err: any) {
            console.error("Error in BNB send API >>>>>", err)
            await commonHelper.save_error_logs("bnb_send", err.message);
            return response.error(res, {
                data: {
                    message: language[lang].CATCH_MSG
                },
            });
        }
    }
    public async getNonce(req: Request, res: Response) {
        let lang: any = req.headers['content-language'] || 'en';
        try {
            console.log("req body bsc nonce >>>", req.body)

            let { wallet_address }: { wallet_address: string } = req.body;
            let nonce_val: number = 0;
            var walletNonce = await bscWeb3.getWalletNonce(wallet_address);
            nonce_val = walletNonce;
            return response.success(res, {
                data: {
                    data: {
                        nonce: nonce_val
                    },
                    message: language[lang].GET_NONCE
                },
            });
        } catch (err: any) {
            console.error("Error in gas_estimation_bsc", err)
            await commonHelper.save_error_logs("getNonce_error", err);
            return response.error(res, {
                data: {
                    message: language[lang].CATCH_MSG,
                    data: {}
                },
            });
        }
    }
}

export const bnbController = new BNBController();
