
import TronWeb from 'tronweb';
import TronStation from "tronstation";
import { config } from '../../config';
import * as Models from '../../models/model/index';
import { TokenStandard } from './enum';
import BigNumber from 'bignumber.js';
import commonHelper from '../../helpers/common/common.helpers';
import { language } from '../../constants';
import { exponentialToDecimal } from '../../helpers/common/globalFunctions';
import axios from 'axios';
import { ethers } from "ethers";

class TronHelper {
    public TRX_FULLNODE: string = config.NODE.TRX_RPC_URL
    public tronWeb: any;

    constructor() {
        this.tronWeb = new TronWeb({
            fullHost: this.TRX_FULLNODE,
            headers: { apikey: config?.NODE?.TRX_API_KEY }
        });
    }

    // Validate_Address = async (
    //     address: string
    // ) => {
    //     try {
    //         return await this.tronWeb.isAddress(address);
    //     } catch (error: any) {
    //         console.error(`Tron_Helper Validate_Address error >>`, error);
    //         return false;
    //     }
    // }
    Gas_Fee = async (
        toAddress: string,
        raw: string,
        contract_address: string
    ) => {
        let energy = 0;
        let fee = 0;
        try {
            const token: any = await Models.CoinsModel.findOne({
                where: {
                    token_address: contract_address
                }
            })

            if (!contract_address) {
                let data: any = raw.length * 10
                fee = data / 1000000;
            } else {
                let data: any = raw.length * 10
                fee = data / 1000000;
                let userHasBalance: number = 0;
                token.token_type?.toLowerCase();
                switch (token.token_type) {
                    case TokenStandard.TRC20:
                        userHasBalance = await this.TRC20_Token_Balance(
                            toAddress, //// wallet_address
                            contract_address /// contract_address
                        )
                        break;
                    case TokenStandard.TRC10:
                        userHasBalance = await this.TRC10_Token_Balance(
                            toAddress, //// wallet_address
                            contract_address /// contract_address
                        )
                        break;
                    default:
                        userHasBalance = 0
                        break;
                }
                if (userHasBalance > 0) {
                    energy = 15000;
                } else if (userHasBalance == 0) {
                    energy = 30000;
                }
            }
            let tronBurned = 0;
            if (energy > 0) {
                const tronStationSDK = new TronStation(this.tronWeb);
                tronBurned = await tronStationSDK.energy.burnedEnergy2Trx(energy);
            }
            return {
                fee: fee,
                energy: energy,
                energyToTron: tronBurned,
                total: fee + tronBurned,
            };
        } catch (err: any) {
            console.error(`Tron_Helper Gas_Fee error >>>`, err);
            await commonHelper.save_error_logs("tron_Gas_Fee", err.message);
            return {
                fee: 0,
                energy: 0,
                energyToTron: 0,
                total: 0,
            };
        }
    }
    BroadcastRawTx = async (
        trnx_raw: any,
        clbk: CallableFunction
    ) => {
        return await this.tronWeb.trx.sendRawTransaction(trnx_raw).then(async (result: any) => {
            if (result.result == true && result.result != undefined) {
                clbk(null, { result: true, data: result });
            } else {
                clbk(null, { result: false, data: result });
            }
        }).catch((error: Error) => {
            console.error('Tron_Helper-BroadcastRawTx >>> ', error);
            clbk(error, null);
        });
    }

