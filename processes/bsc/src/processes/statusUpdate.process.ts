import rabbitMq from "../config/rabbitMq";
import { config } from "../config/config";
import { BlockChainStatusEnum, NotificationTypeEnum, TokenStandard, TrnxTypeEnum } from "../enum";
import { TrnxHistoryModel } from "../models";
import { Utility_Helper, Wallet_Helper, Blockchain_Helper } from "../helpers";
import bscProcessHelper from "./process.helper";
import { Op } from "sequelize";
import { global_helper } from "../helpers/global_helper";
class BscTxStatusUpdateProcess {
  public startTxStatusUpdateQueue = async () => {
    await rabbitMq.consumeQueue(
      config.PENDING_WITHDRAWAL_TX_PROCESS_BSC || "",
      this.getTx
    );
  };

  public getTx = async (data: { tx_id: string; coin_id: number }) => {
    console.log('Pending data >>>>>>>', data);
    const { getTransaction, getTransactionReceipt } = Blockchain_Helper.BSC_Web3.eth;
    try {
      let transaction: any = await getTransaction(data.tx_id);
      let transactionReceipt: any = await getTransactionReceipt(data.tx_id);
      if (transaction.blockNumber) {
        console.log("transaxtion>>>>>>>>", transaction.blockNumber)
        let gasReverted: number | undefined;
        let gasUsed: any = transactionReceipt.gasUsed
          ? transactionReceipt.gasUsed
          : 0;
        let gasPrice: any = parseFloat(transaction.gasPrice) || 0;
        let gasTotal: any = transaction.gas || 0;
        let gasInBsc: number = Number(await Blockchain_Helper.convertWeiToBsc(
          await Utility_Helper.bigNumberSafeMath(
            gasUsed, '*', gasPrice
          ))
        );

        if (gasTotal > 0 && gasUsed > 0) {
          const gasDiff = gasTotal - gasUsed;
          gasReverted = gasPrice * gasDiff;
        }

        if (transactionReceipt.status && transaction.blockHash != null) {
          const txUpdate = {
            coin_id: data.coin_id,
            status: "success",
            txid: transaction.hash,
            gasReverted: gasReverted,
            fromAddress: transactionReceipt.from.toLowerCase(),
            tx_fee: gasInBsc
          };
          await this.sendTxUpdate(txUpdate);
        } else if (!transactionReceipt.status) {
          const txUpdate = {
            coin_id: data.coin_id,
            status: "failed",
            txid: transaction.hash,
            gasReverted: gasReverted,
            fromAddress: transactionReceipt.from.toLowerCase(),
            tx_fee: gasInBsc
          };
          await this.sendTxUpdate(txUpdate);
        }
      }
    } catch (err: any) {
      console.error('getTx >>>>>', err.message);
    }
  };

  public sendTxUpdate = async (txData: {
    coin_id: number;
    status: string;
    txid: string;
    gasReverted: number | undefined;
    fromAddress: string;
    tx_fee: number
  }) => {
    try {
      console.log("Entered into sendTxUpdate under PENDING_WITHDRAWAL_TX_PROCESS_BSC ", txData?.txid)
      let coin_data: any = await bscProcessHelper.CoinByCoinId(txData.coin_id);
      console.log("coin_data added by", coin_data?.added_by)
      const trx_data = {
        coin_id: txData?.coin_id,
        status: txData?.status,
        txid: txData?.txid,
        gas_reverted: txData?.gasReverted,
        tx_fee: txData?.tx_fee,
        fromAddress: txData?.fromAddress,
        coin: {
          coin_id: txData?.coin_id,
          is_token: coin_data.is_token,
          token_type: coin_data.token_type,
          coin_symbol: coin_data.coin_symbol,
          coin_family: coin_data.coin_family,
          token_address: Number(coin_data.is_token) === 1 ? coin_data.token_address : coin_data.coin_symbol,
          added_by: coin_data.added_by
        }
      };
      console.log(trx_data, "withdrwal");
      await this.updateBroadcastTx(trx_data);


    } catch (err: any) {
      console.error('sendTxUpdate error >>>>>>>', err);
      return false;
    }
  };

