import Web3 from 'web3';
import TronWeb from 'tronweb';
import { BooleanEnum, TokenStandard } from "../enum";
import { CoinInterface } from "../models";
import { Utility_Helper } from "./utility.helper";
import { config } from '../config';
import { AbiItem } from 'web3-utils';

class BlockchainHelper {
    // public REDIS_TOKENS: any = CONFIG.REDISKEYS.TOKENS;
    public Web3: Web3;
    public BSC_Web3: Web3;

    public FULLNODE: string = config.config.NODE.ETH_RPC_URL;
    public BSC_FULLNODE: string = config.config.NODE.BNB_RPC_URL;
    public TRX_FULLNODE: string = config.config.NODE.TRX_RPC_URL;
    public tronWeb: any;



    constructor() {
        /* TRON CASE */
        const HttpProvider = TronWeb.providers.HttpProvider;
        const fullNode = new HttpProvider(this.TRX_FULLNODE);
        this.tronWeb = new TronWeb({
            fullHost: this.TRX_FULLNODE,
            headers: { apikey: config.config.NODE.TRX_API_KEY }
        });
        const provider = new Web3.providers.HttpProvider(this.FULLNODE);
        this.Web3 = new Web3(provider);
        const bsc_provider = new Web3.providers.HttpProvider(this.BSC_FULLNODE);
        this.BSC_Web3 = new Web3(bsc_provider);
    }


    public async TRX_Fetch_Balance(address: string, coin: any) {
        try {
            let balance: number | any = 0;
            if (coin.is_token == BooleanEnum.true) {
                switch (coin.token_type.toLowerCase()) {
                    case TokenStandard.TRC20:
                        balance = await this.TRC20_Token_Balance(
                            address, //// wallet_address
                            coin.token_address /// contract_address
                        )
                        break;
                    default:
                        balance = 0
                        break;
                }
            } else {
                balance = await this.TRX_Coin_Fetch_Balance(address);
            }
            return balance
        } catch (err: any) {
            console.error(`TRON_Helper TRON_Fetch_Balance error >>`, err);
            throw err;
        }
    }

    public async TRC20_Token_Balance(address: string, contract_address: string) {
        try {
            await this.tronWeb.setAddress(contract_address);
            let contract = await this.tronWeb.contract().at(contract_address);
            let decimals = await contract.decimals().call();
            if (decimals._hex != undefined) {
                decimals = await this.tronWeb.toDecimal(decimals._hex);
            }
            let balanceOf = await contract.balanceOf(address).call();
            let toDecimal = await this.tronWeb.toDecimal(balanceOf._hex);
            if (balanceOf._hex == undefined) {
                toDecimal = await this.tronWeb.toDecimal(
                    balanceOf.balance._hex
                );
            }
            let expToDecimal = await Utility_Helper.exponentialToDecimal(toDecimal);
            let balance = Number(expToDecimal) / Math.pow(10, decimals);
            return balance;
        } catch (err: any) {
            console.error(`Tron_Helper TRC20_Token_Balance error >>`, err);
            throw err;
        }
    }

    public async TRX_Coin_Fetch_Balance(address: string) {
        try {
            return await this.tronWeb.trx.getBalance(address).then(async (result: any) => {
                return await this.tronWeb.fromSun(result);
            });
        } catch (err: any) {
            console.error(`Tron_Helper TRX_Fetch_Balance error >>`, err);
            throw err;
        }
    }

