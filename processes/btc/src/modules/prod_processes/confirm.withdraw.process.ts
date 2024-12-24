import { config } from '../../config/config';
import utxo from './utxo';
import { Db_Helper, RabbitMq_Helper, Utility_Helper } from '../../helpers';
import { TrnxHistoryModel } from '../../models/tables';
import { Op } from 'sequelize';
import { BlockChainStatusEnum, NotificationTypeEnum, TrnxTypeEnum } from '../../enum/index';
import btcProcessHelper from '../prod_processes/process.helper';
class BTCTxStatusUpdateProcess {
  public startTxStatusUpdateQueue = async () => {
    try {
      await RabbitMq_Helper.consumeQueue(
        config.PENDING_WITHDRAWAL_TX_PROCESS_BTC || "",
        this.getTx
      );
    } catch (error: any) {
      console.error('startTxStatusUpdateQueue >>>>', error);
    }
  };
  public getTx = async (data: { txId: string }) => {
    try {
      await utxo.getTransactionById(data.txId).then(async (rawData) => {
        if (
          rawData.confirmations != undefined &&
          rawData.confirmations >=
          Number(config.MIN_BLOCK_CONFORMATIONS)
        ) {
          const txUpdate = {
            status: 'success',
            txid: data.txId,
          };
          await this.sendTxUpdate(txUpdate);
        } else {
          return null;
        }
      });
    } catch (error: any) {
      console.error('getTx error', error);
    }
  };

  public sendTxUpdate = async (txData: {
    status: string;
    txid: string;
  }) => {
    try {
      const txnData: any = await TrnxHistoryModel.findOne({ attributes: ['from_adrs', 'coin_id', 'amount', 'user_id', 'id', 'to_adrs', 'type', 'coin_family'], where: { tx_id: txData.txid, status: 'completed', [Op.or]: [{ blockchain_status: { [Op.is]: null as any } }, { blockchain_status: 'pending' }] }, raw: true });
      if (txnData) {
        let coinData: any = await btcProcessHelper.CoinByCoinId(txnData.coin_id)
        let from_address = txnData.from_adrs;
        let coin_id: number = txnData.coin_id;
        let amount = txnData.amount;
        let user_id = txnData.user_id;
        let tx_row_id = txnData.id;
        let status_tx = txData.status == "success" ? BlockChainStatusEnum.CONFIRMED : BlockChainStatusEnum.FAILED;
        let to_address = txnData.to_adrs;
        let tx_type = txnData?.type
        let coin_symbol = coinData?.coin_symbol
        let coin_family = txnData.coin_family;
        let txUpdateRes = await TrnxHistoryModel.update({ blockchain_status: status_tx }, { where: { id: tx_row_id } })
        if (txUpdateRes) {
          if (status_tx == BlockChainStatusEnum.CONFIRMED) {
            let coin_data: any = { coin_id: coin_id, coin_family: coin_family };
            let AddressWithdraw: any = await btcProcessHelper.check_our_wallet_address(from_address);
            if (AddressWithdraw) {
              console.log("Checking btc balance getUserBtcBalance Entering getUserBtcBalance", from_address)
              let balDetails: any = await utxo.getUserBtcBalance(from_address);

              /** update withdraw user eth balance */
              /** Update User Btc Balance */
              await Db_Helper.Update_Balance(from_address, coin_data, balDetails);
              let trnxTypeW: string = "Withdraw";
              trnxTypeW = tx_type
              switch (tx_type) {
                case TrnxTypeEnum.DAPP:
                  trnxTypeW = "Smart Contract Execution";
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
                case TrnxTypeEnum.WITHDRAW:
                  trnxTypeW = "Withdraw";
                  break;
                default:
                  break;
              }
              const notiMsg = `${trnxTypeW} of ${await Utility_Helper.bigNumberSafeConversion(
                amount
              )} ${coin_symbol.toUpperCase()} has been confirmed.`;
              let notifData: any = {
                notification_type: NotificationTypeEnum.WITHDRAW.toUpperCase(),
                message: notiMsg,
                from_user_id: 0,
                amount: amount,
                to_user_id: user_id,
                coin_symbol: coin_symbol,
                wallet_address: from_address,
                tx_id: tx_row_id,
                coin_id: coin_id,
                tx_type: tx_type,
                state: "confirmed"
              };
              Utility_Helper.SendNotification(notifData);
            }

            let Addressdeposit: any = await btcProcessHelper.check_our_wallet_address(to_address);
            if (Addressdeposit) {
              let to_user_id: number = Addressdeposit ? Addressdeposit.user_id : 0;
              let trnxTypeD: string = "Deposit";
              console.log("Checking btc balance getUserBtcBalance Addressdeposit Entering getUserBtcBalance", to_address)
              let balDetails: any = await utxo.getUserBtcBalance(to_address);
              /** update to adrs wallet balance */
              await Db_Helper.Update_Balance(to_address, coin_data, balDetails);
              const notiMsg = `${trnxTypeD} of ${await Utility_Helper.bigNumberSafeConversion(
                amount
              )} ${coin_symbol.toUpperCase()} has been confirmed.`;

              let notifData: any = {
                message: notiMsg,
                amount: amount,
                from_user_id: user_id,
                to_user_id: to_user_id,
                wallet_address: to_address,
                tx_id: tx_row_id,
                coin_symbol: coin_symbol,
                coin_id: coin_id,
                tx_type: tx_type,
                notification_type: NotificationTypeEnum.DEPOSIT,
                state: "confirmed"
              };
              Utility_Helper.SendNotification(notifData);
            }

            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }

    } catch (error: any) {
      console.error("error in btc sendTxUpdate>>>>.", error)
    }
  };



}

const btcTxStatusUpdateProcess = new BTCTxStatusUpdateProcess();
export default btcTxStatusUpdateProcess;
