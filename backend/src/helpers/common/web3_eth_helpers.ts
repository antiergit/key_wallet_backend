import Web3 from "web3";
import { config } from "../../config";
import { AbiItem } from "web3-utils";
import { CoinInterface } from "../../models";
import { TokenData } from "../../interfaces/global.interface";

import { bigNumberSafeMath, exponentialToDecimal } from "./globalFunctions";
import { language } from "../../constants";
import commonHelper from "./common.helpers";

class EthWeb3 {
  public web3: Web3;
  public abi: AbiItem[] | string;

  constructor(abi: AbiItem[] | string = "") {
    var provider = new Web3.providers.HttpProvider(config.NODE.ETH_RPC_URL || "");
    this.web3 = new Web3(provider);
    this.abi = abi != "" ? abi : "";
    this.initialize();
  }
  public initialize() { }

  public async searchToken(token_contract: string, lang: string) {
    try {
      let { Contract }: any = ethWeb3.web3.eth;
      let contract: any = new Contract(config.CONTRACT_ABI as AbiItem[], token_contract as string);
      let decimals: number = await contract.methods.decimals().call();
      let name: string = await contract.methods.name().call();
      let symbol: string = await contract.methods.symbol().call();
      let data: TokenData = { decimals: Number(decimals), name: name, symbol: symbol };
      if (!data) throw new Error(language[lang].ERC20_TOKEN_SEARCH);
      return data;
    } catch (err: any) {
      console.error("searchToken_eth", err)
      await commonHelper.save_error_logs("searchToken_eth", err.message);
      throw new Error(language[lang].ERC20_TOKEN_SEARCH);
    }
  }
  public async validate_eth_address(address: string) {
    try {
      let { isAddress }: any = this.web3.utils;
      let validate_address: Boolean = isAddress(address);
      return validate_address;
    } catch (err: any) {
      console.error("Error in validate_eth_address", err);
      await commonHelper.save_error_logs("validate_eth_address", err.message);
      return false;
    }
  }
  public async get_erc20_token_balance(token_address: string | null | undefined, tokenAbi: AbiItem[], wallet_address: string) {
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
      console.error("Error in get_erc20_token_balance_eth of eth.", err)
      await commonHelper.save_error_logs("get_erc20_token_balance_eth", err.message);
      throw err;
    }
  }
  public async get_balance(coinData: CoinInterface, address: string) {
    try {
      let balance: string|any = '0';
      if (coinData.is_token) {
        balance = (await this.get_erc20_token_balance(coinData.token_address, config.CONTRACT_ABI as AbiItem[], address))?.toString()
      } else {
        balance = (await this.get_coin_balance(address, true))?.toString();
      }
      balance = exponentialToDecimal(Number(balance))
      return balance;
    } catch (err: any) {
      console.error("Error in get_balance of eth", err)
      await commonHelper.save_error_logs("get_balance_eth", err.message);
      throw err;
    }
  }
  public async get_coin_balance(address: string, inEth: boolean) {
    try {
      let balance_in_wei: any = await this.web3.eth.getBalance(address)
      if (inEth == true) {
        let balance_in_eth = bigNumberSafeMath(balance_in_wei, '/', Math.pow(10, 18))
        return balance_in_eth;
      }
      return balance_in_wei;
    } catch (err: any) {
      console.error("Error in get_coin_balance of eth", err)
      await commonHelper.save_error_logs("get_coin_balance_eth", err.message);
      throw err;
    }
  }
}

export const ethWeb3 = new EthWeb3();
