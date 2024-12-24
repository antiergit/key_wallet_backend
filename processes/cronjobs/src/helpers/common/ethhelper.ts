import Web3 from "web3";
import { config } from "./../../config";
import { AbiItem } from "web3-utils";
import { bigNumberSafeMath, exponentialToDecimal } from "../../helpers/common/globalFunctions";

class EthHelpers {
    public web3: Web3;

    constructor() {
        var provider = new Web3.providers.HttpProvider(config.NODE.ETH_RPC_URL || "");
        this.web3 = new Web3(provider);
        this.initialize();
    }

    public initialize() { }


    public async getBalance(is_token: number, token_address: string, wallet_address: string) {
        try {
            let balance: string = '0';
            if (is_token == 1) {
                balance = (await this.getErc20TokenBal(token_address, config.CONTRACT_ABI as AbiItem[], wallet_address)).toString()
            } else {
                balance = (await this.getCoinBal(wallet_address, true)).toString();
            }
            balance = exponentialToDecimal(Number(balance))
            return balance;
        } catch (err: any) {
            console.error("Error in getBalance of ethereum 🔥 ~ ~", err.message)
            throw err;
        }
    }
    public async getErc20TokenBal(token_address: string | undefined, tokenAbi: AbiItem[], wallet_address: string) {
        try {
            if (token_address) {
                const contract: any = new this.web3.eth.Contract(tokenAbi, token_address)
                let decimals: any = await contract.methods.decimals().call();
                let balance: any = await contract.methods.balanceOf(wallet_address).call();
                let tokenBalance: any = await bigNumberSafeMath(balance, '/', Math.pow(10, decimals))
                console.log("getErc20TokenBal 🔥 ~ ~", tokenBalance)
                return tokenBalance;
            }
            return 0;
        } catch (err: any) {
            console.error("Error in getErc20TokenBal of eth. 🔥 ~ ~", err.message)
            throw err;
        }

    }
    public async getCoinBal(address: string, inEth: boolean) {
        try {
            let balance_in_wei: any = await this.web3.eth.getBalance(address)
            if (inEth == true) {
                let balance_in_eth = bigNumberSafeMath(balance_in_wei, '/', Math.pow(10, 18))
                return balance_in_eth;
            }
        } catch (err: any) {
            console.error("Error in get_coin_balance of eth 🔥 ~ ~", err.message)
            throw err;
        }
    }
    public async getTrnxDetails(transactionId: string) {
        try {
            let fromAddress: string;
            let blockId: any;

            let { getTransaction, getTransactionReceipt } = this.web3.eth;
            const transactionReceipt = await getTransactionReceipt(transactionId);
            if (transactionReceipt && transactionReceipt?.status && transactionReceipt?.blockHash != null) {
                const transaction = await getTransaction(transactionId);
                fromAddress = transaction.from;
                blockId = transaction.blockNumber
                return {
                    status: true,
                    data: {
                        fromAddress: fromAddress,
                        blockId: blockId
                    }
                }
            } else {
                return { status: false };
            }
        } catch (err: any) {
            console.error("Error in getTrnxDetails of eth  🔥 ~ ~", err.message)
            return { status: false };
        }
    }
}
const ethHelper = new EthHelpers();
export default ethHelper;