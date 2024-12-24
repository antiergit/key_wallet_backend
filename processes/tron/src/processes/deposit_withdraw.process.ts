import { RabbitMq } from "../helpers/rabbitmq.helper";
import { config } from "../config/config";
import ethProcessHelper from './processes.helper';
import { BooleanEnum, CoinFamily, NotificationTypeEnum, TrnxTypeEnum, TxReqTypesEnum } from ".././enum";
import { Utility_Helper, trnx_history_queries, wallet_queries } from "../helpers"
import { Op } from "sequelize";
import tronProcessHelper from "./processes.helper";
import { TrnxBlockchainStatus } from "../enum";
import { global_helper } from '../helpers/index'


class TronDepositWithdrawProcess {
  public deposit_withdraw_process: string = config.DEPOSIT_WITHDRAW_PROCESS_TRON

  public startDepositQueue = async () => {
    await RabbitMq.consumeQueue(
      this.deposit_withdraw_process || "",
      this.checkIfOurTx
    );
  };

  public async checkIfOurTx(data: any) {
    console.log("Entered into checkIfOurTx>>", data)

    let coin_data: any = null;

    if (data.token_address) {
      coin_data = await tronProcessHelper.checkIfContract(data.token_address)
    } else {
      coin_data = await tronProcessHelper.NativeCoinByCoinFamily(CoinFamily.TRON);
    }
    const webhookTx: any = {
      coin: coin_data,
      tx_id: data.tx_id,
      to_address: data.toAddress,
      from_address: data.fromAddress,
      block_id: data.blockId,
      amount: data.amount,
      isNFTToken: data.isNFTToken || false,
      status: 'completed',
      blockchain_status: TrnxBlockchainStatus.CONFIRMED,
      txType: data.type,
      trnx_fee: data.trnx_fee
    };
    await tronDepositWithdrawProcess.SaveNewTrnx(webhookTx)
  };
  SaveNewTrnx = async (trnx_data: any) => {
    try {
      console.log("Entered into SaveNewTrnx", trnx_data.tx_id)
      const tx_hash: string = trnx_data.tx_id;
      const to_address: string = trnx_data.to_address;
      const from_address: string = trnx_data.from_address;
      const coin: any = trnx_data.coin;
      const amount: number = trnx_data.amount;
      const status: string = trnx_data.status;
      const block_number: number = trnx_data.block_id;
      const blockchain_status: any = trnx_data.blockchain_status;
      const trnx_fee: any = trnx_data.trnx_fee ? trnx_data.trnx_fee : 0;

      let tx_type: TrnxTypeEnum = trnx_data.txType ? trnx_data.txType : TrnxTypeEnum.DEPOSIT;
      const fiat_currency = "USD";

      let checkOldTrnx: any = null;
      if (tx_type == TrnxTypeEnum.WITHDRAW) {

        checkOldTrnx = await trnx_history_queries.trnx_history_find_one(
          ["coin_id", "tx_id", "type"],
          {
            tx_id: { [Op.like]: tx_hash },
            from_adrs: { [Op.like]: `%${from_address}%` },
            coin_id: coin.coin_id,
            req_type: { [Op.notIn]: [TxReqTypesEnum.ALCHEMY, TxReqTypesEnum.TRANSAK] }
          },
        )

        if (checkOldTrnx == null) {
          let check_coin_in_wallet: any = await wallet_queries.wallet_find_one(
            ["coin_id", "coin_family"],
            { wallet_address: from_address, coin_id: coin.coin_id }
          )

          if (!check_coin_in_wallet) {
            console.error(`Coin not exist under this wallet.`);
            return false;
          }
        }
      } else if (tx_type == TrnxTypeEnum.DEPOSIT) {

        checkOldTrnx = await trnx_history_queries.trnx_history_find_one(
          ["coin_id", "tx_id", "type"],
          {
            tx_id: { [Op.like]: tx_hash },
            to_adrs: { [Op.like]: `%${to_address}%` },
            coin_id: coin.coin_id,
            req_type: { [Op.notIn]: [TxReqTypesEnum.ALCHEMY, TxReqTypesEnum.TRANSAK] }
          },
        )
      }

      if (checkOldTrnx) {
        console.error(`Transaction ${tx_hash} is already exists.`);
        return false;
      }

      if (tx_type !== TrnxTypeEnum.WITHDRAW && checkOldTrnx && checkOldTrnx.tx_id == tx_hash) {

        tx_type = checkOldTrnx.type;
      }

      let AddressWithdraw: any = await tronProcessHelper.check_our_wallet_address(from_address);
      let Addressdeposit: any = await tronProcessHelper.check_our_wallet_address(to_address);


      let user_id: number = AddressWithdraw ? AddressWithdraw.user_id : 0;
      let to_user_id: number = Addressdeposit ? Addressdeposit.user_id : 0;

      let trx_data: any = {
        user_id: user_id,
        to_user_id: to_user_id,
        req_type: TxReqTypesEnum.EXNG,
        from_adrs: from_address,
        to_adrs: to_address,
        coin_id: coin.coin_id,
        coin_family: coin.coin_family,
        amount: amount,
        status: status,
        block_id: block_number,
        tx_id: tx_hash,
        blockchain_status: blockchain_status,
        type: tx_type,
        tx_fee: trnx_fee,
        fiat_type: fiat_currency
      }
      const newTrnx: any = await trnx_history_queries.trnx_history_create(trx_data)
      let coinFmlyTag: string = "";

      if (coin.is_token == Number(BooleanEnum.true)) {
        coinFmlyTag = `(${coin.token_type.toUpperCase()})`;
      }

      if (Addressdeposit) {

        let trnxTypeD: string = "Deposit";
        switch (tx_type) {
          case TrnxTypeEnum.SMARTCONTRACTINTERACTION:
            trnxTypeD = "Smart Contract Interaction";
            break;
          case TrnxTypeEnum.APPROVE:
            trnxTypeD = "Approval";
            break;
          case TrnxTypeEnum.SWAP:
            trnxTypeD = "Swap";
            break;
          case TrnxTypeEnum.CROSS_CHAIN:
            trnxTypeD = "Cross-chain Swap";
            break;
          default:
            break;
        }

        /** update to adrs wallet balance */
        //============================================================================
        // let balance: any = await Wallet_Helper.Update_Balance(
        //   to_address, /// wallet_address,
        //   coin// trx_data /// coin
        // );
        // await global_helper.check_coin_in_wallet(to_address, coin, balance)
        //============================================================================
        console.log("123ENtering adding_coins_to_queue ")

        await tronProcessHelper.adding_coins_to_queue(to_address, coin)
        //============================================================================




        const notiMsg = `${trnxTypeD} of ${await Utility_Helper.bigNumberSafeConversion(
          amount
        )} ${coin.coin_symbol.toUpperCase()} has been confirmed.`;

        let notifData: any = {
          title: NotificationTypeEnum.DEPOSIT.toUpperCase(),
          message: notiMsg,
          amount: amount,
          from_user_id: user_id,
          to_user_id: to_user_id,
          wallet_address: to_address,
          tx_id: newTrnx.id,
          coin_symbol: coin.coin_symbol,
          coin_id: coin.coin_id,
          tx_type: tx_type,
          notification_type: NotificationTypeEnum.DEPOSIT,
          state: "confirmed"
        };
        Utility_Helper.SendNotification(notifData);
      }

      if (AddressWithdraw) {
        let trnxTypeW: string = "Withdraw";

        switch (tx_type) {
          case TrnxTypeEnum.SMARTCONTRACTINTERACTION:
            trnxTypeW = "Smart Contract Interaction";
            break;
          case TrnxTypeEnum.APPROVE:
            trnxTypeW = "Approval";
            break;
          case TrnxTypeEnum.SWAP:
            trnxTypeW = "Swap";
            break;
          case TrnxTypeEnum.CROSS_CHAIN:
            trnxTypeW = "Cross-chain Swap";
            break;
          default:
            break;
        }
        //============================================================================
        // await Wallet_Helper.Update_Balance(
        //   from_address, /// wallet_address,
        //   coin//trx_data /// coin
        // );
        console.log("456 adding_coins_to_queue ")

        await tronProcessHelper.adding_coins_to_queue(from_address, coin)

        if (coin.is_token) {
          const native_coin: any =
            await ethProcessHelper.NativeCoinByCoinFamily(coin.coin_family);
          //   await Wallet_Helper.Update_Balance(
          //     from_address, /// wallet_address,
          //     native_coin /// coin
          //   );
          console.log("789 adding_coins_to_queue ")

          await tronProcessHelper.adding_coins_to_queue(from_address, native_coin)

        }
        //============================================================================

        const notiMsg = `${trnxTypeW} of ${await Utility_Helper.bigNumberSafeConversion(
          amount
        )} ${coin.coin_symbol.toUpperCase()} has been confirmed.`;

        let notifData: any = {
          title: NotificationTypeEnum.WITHDRAW.toUpperCase(),
          message: notiMsg,
          amount: amount,
          from_user_id: 0,
          to_user_id: user_id,
          wallet_address: from_address,
          tx_id: newTrnx.id,
          tx_type: tx_type,
          coin_symbol: coin.coin_symbol,
          coin_id: coin.coin_id,
          notification_type: NotificationTypeEnum.WITHDRAW,
          state: "confirmed"
        };

        Utility_Helper.SendNotification(notifData);
      }

      return true;
    } catch (error: any) {
      console.error(`Error in SaveTrnx_Process-SaveNewTrnx error >>>`, error);
      return false;
    }
  };
}
export const tronDepositWithdrawProcess = new TronDepositWithdrawProcess();