  public updateBroadcastTx = async (trx_data: any) => {

    console.log("Entered into updateBroadcastTx under PENDING_WITHDRAWAL_TX_PROCESS_BSC ", trx_data.txid)

    let txnData: any = await TrnxHistoryModel.findOne(
      {
        attributes: ['from_adrs', 'amount', 'user_id', 'id', 'to_adrs', 'type', 'coin_family'],
        where:
        {
          tx_id: trx_data.txid,
          status: 'completed',
          [Op.or]: [{ blockchain_status: { [Op.is]: null as any } }, { blockchain_status: 'pending' }]
        },
        raw: true
      });

    if (txnData) {
      let from_address = txnData.from_adrs;
      let amount = txnData.amount;
      let user_id = txnData.user_id;
      let tx_row_id = txnData.id;
      let status_tx = trx_data.status == "success" ? BlockChainStatusEnum.CONFIRMED : BlockChainStatusEnum.FAILED;
      let to_address = txnData.to_adrs;
      let tx_type = txnData?.type
      let coin_symbol = trx_data?.coin?.coin_symbol
      let coin_family = txnData.coin_family;
      //Update transaction status
      let txUpdateRes = await TrnxHistoryModel.update(
        { blockchain_status: status_tx, tx_fee: trx_data.tx_fee, gas_reverted: trx_data.gas_reverted },
        { where: { id: tx_row_id } })

      if (txUpdateRes) {

        if (status_tx == BlockChainStatusEnum.CONFIRMED) {

          let AddressWithdraw: any = await bscProcessHelper.check_our_wallet_address(from_address);

          if (AddressWithdraw) {
            /** update withdraw user bsc balance */
            console.log("Entered into AddressWithdraw", trx_data.txid)

            if (tx_type !== TrnxTypeEnum.DAPP) {
              console.log("Entered not into DAPP", trx_data.txid)


              const native_coin: any = await bscProcessHelper.NativeCoinByCoinFamily(coin_family);
              await Wallet_Helper.Update_Balance(from_address, native_coin);

              console.log("Trnx Data in Update_Balance >>>>", trx_data.txid)

              if (trx_data?.coin?.is_token === 1 && trx_data.coin?.token_type.toLowerCase() === TokenStandard.BEP20.toLowerCase()) {
                /** Update User ERC20 Token Balance */
                console.log("Trnx Data in Balance >>>>", trx_data.txid)

                await Wallet_Helper.Update_Balance(from_address, trx_data?.coin);
              }
              await Wallet_Helper.Update_all_active_coin_balance(from_address);
            } else { // Entered in DAPP transactioin
              console.log("Entered into DAPP", trx_data.txid)

              await Wallet_Helper.Update_all_active_coin_balance(from_address);
            }

            let trnxTypeW: string = "Withdraw";
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
              default:
                break;
            }

            let notiMsg = `${trnxTypeW} of ${await Utility_Helper.bigNumberSafeConversion(
              amount
            )} ${coin_symbol.toUpperCase()} has been confirmed.`;

            let notifData: any = {
              title: NotificationTypeEnum.WITHDRAW.toUpperCase(),
              message: notiMsg,
              amount: amount,
              from_user_id: 0,
              to_user_id: user_id,
              coin_symbol: coin_symbol,
              wallet_address: from_address,
              tx_id: tx_row_id,
              coin_id: trx_data?.coin?.coin_id,
              tx_type: tx_type,
              notification_type: NotificationTypeEnum.WITHDRAW,
              state: "confirmed"
            };

            console.log("Near to SendNotification Withdraw>>>>", trx_data.txid)

            Utility_Helper.SendNotification(notifData);
          }


          let Addressdeposit: any = await bscProcessHelper.check_our_wallet_address(to_address);
          if (Addressdeposit) {

            console.log("Entered into Addressdeposit", trx_data.txid)

            let to_user_id: number = Addressdeposit ? Addressdeposit.user_id : 0;
            let trnxTypeD: string = "Deposit";
            switch (tx_type) {
              case TrnxTypeEnum.DAPP:
                trnxTypeD = "Smart Contract Execution";
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
            if (to_address !== from_address) {
              if (tx_type !== TrnxTypeEnum.DAPP) {
                await Wallet_Helper.Update_Balance(
                  to_address, /// wallet_address,
                  trx_data?.coin /// coin
                );
              } else {
                let updated: any = await Wallet_Helper.Update_all_active_coin_balance(to_address);
              }
            }
            const notiMsg = `${trnxTypeD} of ${await Utility_Helper.bigNumberSafeConversion(
              amount
            )} ${trx_data?.coin?.coin_symbol.toUpperCase()} has been confirmed .`;

            let notifData: any = {
              title: NotificationTypeEnum.DEPOSIT.toUpperCase(),
              message: notiMsg,
              amount: amount,
              from_user_id: user_id,
              to_user_id: to_user_id,
              wallet_address: to_address,
              tx_id: tx_row_id,
              coin_symbol: coin_symbol,
              coin_id: trx_data?.coin?.coin_id,
              tx_type: tx_type,
              notification_type: NotificationTypeEnum.DEPOSIT,
              state: "confirmed"
            };
            console.log("Near to SendNotification Deposit >>>>", trx_data.txid)

            Utility_Helper.SendNotification(notifData);
          }
          return true;

        } else if (status_tx == BlockChainStatusEnum.FAILED) {
          let notiMsg = trx_data?.coin.token_type === "ERC721" ? `Withdraw of NFT(${trx_data?.coin.coin_symbol.toUpperCase()}) with token id ${amount} has been confirmed.` : `Withdraw request of ${await Utility_Helper.bigNumberSafeConversion(amount)} ${trx_data?.coin.coin_symbol.toUpperCase()} has been failed.`;
          let notifData: any = {
            title: NotificationTypeEnum.WITHDRAW.toUpperCase(),
            message: notiMsg,
            amount: amount,
            from_user_id: 0,
            to_user_id: user_id,
            wallet_address: from_address,
            tx_id: tx_row_id,
            coin_symbol: coin_symbol,
            coin_id: trx_data?.coin?.coin_id,
            tx_type: tx_type,
            notification_type: NotificationTypeEnum.WITHDRAW,
            state: "failed"
          };
          Utility_Helper.SendNotification(notifData);

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
  }
}
export const bscTxStatusUpdateProcess = new BscTxStatusUpdateProcess();

