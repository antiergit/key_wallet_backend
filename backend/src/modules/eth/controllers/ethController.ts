import { Request, Response } from "express";
import { EthHelper } from "../helpers";
import { OnlyControllerInterface } from "../../../interfaces/controller.interface";
import dbHelper from "../../../helpers/dbHelper";
import { config } from "../../../config";
import { bigNumberSafeMath, exponentialToDecimal } from "../../../helpers/common/globalFunctions";
import Web3 from "web3";
import * as Models from '../../../models/model/index';
import { AbiItem } from "web3-utils";
import { RawDataInterface } from "../interfaces/interfaces.eth";
import { language } from "../../../constants";
import response from "../../../helpers/response/response.helpers";
import { ethWeb3 } from "../../../helpers/common/web3_eth_helpers";
import commonHelper from "../../../helpers/common/common.helpers";
import { global_helper } from "../../../helpers/common/global_helper";

class EthController implements OnlyControllerInterface {
  constructor() {
    this.initialize();
  }

  public initialize() { }

  public async getNonce(req: Request, res: Response): Promise<Response> {
    let lang: any = req.headers['content-language'] || 'en';
    console.log("req body eth nonce >>>", req.body)
    var { wallet_address }: { wallet_address: string } = req.body;
    var nonce_val: number = 0;
    try {
      var walletNonce = await EthHelper.getWalletNonce(wallet_address);
      nonce_val = walletNonce;
      return response.success(res, {
        data: {
          data: {
            nonce: nonce_val,
          },
          message: language[lang].GET_NONCE,
        },
      });

    } catch (err: any) {
      console.error("error in eth getting nonce", err);
      await commonHelper.save_error_logs("eth_getNonce", err.message);
      return response.error(res, {
        data: {
          message: language[lang].CATCH_MSG,
          data: {},
        },
      });
    }
  }
  public async getEstimationGas(
    req: Request,
    res: Response
  ): Promise<Response | undefined> {
    let lang: any = req.headers['content-language'] || 'en';
    try {
      console.log("req body eth getEstimationGas >>>", req.body)

      var estimationRes: {
        status: boolean;
        gas_estimate: number;
        message: string;
      };
      //Gas estimation 0 for coins other than BSC/BEP20
      if (
        req.coininfo &&
        req.coininfo.coin_family !== config.STATIC_COIN_FAMILY.ETH
      ) {
        return response.success(res, {
          data: { status: true, gas_estimate: 0, gas_gwei_price: 0 },
        });
      } else if (req.coininfo) {
        const { from, to }: { from: string; to: string } = req.body;
        const { token_address, token_abi, is_token } = req.coininfo;
        if (is_token) {
          estimationRes =
            await EthHelper.getErc20TokenTransferGasEstimationCost(
              token_address,
              token_abi,
              from,
              to,
              lang
            );
        } else {
          estimationRes = await EthHelper.getEthGasLimit(from, to, lang);
        }
        let resultList: any = await Models.GasPriceModel.findOne({
          where: {
            coin_family: config.STATIC_COIN_FAMILY.ETH
          }
        })
        return response.success(res, {
          data: {
            status: true,
            gas_estimate: estimationRes.gas_estimate,
            resultList,
          },
        });
      }
    } catch (err: any) {
      await commonHelper.save_error_logs("eth_getEstimationGas", err.message);
      return response.error(res, {
        data: { message: language[lang].CATCH_MSG + err },
      });
    }
  }
  public async rawDataString(req: Request, res: Response): Promise<Response> {
    let lang: any = req.headers['content-language'] || 'en';
    try {
      console.log("req body eth rawDataString >>>", req.body)

      var { my_address, dest_address, amount, coin_type }: RawDataInterface =
        req.body;
      const web3: Web3 = new Web3(
        Web3.givenProvider || config.NODE.ETH_RPC_URL + ""
      );
      let minABI: AbiItem[] = [
        // transfer
        {
          constant: false,
          inputs: [
            {
              name: "_to",
              type: "address",
            },
            {
              name: "_value",
              type: "uint256",
            },
          ],
          name: "transfer",
          outputs: [
            {
              name: "success",
              type: "bool",
            },
          ],
          payable: false,
          stateMutability: "nonpayable",
          type: "function",
        },
      ];
      // If your token is divisible to 8 decimal places, 42 = 0.00000042 of your token
      var transferAmount = await exponentialToDecimal(amount);

      // Determine the nonce
      var count = await web3.eth.getTransactionCount(my_address);
      var contract = new web3.eth.Contract(
        minABI,
        req.coininfo.token_address || "",
        { from: my_address }
      );
      return response.success(res, {
        data: {
          status: true,
          message: language[lang].SUCCESS,
          data: contract.methods
            .transfer(dest_address, transferAmount)
            .encodeABI(),
        },
      });
    } catch (err: any) {
      console.error("rawDataString error: ==>  ", err);
      await commonHelper.save_error_logs("eth_rawDataString", err.message);
      return response.error(res, {
        data: { status: true, message: language[lang].SUCCESS, data: [] },
      });
    }
  }
  public async send(req: Request, res: Response) {
    let lang: any = req.headers['content-language'] || 'en';
    try {
      console.log("req body eth send >>>", req.body)

      let is_maker: number | null = req.body.is_maker ? req.body.is_maker : null;
      const { token_address: contractAddress, token_abi: ABI } = req.coininfo;
      let dapp_transaction: any = req.body.add_amount;
      var {
        gas_estimate,
        amount,
        gas_price,
        from,
        tx_raw,
      } = req.body;

      let maxGas = gas_price * gas_estimate;
      var gasInETH = await EthHelper.convertWeiToEth(maxGas);
      gas_price = gasInETH;
      var gasInEthForErc = 0;
      // ETH only
      if (req.coininfo.is_token == false && req.coininfo.coin_symbol == "eth") {
        var withdrawAmount;
        if (dapp_transaction == 1) {
          withdrawAmount = bigNumberSafeMath('0', "+", gasInETH);
        } else {
          withdrawAmount = bigNumberSafeMath(amount, "+", gasInETH);
        }
        var ethBalance = await ethWeb3.get_coin_balance(from, true);
        if (Number(ethBalance) < Number(withdrawAmount)) {
          return response.error(res, {
            data: { status: false, message: language[lang].INSUFFICIENT },
          });
        }
      } else if (
        req.coininfo.coin_family == config.STATIC_COIN_FAMILY.ETH &&
        req.coininfo.is_token == true &&
        req.coininfo.token_type === "ERC20"
      ) {
        var ethBalance = await ethWeb3.get_coin_balance(from, true);
        var ERC20TokenBalance = await ethWeb3.get_erc20_token_balance(
          contractAddress,
          ABI as AbiItem[],
          req.body.from
        );
        if (Number(ethBalance) < Number(gasInETH)) {
          return response.error(res, {
            data: {
              status: false,
              message: language[lang].INSUFFICIENTETH
            },
          });
        } else if (Number(ERC20TokenBalance) < Number(amount)) {
          return response.error(res, {
            data: {
              status: false,
              message: language[lang].ETH_INSUFFICIENT(req.coininfo.coin_symbol)
            },
          });
        }
      } else if (
        req.coininfo.coin_family == config.STATIC_COIN_FAMILY.ETH &&
        req.coininfo.is_token == true &&
        req.coininfo.token_type === "ERC721"
      ) {
        var ethBalance = await ethWeb3.get_coin_balance(from, true);
        if (Number(ethBalance) < Number(gasInETH)) {
          return response.error(res, {
            data: {
              status: false,
              message: language[lang].ETH_GAS(gasInEthForErc)
            },
          });
        }
      }
      let transferData = await EthHelper.sendEthOrTokens(
        req,
        lang,
        tx_raw,
        async (err: Error, txid: string) => {
          if (err) {
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

            if (
              req.coininfo.is_token == true &&
              req.coininfo.token_type === "ERC721"
            ) {
              await Models.NFTModelModel.update(
                {
                  available: 0,
                },
                { where: { token_address: req.coininfo.token_address as string } }
              );
            }

            if (resultStatus.status && resultStatus.status == true) {
              // Add notification for pending transaction
              let trnxTypeW: string = "Withdraw";
              switch (req.body.tx_type) {
                case 'DAPP':
                  trnxTypeW = "Smart Contract Execution";
                  break;
                case 'Approve':
                  trnxTypeW = "Approval";
                  break;
                case 'SWAP':
                  trnxTypeW = "Swap";
                  break;
                case 'CROSS_CHAIN':
                  trnxTypeW = "Cross-chain Swap";
                  break;
                default:
                  break;
              }

              const notiMsg = `${trnxTypeW} of ${req.body.amount} ${req.coininfo.coin_symbol.toUpperCase()} is pending.`;

              let notifData: any = {
                title: "WITHDRAW",
                message: notiMsg,
                amount: req.body.amount,
                from_user_id: 0,
                to_user_id: req.userId,
                coin_symbol: req.coininfo.coin_symbol,
                wallet_address: req.body.from,
                tx_id: req.body.tx_hash,
                coin_id: req.coininfo.coin_id,
                tx_type: req.body.tx_type,
                notification_type: "withdraw",

              };

              await global_helper.SendNotification(notifData);

              // if (req.body.approval == 1 && req.body.tx_type == 'Approve') {
              if (req.body.tx_type == 'Approve') {

                return response.success(res, {
                  data: {
                    status: true,
                    message: language[lang].APPROVE_REQUEST,
                    tx_hash: txid,
                  },
                });
                // } else if (req.body.approval == 0 && req.body.tx_type == 'withdraw') {
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
      console.error("Error in ETHEREUM send API >>>>>", err)
      await commonHelper.save_error_logs("eth_send", err.message);
      return response.error(res, {
        data: {
          message: language[lang].CATCH_MSG
        },
      });
    }
  }
  public async sendSwapTrnx(req: Request, res: Response) {
    let lang: any = req.headers['content-language'] || 'en';
    try {
      console.log("req body eth sendSwapTrnx >>>", req.body)

      console.log("Entered into sendSwapTransaction")
      let { tx_hash, amount, from, to, tx_type, amount_in_fiat, swap_fee, fiat_type }:
        { tx_hash: string, amount: number, from: string, to: string, tx_type: string, amount_in_fiat: number, swap_fee: number, fiat_type: string }
        = req.body;

      req.body.tx_status = 'completed';
      let resultStatus: any = await dbHelper.saveWithdrawTxDetails(req, null);

      if (resultStatus.status && resultStatus.status == true) {
        return response.success(res, {
          data: {
            status: true,
            message: language[lang].SWAP_REQUEST_ETH(amount, req.coininfo.coin_symbol),
            tx_hash: tx_hash
          },
        });
      } else {
        return response.error(res, {
          data: {
            status: false,
            message: language[lang].TRANSACTION_REQUEST
          },
        });
      }
    } catch (err: any) {
      console.error("Error in ETHEREUM sendSwapTrnx API >>>>>", err)
      await commonHelper.save_error_logs("eth_sendSwapTrnx", err.message);
      return response.error(res, {
        data: {
          message: language[lang].CATCH_MSG
        },
      });
    }
  }
}

export const EthControllers = new EthController();