    public async GetConfirmedTransaction(tx_hash: string) {
        try {
            const transaction: {
                status: boolean;
                data: { ret: [{ contractRet: string }] };
            } = await this.tronWeb.trx.getConfirmedTransaction(tx_hash).then((result: {}) => {
                console.log("trasacntion sytatus >>>>>>>>>true", result)
                return { status: true, data: result };
            }).catch(async (error: {}) => {
                await commonHelper.save_error_logs("tron_GetConfirmedTransaction", error.toString());
                return { status: false, data: error };
            });
            return transaction;
        } catch (err: any) {
            console.error(`Tron_Helper GetConfirmedTransaction error >>`, err);
            await commonHelper.save_error_logs("tron_GetConfirmedTransaction", err.message);
            return { status: false, data: err };
        }
    }
    public async GetTransactionInfo(tx_hash: string) {
        try {
            return await this.tronWeb.trx.getTransactionInfo(tx_hash).then(async (result: any) => {
                return { status: true, data: result };
            });
        } catch (err: any) {
            console.error(`Tron_Helper GetTransactionInfo error >>`, err);
            await commonHelper.save_error_logs("tron_GetTransactionInfo", err.message);
            return null;
        }
    }
    private TRC20_Token_Balance = async (
        address: string,
        contract_address: string
    ) => {
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
            let expToDecimal = await exponentialToDecimal(toDecimal);
            let balance = Number(expToDecimal) / Math.pow(10, decimals);
            return balance;
        } catch (err: any) {
            console.error(`Tron_Helper TRC20_Token_Balance error >>`, err);
            await commonHelper.save_error_logs("tron_TRC20_Token_Balance", err.message);
            return 0;
        }
    }
    private TRC10_Token_Balance = async (
        address: string,
        contract_address: string
    ) => {
        try {
            const assetBalance = await this.tronWeb.trx.getAccount(address);

            var balance: number = 0;
            if (
                assetBalance &&
                assetBalance.assetV2 &&
                assetBalance.assetV2.length > 0
            ) {
                for await (var i of assetBalance.assetV2) {
                    if (i.key == contract_address) {
                        var assetDetails = await this.tronWeb.trx.getTokenByID(
                            contract_address
                        );
                        var precison = Math.pow(10, assetDetails.precision);
                        balance = i.value / precison;
                        return balance;
                    }
                }
                return balance;
            } else {
                return balance;
            }
        } catch (err: any) {
            console.error(`Tron_Helper TRX_Fetch_Balance error >>`, err);
            await commonHelper.save_error_logs("tron_TRC10_Token_Balance", err.message);
            return 0;
        }
    }

    public async getActiveAccountInfo(address: string): Promise<boolean> {
        try {
            if (!address) {
                console.log("getActiveAccountInfo Toaddress is empty.", address);
                return false;
            }
            let getAccount = await this.tronWeb.trx.getAccount(address);
            if (getAccount && Object.keys(getAccount).length === 0) {
                console.log("new account :>> ");
                return false;
            } else {
                return true;
            }
        } catch (error) {
            // console.log("::Error log:: getActiveAccountInfo :>> ", error);
            return false
        }
    }

    public async getAccountResources(address: string) {
        try {
            let getAccountResources = await this.tronWeb.trx.getAccountResources(
                address
            );

            return getAccountResources;
        } catch (error) {
            // console.error("::Error log:: getAccountResources:", error);

        }
    }

    // async getUserTrxBalance(wallet: string): Promise<string> {
    //     try {
    //         return new Promise((resolve) => {
    //             this.tronWeb.trx.getBalance(wallet).then(async (result: any) => {
    //                 let balance = await this.tronWeb.fromSun(result);
    //                 console.log("UserTrxBalance:", balance);
    //                 resolve(balance);
    //             });
    //         });
    //     } catch (error) {
    //         console.log("getUserTrxBalance error: ", error);
    //         return '00'
    //     }

    // }


    async getUserTrxBalance(address: string): Promise<number | boolean> {
        try {
          let data = JSON.stringify({
            address: address,
            visible: true,
          });
    
          let configObj: any = {
            method: "post",
            url: this.TRX_FULLNODE + "wallet/getaccount",
            // url: config.TRX_FULLNODE + '/wallet/getaccount',
            // headers: {},
    
            headers: {
              "Content-Type": "application/json",
              apikey:  config.NODE.TRX_API_KEY,
            },
            data: data,
          };
    
          let balance = await axios(configObj)
            .then(function (response: any) {
              if (response.data?.balance) {
                return response.data.balance;
              } else {
                return 0;
              }
            })
            .catch(function (error: any) {
              console.log("::Error log:: axios catch Coin_Fetch_Balance >", error);
              return false;
            });
    
          if (balance > 0) {
            balance = balance / 1000000;
          }
    
          console.log("----tron balance----",balance)
          return balance;
        } catch (error) {
          console.log("::Error log:: Coin_Fetch_Balance :", error);
          return false;
        }
      }


    public async fetchAccountInfo(fromAddress: string, toAddress: string) {
        try {
            let result = await Promise.all([
                this.getActiveAccountInfo(toAddress),
                this.getActiveAccountInfo(fromAddress),
                this.getAccountResources(fromAddress),
                this.getUserTrxBalance(fromAddress),
            ])
                .then((values) => {
                    console.log(values);
                    return values;
                })
                .catch((error) => {
                    console.error("At least one promise was rejected:", error);
                    return false;
                });
            return result;
        } catch (error) {
            console.log("::Error log:: fetchAccountInfo :>> ", error);
            return false;
        }
    }

    public async convertBandwidthIntoTRX(bandwidth: number) {
        try {
            const sunAmount = bandwidth * 1000;
            let amount = await this.tronWeb.fromSun(sunAmount);

            console.log("convertBandwidthIntoTRX amount:>> ", amount);

            return amount;
        } catch (error) {
            console.log("::Error log:: convertBandwidthIntoTRX :>> ", error);
            return 1;
        }
    }


    public async addressConversion(token_address: string) {
        try {
            console.log("token_address :>> ", token_address);
            let tronAddress = await this.tronWeb.address.toHex(token_address);

            console.log("addressConversion tronAddress:>> ", tronAddress);

            return tronAddress;
        } catch (error) {
            console.log("::Error log:: addressConversion :>> ", error);
            return false;
        }
    }
    public async encodeParams(inputs: any) {
        console.log("encodeParams inputs :", inputs);
        const AbiCoder = ethers.AbiCoder;
        const ADDRESS_PREFIX_REGEX = /^(41)/;
        const ADDRESS_PREFIX = "41";
        try {
            let typesValues = inputs;
            let parameters = "";

            if (typesValues.length == 0) return parameters;
            const abiCoder = new AbiCoder();
            let types = [];
            const values = [];

            for (let i = 0; i < typesValues.length; i++) {
                let { type, value } = typesValues[i];
                if (type == "address")
                    value = value.replace(ADDRESS_PREFIX_REGEX, "0x");
                // else if (type == 'address[]')
                //   value = value.map((v: any) =>
                //     toHex(v).replace(ADDRESS_PREFIX_REGEX, '0x')
                //   );
                types.push(type);
                values.push(value);
            }

            console.log(types, values);
            try {
                parameters = abiCoder.encode(types, values).replace(/^(0x)/, "");
            } catch (ex) {
                console.log(ex);
                return false;
            }
            return parameters;
        } catch (error) {
            console.log("::Error log:: encodeParams :>> ", error);
            return false;
        }
    }

    public async getTransactionRequiredEnergy(
        from_address: string,
        token_address: string,
        parameters: string
    ) {
        try {
            var data = JSON.stringify({
                owner_address: from_address,
                contract_address: token_address,
                function_selector: "transfer(address,uint256)",
                parameter: parameters,
                visible: true,
            });

            // console.log(' getTransactionRequiredEnergy data :>> ', data);

            var configObj: any = {
                method: "post",
                maxBodyLength: Infinity,
                url: config.NODE.TRX_RPC_URL + "wallet/estimateenergy",
                // headers: {
                //   "Content-Type": "application/json",
                // },
                headers: {
                    "Content-Type": "application/json",
                    apikey: config.NODE.TRX_API_KEY,
                },
                data: data,
            };

            let energy = await axios(configObj)
                .then(function (response: any) {
                    console.log(
                        "getTransactionRequiredEnergy :",
                        JSON.stringify(response.data)
                    );
                    if (response.data?.energy_required) {
                        return response.data.energy_required;
                    } else {
                        return 0;
                    }
                })
                .catch(function (error: Error) {
                    console.log("::Error log:: getTransactionRequiredEnergy :", error);
                    return 0;
                });

            return energy;
        } catch (error) {
            console.log("::Error log:: getTransactionRequiredEnergy :>> ", error);
            return false;
        }
    }

    public async fetchUseEnergy(
        fromAddress: string,
        tokenAddress: string,
        amount: number
    ) {
        try {
            let requiredEnergy = 0;
            let hexAddress = await this.addressConversion(tokenAddress);
            let inputs = [
                {
                    type: "address",
                    value: hexAddress,
                },
                { type: "uint256", value: Math.floor(amount) },
            ];
            let parameters = await this.encodeParams(inputs);

            if (parameters) {
                requiredEnergy = await this.getTransactionRequiredEnergy(
                    fromAddress,
                    tokenAddress,
                    parameters
                );
            }
            return requiredEnergy;
        } catch (error) {
            return 0;
        }
    }

    public async getUserEnergy(address: string): Promise<number> {
        try {
            let getAccountResources = await this.tronWeb.trx.getAccountResources(
                address
            );
            let EnergyBalance =
                (getAccountResources.EnergyLimit || 0) -
                (getAccountResources.EnergyUsed || 0);
            console.log("EnergyBalance :>> ", EnergyBalance);
            if (!EnergyBalance) {
                return 0;
            }
            return EnergyBalance;
        } catch (error) {
            console.error("::Error log:: getUserEnergy:", error);
            return 0;
        }
    }

    public async calculateEnergy(
        fromAddress: string,
        toAddress: string,
        tokenAddress: string,
        amount: number
    ) {
        try {
            let result = await Promise.all([
                this.fetchUseEnergy(fromAddress, tokenAddress, amount),
                this.TRC20_Token_Balance(tokenAddress, toAddress),
                this.getUserEnergy(fromAddress),
            ])
                .then((values) => {
                    // console.log(values);
                    return values;
                })
                .catch((error) => {
                    console.error(
                        "At least one promise was rejected: calculateEnergy",
                        error
                    );
                    return false;
                });
            return result;
        } catch (error) {
            console.log("::Error log:: calculateEnergy :>> ", error);
            return false;
        }
    }

    public async convertEnergyIntoTrx(energy: number) {
        try {
          console.log("energy convertEnergyIntoTrx :>> ", energy);
          const tronStationSDK = new TronStation(this.tronWeb);
          let tronFee = await tronStationSDK.energy.burnedEnergy2Trx(energy);
    
          console.log("tronFee convertEnergyIntoTrx:>> ", tronFee);
          // let remain = tronFee % 1;
    
          // if (remain) {
          tronFee = Number(tronFee.toFixed(4));
          // }
    
          return tronFee;
        } catch (error) {
          console.log("::Error log:: getTransactionRequiredEnergy :>> ", error);
          return 0;
        }
      }

    Estimation_Gas_Tron = async (
        toAddress: string,
        fromAddress: string,
        resData: any,
        coininfo: any,
        amount: any,
        isBridge: number
    ) => {
        let energy = 0;
        let fee = 0;
        try {
            let tronFee: any = {};
            let delegateAmountForSwap: any = {};
            let result: any = await this.fetchAccountInfo(fromAddress, toAddress);
            console.log("result  tron gasEstimation:>> ", result);

            let getAccount = result[0];
            let getFromAddressAccount = result[1];

            let findUserAccountDetails = result[2];
            let freeBandwidth =
                (findUserAccountDetails?.freeNetLimit || 0) -
                (findUserAccountDetails?.freeNetUsed || 0);

            let getUserBandwidth =
                (findUserAccountDetails?.NetLimit || 0) -
                (findUserAccountDetails?.NetUsed || 0);
            let requiredBandwidthForTrx = 0;

            if (coininfo.token_type == "TRC10") {
                requiredBandwidthForTrx = resData.tron_trc10_bandwidth;

                if (getAccount) {
                    let requiredBandwidth = Number(
                        getUserBandwidth - resData.tron_trc10_bandwidth
                    );
                    if (requiredBandwidth >= 0) {
                        tronFee = {
                            is_activate: 0,
                            trx: 0,
                            bandwidth: resData.tron_trc10_bandwidth,
                        };
                    } else {
                        let trxAmount = await this.convertBandwidthIntoTRX(
                            Math.abs(requiredBandwidth)
                        );
                        tronFee = {
                            is_activate: 0,
                            trx: trxAmount,
                            bandwidth: getUserBandwidth,
                        };
                    }
                } else {
                    let fee = Number(getUserBandwidth - resData.tron_trc10_bandwidth);
                    if (fee >= 0) {
                        tronFee = {
                            is_activate: 1,
                            trx: 0.1,
                            bandwidth: resData.tron_trc10_bandwidth,
                        };
                    } else {
                        let trxAmount = await this.convertBandwidthIntoTRX(
                            resData.tron_trc10_bandwidth
                        );
                        tronFee = {
                            is_activate: 1,
                            trx: 0.1,
                            bandwidth: getUserBandwidth,
                        };
                    }
                }
            } else if (coininfo.token_type == "TRC20" && coininfo.token_address) {
                requiredBandwidthForTrx = resData.tron_trc20_bandwidth;

                let requiredBandwidth = Number(
                    getUserBandwidth - requiredBandwidthForTrx
                );

                // if (coininfo.token_address) {
                let calculateEnergy: any = await this.calculateEnergy(
                    fromAddress,
                    toAddress,
                    coininfo.token_address,
                    amount
                );

                console.log("calculateEnergy :>> ", calculateEnergy);

                let requiredEnergy = calculateEnergy[0];
                let tokenBalance = calculateEnergy[1];
                energy = calculateEnergy[2];

                if (requiredEnergy > 0) {
                    console.log("tokenBalance :>> ", tokenBalance);
                    if (isBridge == 1 || tokenBalance == 0) {
                        requiredEnergy *= 2.2;
                    } else {
                        requiredEnergy = Number(requiredEnergy) * 1.2;
                        requiredEnergy = parseInt(requiredEnergy);
                    }
                }

                console.log("requiredEnergy ::>> ", requiredEnergy);

                let remainEnergy = energy - requiredEnergy;

                if (requiredEnergy == 0) {
                    remainEnergy = -35500;
                    remainEnergy *= 2.2;
                    requiredEnergy = Math.abs(remainEnergy);
                }

                if (remainEnergy < 0) {
                    let convertEnergyIntoTrx = await this.convertEnergyIntoTrx(
                        Math.abs(remainEnergy)
                    );

                    if (convertEnergyIntoTrx) {
                        tronFee = {
                            trx: convertEnergyIntoTrx,
                            is_activate: 0,
                            bandwidth: resData.tron_trc20_bandwidth,
                            energy: Math.abs(remainEnergy),
                        };
                        // }
                    }
                } else {
                    // if (getAccount) {
                    if (
                        freeBandwidth > requiredBandwidthForTrx ||
                        getUserBandwidth > requiredBandwidthForTrx
                    ) {
                        tronFee = {
                            trx: 0,
                            is_activate: 0,
                            bandwidth: 0,
                            energy: 0,
                        };
                    } else {
                        let trxAmount = await this.convertBandwidthIntoTRX(
                            Math.abs(requiredBandwidth)
                        );

                        tronFee = {
                            trx: trxAmount,
                            is_activate: 0,
                            bandwidth: resData.tron_trc20_bandwidth,
                            energy: 0,
                        };
                    }
                    // } else {
                    //   if (requiredBandwidth >= 0) {
                    //     tronFee = {
                    //       trx: 0,
                    //       is_activate: 0,
                    //       bandwidth: resData.tron_trc20_bandwidth,
                    //       energy: 0,
                    //     };
                    //   } else {
                    //     let trxAmount = await TRX.convertBandwidthIntoTRX(
                    //       Math.abs(requiredBandwidth)
                    //     );

                    //     tronFee = {
                    //       trx: trxAmount * 2.05,
                    //       is_activate: 0,
                    //       bandwidth: resData.tron_trc20_bandwidth,
                    //       energy: 0,
                    //     };
                    //   }
                    // }
                }

                let trxBalance = result[3];
                if (trxBalance >= 150) {
                    tronFee.fee_limit = 150;
                } else if (trxBalance >= 100) {
                    tronFee.fee_limit = 100;
                } else if (trxBalance >= 50 || requiredEnergy > 50000) {
                    tronFee.fee_limit = 50;
                } else if (trxBalance >= 40) {
                    tronFee.fee_limit = 40;
                } else {
                    tronFee.fee_limit = 30;
                }

                tronFee.fee_limit = parseInt(tronFee.fee_limit);
            } else {
                requiredBandwidthForTrx = resData.tron_bandwidth;
                console.log("requiredBandwidthForTrx::", requiredBandwidthForTrx);

                if (getAccount) {
                    if (
                        freeBandwidth > requiredBandwidthForTrx ||
                        getUserBandwidth > requiredBandwidthForTrx
                    ) {
                        tronFee = {
                            is_activate: 0,
                            trx: 0,
                            bandwidth: requiredBandwidthForTrx,
                        };
                    } else {
                        let trxAmount = await this.convertBandwidthIntoTRX(
                            Math.abs(requiredBandwidthForTrx)
                        );
                        console.log("trxAmount::", trxAmount);

                        tronFee = {
                            is_activate: 0,
                            trx: trxAmount,
                            bandwidth: resData.tron_bandwidth,
                        };
                    }
                } else {
                    tronFee = {
                        is_activate: 1,
                        trx: 0.1,
                        bandwidth: resData.tron_bandwidth,
                    };
                }
            }

            console.log("tronFee :>> ", tronFee);
            tronFee.is_delegate = false;


            if (
                Object.keys(delegateAmountForSwap).length &&
                delegateAmountForSwap.max_bandwidth > requiredBandwidthForTrx
            ) {
                requiredBandwidthForTrx = delegateAmountForSwap.max_bandwidth;
                tronFee.bandwidth = delegateAmountForSwap.max_bandwidth;
            } else {
                requiredBandwidthForTrx = tronFee.bandwidth;
            }


            if (
                Object.keys(delegateAmountForSwap).length &&
                delegateAmountForSwap.max_energy
            ) {
                tronFee.energy = delegateAmountForSwap.max_energy;
            }

            if (tronFee.energy && getFromAddressAccount) {
                if (energy < tronFee.energy) {
                    let requiredDelegateEnergy = 0;
                    if (Object.keys(delegateAmountForSwap).length == 0) {
                        requiredDelegateEnergy = tronFee.energy - energy;
                        tronFee.trx = await this.convertEnergyIntoTrx(
                            Math.abs(requiredDelegateEnergy)
                        );
                    } else {
                        requiredDelegateEnergy = delegateAmountForSwap.max_energy - energy;
                        tronFee.trx = await this.convertEnergyIntoTrx(
                            Math.abs(requiredDelegateEnergy)
                        );
                    }


                }
            }
            return tronFee
        } catch (error: any) {
            return false
        }
    }

}
export let Tron_Helper = new TronHelper();
