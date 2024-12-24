import { Request } from "express";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import { config } from "../../../config";
import { exponentialToDecimal } from "../../../helpers/common/globalFunctions";
import { HelpersInterface } from "../../../interfaces/helpers.interface";
import { ethWeb3 } from "../../../helpers/common/web3_eth_helpers";
import { language } from "../../../constants";
import commonHelper from "../../../helpers/common/common.helpers";
import { TokenData } from "../../../interfaces/global.interface";

class EthHelpers implements HelpersInterface {
  public web3: Web3;
  public abi: AbiItem[] | string;
  public token_address: string | null | undefined;

  constructor(abi: AbiItem[] | string = "", contractAddress: string = "") {
    var provider = new Web3.providers.HttpProvider(config.NODE.ETH_RPC_URL || "");
    this.web3 = new Web3(provider);
    this.abi = abi != "" ? abi : "";
    this.token_address = !contractAddress ? contractAddress : "";
    this.initialize();
  }

  public initialize() { }


  public async searchToken(token_contract: string) {
    try {
      let { Contract }: any = ethWeb3.web3.eth;
      let contract: any = new Contract(config.CONTRACT_ABI as AbiItem[], token_contract as string);
      let decimals: number = await contract.methods.decimals().call();
      let name: string = await contract.methods.name().call();
      let symbol: string = await contract.methods.symbol().call();
      if (!decimals) {
        return { decimals: 0, name: "", symbol: "" };
      }
      return { decimals: decimals, name: name, symbol: symbol };
    } catch (err: any) {
      console.error("Error in searchToken in eth case", err)
      await commonHelper.save_error_logs("searchToken_eth", err.message);
      return { decimals: 0, name: "", symbol: "" };
    }
  }

