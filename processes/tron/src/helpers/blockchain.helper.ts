import TronWeb from 'tronweb';
import axios from 'axios';
import Web3 from "web3"
import { BooleanEnum, TokenStandard } from "../enum";
import { Utility_Helper } from "./utility.helper";
import { config } from '../config/config';
import { AbiItem } from 'web3-utils';
import tronProcessHelper from '../processes/processes.helper';
import node_issue_error_log_queries from './dbhelper/node_issue_error_logs';
class BlockchainHelper {
   public MATIC_Web3: Web3;
   public ETH_Web3: Web3;
   public BSC_Web3: Web3;
   public tron_coin_family: any = config.COIN_FAMILY_TRON;


   public ETH_FULLNODE: string = config.NODE.ETH_RPC_URL;
   public TRX_FULLNODE: string = config.NODE.TRX_RPC_URL;
   public BSC_FULLNODE: string = config.NODE.BNB_RPC_URL;

   public tronWeb: any;


   constructor() {
      /* TRON CASE */
      const HttpProvider = TronWeb.providers.HttpProvider;
      const fullNode = new HttpProvider(this.TRX_FULLNODE);
      // this.tronWeb = new TronWeb({ fullHost: this.TRX_FULLNODE }); // Old used
      this.tronWeb = new TronWeb({
         fullHost: this.TRX_FULLNODE,
         headers: { apikey: config.NODE.TRX_API_KEY }
      });

      /* ETH CASE*/
      const eth_provider = new Web3.providers.HttpProvider(this.ETH_FULLNODE);
      this.ETH_Web3 = new Web3(eth_provider);

      /** BSC CASE */
      const bsc_provider = new Web3.providers.HttpProvider(this.BSC_FULLNODE);
      this.BSC_Web3 = new Web3(bsc_provider);
   }

   public async GetConfirmedTransaction(tx_hash: string, block_number: number) {
      try {
         const transaction: {
            status: any;
            data: { ret: [{ contractRet: any }] };
         } = await this.tronWeb.trx.getConfirmedTransaction(tx_hash).then((result: {}) => {
            // console.log("Inside tx_hash>>>", tx_hash)
            return { status: true, data: result };
         }).catch(async (err: any) => {
            console.error("Error in getConfirmedTransaction catch:", err?.message);
            if (err == "Transaction not found") {
               console.log("Transaction not fount for tx_id>>", tx_hash, "block number>>>", block_number)
            } else {
               console.log("Error in GetConfirmedTransaction tx_id", tx_hash)
               await node_issue_error_log_queries.node_issue_error_logs_create({
                  function: "GetConfirmedTransaction",
                  block_number: block_number.toString(),
                  error: err.message,
                  transaction_id: tx_hash,
                  from_adrs: null,
                  to_adrs: null,
                  coin_family: this.tron_coin_family,
                  extra: "else catch under GetConfirmedTransaction"
               })
            }
            return { status: false, data: err };
         });
         return transaction;
      } catch (err: any) {
         console.error(`Error in GetConfirmedTransaction function >>`, err?.message);
         await node_issue_error_log_queries.node_issue_error_logs_create({
            function: "GetConfirmedTransaction",
            block_number: block_number.toString(),
            error: err.message,
            transaction_id: tx_hash,
            from_adrs: null,
            to_adrs: null,
            coin_family: this.tron_coin_family,
            extra: "catch under GetConfirmedTransaction"
         })
         return { status: false, data: err };
      }
   }



   /* TRON CASE */
   public async Trc20_Token(address: string) {
      const tokenStandard: TokenStandard = TokenStandard.TRC20;
      return await tronProcessHelper.checkIfContract(address)
   };
   public async hexToAscii(data: string) {
      var hex = data.toString();
      var str = "";
      for (var n = 0; n < hex.length; n += 2) {
         str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
      }
      return str;
   }
   /** fetch balance */
   public async TRX_Fetch_Balance(address: string, coin: any) {
      try {
         let balance: any;
         if (coin.is_token == 1) {
            switch (coin.token_type.toLowerCase()) {
               case TokenStandard.TRC20:
                  balance = await this.TRC20_Token_Balance(
                     address, //// wallet_address
                     coin.token_address /// contract_address
                  )
                  break;
            }
         } else {
            balance = await this.TRX_Coin_Fetch_Balance(address);

         }
         return balance;
      } catch (err: any) {
         console.error(`error in TRON_Helper TRON_Fetch_Balance error >>`, err);
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
         return Number(balance);

      } catch (err: any) {
         console.error(`error in Tron_Helper TRC20_Token_Balance error >>`, err);
         throw err;
      }
   }
   /** fetch native coin balance */
   // public async TRX_Coin_Fetch_Balance(address: string) {
   //    try {
   //       return await this.tronWeb.trx.getBalance(address).then(async (result: any) => {
   //          let coinBalance: any = await this.tronWeb.fromSun(result);
   //          return Number(coinBalance);
   //       });
   //    } catch (err: any) {
   //       console.error(`error in Tron_Helper TRX_Fetch_Balance error >>`, err);
   //       throw err;
   //    }
   // }

