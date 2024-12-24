import TronWeb from 'tronweb';
import { config } from "../../config";
import { GlblBooleanEnum } from '../../constants/global_enum';
import { CoinInterface } from '../../models';
import { exponentialToDecimal } from './globalFunctions';
import commonHelper from './common.helpers';
import { TokenData } from '../../interfaces/global.interface';
import { language } from "../../constants";



class TrxWeb3 {

    public TRX_FULLNODE: string = config.NODE.TRX_RPC_URL
    public tronWeb: any;

    constructor() {
        this.tronWeb = new TronWeb({
            fullHost: this.TRX_FULLNODE,
            headers: { apikey: config.NODE.TRX_API_KEY }
        });
    }

    public async searchToken(trc20ContractAddress: string, lang: string) {
        try {
            await this.tronWeb.setAddress(trc20ContractAddress);
            let contract: any = await this.tronWeb.contract().at(trc20ContractAddress);
            let coin_name: string = await contract.name().call();
            let coin_symbol: string = await contract.symbol().call();
            let decimals: number = await contract.decimals().call();
            let data: TokenData = { decimals: Number(decimals.toString()), name: coin_name, symbol: coin_symbol };
            let dex: any = decimals.toString()
            if (dex.hex != undefined) {
                dex = await this.tronWeb.toDecimal(dex.hex);
                data.decimals = Number(dex);
            }
            if (!data) throw language[lang].TRON_TOKEN_SEARCH;
            return data;
        } catch (err: any) {
            console.error("searchToken_trx", err);
            await commonHelper.save_error_logs("searchToken_trx", err.message);
            throw language[lang].TRON_TOKEN_SEARCH;
        }
    }
    public async validate_trx_address(address: string) {
        try {
            return await this.tronWeb.isAddress(address);
        } catch (err: any) {
            console.error(`Tron_Helper Validate_Address error >>`, err);
            await commonHelper.save_error_logs("validate_trx_address", err.message);
            return false;
        }
    }
    public async TRC20_Token_Balance(address: string, contract_address: string | null | undefined) {
        try {
            await this.tronWeb.setAddress(contract_address);
            let contract: any = await this.tronWeb.contract().at(contract_address);
            let decimals: number = await contract.decimals().call();
            let dex: any = decimals.toString()
            if (dex.hex != undefined) {
                dex = await this.tronWeb.toDecimal(dex.hex);
                decimals = Number(dex);
            }

            let balanceOf: any = await contract.balanceOf(address).call();
            let toDecimal: number = await this.tronWeb.toDecimal(balanceOf._hex);
            if (balanceOf._hex == undefined) {
                toDecimal = await this.tronWeb.toDecimal(
                    balanceOf.balance._hex
                );
            }
            let expToDecimal: string = exponentialToDecimal(toDecimal);
            let balance: number = Number(expToDecimal) / Math.pow(10, decimals);
            return balance;
        } catch (err: any) {
            console.error(`Tron_Helper TRC20_Token_Balance error >>`, err);
            await commonHelper.save_error_logs("TRC20_Token_Balance", err.message);
            throw err;
        }
    }
    public async Fetch_Balance(address: string, coin: CoinInterface) {
        try {
            let balance: number|any = 0;
            if (coin.is_token == GlblBooleanEnum.true) {
                balance = await this.TRC20_Token_Balance(address, coin.token_address)
            } else {
                balance = await this.Coin_Fetch_Balance(address);
            }
            return balance;
        } catch (err: any) {
            console.error(`Error in Fetch_Balance of tron. `, err);
            await commonHelper.save_error_logs("Fetch_Balance_trx", err.message);
            throw err;
        }
    }
    public async Coin_Fetch_Balance(address: string) {
        try {
            return await this.tronWeb.trx.getBalance(address).then(async (result: any) => {
                return await this.tronWeb.fromSun(result);
            });
        } catch (err: any) {
            console.error(`Tron_Helper TRX_Fetch_Balance error >>`, err);
            await commonHelper.save_error_logs("Coin_Fetch_Balance", err.message);
            throw err;
        }
    }

}

export const trxWeb3 = new TrxWeb3();