  public async getWalletNonce(wallet: string): Promise<number> {
    return await this.web3.eth.getTransactionCount(wallet, "pending");
  }
  async getErc20TokenTransferGasEstimationCost(
    token_contract: string | null | undefined,
    token_abi: AbiItem[] | string,
    fromAdress: string,
    toAddress: string,
    lang: string
  ) {
    try {
      if (token_contract) {
        let contract = new this.web3.eth.Contract(
          token_abi as AbiItem[],
          token_contract
        );
        var tokenValue = await contract.methods.balanceOf(fromAdress).call();
        tokenValue = await exponentialToDecimal(tokenValue as number);
        var gasLimit = await contract.methods
          .transfer(toAddress, tokenValue)
          .estimateGas({ from: fromAdress });
        gasLimit = gasLimit * 3;
        // return gasLimit;
      }
      return {
        status: true,
        gas_estimate:
          gasLimit == 0 ? 60000 : Math.floor(parseFloat(gasLimit.toString())),
        message: language[lang].ESTIMATE_ETH_TRANSFER_GAS_FEE
      };

      //return 0;
    } catch (err: any) {
      await commonHelper.save_error_logs("eth_getErc20TokenTransferGasEstimationCost", err.message);
      console.error("error, for try catch", err);
      return {
        status: false,
        gas_estimate: 60000,
        message: language[lang].ESTIMATE_ETH_TRANSFER_GAS_FEE
      };
    }
  }
  async getEthGasLimit(from: string, to: string, lang: string) {
    try {
      var amount = await ethWeb3.get_coin_balance(from, true);
      var amountWei = await this.web3.utils.toWei(amount.toString(), "ether");
      var amountHex = await this.web3.utils.toHex(amountWei);
      var gasLimit = await this.web3.eth.estimateGas({
        from: from,
        to: to,
        value: amountHex,
      });

      return {
        status: true,
        gas_estimate: gasLimit > 30000 ? gasLimit : 30000,
        message: language[lang].ESTIMATE_ETH_TRANSFER_GAS_FEE
      };
    } catch (err: any) {
      console.error("error, for try catch", err);
      // await commonHelper.save_error_logs("eth_getEthGasLimit", err.message);
      return {
        status: false,
        gas_estimate: 30000,
        message: language[lang].ESTIMATE_ETH_TRANSFER_GAS_FEE
      };
    }
  }
  public async broadcastEthRawTx(rawTx: string, cb: CallableFunction) {
    var sendRawRes = await this.web3.eth
      .sendSignedTransaction("0x" + rawTx)
      .on("transactionHash", (txHash) => {
        cb(null, txHash);
      })
      .on("error", (err) => {
        console.error("err:: ", err);
        cb(err, null);
      });
  }
  public async sendEthOrTokens(
    req: Request,
    lang: string,
    rawTrnx: string,
    cb: CallableFunction
  ) {
    try {
      if (req.coininfo) {
        // Broadcast ETH/ERC20 transaction
        if (rawTrnx) {
          await this.broadcastEthRawTx(
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
      console.error("Error, sendEthOrToken===>", err);
      // await commonHelper.save_error_logs("eth_sendEthOrTokens", err.message);

    }
  }
  public async convertWeiToEth(value: number): Promise<string> {
    let valueInEth: any = await this.web3.utils.fromWei(value.toString(), "ether");
    return valueInEth;
  }

  // async getUserERC721TokenBalance(walletAddress: string, tokenAddress: string) {
  //   try {
  //     let contract = await new this.web3.eth.Contract(
  //       config.ERC721ABI as AbiItem[],
  //       tokenAddress
  //     );

  //     const balance = await contract.methods.balanceOf(walletAddress).call();
  //     return balance;
  //   } catch (error: any) {
  //     console.error("catch error: ", error);
  //     return false;
  //   }
  // }

  // async getERC721TokenData(tokenAddress: string) {
  //   try {
  //     let contract = new this.web3.eth.Contract(
  //       config.ERC721ABI as AbiItem[],
  //       tokenAddress
  //     );
  //     const name = await contract.methods.name().call();
  //     const symbol = await contract.methods.symbol().call();
  //     if (name && symbol) {
  //       return { name, symbol };
  //     } else {
  //       return false;
  //     }
  //   } catch (error:any) {
  //     console.error("error error", error);
  //   }
  // }

  // async getTokenDetail(tokenId: String) {
  //   let contract = new this.web3.eth.Contract(
  //     config.ERC721ABI as AbiItem[],
  //     tokenId
  //   );
  //   let tokenUri = "";
  //   let name = "";
  //   let symbol = "";
  //   tokenUri = await contract.methods.tokenURI(tokenId).call();
  //   name = await contract.methods.name().call();
  //   symbol = await contract.methods.symbol().call();
  //   return { tokenUri: tokenUri, name: name, symbol: symbol };
  // }
  // public async broadcast_Eth_RawTx(rawTx: string, cb: CallableFunction) {
  //   var sendRawRes = await this.web3.eth
  //     .sendSignedTransaction("0x" + rawTx)
  //     .on("transactionHash", (txHash) => {
  //       cb(null, txHash);
  //     })
  //     .on("error", (err) => {
  //       console.error("err:: ", err);
  //       cb(err, null);
  //     });
  // }
  // public async send_EthOrTokens(
  //   req: Request,
  //   rawTrnx: string,
  //   cb: CallableFunction
  // ) {
  //   try {
  //     if (rawTrnx) {
  //       await this.broadcast_Eth_RawTx(
  //         rawTrnx,
  //         async (error: Error, txid: string) => {
  //           if (error) {
  //             console.error("txid callback error ------ ", error);
  //             cb(error, null);
  //           } else {
  //             console.log("txid callback ------ ", txid);
  //             cb(null, txid);
  //           }
  //         }
  //       );
  //     } else {
  //       cb("Tx not found", null);
  //     }
  //     // }
  //   } catch (error) {
  //     console.error("Error, sendEthOrToken===>", error);
  //   }
  // }
}

export const EthHelper = new EthHelpers();
