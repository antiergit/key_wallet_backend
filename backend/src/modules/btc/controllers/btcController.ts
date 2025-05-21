import { Request, Response } from "express";
import { OnlyControllerInterface } from "../../../interfaces/controller.interface";
import { language } from "../../../constants";
import { BtcHelper } from "../helpers/index"
import response from "../../../helpers/response/response.helpers";
import dbHelper from "../../../helpers/dbHelper";
import { bigNumberSafeMath } from "../../../helpers/common/globalFunctions";
import { config } from "../../../config";
import { global_helper } from "../../../helpers/common/global_helper";
import { utxobtc } from "../../../helpers/common/web3_btc_helpers";
import { GlblCode } from "../../../constants/global_enum";
import commonHelper from "../../../helpers/common/common.helpers";
import axios from "axios";

class BTCController implements OnlyControllerInterface {
  constructor() {
    this.initialize();
  }
  public initialize() { }
  public async send(req: Request, res: Response) {
    let lang: any = req.headers['content-language'] || 'en';
    try {
      console.log("req body btc send >>>", req.body)

      let is_maker: number | null = req.body.is_maker ? req.body.is_maker : null;
      const gasBtc: any = req.body.gas_estimate / 100000000;
      const withdrawAmount: any = req.body.amount;
      const userBtcBalance: any = await utxobtc.get_balance(req.body.from);
      //Validate balance
      const finalWithdrawAmount: any = bigNumberSafeMath(
        withdrawAmount,
        "+",
        gasBtc
      );
      if (userBtcBalance < finalWithdrawAmount) {
        return res
          .status(GlblCode.ERROR_CODE)
          .send({ status: false, message: language[lang].INSUFFICIENT });
      }
      req.body.tx_hash = "";
      req.body.tx_type = req.body.tx_type || "WITHDRAW";
      req.body.nonce = req.body.nonce ? req.body.nonce : 0;
      req.body.gas_price = req.body.eth_gas_price ? req.body.eth_gas_price : 0;
      req.body.gas_estimate = req.body.gas_estimate ? req.body.gas_estimate : 0;
      req.body.eth_gas_price = req.body.gas_estimate
        ? req.body.gas_estimate
        : 0;
      req.body.tx_status = "completed";
      let dataFromBtc: any = await BtcHelper.sendRawTransaction(req.body.tx_raw);
      if (dataFromBtc.status == false) {
        return response.error(res, {
          data: {
            message: dataFromBtc.custom_err_msg || language[lang].CATCH_MSG
          },
        });
      }
      req.body.tx_hash = dataFromBtc.data.result;
      console.log("request body hash", req.body.tx_hash)
      console.log("send Raw Trnx Hash", dataFromBtc.data.result)

      let resultStatus: any = await dbHelper.saveWithdrawTxDetails(req, is_maker);
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

        return response.success(res, {
          data: {
            message: language[lang].TRANSACTION_BROADCAST_SUCCESSFULLY,
            data: dataFromBtc.data.result,
          },
        });
      } else {
        return response.error(res, {
          data: {
            message: language[lang].TRANSACTION_BROADCAST_FAILED,
            data: {},
          },
        });
      }
    } catch (err: any) {
      await commonHelper.save_error_logs("btc_send", err.message);
      console.error("err", err as Error);
    }
  }
  public async unspent(req: Request, res: Response) {
    let lang: any = req.headers['content-language'] || 'en';
    try {
      let btc_config = {
        method: 'get',
        url: `${config.NODE.BTC_RPC_URL}/api/v2/utxo/${req.params?.address}`,
        headers: {
          'apikey': `${config.NODE.BTC_API_KEY}`,
          'Content-Type': 'application/json',
        }
      };
      let result: any = await axios(btc_config);
      let res_data: any = [];
      if (result && result.data.length > 0) {
        let i = 0;
        for await (let data of result.data) {
          let unspent_data: any = {
            txid: data.txid,
            block_height: data.height,
            vout: data.vout,
            satoshis: data.value,
            confirmations: data.confirmations
          }
          if (i == 0) {
            let btc_config1 = {
              method: 'get',
              url: `${config.NODE.BTC_RPC_URL}/api/v2/tx-specific/${data.txid}`,
              headers: {
                'apikey': `${config.NODE.BTC_API_KEY}`,
                'Content-Type': 'application/json',
              }
            };
            let result: any = await axios(btc_config1);
            let transaction_data: any = result.data;
            if (transaction_data && transaction_data.vout !== undefined && transaction_data.vout.length > 0) {
              unspent_data.tx_raw = transaction_data.hex
              let unspent_vout = await transaction_data.vout.filter((vout: any) => vout.n == data.vout);
              if (unspent_vout.length > 0) {
                unspent_data.scriptPubKey = unspent_vout[0].scriptPubKey.hex;
                unspent_data.address = unspent_vout[0].scriptPubKey.address
              } else {
                unspent_data.scriptPubKey = '';
                unspent_data.address = 0;
              }
            }
          }
          res_data.push(unspent_data);
        }
      }
      return response.success(res, {
        data: {
          status: true,
          data: res_data,
          message: language[lang].SUCCESS
        },
      });
    } catch (err: any) {
      await commonHelper.save_error_logs("btc_unspent", err.message);
      console.error("ERROR in BTC unspent API", err)
    }
  }
}

let btcController = new BTCController();

export default btcController;