   async TRX_Coin_Fetch_Balance(address: string): Promise<number | boolean> {
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
  
        return balance;
      } catch (error) {
        console.log("::Error log:: Coin_Fetch_Balance :", error);
        return false;
      }
    }



   public async GetTransactionInfo(tx_hash: string) {
      try {
         return await this.tronWeb.trx.getTransactionInfo(tx_hash).then(async (result: any) => {
            return { status: true, data: result };
         });
      } catch (error: any) {
         console.error(`Tron_Helper GetTransactionInfo error >>`, error?.message);
         return null;
      }
   }
   //BNB

   public Fetch_Balance_bnb = async (address: string, coin: any) => {
      try {
         let balance: any;
         if (coin.is_token == 1) {

            switch (coin.token_type.toLowerCase()) {

               case TokenStandard.BEP20:

                  balance = await this.BEP20_Token_Fetch_Balance(
                     address, //// wallet_address
                     coin.token_address ? coin.token_address : null/// contract_address
                  )

                  break;
            }
         } else {
            balance = await this.BSC_Coin_Fetch_Balance(address);
         }
         return balance;
      } catch (err: any) {
         console.error(`error in Bsc_Helper BSC_Fetch_Balance error >>`, err);
         throw err;
      }
   }
   public BEP20_Token_Fetch_Balance = async (wallet_address: string, contract_address: string | null) => {
      try {
         if (contract_address) {
            const contract = await new this.BSC_Web3.eth.Contract(
               config.CONTRACT_ABI as AbiItem[],
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
         console.error(`error in BscHelper BEP20_Token_Fetch_Balance error >>`, err);
         throw err;
      }
   }
   public BSC_Coin_Fetch_Balance = async (address: string) => {
      try {
         const balance: string = await this.BSC_Web3.eth.getBalance(address);
         const tokenBalance = await Utility_Helper.bigNumberSafeMath(
            balance, '/', Math.pow(10, 18)
         );
         let coinBalance: string = await Utility_Helper.exponentialToDecimal(tokenBalance)
         return Number(coinBalance);
      } catch (err: any) {
         console.error(`error in Bsc_Helper Coin_Fetch_Balance error >>`, err);
         throw err;
      }
   }

   //eth
   public async ETH_Fetch_Balance(address: string, coin: any) {
      try {
         let balance: any;
         if (coin.is_token == 1) {
            switch (coin.token_type.toLowerCase()) {

               case TokenStandard.ERC20:
                  balance = await this.ERC20_Token_Fetch_Eth_Balance(
                     address, //// wallet_address
                     coin.token_address ? coin.token_address : null/// contract_address
                  )
                  break;
            }

         } else {
            balance = await this.ETH_Coin_Fetch_Balance(address);

         }
         return balance;
      } catch (err: any) {
         console.error(`error in ETH_Helper ETH_Fetch_Balance error >>`, err);
         throw err;
      }
   }
   public async ERC20_Token_Fetch_Eth_Balance(wallet_address: string, contract_address: string | null) {
      try {
         if (contract_address) {
            const contract: any = await new this.ETH_Web3.eth.Contract(
               config.CONTRACT_ABI as AbiItem[],
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
      } catch (err) {
         console.error(`error in ETHHelper ERC20_Token_Fetch_Balance error >>`, err);
         throw err;
      }
   }
   public async ETH_Coin_Fetch_Balance(address: string) {
      try {
         const balance: any = await this.ETH_Web3.eth.getBalance(address);
         const tokenBalance = await Utility_Helper.bigNumberSafeMath(
            balance, '/', Math.pow(10, 18)
         );
         let coinBalance: string = await Utility_Helper.exponentialToDecimal(tokenBalance)
         return Number(coinBalance);
      } catch (err: any) {
         console.error(`error in ETH_Helper Coin_Fetch_Balance error >>`, err);
         throw err;
      }
   }

}
export let Blockchain_Helper = new BlockchainHelper();