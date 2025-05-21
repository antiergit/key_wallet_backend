
import { config } from "../../../config";
import { AbiItem } from "web3-utils";
import { TokenType } from "../../../constants/global_enum";
import { bscWeb3 } from "../../../helpers/common/web3.bsc_helper";
import * as Models from '../../../models/model/index';
import commonHelper from "../../../helpers/common/common.helpers";
import Web3 from "web3";
import { bigNumberSafeMath } from "../../../helpers/common/globalFunctions";
import { language } from "../../../constants";
import { gas_prices_queries } from "../../../helpers/dbHelper/index";


let utxoClass = class UTXO {
    public web3: Web3;
    public abi: AbiItem[] | string;
    public token_address: string | null | undefined;

    constructor(abi: AbiItem[] | string = "", contractAddress: string = "") {
        var provider = new Web3.providers.HttpProvider(config.NODE.BNB_RPC_URL || "");
        this.web3 = new Web3(provider);
        this.abi = abi != "" ? abi : "";
        this.token_address = !contractAddress ? contractAddress : "";
        this.initialize();
    }

    public initialize() { }

    public async get_fee_price(coin_info: any, body: any, lang: string) {
        try {
            const { from, to }: { from: string; to: string } = body;
            console.log("------ from ,to ---------",from,to,"----coin_info----",coin_info)
            let estimateGas: any;
            let set_token_type = coin_info.token_type !== undefined ? coin_info.token_type : TokenType.BEP20;
            if (coin_info.is_token) {

                console.log("------",coin_info.is_token)

                if (set_token_type == TokenType.BEP20) {
                    estimateGas = await bscWeb3.getBep20TokenTransferGasEstimationCost(coin_info.token_address, config.CONTRACT_ABI as AbiItem[], from, to, lang);
                } else {
                    console.log("is_token can't be 0 ")
                }
            } else {
                console.log("-- +++----")

                estimateGas = await bscWeb3.getBscGasLimit(from, to);
            }

            return {
                gas_estimate: estimateGas,
            }
        } catch (err: any) {
            await commonHelper.save_error_logs("bsc_send", err.message);
            console.error("err", err as Error);
        }

    }
    public async convertWeiToEth(value: number): Promise<string> {
        var valueInEth = await this.web3.utils.fromWei(value.toString(), "ether");
        return valueInEth;
    }
    public async getUserBEP20TokenBalance(
        tokenAddress: string | null | undefined,
        tokenAbi: AbiItem[],
        walletAddress: string
    ): Promise<number> {
        try {
            if (tokenAddress) {
                let contract = await new this.web3.eth.Contract(tokenAbi, tokenAddress);
                var decimals = await contract.methods.decimals().call();
                var balance = await contract.methods.balanceOf(walletAddress).call();
                var tokenBalance = await bigNumberSafeMath(
                    balance,
                    "/",
                    Math.pow(10, decimals)
                );
                return tokenBalance;
            }
            return 0;
        } catch (error) {
            console.log("getUserBEP20TokenBalance catch error: ", error);
            return 0;
        }
    }
    public async broadcastBscRawTx(rawTx: string, cb: CallableFunction) {
        let sendRawRes: any = await this.web3.eth
            .sendSignedTransaction("0x" + rawTx)
            .on("transactionHash", (txHash) => {
                console.log("tx", txHash)
                cb(null, txHash);
            })
            .on("error", (err) => {
                console.error("err:: ", err);
                cb(err, null);
            });
    }
    public async sendBscOrTokens(
        req: any,
        lang: string,
        rawTrnx: string,
        cb: CallableFunction
    ) {
        try {
            if (req.coininfo) {
                if (rawTrnx) {
                    await this.broadcastBscRawTx(
                        rawTrnx,
                        async (error: Error, txid: string) => {
                            if (error) {
                                console.error("txid callback error ------ ", error);
                                cb(error, null);
                            } else {
                                console.log("txid callback ------ ", txid);
                                cb(null, txid);
                            }
                        }
                    );
                } else {
                    cb(language[lang].TRNX_NOT_FOUND, null);
                }
            }
        } catch (err: any) {
            console.error("Error, sendBscOrToken===>", err);
        }
    }

};

let utxo = new utxoClass();

export const BscHelper = utxo;