    //ETH
    convertWeiToEth = async (
        value: number
    ) => {
        try {
            return this.Web3.utils.fromWei(
                value.toString(),
                'ether'
            );
        } catch (error: any) {
            console.error(`ConvertWeiToEth error >>`, error);
            return 0;
        }
    }
    Fetch_Balance = async (
        address: string,
        coin: any
    ) => {
        try {
            let balance: number | any = 0;
            if (coin.is_token == BooleanEnum.true) {
                switch (coin.token_type.toLowerCase()) {

                    case TokenStandard.ERC20:
                        balance = await this.ERC20_Token_Fetch_Balance(
                            address, //// wallet_address
                            coin.token_address ? coin.token_address : null/// contract_address
                        )
                        break;
                    case TokenStandard.ERC721:
                        balance = await this.ERC721_Token_Fetch_Balance(
                            address, //// wallet_address
                            coin.token_address ? coin.token_address : null /// contract_address
                        )
                        break;
                    default:
                        balance = 0
                        break;
                }
            } else {
                balance = await this.Coin_Fetch_Balance(address);
            }
            return balance
        } catch (err: any) {
            console.error(`Bsc_Helper BSC_Fetch_Balance error >>`, err);
            throw err;
        }
    }
    public ERC20_Token_Fetch_Balance = async (
        wallet_address: string,
        contract_address: string | null
    ) => {
        try {
            if (contract_address) {
                const contract = await new this.Web3.eth.Contract(
                    config.config.CONTRACT_ABI as AbiItem[],
                    contract_address
                );
                const decimals = await contract.methods.decimals().call();
                const balance = await contract.methods.balanceOf(wallet_address).call();
                const tokenBalance = await Utility_Helper.bigNumberSafeMath(
                    balance, '/', Math.pow(10, decimals)
                );
                let tokBalance: string = await Utility_Helper.exponentialToDecimal(tokenBalance)
                return Number(tokBalance);
            }
            return 0;
        } catch (err: any) {
            console.error(`BscHelper BEP20_Token_Fetch_Balance error >>`, err);
            throw err;
        }
    }
    private ERC721_Token_Fetch_Balance = async (
        wallet_address: string,
        contract_address: string | null
    ) => {
        try {
            if (contract_address) {
                const contract = await new this.Web3.eth.Contract(
                    config.config.ERC721ABI as AbiItem[],
                    contract_address
                );
                const balance = await contract.methods.balanceOf(wallet_address).call();
                return Number(balance);
            }
            return 0;
        } catch (err: any) {
            console.error(`Bsc_Helper BEP20_Token_Fetch_Balance error >>`, err);
            throw err;
        }
    }
    public Coin_Fetch_Balance = async (
        address: string
    ) => {
        try {
            const balance: string = await this.Web3.eth.getBalance(address);
            const tokenBalance = await Utility_Helper.bigNumberSafeMath(
                balance, '/', Math.pow(10, 18)
            );
            let coinBalance: string = await Utility_Helper.exponentialToDecimal(tokenBalance)
            return Number(coinBalance || 0);
        } catch (err: any) {
            console.error(`Eth_Helper Coin_Fetch_Balance error >>`, err);
            throw err;
        }
    }
    // BNB
    Fetch_Balance_bnb = async (
        address: string,
        coin: any
    ) => {
        try {
            let balance: number | any = 0;

            if (coin.is_token == BooleanEnum.true) {
                switch (coin.token_type.toLowerCase()) {
                    case TokenStandard.BEP20:
                        balance = await this.BEP20_Token_Fetch_Balance(
                            address, //// wallet_address
                            coin.token_address ? coin.token_address : null/// contract_address
                        )
                        break;
                    default:
                        balance = 0
                        break;
                }
            } else {
                balance = await this.BSC_Coin_Fetch_Balance(address);
            }
            return balance
        } catch (err: any) {
            console.error(`Bsc_Helper BSC_Fetch_Balance error >>`, err);
            throw err;
        }
    }
    public BEP20_Token_Fetch_Balance = async (
        wallet_address: string,
        contract_address: string | null
    ) => {
        try {
            if (contract_address) {
                const contract = await new this.BSC_Web3.eth.Contract(
                    config.config.CONTRACT_ABI as AbiItem[],
                    contract_address
                );
                const decimals = await contract.methods.decimals().call();
                const balance = await contract.methods.balanceOf(wallet_address).call();
                const tokenBalance = await Utility_Helper.bigNumberSafeMath(
                    balance, '/', Math.pow(10, decimals)
                );
                let tokBalance: string = await Utility_Helper.exponentialToDecimal(tokenBalance)
                return Number(tokBalance);
            }
            return 0;
        } catch (err: any) {
            console.error(`BscHelper BEP20_Token_Fetch_Balance error >>`, err);
            throw err;
        }
    }
    public BSC_Coin_Fetch_Balance = async (
        address: string
    ) => {
        try {
            const balance: string = await this.BSC_Web3.eth.getBalance(address);
            const tokenBalance = await Utility_Helper.bigNumberSafeMath(
                balance, '/', Math.pow(10, 18)
            );
            let coinBalance: string = await Utility_Helper.exponentialToDecimal(tokenBalance)
            return Number(coinBalance || 0);
        } catch (err: any) {
            console.error(`Bsc_Helper Coin_Fetch_Balance error >>`, err);
            throw err;
        }
    }
}
export let Blockchain_Helper = new BlockchainHelper();