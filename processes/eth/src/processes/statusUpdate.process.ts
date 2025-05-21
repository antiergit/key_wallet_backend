import rabbitMq from "../config/rabbitMq";
import { config } from "../config/config";
import {
  BlockChainStatusEnum,
  BooleanEnum,
  CoinFamilyEnum,
  CoinFamilyEnum_2,
  NotificationTypeEnum,
  TokenStandard,
  TrnxTypeEnum,
} from "../enum";
import { NotificationInterface, TrnxHistoryModel } from "../models";
import {
  Utility_Helper,
  Wallet_Helper,
  Blockchain_Helper,
  Db_Helper,
} from "../helpers";
import ethProcessHelper from "./process.helper";
import { Op } from "sequelize";
import { global_helper } from "../helpers/global_helper";
class EthTxStatusUpdateProcess {
  public startTxStatusUpdateQueue = async () => {
    await rabbitMq.consumeQueue(
      config.PENDING_WITHDRAWAL_TX_PROCESS_ETH || "",
      this.getTx
    );
  };

  public getTx = async (data: { tx_id: string; coin_id: number }) => {
    console.log("Pending data >>>>>>>", data);
    const { getTransaction, getTransactionReceipt } =
      Blockchain_Helper.Web3.eth;
    try {
      const transaction = await getTransaction(data.tx_id);
      const transactionReceipt = await getTransactionReceipt(data.tx_id);
      if (transaction.blockNumber) {
        let gasReverted: number | undefined;
        const gasUsed = transactionReceipt.gasUsed
          ? transactionReceipt.gasUsed
          : 0;
        const gasPrice = parseFloat(transaction.gasPrice) || 0;
        const gasTotal = transaction.gas || 0;
        const gasInEth: number = Number(
          await Blockchain_Helper.convertWeiToEth(
            await Utility_Helper.bigNumberSafeMath(gasUsed, "*", gasPrice)
          )
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
            tx_fee: gasInEth,
          };
          await this.sendTxUpdate(txUpdate);
        } else if (!transactionReceipt.status) {
          const txUpdate = {
            coin_id: data.coin_id,
            status: "failed",
            txid: transaction.hash,
            gasReverted: gasReverted,
            fromAddress: transactionReceipt.from.toLowerCase(),
            tx_fee: gasInEth,
          };
          await this.sendTxUpdate(txUpdate);
        }
      }
    } catch (error: any) {
      console.error("getTx >>>>>", error.message);
    }
  };

  public sendTxUpdate = async (txData: {
    coin_id: number;
    status: string;
    txid: string;
    gasReverted: number | undefined;
    fromAddress: string;
    tx_fee: number;
  }) => {
    try {
      let coin_data: any = await ethProcessHelper.CoinByCoinId(txData.coin_id);
      console.log("coin_data added by", coin_data?.added_by);
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
          token_address:
            Number(coin_data.is_token) === Number(BooleanEnum.true)
              ? coin_data.token_address
              : coin_data.coin_symbol,
          added_by: coin_data.added_by,
        },
      };
      console.log(trx_data, "withdrwal");
      await this.updateBroadcastTx(trx_data);
    } catch (error: any) {
      console.error("sendTxUpdate error >>>>>>>", error);
      return false;
    }
  };

  public async updateBroadcastTx(trx_data: any) {
    const txnData: any = await TrnxHistoryModel.findOne({
      attributes: [
        "from_adrs",
        "amount",
        "user_id",
        "id",
        "to_adrs",
        "type",
        "coin_family",
      ],
      where: {
        tx_id: trx_data.txid,
        status: "completed",
        [Op.or]: [
          { blockchain_status: { [Op.is]: null as any } },
          { blockchain_status: "pending" },
        ],
      },
      raw: true,
    });
    if (txnData) {
      let from_address = txnData.from_adrs;
      let amount = txnData.amount;
      let user_id = txnData.user_id;
      let tx_row_id = txnData.id;
      let status_tx =
        trx_data.status == "success"
          ? BlockChainStatusEnum.CONFIRMED
          : BlockChainStatusEnum.FAILED;
      let to_address = txnData.to_adrs;
      let tx_type = txnData?.type;
      let coin_symbol = trx_data?.coin?.coin_symbol;
      let token_type = trx_data?.coin?.token_type;
      let coin_family = txnData.coin_family;
      //Update transaction status
      let txUpdateRes = await TrnxHistoryModel.update(
        {
          blockchain_status: status_tx,
          tx_fee: trx_data.tx_fee,
          gas_reverted: trx_data.gas_reverted,
        },
        { where: { id: tx_row_id } }
      );
      if (txUpdateRes) {
        if (status_tx == BlockChainStatusEnum.CONFIRMED) {
          let AddressWithdraw: any =
            await ethProcessHelper.check_our_wallet_address(from_address);
          if (AddressWithdraw) {
            /** update withdraw user eth balance */
            if (tx_type !== TrnxTypeEnum.DAPP) {
              const native_coin: any =
                await ethProcessHelper.NativeCoinByCoinFamily(coin_family);
              await Wallet_Helper.Update_Balance(from_address, native_coin);
              if (
                trx_data?.coin?.is_token === BooleanEnum.true &&
                trx_data.coin?.token_type.toLowerCase() ===
                  TokenStandard.ERC20.toLowerCase()
              ) {
                /** Update User ERC20 Token Balance */
                await Wallet_Helper.Update_Balance(
                  from_address,
                  trx_data?.coin
                );
              }
              await Wallet_Helper.Update_all_active_coin_balance(from_address);
            } else {
              // Entered in DAPP transactioin
              let updated: any =
                await Wallet_Helper.Update_all_active_coin_balance(
                  from_address
                );
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
            const notiMsg = `${trnxTypeW} of ${await Utility_Helper.bigNumberSafeConversion(
              amount
            )} ${coin_symbol.toUpperCase()} has been confirmed.`;

            let notifData: NotificationInterface = {
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
              state: "confirmed",
            };
            Utility_Helper.SendNotification(notifData);
          }
          let Addressdeposit: any =
            await ethProcessHelper.check_our_wallet_address(to_address);
          if (Addressdeposit) {
            let to_user_id: number = Addressdeposit
              ? Addressdeposit.user_id
              : 0;
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
                await Wallet_Helper.Update_all_active_coin_balance(to_address);
              }
            }
            const notiMsg = `${trnxTypeD} of ${await Utility_Helper.bigNumberSafeConversion(
              amount
            )} ${trx_data?.coin?.coin_symbol.toUpperCase()} has been confirmed .`;

            let notifData: NotificationInterface = {
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
              state: "confirmed",
            };
            Utility_Helper.SendNotification(notifData);
          }

          return true;
        } else if (status_tx == BlockChainStatusEnum.FAILED) {
          let AddressWithdraw: any =
            await ethProcessHelper.check_our_wallet_address(from_address);
          if (AddressWithdraw) {
            /** update withdraw user eth balance */
            if (tx_type !== TrnxTypeEnum.DAPP) {
              const native_coin: any =
                await ethProcessHelper.NativeCoinByCoinFamily(coin_family);
              await Wallet_Helper.Update_Balance(from_address, native_coin);
              if (
                trx_data?.coin?.is_token === BooleanEnum.true &&
                trx_data.coin?.token_type.toLowerCase() ===
                  TokenStandard.ERC20.toLowerCase()
              ) {
                /** Update User ERC20 Token Balance */
                await Wallet_Helper.Update_Balance(
                  from_address,
                  trx_data?.coin
                );
              }
              await Wallet_Helper.Update_all_active_coin_balance(from_address);
            } else {
              // Entered in DAPP transactioin
              let updated: any =
                await Wallet_Helper.Update_all_active_coin_balance(
                  from_address
                );
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
            // const notiMsg = `${trnxTypeW} of ${await Utility_Helper.bigNumberSafeConversion(
            //   amount
            // )} ${coin_symbol.toUpperCase()} has been failed.`;
            const coin_family_short_code =
              CoinFamilyEnum_2[
                Number(coin_family) as keyof typeof CoinFamilyEnum_2
              ];

            const convertedAmount =
              await Utility_Helper.bigNumberSafeConversion(amount);
            const coinDetails = `${convertedAmount} ${coin_symbol.toUpperCase()}${
              token_type ? ` (${token_type})` : "" // 100 USDT (TRC20)
            }`;

            let notiMsg = (() => {
              switch (trnxTypeW) {
                case "Swap":
                  return `Transaction Failed - Failed to swap ${coinDetails} for ${coin_family_short_code?.toUpperCase()}`;
                case "Cross-chain Swap":
                  return `Transaction Failed - Failed to swap ${coinDetails} for ${coin_family_short_code?.toUpperCase()}`;
                default:
                  return `Transaction Failed - The withdrawal of ${coinDetails} has failed.`;
              }
            })();

            let notifData: NotificationInterface = {
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
              state: "failed",
            };
            Utility_Helper.SendNotification(notifData);
          }
          let Addressdeposit: any =
            await ethProcessHelper.check_our_wallet_address(to_address);
          if (Addressdeposit) {
            let to_user_id: number = Addressdeposit
              ? Addressdeposit.user_id
              : 0;
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
                await Wallet_Helper.Update_all_active_coin_balance(to_address);
              }
            }
            // const notiMsg = `${trnxTypeD} of ${await Utility_Helper.bigNumberSafeConversion(
            //   amount
            // )} ${trx_data?.coin?.coin_symbol.toUpperCase()} has been failed .`;

            const coin_family_short_code =
              CoinFamilyEnum_2[
                Number(coin_family) as keyof typeof CoinFamilyEnum_2
              ];

            const convertedAmount =
              await Utility_Helper.bigNumberSafeConversion(amount);
            const coinDetails = `${convertedAmount} ${coin_symbol.toUpperCase()}${
              token_type ? ` (${token_type})` : "" // 100 USDT (TRC20)
            }`;

            let notiMsg = (() => {
              switch (trnxTypeD) {
                case "Swap":
                  return `Transaction Failed - Failed to swap ${coinDetails} for ${coin_family_short_code?.toUpperCase()}`;
                case "Cross-chain Swap":
                  return `Transaction Failed - Failed to swap ${coinDetails} for ${coin_family_short_code?.toUpperCase()}`;
                default:
                  return `Transaction Failed - The withdrawal of ${coinDetails} has failed.`;
              }
            })();

            let notifData: NotificationInterface = {
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
              state: "failed",
            };
            Utility_Helper.SendNotification(notifData);
          }
          return true;
        } else if (status_tx == BlockChainStatusEnum.FAILED) {
          let notiMsg =
            trx_data?.coin.token_type === "ERC721"
              ? `Withdraw of NFT(${trx_data?.coin.coin_symbol.toUpperCase()}) with token id ${amount} has been confirmed.`
              : `Withdraw request of ${await Utility_Helper.bigNumberSafeConversion(
                  amount
                )} ${trx_data?.coin.coin_symbol.toUpperCase()} has been failed.`;
          let notifData: NotificationInterface = {
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
            state: "failed",
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

export const ethTxStatusUpdateProcess = new EthTxStatusUpdateProcess();
// export default ethTxStatusUpdateProcess;
