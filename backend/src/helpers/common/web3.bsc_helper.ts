import Web3 from "web3";
import { config } from "../../config";
import { AbiItem } from "web3-utils";
import { CoinInterface } from "../../models";
import { TokenData } from "../../interfaces/global.interface";

import { bigNumberSafeMath } from "./globalFunctions";
import { exponentialToDecimal } from "./globalFunctions";
import { language } from "../../constants";
import commonHelper from "./common.helpers";

class BSCWeb3 {
    public web3: Web3;
    public abi: AbiItem[] | string;

    constructor(abi: AbiItem[] | string = "") {
        var provider = new Web3.providers.HttpProvider(config.NODE.BNB_RPC_URL || "");
        this.web3 = new Web3(provider);
        this.abi = abi != "" ? abi : "";
        this.initialize();
    }
    public initialize() { }

    public async searchToken(token_contract: string, lang: string) {
        try {
            let { Contract }: any = bscWeb3.web3.eth;
            let contract: any = new Contract(config.CONTRACT_ABI as AbiItem[], token_contract as string);
            let decimals: number = await contract.methods.decimals().call();
            let name: string = await contract.methods.name().call();
            let symbol: string = await contract.methods.symbol().call();
            let data: TokenData = { decimals: Number(decimals), name: name, symbol: symbol };
            if (!data) throw new Error(language[lang].BSC_TOKEN_SEARCH);
            return data;
        } catch (err: any) {
            console.error("searchToken_bsc", err)
            await commonHelper.save_error_logs("searchToken_bsc", err.message);
            throw new Error(language[lang].BSC_TOKEN_SEARCH);
        }
    }
    public async validate_bnb_address(address: string) {
        try {
            let { isAddress }: any = this.web3.utils;
            let validate_address: Boolean = isAddress(address);
            return validate_address;
        } catch (err: any) {
            console.error("Error in validate_bnb_address", err);
            await commonHelper.save_error_logs("validate_bnb_address", err.message);
            return false;
        }
    }
    public async get_bep20_token_balance(token_address: string | null | undefined, tokenAbi: AbiItem[], wallet_address: string) {
        try {
            if (token_address) {
                let contract: any = new this.web3.eth.Contract(tokenAbi, token_address);
                let decimals: number = await contract.methods.decimals().call();
                let balance: string = await contract.methods.balanceOf(wallet_address).call();
                let tokenBalance: number = await bigNumberSafeMath(balance, '/', Math.pow(10, decimals))
                return tokenBalance;
            }
            return 0;
        } catch (err: any) {
            console.error("Error in get_bep20_token_balance of bsc.", err)
            await commonHelper.save_error_logs("get_bep20_token_balance_bsc", err.message);
            throw err;
        }
    }
    public async get_balance(coinData: CoinInterface, address: string) {
        try {
            let balance: string|any = '0';
            if (coinData.is_token) {
                balance = (await this.get_bep20_token_balance(coinData.token_address, config.CONTRACT_ABI as AbiItem[], address))?.toString()
            } else {
                balance = (await this.get_coin_balance(address, true))?.toString();
            }
            balance = exponentialToDecimal(Number(balance))
            return balance;
        } catch (err: any) {
            console.error("Error in get_balance of bnb", err)
            await commonHelper.save_error_logs("get_balance_bnb", err.message);
            throw err;
        }
    }
    public async get_coin_balance(address: string, inBsc: boolean) {
        try {
            console.log("---get_coin_balance---",address)
            let balanceInWei = await this.web3.eth.getBalance(address);
            if (inBsc == true) {
                let balanceInBsc = this.web3.utils.fromWei(balanceInWei, "ether");
                return balanceInBsc;
            }
            console.log("---get_coin_balance---",balanceInWei)

            return balanceInWei;
        } catch (err: any) {
            console.log("get_coin_balance _bsc", err);
            await commonHelper.save_error_logs("get_coin_balance_bnb", err.message);
            throw err;
        }
    }

    // Used in bsc 
    public async getBep20TokenTransferGasEstimationCost(
        token_contract: string | null | undefined,
        token_abi: AbiItem[] | string,
        fromAdress: string,
        toAddress: string,
        lang: string
    ) {
        try {
            if (token_contract) {
                let contract = new this.web3.eth.Contract(token_abi as AbiItem[], token_contract);
                let tokenValue = await contract.methods.balanceOf(fromAdress).call();
                if (tokenValue == 0) {
                    return {
                        status: false,
                        gas_estimate: 0,
                        message: language[lang].BSC_UNABLE_TO_ESTIMATE,
                    };
                }
                tokenValue = exponentialToDecimal(tokenValue as number);
                let gasLimit = await contract.methods.transfer(toAddress, tokenValue).estimateGas({ from: fromAdress });
                console.log("gasLimit =''''======",gasLimit)

                gasLimit = gasLimit * 2;
                gasLimit == 0 ? 60000 : Math.floor(parseFloat(gasLimit.toString()));
                console.log("gasLimit ========",gasLimit)

                return gasLimit;
            }
            return 60000;
        } catch (err: any) {
            console.error("🔥 ~ ~ getBep20TokenTransferGasEstimationCost node.bsc.helper.ts error", err);
            await commonHelper.save_error_logs("getBep20TokenTransferGasEstimationCost_bsc", err.message);
            return 0;
        }
    }
    public async getBscGasLimit(from: string, to: string) {
        try {
            console.log("------",from,to)

            let amount: any = await this.get_coin_balance(from, true);
            let amountWei: any = this.web3.utils.toWei(amount.toString(), "ether");
            let amountHex: any = this.web3.utils.toHex(amountWei);
            let gasLimit: any = await this.web3.eth.estimateGas({
                from: from,
                to: to,
                value: amountHex,
            });
            return Math.floor(gasLimit * 1.5);
        } catch (err: any) {
            console.error("getBscGasLimit_bsc", err)
            await commonHelper.save_error_logs("getBscGasLimit_bsc", err.message);
            return 0;
        }
    }
    public async getWalletNonce(wallet: string) {
        try {
            return await this.web3.eth.getTransactionCount(wallet, "pending");
        } catch (err: any) {
            console.error("getWalletNonce_bsc", err)
            await commonHelper.save_error_logs("getWalletNonce_bsc", err.message);
            throw err;
        }
    }

    public async get_confirmed_trnx(tx_id: string) {
        try {
            console.log("transaction id bsc>>>", tx_id)
            const { getTransaction, getTransactionReceipt } = this.web3.eth;
            let transaction: any = await getTransaction(tx_id);
            let transactionReceipt: any = await getTransactionReceipt(tx_id);
            if (transaction.blockNumber) {
                console.log("bsc transaction.blockNumber")
                if (transactionReceipt) {
                    if (transactionReceipt.status && transaction.blockHash != null) {
                        console.log("transactionReceipt.status && transaction.blockHash != null>>>")
                        return { status: true }

                    } else {
                        console.log(" not transactionReceipt.status && transaction.blockHash != null>>>")
                        return { status: false }
                    }

                } else {
                    console.log("bsc transaction receipt not found")
                    return { status: false }
                }
            } else {
                console.log("bsc no transaction.blockNumber")
                return { status: false }
            }
        } catch (err: any) {
            console.error("err bsc_get_confirmed_trnx", err)
            await commonHelper.save_error_logs("err bsc_get_confirmed_trnx", err.message);
            return { status: false }
        }
    }

};

export const bscWeb3 = new BSCWeb3();

